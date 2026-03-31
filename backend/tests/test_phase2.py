"""
Phase 2 tests — auth, WebSocket protocol, LangGraph routing logic.

Run with: pytest tests/ -v
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.auth.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    decode_access_token, decode_refresh_token,
)
from app.ws.manager import ConnectionManager


# ── Security unit tests ───────────────────────────────────────────────────

class TestPasswordHashing:
    def test_hash_and_verify(self):
        hashed = hash_password("minecraft123")
        assert verify_password("minecraft123", hashed)

    def test_wrong_password_fails(self):
        hashed = hash_password("minecraft123")
        assert not verify_password("wrongpass", hashed)

    def test_hashes_are_unique(self):
        """Same password should produce different hashes (bcrypt salts)."""
        h1 = hash_password("same")
        h2 = hash_password("same")
        assert h1 != h2


class TestJWTTokens:
    def test_access_token_round_trip(self):
        token = create_access_token("user-123", "steve")
        payload = decode_access_token(token)
        assert payload["sub"] == "user-123"
        assert payload["username"] == "steve"
        assert payload["type"] == "access"

    def test_refresh_token_round_trip(self):
        token = create_refresh_token("user-456")
        user_id = decode_refresh_token(token)
        assert user_id == "user-456"

    def test_refresh_token_rejected_as_access(self):
        from jose import JWTError
        refresh = create_refresh_token("user-789")
        with pytest.raises(JWTError):
            decode_access_token(refresh)

    def test_access_token_rejected_as_refresh(self):
        from jose import JWTError
        access = create_access_token("user-111", "alex")
        with pytest.raises(JWTError):
            decode_refresh_token(access)


# ── WebSocket manager unit tests ──────────────────────────────────────────

class TestConnectionManager:
    @pytest.mark.asyncio
    async def test_connect_and_disconnect(self):
        mgr = ConnectionManager()
        ws = AsyncMock()
        await mgr.connect("session-1", ws)
        ws.accept.assert_called_once()
        assert mgr.active_sessions == 1

        mgr.disconnect("session-1", ws)
        assert mgr.active_sessions == 0

    @pytest.mark.asyncio
    async def test_send_to_connected_client(self):
        mgr = ConnectionManager()
        ws = AsyncMock()
        await mgr.connect("session-2", ws)
        await mgr.send_token("session-2", "hello")
        ws.send_text.assert_called_once()
        sent = ws.send_text.call_args[0][0]
        import json
        data = json.loads(sent)
        assert data["type"] == "token"
        assert data["data"] == "hello"

    @pytest.mark.asyncio
    async def test_dead_connection_cleaned_up(self):
        """If a send fails, the dead WS is removed."""
        mgr = ConnectionManager()
        ws = AsyncMock()
        ws.send_text.side_effect = Exception("connection dead")
        await mgr.connect("session-3", ws)
        await mgr.send("session-3", {"type": "test"})
        # After failed send, connection should be cleaned up
        assert mgr.active_sessions == 0


# ── Auth API tests ────────────────────────────────────────────────────────

@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


class TestAuthAPI:
    async def test_register_validates_short_password(self, client: AsyncClient):
        resp = await client.post("/api/auth/register", json={
            "username": "steve", "password": "short"
        })
        assert resp.status_code == 422

    async def test_register_validates_short_username(self, client: AsyncClient):
        resp = await client.post("/api/auth/register", json={
            "username": "ab", "password": "validpassword123"
        })
        assert resp.status_code == 422

    async def test_me_requires_auth(self, client: AsyncClient):
        """Without a token, /me should return 403 (HTTPBearer auto_error=False returns 403)."""
        resp = await client.get("/api/auth/me")
        # HTTPBearer with no creds → 403 Forbidden (FastAPI default)
        assert resp.status_code in (401, 403)

    async def test_login_wrong_password_format(self, client: AsyncClient):
        """Login with empty body fails validation."""
        resp = await client.post("/api/auth/login", json={})
        assert resp.status_code == 422


# ── LangGraph routing logic test ──────────────────────────────────────────

class TestAgentRouting:
    def test_graph_was_compiled(self):
        """Verify the LangGraph compiled without errors."""
        from app.agents.graph import agent_graph
        assert agent_graph is not None

    def test_route_function_defaults(self):
        from app.agents.graph import route
        # Default to nexus_answer for unknown decisions
        state = {"route_decision": "unknown", "messages": [], "session_id": "",
                 "active_agent": "NEXUS", "final_response": ""}
        assert route(state) == "nexus_answer"

    def test_route_function_code(self):
        from app.agents.graph import route
        state = {"route_decision": "code", "messages": [], "session_id": "",
                 "active_agent": "NEXUS", "final_response": ""}
        assert route(state) == "alex_code"

    def test_route_function_data(self):
        from app.agents.graph import route
        state = {"route_decision": "data", "messages": [], "session_id": "",
                 "active_agent": "NEXUS", "final_response": ""}
        assert route(state) == "vortex_data"
