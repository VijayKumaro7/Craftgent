"""
WebSocket Connection Manager.

Tracks all active WebSocket connections, keyed by session_id.
Handles send, broadcast, and clean disconnect.

Thread-safety note: FastAPI runs in asyncio — all operations here
are coroutines and safe within a single event loop. For multi-process
deployments (Phase 4), this moves to Redis-backed pub/sub (already
set up in redis_bus.py).
"""
import json
from typing import Any
import structlog
from fastapi import WebSocket

logger = structlog.get_logger()


class ConnectionManager:
    def __init__(self) -> None:
        # session_id → list of WebSocket connections
        # (a session can have multiple tabs open)
        self._connections: dict[str, list[WebSocket]] = {}

    async def connect(self, session_id: str, ws: WebSocket) -> None:
        await ws.accept()
        if session_id not in self._connections:
            self._connections[session_id] = []
        self._connections[session_id].append(ws)
        logger.info("ws_connected", session_id=session_id,
                    total=len(self._connections[session_id]))

    def disconnect(self, session_id: str, ws: WebSocket) -> None:
        conns = self._connections.get(session_id, [])
        if ws in conns:
            conns.remove(ws)
        if not conns:
            self._connections.pop(session_id, None)
        logger.info("ws_disconnected", session_id=session_id)

    async def send(self, session_id: str, payload: dict[str, Any]) -> None:
        """Send a JSON payload to all connections for this session."""
        conns = self._connections.get(session_id, [])
        dead: list[WebSocket] = []
        for ws in conns:
            try:
                await ws.send_text(json.dumps(payload))
            except Exception:
                dead.append(ws)
        # Clean up dead connections
        for ws in dead:
            self.disconnect(session_id, ws)

    async def send_token(self, session_id: str, token: str) -> None:
        await self.send(session_id, {"type": "token", "data": token})

    async def send_done(self, session_id: str, full_text: str, agent: str) -> None:
        await self.send(session_id, {"type": "done", "data": full_text, "agent": agent})

    async def send_error(self, session_id: str, error: str) -> None:
        await self.send(session_id, {"type": "error", "data": error})

    async def send_handoff(self, session_id: str, from_agent: str, to_agent: str) -> None:
        await self.send(session_id, {
            "type": "handoff",
            "from_agent": from_agent,
            "to_agent": to_agent,
        })

    async def send_system(self, session_id: str, message: str) -> None:
        await self.send(session_id, {"type": "system", "data": message})

    @property
    def active_sessions(self) -> int:
        return len(self._connections)


# Singleton — shared across the whole FastAPI process
manager = ConnectionManager()
