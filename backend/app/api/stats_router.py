"""
Stats API — agent XP and level endpoints.

GET  /api/stats               → all 3 agents' stats for current user
POST /api/stats/{agent}/award → award XP after a task (called by Celery worker)
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.auth.dependencies import get_current_user
from app.db.base import get_db
from app.models.models import User, AgentName
from app.models.agent_stats import AgentStats

router = APIRouter(prefix="/stats", tags=["stats"])


# ── Schemas ───────────────────────────────────────────────────────────────

class AgentStatOut(BaseModel):
    agent:         str
    level:         int
    xp:            int
    xp_percent:    int
    message_count: int
    hp:            int
    mp:            int


class StatsResponse(BaseModel):
    stats: dict[str, AgentStatOut]


# ── Helpers ───────────────────────────────────────────────────────────────

async def _get_or_create_stat(
    user_id: uuid.UUID, agent: AgentName, db: AsyncSession
) -> AgentStats:
    result = await db.execute(
        select(AgentStats).where(
            AgentStats.user_id   == user_id,
            AgentStats.agent_name == agent.value,
        )
    )
    stat = result.scalar_one_or_none()
    if not stat:
        stat = AgentStats(user_id=user_id, agent_name=agent.value)
        db.add(stat)
        await db.flush()
    return stat


# ── Endpoints ─────────────────────────────────────────────────────────────

@router.get("", response_model=StatsResponse)
async def get_stats(
    db:   AsyncSession = Depends(get_db),
    user: User         = Depends(get_current_user),
) -> StatsResponse:
    """Return XP stats for all 3 agents for the authenticated user."""
    out: dict[str, AgentStatOut] = {}
    for agent in AgentName:
        stat = await _get_or_create_stat(user.id, agent, db)
        out[agent.value] = AgentStatOut(
            agent=agent.value,
            level=stat.level,
            xp=stat.xp,
            xp_percent=stat.xp_percent,
            message_count=stat.message_count,
            hp=stat.hp,
            mp=stat.mp,
        )
    return StatsResponse(stats=out)


@router.post("/{agent_name}/award", status_code=status.HTTP_204_NO_CONTENT)
async def award_xp(
    agent_name: str,
    xp_amount:  int  = 50,
    user_id:    str  = "",   # passed by Celery worker (not authenticated)
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Award XP to an agent after task completion.
    Called internally by the Celery worker — not user-facing.
    """
    try:
        agent = AgentName(agent_name.upper())
        uid   = uuid.UUID(user_id)
    except (ValueError, KeyError):
        raise HTTPException(status_code=400, detail="Invalid agent or user_id")

    stat = await _get_or_create_stat(uid, agent, db)
    stat.add_xp(xp_amount)
