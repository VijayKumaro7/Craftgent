"""
Celery application factory.

Workers run agent tasks asynchronously so the WebSocket connection
stays responsive. Tokens stream back via Redis pub/sub.

Start a worker with:
    celery -A app.tasks.celery_app worker --loglevel=info
"""
from celery import Celery
from app.core.config import get_settings


def make_celery() -> Celery:
    settings = get_settings()

    app = Celery(
        "craftgent",
        broker=settings.redis_url,
        backend=settings.redis_url,
    )

    app.conf.update(
        # Serialisation — JSON only, never pickle (security)
        task_serializer="json",
        result_serializer="json",
        accept_content=["json"],
        # Timezone
        timezone="UTC",
        enable_utc=True,
        # Task behaviour
        task_acks_late=True,           # ack after completion, not on receipt
        task_reject_on_worker_lost=True,
        worker_prefetch_multiplier=1,  # one task at a time per worker
        # Result expiry — 1 hour
        result_expires=3600,
        # Routing
        task_routes={
            "app.tasks.agent_tasks.run_agent_task": {"queue": "agents"},
        },
    )

    return app


celery_app = make_celery()
