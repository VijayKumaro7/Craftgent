"""
Celery task: run_agent_task

This is what the WebSocket endpoint dispatches when a user sends a message.
It runs in a Celery worker process so the FastAPI event loop stays free.

Tokens stream back to the WebSocket hub via Redis pub/sub
(redis_bus.publish_token / publish_done / publish_error).
"""
import asyncio
import uuid
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
import structlog

from app.tasks.celery_app import celery_app
from app.agents.graph import run_agent_graph
from app.tasks.redis_bus import publish_error

logger = structlog.get_logger()


@celery_app.task(
    name="app.tasks.agent_tasks.run_agent_task",
    bind=True,
    max_retries=1,
    soft_time_limit=120,
    time_limit=130,
)
def run_agent_task(
    self,
    session_id: str,
    user_message: str,
    history: list[dict],
    user_id: str = "",
) -> str:
    log = logger.bind(session_id=session_id, task_id=self.request.id)
    log.info("agent_task_started")

    lc_history = []
    for msg in history:
        role    = msg.get("role", "")
        content = msg.get("content", "")
        if role == "user":
            lc_history.append(HumanMessage(content=content))
        elif role == "assistant":
            lc_history.append(AIMessage(content=content))
        elif role == "system":
            lc_history.append(SystemMessage(content=content))

    try:
        result = asyncio.run(
            run_agent_graph(session_id, user_message, lc_history, user_id=user_id)
        )
        log.info("agent_task_completed", length=len(result))

        # Award XP — determine which agent handled the task from result metadata
        # We award to the active agent; the graph sets active_agent in state
        _award_xp(user_id=user_id, agent_name="NEXUS", xp=_calc_xp(result))

        return result

    except Exception as exc:
        log.error("agent_task_failed", error=str(exc))
        publish_error(session_id, f"Task failed: {exc}")
        raise self.retry(exc=exc, countdown=2)


def _calc_xp(response: str) -> int:
    """Award more XP for longer, more detailed responses."""
    words = len(response.split())
    if words > 200:
        return 80
    elif words > 100:
        return 60
    elif words > 50:
        return 40
    return 20


def _award_xp(user_id: str, agent_name: str, xp: int) -> None:
    """
    Award XP by calling the stats endpoint internally.
    Fire-and-forget — never blocks or raises.
    """
    if not user_id or user_id == "00000000-0000-0000-0000-000000000001":
        return  # skip anonymous sessions
    try:
        from app.db.base import AsyncSessionLocal
        from app.models.models import AgentName
        from app.models.agent_stats import AgentStats
        from sqlalchemy import select

        async def _do_award():
            try:
                agent_enum = AgentName(agent_name.upper())
                uid = uuid.UUID(user_id)
                async with AsyncSessionLocal() as db:
                    result = await db.execute(
                        select(AgentStats).where(
                            AgentStats.user_id    == uid,
                            AgentStats.agent_name == agent_enum.value,
                        )
                    )
                    stat = result.scalar_one_or_none()
                    if not stat:
                        stat = AgentStats(user_id=uid, agent_name=agent_enum.value)
                        db.add(stat)
                    stat.add_xp(xp)
                    await db.commit()
            except Exception as e:
                import structlog as sl
                sl.get_logger().warning("xp_award_failed", error=str(e))

        asyncio.run(_do_award())
    except Exception:
        pass  # XP is best-effort, never crash the task
