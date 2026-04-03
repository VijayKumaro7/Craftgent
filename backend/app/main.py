"""
CraftAgent — FastAPI application entrypoint.

Startup order:
1. Setup structured logging
2. Configure CORS
3. Register routers
4. Lifespan: verify DB on startup, clean up on shutdown
"""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text

from app.core.config import get_settings
from app.core.logging import setup_logging
from app.db.base import engine, AsyncSessionLocal
from app.api import health, chat, auth_router, ws_router, stats_router, sessions_router

setup_logging()
logger = structlog.get_logger()
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Runs on startup and shutdown.
    Startup: verify DB is reachable.
    Shutdown: dispose DB connection pool.
    """
    logger.info("craftgent_starting", env=settings.app_env)

    # Verify DB connectivity at startup — fail fast rather than fail later
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        logger.info("db_connection_ok")
    except Exception as e:
        logger.error("db_connection_failed", error=str(e))
        # Don't crash — let the health endpoint report the issue

    yield  # app is running

    # Shutdown
    await engine.dispose()
    logger.info("craftgent_shutdown")


def create_app() -> FastAPI:
    app = FastAPI(
        title="CraftAgent API",
        description="Minecraft-style AI Agent Command Center",
        version="0.1.0",
        docs_url="/docs" if settings.is_development else None,
        redoc_url="/redoc" if settings.is_development else None,
        lifespan=lifespan,
    )

    # ── Rate limiter ───────────────────────────────────────────────────────
    limiter = Limiter(
        key_func=get_remote_address,
        default_limits=[f"{settings.rate_limit_per_minute}/minute"],
    )
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # ── CORS ──────────────────────────────────────────────────────────────
    # Allows the Vite dev server (localhost:5173) to call the API.
    # In production, lock this down to your actual domain.
    # SECURITY: Only allow necessary methods and headers to reduce attack surface
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],  # Restrict to necessary methods only
        allow_headers=["Content-Type", "Authorization"],  # Only necessary headers
    )

    # ── Global error handler ──────────────────────────────────────────────
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error(
            "unhandled_exception",
            path=request.url.path,
            method=request.method,
            error=str(exc),
            exc_info=True,
        )
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error", "detail": str(exc) if settings.is_development else None},
        )

    # ── Routers ───────────────────────────────────────────────────────────
    app.include_router(health.router,           prefix="/api")
    app.include_router(chat.router,             prefix="/api")
    app.include_router(auth_router.router,      prefix="/api")
    app.include_router(ws_router.router,        prefix="/api")
    app.include_router(stats_router.router,     prefix="/api")
    app.include_router(sessions_router.router,  prefix="/api")

    return app


app = create_app()
