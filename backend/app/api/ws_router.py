"""
WebSocket endpoint: /api/ws/{session_id}

Protocol (JSON messages):

  Client → Server:
    {"type": "chat", "message": "...", "agent": "NEXUS", "token": "jwt..."}
    {"type": "ping"}

  Server → Client:
    {"type": "connected", "session_id": "..."}
    {"type": "token",    "data": "..."}
    {"type": "done",     "data": "full text", "agent": "NEXUS"}
    {"type": "handoff",  "from_agent": "NEXUS", "to_agent": "ALEX"}
    {"type": "system",   "data": "..."}
    {"type": "error",    "data": "..."}
    {"type": "pong"}
"""
import uuid
import json
import asyncio
import structlog
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_core.messages import HumanMessage, AIMessage

from app.ws.manager import manager
from app.tasks.redis_bus import subscribe_session
from app.tasks.agent_tasks import run_agent_task
from app.auth.dependencies import get_ws_user
from app.db.base import get_db, AsyncSessionLocal
from app.models.models import ChatSession, Message, MessageRole, AgentName

router = APIRouter(tags=["websocket"])
logger = structlog.get_logger()

MAX_CONTEXT = 20   # messages to include as history


async def _get_or_create_session(session_id: str, user_id: str, db: AsyncSession) -> ChatSession:
    """Fetch existing session or create a new one."""
    try:
        sid = uuid.UUID(session_id)
        session = await db.get(ChatSession, sid)
        if session:
            return session
    except ValueError:
        pass

    session = ChatSession(
        user_id=uuid.UUID(user_id),
        active_agent=AgentName.NEXUS,
    )
    db.add(session)
    await db.flush()
    return session


def _build_history(messages: list[Message]) -> list[dict]:
    """Convert DB messages to the serialisable format Celery expects."""
    recent = messages[-MAX_CONTEXT:]
    return [
        {"role": msg.role.value, "content": msg.content}
        for msg in recent
        if msg.role in (MessageRole.USER, MessageRole.ASSISTANT)
    ]


async def _save_messages(
    session_id: uuid.UUID,
    user_content: str,
    assistant_content: str,
    agent: str,
) -> None:
    """Persist both sides of the exchange to the DB after the task completes."""
    async with AsyncSessionLocal() as db:
        db.add(Message(
            session_id=session_id,
            role=MessageRole.USER,
            content=user_content,
        ))
        db.add(Message(
            session_id=session_id,
            role=MessageRole.ASSISTANT,
            content=assistant_content,
            agent=AgentName(agent),
            token_count=len(assistant_content.split()),
        ))
        await db.commit()


@router.websocket("/ws/{session_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Main WebSocket handler.

    Lifecycle:
      1. Accept connection
      2. Wait for first "chat" message (contains JWT token for auth)
      3. Validate token → get user
      4. Get/create session
      5. Dispatch Celery task
      6. Subscribe to Redis channel, forward tokens to client
      7. On disconnect: clean up
    """
    log = logger.bind(session_id=session_id)

    await manager.connect(session_id, websocket)
    log.info("ws_endpoint_connected")

    try:
        # Send connection confirmation
        await websocket.send_text(json.dumps({
            "type": "connected",
            "session_id": session_id,
        }))

        while True:
            try:
                raw = await asyncio.wait_for(websocket.receive_text(), timeout=300)
            except asyncio.TimeoutError:
                # Send ping to keep connection alive
                await websocket.send_text(json.dumps({"type": "ping"}))
                continue

            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"type": "error", "data": "Invalid JSON"}))
                continue

            msg_type = msg.get("type")

            # ── Ping / pong ────────────────────────────────────────────
            if msg_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
                continue

            # ── Chat message ───────────────────────────────────────────
            if msg_type == "chat":
                user_message = msg.get("message", "").strip()
                token        = msg.get("token", "")

                if not user_message:
                    await websocket.send_text(json.dumps({"type": "error", "data": "Empty message"}))
                    continue

                # Auth — validate JWT
                user = await get_ws_user(token, db)
                if not user:
                    await websocket.send_text(json.dumps({
                        "type": "error", "data": "Unauthorized — invalid token"
                    }))
                    continue

                # Get/create session
                chat_session = await _get_or_create_session(session_id, str(user.id), db)
                history = _build_history(chat_session.messages)

                log.info("chat_message_received", user=user.username, msg_len=len(user_message))

                # Dispatch to Celery worker
                run_agent_task.delay(
                    session_id=str(chat_session.id),
                    user_message=user_message,
                    history=history,
                    user_id=str(user.id),
                )

                # Subscribe to Redis channel and forward tokens to client
                full_text = ""
                final_agent = "NEXUS"

                async for event in subscribe_session(str(chat_session.id)):
                    event_type = event.get("type")

                    if event_type == "token":
                        token_data = event["data"]
                        full_text += token_data
                        await manager.send_token(str(chat_session.id), token_data)

                    elif event_type == "handoff":
                        final_agent = event.get("to_agent", "NEXUS")
                        await manager.send_handoff(
                            str(chat_session.id),
                            event["from_agent"],
                            event["to_agent"],
                        )

                    elif event_type == "done":
                        full_text  = event["data"]
                        final_agent = event.get("agent", "NEXUS")
                        await manager.send_done(str(chat_session.id), full_text, final_agent)
                        break

                    elif event_type == "error":
                        await manager.send_error(str(chat_session.id), event["data"])
                        break

                # Persist messages in background (don't block the WS)
                if full_text:
                    asyncio.create_task(
                        _save_messages(
                            chat_session.id,
                            user_message,
                            full_text,
                            final_agent,
                        )
                    )

    except WebSocketDisconnect:
        log.info("ws_client_disconnected")
    except Exception as e:
        log.error("ws_unexpected_error", error=str(e))
        try:
            await websocket.send_text(json.dumps({"type": "error", "data": str(e)}))
        except Exception:
            pass
    finally:
        manager.disconnect(session_id, websocket)
