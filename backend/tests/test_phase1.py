"""
Phase 1 tests — health check and basic chat endpoint.

Run with: pytest tests/ -v
"""
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch

from app.main import app


@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


class TestHealth:
    async def test_health_returns_ok(self, client: AsyncClient):
        with patch("app.api.health.get_db") as mock_db:
            mock_session = AsyncMock()
            mock_session.execute = AsyncMock()
            mock_db.return_value = mock_session

            resp = await client.get("/api/health")
            assert resp.status_code == 200
            data = resp.json()
            assert data["status"] == "ok"
            assert "version" in data
            assert "environment" in data


class TestChat:
    async def test_chat_requires_message(self, client: AsyncClient):
        resp = await client.post("/api/chat", json={"message": ""})
        assert resp.status_code == 422  # Pydantic validation error

    async def test_chat_rejects_too_long_message(self, client: AsyncClient):
        resp = await client.post("/api/chat", json={"message": "x" * 8001})
        assert resp.status_code == 422

    async def test_chat_default_agent_is_nexus(self, client: AsyncClient):
        """Verify schema defaults work correctly."""
        from app.schemas.schemas import ChatRequest
        from app.models.models import AgentName
        req = ChatRequest(message="hello")
        assert req.agent == AgentName.NEXUS

    async def test_chat_strips_whitespace(self, client: AsyncClient):
        from app.schemas.schemas import ChatRequest
        req = ChatRequest(message="  hello  ")
        assert req.message == "hello"
