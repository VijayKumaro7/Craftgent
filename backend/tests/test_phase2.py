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


# ── Password policy ───────────────────────────────────────────────────────

class TestPasswordPolicy:
    """Pure-Python checks against app.auth.password_policy — no app stack."""

    def test_accepts_strong(self):
        from app.auth.password_policy import validate_password_strength
        validate_password_strength("Tr0ub4dor&3!XyZ", username="alice")

    def test_rejects_short(self):
        from app.auth.password_policy import validate_password_strength
        with pytest.raises(ValueError, match="at least"):
            validate_password_strength("Aa1!short")  # 9 chars

    def test_rejects_no_upper(self):
        from app.auth.password_policy import validate_password_strength
        with pytest.raises(ValueError, match="uppercase"):
            validate_password_strength("longenough1!extra")

    def test_rejects_no_lower(self):
        from app.auth.password_policy import validate_password_strength
        with pytest.raises(ValueError, match="lowercase"):
            validate_password_strength("LONGENOUGH1!EXTRA")

    def test_rejects_no_digit(self):
        from app.auth.password_policy import validate_password_strength
        with pytest.raises(ValueError, match="digit"):
            validate_password_strength("LongEnough!Extra")

    def test_rejects_no_special(self):
        from app.auth.password_policy import validate_password_strength
        with pytest.raises(ValueError, match="special"):
            validate_password_strength("LongEnough123ABC")

    def test_rejects_common_password(self):
        from app.auth.password_policy import validate_password_strength
        # 'password1234' is in the embedded denylist (case-insensitive)
        with pytest.raises(ValueError, match="too common"):
            validate_password_strength("password1234")

    def test_rejects_username_in_password(self):
        from app.auth.password_policy import validate_password_strength
        with pytest.raises(ValueError, match="username"):
            validate_password_strength("AliceRocks2025!", username="alice")

    def test_rejects_null_or_empty(self):
        from app.auth.password_policy import validate_password_strength
        with pytest.raises(ValueError, match="required"):
            validate_password_strength("")
        with pytest.raises(ValueError, match="required"):
            validate_password_strength(None)  # type: ignore[arg-type]


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

    async def test_login_runs_bcrypt_for_unknown_user(self, client: AsyncClient):
        """
        Login against a non-existent username must still invoke
        verify_password, otherwise an attacker can detect user existence
        from response timing alone.
        """
        from app.api import auth_router as ar
        with patch.object(ar, "verify_password", wraps=ar.verify_password) as spy:
            resp = await client.post("/api/auth/login", json={
                "username": "no-such-user-zzz",
                "password": "doesnotmatter1",
            })
            assert resp.status_code == 401
            assert spy.call_count == 1
            # Called against the dummy hash, not against a None user object.
            assert spy.call_args.args[1] == ar.DUMMY_BCRYPT_HASH

    def test_username_validator_strips_whitespace(self):
        from app.api.auth_router import RegisterRequest, LoginRequest
        # Use a policy-compliant password so the test exercises the username
        # validator alone (independent of the strength rules).
        assert RegisterRequest(
            username="  alice  ", password="Tr0ub4dor&3!XyZ"
        ).username == "alice"
        assert LoginRequest(username="\t bob \n", password="x").username == "bob"

    def test_register_request_rejects_null_username(self):
        from pydantic import ValidationError
        from app.api.auth_router import RegisterRequest
        with pytest.raises(ValidationError):
            RegisterRequest(username=None, password="Tr0ub4dor&3!XyZ")  # type: ignore[arg-type]

    def test_register_request_rejects_whitespace_username(self):
        from pydantic import ValidationError
        from app.api.auth_router import RegisterRequest
        with pytest.raises(ValidationError):
            RegisterRequest(username="     ", password="Tr0ub4dor&3!XyZ")

    def test_register_request_rejects_null_password(self):
        from pydantic import ValidationError
        from app.api.auth_router import RegisterRequest
        with pytest.raises(ValidationError):
            RegisterRequest(username="alice", password=None)  # type: ignore[arg-type]

    def test_register_request_rejects_weak_password(self):
        from pydantic import ValidationError
        from app.api.auth_router import RegisterRequest
        # 12 chars but no uppercase / digit / special — caught by the policy.
        with pytest.raises(ValidationError, match="(?i)(uppercase|digit|special)"):
            RegisterRequest(username="alice", password="alllowercase")

    def test_register_request_rejects_password_with_username(self):
        from pydantic import ValidationError
        from app.api.auth_router import RegisterRequest
        with pytest.raises(ValidationError, match="(?i)username"):
            RegisterRequest(username="alice", password="AliceTopcat99!")

    def test_register_request_accepts_strong_password(self):
        from app.api.auth_router import RegisterRequest
        r = RegisterRequest(username="alice", password="Tr0ub4dor&3!XyZ")
        assert r.username == "alice" and r.password == "Tr0ub4dor&3!XyZ"

    def test_secret_key_too_short_rejected(self, monkeypatch):
        from pydantic import ValidationError
        from app.core.config import Settings
        monkeypatch.setenv("SECRET_KEY", "shortkey")
        monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-fake")
        with pytest.raises(ValidationError) as exc:
            Settings()
        assert "SECRET_KEY" in str(exc.value)

    def test_secret_key_strong_accepted(self, monkeypatch):
        from app.core.config import Settings
        monkeypatch.setenv("SECRET_KEY", "x" * 32)
        monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-fake")
        s = Settings()
        assert len(s.secret_key) >= 32


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
