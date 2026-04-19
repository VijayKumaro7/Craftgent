"""
Agent history endpoint — per-agent output history for the authenticated user.

GET /api/agents/{agent_name}/history → paginated list of past outputs from an agent
"""
from __future__ import annotations
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.auth.dependencies import get_current_user
from app.db.base import get_db
from app.models.models import User, ChatSession, Message, AgentName, MessageRole

router = APIRouter(prefix="/agents", tags=["agents"])


# ── Schemas ───────────────────────────────────────────────────────────────

class AgentOutputItem(BaseModel):
    id:          str
    content:     str
    session_id:  str
    token_count: int
    created_at:  datetime

    model_config = {"from_attributes": True}


class AgentHistoryResponse(BaseModel):
    agent:    str
    outputs:  list[AgentOutputItem]
    total:    int
    page:     int
    per_page: int


# ── Endpoint ──────────────────────────────────────────────────────────────

@router.get("/{agent_name}/history", response_model=AgentHistoryResponse)
async def get_agent_history(
    agent_name: str,
    page:       int          = Query(default=1, ge=1),
    per_page:   int          = Query(default=20, ge=1, le=100),
    db:         AsyncSession = Depends(get_db),
    user:       User         = Depends(get_current_user),
) -> AgentHistoryResponse:
    """
    Return paginated output history for a specific agent, newest first.
    Only returns assistant messages where the given agent responded.
    """
    try:
        agent = AgentName(agent_name.upper())
    except (ValueError, KeyError):
        raise HTTPException(status_code=400, detail="Invalid agent name")

    offset = (page - 1) * per_page

    # Base conditions: this agent's assistant messages in this user's sessions
    base_conditions = (
        Message.agent == agent,
        Message.role == MessageRole.ASSISTANT,
        ChatSession.user_id == user.id,
    )

    count_result = await db.execute(
        select(func.count(Message.id))
        .join(ChatSession, Message.session_id == ChatSession.id)
        .where(*base_conditions)
    )
    total = count_result.scalar_one()

    outputs_result = await db.execute(
        select(Message)
        .join(ChatSession, Message.session_id == ChatSession.id)
        .where(*base_conditions)
        .order_by(Message.created_at.desc())
        .offset(offset)
        .limit(per_page)
    )
    messages = list(outputs_result.scalars().all())

    return AgentHistoryResponse(
        agent=agent.value,
        outputs=[
            AgentOutputItem(
                id=str(m.id),
                content=m.content,
                session_id=str(m.session_id),
                token_count=m.token_count,
                created_at=m.created_at,
            )
            for m in messages
        ],
        total=total,
        page=page,
        per_page=per_page,
    )
