"""
Session list endpoint — returns all chat sessions for the authenticated user.
Used by the frontend SessionHistory panel to let users browse past chats.

GET /api/sessions          → paginated list of sessions
GET /api/sessions/{id}     → single session with full message history (already in chat.py)
"""
from __future__ import annotations
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.auth.dependencies import get_current_user
from app.db.base import get_db
from app.models.models import User, ChatSession, Message, AgentName

router = APIRouter(prefix="/sessions", tags=["sessions"])


# ── Schemas ───────────────────────────────────────────────────────────────

class SessionSummary(BaseModel):
    id:            str
    active_agent:  AgentName
    message_count: int
    last_message:  str | None   # first 80 chars of the last message
    updated_at:    datetime
    created_at:    datetime

    model_config = {"from_attributes": True}


class SessionListResponse(BaseModel):
    sessions: list[SessionSummary]
    total:    int
    page:     int
    per_page: int


# ── Endpoint ──────────────────────────────────────────────────────────────

@router.get("", response_model=SessionListResponse)
async def list_sessions(
    page:     int          = Query(default=1, ge=1),
    per_page: int          = Query(default=20, ge=1, le=100),
    db:       AsyncSession = Depends(get_db),
    user:     User         = Depends(get_current_user),
) -> SessionListResponse:
    """
    Return a paginated list of the user's chat sessions,
    newest first, with message count and last message preview.
    """
    offset = (page - 1) * per_page

    # Total count
    count_result = await db.execute(
        select(func.count(ChatSession.id)).where(ChatSession.user_id == user.id)
    )
    total = count_result.scalar_one()

    # Paginated sessions, newest first
    sessions_result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == user.id)
        .order_by(ChatSession.updated_at.desc())
        .offset(offset)
        .limit(per_page)
    )
    sessions = list(sessions_result.scalars().all())

    summaries: list[SessionSummary] = []
    for session in sessions:
        # Message count for this session
        count_q = await db.execute(
            select(func.count(Message.id)).where(Message.session_id == session.id)
        )
        msg_count = count_q.scalar_one()

        # Last message preview
        last_q = await db.execute(
            select(Message.content)
            .where(Message.session_id == session.id)
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        last_content = last_q.scalar_one_or_none()
        preview = (last_content[:80] + "...") if last_content and len(last_content) > 80 else last_content

        summaries.append(SessionSummary(
            id=str(session.id),
            active_agent=session.active_agent,
            message_count=msg_count,
            last_message=preview,
            updated_at=session.updated_at,
            created_at=session.created_at,
        ))

    return SessionListResponse(
        sessions=summaries,
        total=total,
        page=page,
        per_page=per_page,
    )
