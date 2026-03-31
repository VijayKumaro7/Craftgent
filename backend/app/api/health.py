"""
Health check endpoint.
Used by Docker, load balancers, and monitoring to verify the service is alive.
Also checks DB connectivity so we catch connection issues early.
"""
import structlog
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.base import get_db
from app.schemas.schemas import HealthResponse

router = APIRouter()
logger = structlog.get_logger()

VERSION = "0.1.0"


@router.get("/health", response_model=HealthResponse, tags=["meta"])
async def health_check(
    db: AsyncSession = Depends(get_db),
    settings=Depends(get_settings),
) -> HealthResponse:
    """
    Returns service health.
    Checks: DB connectivity.
    Used by Docker health checks and monitoring.
    """
    db_status = "ok"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        logger.error("db_health_check_failed", error=str(e))
        db_status = "error"

    return HealthResponse(
        status="ok",
        version=VERSION,
        environment=settings.app_env,
        db=db_status,
    )
