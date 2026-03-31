"""
Chat API — the core endpoint for Phase 1.

POST /api/chat         → streams a Claude response token by token via SSE
GET  /api/sessions     → list sessions (stub for Phase 2)
GET  /api/sessions/:id → get session with history
"""
import json
import uuid
import structlog
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession
from anthropic import AsyncAnthropic, APIStatusError, APIConnectionError

from app.core.config import get_settings, Settings
from app.db.base import get_db
from app.models.models import AgentName, ChatSession, Message, MessageRole
from app.schemas.schemas import ChatRequest, SessionOut, ErrorResponse
from app.agents.prompts import get_system_prompt

router = APIRouter()
logger = structlog.get_logger()
limiter = Limiter(key_func=get_remote_address)

# Anthropic model to use — always Sonnet for the best quality/cost balance
MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 2048

# Max messages we send as context (keeps token costs predictable)
MAX_CONTEXT_MESSAGES = 20


async def _get_or_create_session(
    session_id: uuid.UUID | None,
    agent: AgentName,
    db: AsyncSession,
) -> ChatSession:
    """
    Returns an existing session or creates a new one.
    In Phase 1 sessions are anonymous (no user auth yet).
    Phase 2 will attach sessions to authenticated users.
    """
    if session_id:
        result = await db.get(ChatSession, session_id)
        if result:
            return result
        # Session not found — create fresh rather than 404 (graceful degradation)
        logger.warning("session_not_found_creating_new", session_id=str(session_id))

    session = ChatSession(
        # Phase 1: anonymous user UUID placeholder — replaced with real user in Phase 2
        user_id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
        active_agent=agent,
    )
    db.add(session)
    await db.flush()  # get the generated ID without committing
    return session


def _build_message_history(messages: list[Message]) -> list[dict]:
    """
    Convert DB messages to Anthropic API format.
    Truncates to MAX_CONTEXT_MESSAGES to avoid token blowout.
    """
    recent = messages[-MAX_CONTEXT_MESSAGES:] if len(messages) > MAX_CONTEXT_MESSAGES else messages
    return [
        {"role": msg.role.value, "content": msg.content}
        for msg in recent
        if msg.role in (MessageRole.USER, MessageRole.ASSISTANT)
    ]


async def _stream_claude(
    user_message: str,
    history: list[dict],
    agent: AgentName,
    settings: Settings,
):
    """
    Async generator that streams Claude tokens as Server-Sent Events.
    Each chunk is: data: {"token": "..."}\n\n
    Final chunk is:  data: {"done": true, "full_text": "..."}\n\n
    """
    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    system_prompt = get_system_prompt(agent)

    messages = history + [{"role": "user", "content": user_message}]

    full_text = ""
    try:
        async with client.messages.stream(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=system_prompt,
            messages=messages,
        ) as stream:
            async for text_chunk in stream.text_stream:
                full_text += text_chunk
                payload = json.dumps({"token": text_chunk})
                yield f"data: {payload}\n\n"

        # Signal completion with the full assembled text
        done_payload = json.dumps({"done": True, "full_text": full_text})
        yield f"data: {done_payload}\n\n"

    except APIStatusError as e:
        logger.error("anthropic_api_error", status_code=e.status_code, message=e.message)
        error_payload = json.dumps({"error": "API error", "detail": e.message})
        yield f"data: {error_payload}\n\n"

    except APIConnectionError as e:
        logger.error("anthropic_connection_error", error=str(e))
        error_payload = json.dumps({"error": "Connection error", "detail": "Could not reach Anthropic API"})
        yield f"data: {error_payload}\n\n"


@router.post(
    "/chat",
    tags=["chat"],
    summary="Send a message to an agent (streaming)",
    responses={422: {"model": ErrorResponse}, 429: {"description": "Rate limit exceeded"}, 500: {"model": ErrorResponse}},
)
@limiter.limit("20/minute")
async def chat(
    request: Request,
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> StreamingResponse:
    """
    Streams a Claude response as Server-Sent Events.

    Client should read the stream and parse each `data: {...}` line:
    - `{"token": "..."}` — append to the chat bubble
    - `{"done": true, "full_text": "..."}` — response complete
    - `{"error": "..."}` — something went wrong
    """
    log = logger.bind(agent=body.agent, session_id=str(body.session_id))
    log.info("chat_request_received")

    # Get or create session
    session = await _get_or_create_session(body.session_id, body.agent, db)

    # Build history from existing messages
    history = _build_message_history(session.messages)

    # Save user message to DB
    user_msg = Message(
        session_id=session.id,
        role=MessageRole.USER,
        content=body.message,
        agent=None,
    )
    db.add(user_msg)
    await db.flush()

    # We can't save the assistant message until streaming is done.
    # The client sends a follow-up PATCH /sessions/:id/messages when done.
    # (Phase 2 will use WebSockets which handle this more elegantly.)

    async def stream_with_session_id():
        """Prepend session_id so the client can track it."""
        session_payload = json.dumps({"session_id": str(session.id)})
        yield f"data: {session_payload}\n\n"

        async for chunk in _stream_claude(body.message, history, body.agent, settings):
            yield chunk

    log.info("streaming_response_started", session_id=str(session.id))

    return StreamingResponse(
        stream_with_session_id(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",   # prevents Nginx from buffering SSE
            "Connection": "keep-alive",
        },
    )


@router.get(
    "/sessions/{session_id}",
    response_model=SessionOut,
    tags=["sessions"],
    summary="Get session with message history",
)
async def get_session(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> SessionOut:
    session = await db.get(ChatSession, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return SessionOut.model_validate(session)
