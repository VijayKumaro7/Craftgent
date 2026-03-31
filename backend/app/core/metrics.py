"""
Prometheus metrics middleware.

Exposes /metrics endpoint for Prometheus scraping.
Tracks: request count, latency, active WebSocket connections,
        agent task completions, error rates.

Add to FastAPI with:
    from app.core.metrics import setup_metrics
    setup_metrics(app)
"""
import time
from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.routing import Match

# Only import prometheus_client if installed — optional dep
try:
    from prometheus_client import (
        Counter, Histogram, Gauge,
        generate_latest, CONTENT_TYPE_LATEST, CollectorRegistry
    )
    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False


if PROMETHEUS_AVAILABLE:
    # ── Metrics definitions ───────────────────────────────────────────
    http_requests_total = Counter(
        "craftgent_http_requests_total",
        "Total HTTP requests",
        ["method", "path", "status_code"],
    )
    http_request_duration = Histogram(
        "craftgent_http_request_duration_seconds",
        "HTTP request duration",
        ["method", "path"],
        buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
    )
    ws_connections_active = Gauge(
        "craftgent_ws_connections_active",
        "Active WebSocket connections",
    )
    agent_tasks_total = Counter(
        "craftgent_agent_tasks_total",
        "Agent tasks completed",
        ["agent", "status"],
    )
    memory_retrievals_total = Counter(
        "craftgent_memory_retrievals_total",
        "ChromaDB memory retrievals",
    )


class MetricsMiddleware(BaseHTTPMiddleware):
    """Records HTTP request count + latency per route."""

    async def dispatch(self, request: Request, call_next) -> Response:
        if not PROMETHEUS_AVAILABLE:
            return await call_next(request)

        # Match route pattern (e.g. /api/sessions/{session_id} not the literal URL)
        route_path = request.url.path
        for route in request.app.routes:
            match, _ = route.matches({"type": "http", "path": route_path,
                                      "method": request.method, "query_string": b""})
            if match == Match.FULL:
                route_path = getattr(route, "path", route_path)
                break

        start = time.perf_counter()
        response = await call_next(request)
        duration = time.perf_counter() - start

        http_requests_total.labels(
            method=request.method,
            path=route_path,
            status_code=response.status_code,
        ).inc()
        http_request_duration.labels(
            method=request.method,
            path=route_path,
        ).observe(duration)

        return response


def setup_metrics(app: FastAPI) -> None:
    """Register metrics middleware and /metrics endpoint."""
    if not PROMETHEUS_AVAILABLE:
        return

    app.add_middleware(MetricsMiddleware)

    @app.get("/metrics", include_in_schema=False)
    async def metrics() -> Response:
        return Response(
            content=generate_latest(),
            media_type=CONTENT_TYPE_LATEST,
        )


# ── Utility functions for manual instrumentation ──────────────────────────

def record_agent_task(agent: str, status: str = "success") -> None:
    if PROMETHEUS_AVAILABLE:
        agent_tasks_total.labels(agent=agent, status=status).inc()


def set_ws_connections(count: int) -> None:
    if PROMETHEUS_AVAILABLE:
        ws_connections_active.set(count)


def record_memory_retrieval() -> None:
    if PROMETHEUS_AVAILABLE:
        memory_retrievals_total.inc()
