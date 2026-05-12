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
from app.models.models import User, ChatSession, Message, MessageRole, AgentName

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

    # Pre-aggregate message counts per session (user + assistant only).
    counts_subq = (
        select(
            Message.session_id.label("sid"),
            func.count(Message.id).label("cnt"),
        )
        .where(Message.role.in_((MessageRole.USER, MessageRole.ASSISTANT)))
        .group_by(Message.session_id)
        .subquery()
    )

    # Latest message content per session via Postgres DISTINCT ON.
    # (id, created_at DESC) breaks ties deterministically when two rows in the
    # same commit share a microsecond — see `_save_messages` which inserts the
    # user + assistant pair under a single utcnow() lambda.
    last_msgs_subq = (
        select(
            Message.session_id.label("sid"),
            Message.content.label("content"),
        )
        .where(Message.role.in_((MessageRole.USER, MessageRole.ASSISTANT)))
        .order_by(
            Message.session_id,
            Message.created_at.desc(),
            Message.id.desc(),
        )
        .distinct(Message.session_id)
        .subquery()
    )

    rows_q = (
        select(ChatSession, counts_subq.c.cnt, last_msgs_subq.c.content)
        .outerjoin(counts_subq, counts_subq.c.sid == ChatSession.id)
        .outerjoin(last_msgs_subq, last_msgs_subq.c.sid == ChatSession.id)
        .where(ChatSession.user_id == user.id)
        .order_by(ChatSession.updated_at.desc())
        .offset(offset)
        .limit(per_page)
    )
    rows = (await db.execute(rows_q)).all()

    summaries: list[SessionSummary] = [
        SessionSummary(
            id=str(session.id),
            active_agent=session.active_agent,
            message_count=int(cnt or 0),
            last_message=(
                (last_content[:80] + "...")
                if last_content and len(last_content) > 80
                else last_content
            ),
            updated_at=session.updated_at,
            created_at=session.created_at,
        )
        for session, cnt, last_content in rows
    ]

    return SessionListResponse(
        sessions=summaries,
        total=total,
        page=page,
        per_page=per_page,
    )
