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
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_core.messages import HumanMessage, AIMessage

from app.ws.manager import manager
from app.tasks.redis_bus import subscribe_session
from app.tasks.agent_tasks import run_agent_task
from app.auth.dependencies import get_ws_user
from app.db.base import get_db, AsyncSessionLocal
from app.memory.service import MemoryService
from app.models.models import ChatSession, Message, MessageRole, AgentName

router = APIRouter(tags=["websocket"])
logger = structlog.get_logger()

# Fetch enough history to cover the widest per-agent window (RESEARCHER = 30).
# Each agent node further trims this to its own AGENT_HISTORY_WINDOW value.
MAX_CONTEXT = 40


async def _get_or_create_session(
    session_id: str, user_id: str, db: AsyncSession
) -> tuple[ChatSession, bool]:
    """
    Fetch existing session or create a new one.
    SECURITY: Verify user owns the session if it exists.

    Returns (session, created) where `created` is True when a brand-new
    session was inserted in this call — callers can use it to skip the
    history query, since a new session has no prior messages.
    """
    try:
        sid = uuid.UUID(session_id)
        session = await db.get(ChatSession, sid)
        if session:
            # SECURITY: Verify the requesting user owns this session
            if str(session.user_id) != user_id:
                logger.warning(
                    "unauthorized_ws_session_access",
                    session_id=session_id,
                    session_owner=str(session.user_id),
                    requester=user_id,
                )
                raise ValueError(f"Session {session_id} does not belong to user {user_id}")
            return session, False
    except ValueError:
        pass

    session = ChatSession(
        user_id=uuid.UUID(user_id),
        active_agent=AgentName.NEXUS,
    )
    db.add(session)
    await db.flush()
    return session, True


async def _load_history(session_id: uuid.UUID, db: AsyncSession) -> list[dict]:
    """Load the last MAX_CONTEXT messages for a session via an explicit query.

    Accessing ``ChatSession.messages`` lazily on an ``AsyncSession`` raises
    ``MissingGreenlet`` / returns no rows, so we must query the table
    directly — same pattern as ``sessions_router.list_sessions``.
    """
    result = await db.execute(
        select(Message)
        .where(
            Message.session_id == session_id,
            Message.role.in_((MessageRole.USER, MessageRole.ASSISTANT)),
        )
        .order_by(Message.created_at)
    )
    messages = list(result.scalars().all())
    recent = messages[-MAX_CONTEXT:]
    return [{"role": m.role.value, "content": m.content} for m in recent]


async def _save_messages(
    session_id: uuid.UUID,
    user_content: str,
    assistant_content: str,
    agent: str,
) -> tuple[uuid.UUID, uuid.UUID]:
    """Persist both sides of the exchange to the DB after the task completes.

    Returns the (user_message_id, assistant_message_id) of the rows inserted
    so the caller can write them to the ChromaDB vector index with a stable
    reference back to the source of truth.
    """
    async with AsyncSessionLocal() as db:
        try:
            user_msg = Message(
                session_id=session_id,
                role=MessageRole.USER,
                content=user_content,
            )
            assistant_msg = Message(
                session_id=session_id,
                role=MessageRole.ASSISTANT,
                content=assistant_content,
                agent=AgentName(agent),
                token_count=len(assistant_content.split()),
            )
            db.add(user_msg)
            db.add(assistant_msg)
            await db.commit()
            logger.info("messages_persisted", session_id=str(session_id), user_len=len(user_content))
            return user_msg.id, assistant_msg.id
        except Exception as e:
            await db.rollback()
            logger.error("message_persistence_failed", session_id=str(session_id), error=str(e))
            raise


def _index_memory(
    user_id: str,
    session_id: uuid.UUID,
    user_message_id: uuid.UUID,
    user_content: str,
    assistant_message_id: uuid.UUID,
    assistant_content: str,
    agent: str,
) -> None:
    """Write the freshly-committed exchange to the ChromaDB memory index.

    DB is the source of truth; ChromaDB is a derived index that we only
    write *after* a successful Postgres commit. A Chroma outage must not
    surface to the user, so any failure is swallowed and logged.
    """
    try:
        svc = MemoryService(user_id=user_id)
        svc.store_message(
            message_id=str(user_message_id),
            content=user_content,
            role=MessageRole.USER.value,
            session_id=str(session_id),
        )
        svc.store_message(
            message_id=str(assistant_message_id),
            content=assistant_content,
            role=MessageRole.ASSISTANT.value,
            session_id=str(session_id),
            agent=agent,
        )
    except Exception as e:
        logger.warning("memory_index_failed", session_id=str(session_id), error=str(e))


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

                if len(user_message) > 8000:
                    await websocket.send_text(json.dumps({"type": "error", "data": "Message too long (max 8000 chars)"}))
                    continue

                # Auth — validate JWT
                user = await get_ws_user(token, db)
                if not user:
                    await websocket.send_text(json.dumps({
                        "type": "error", "data": "Unauthorized — invalid token"
                    }))
                    continue

                # Get/create session
                try:
                    chat_session, created = await _get_or_create_session(session_id, str(user.id), db)
                except ValueError as e:
                    await websocket.send_text(json.dumps({
                        "type": "error", "data": "Unauthorized — you do not have access to this session"
                    }))
                    continue

                # Brand-new sessions have no history yet; skip the query.
                history = [] if created else await _load_history(chat_session.id, db)

                log.info(
                    "chat_message_received",
                    user=user.username,
                    msg_len=len(user_message),
                    history_turns=len(history),
                )

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

                # Persist messages after response completes, THEN mirror them
                # into the ChromaDB memory index. Postgres is the source of
                # truth; the vector store is only updated on a successful
                # commit so retrieval can never surface ghost rows.
                if full_text:
                    try:
                        user_msg_id, assistant_msg_id = await _save_messages(
                            chat_session.id,
                            user_message,
                            full_text,
                            final_agent,
                        )
                        log.info("message_saved_to_db", session_id=str(chat_session.id))
                        _index_memory(
                            str(user.id),
                            chat_session.id,
                            user_msg_id,
                            user_message,
                            assistant_msg_id,
                            full_text,
                            final_agent,
                        )
                    except Exception as e:
                        log.error("failed_to_save_message", error=str(e))
                        await manager.send_error(str(chat_session.id), f"Failed to save message: {e}")

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
