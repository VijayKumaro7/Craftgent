"""
Tests for server-side MFA (AAL2) enforcement.

Run with: pytest tests/test_mfa_enforcement.py -v
"""
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.auth import mfa
from app.auth.dependencies import _check_aal, get_current_user, get_ws_user

USER_ID = str(uuid.uuid4())


@pytest.fixture(autouse=True)
def clear_factor_cache():
    mfa.reset_factor_cache()
    yield
    mfa.reset_factor_cache()


# ── user_requires_aal2 ────────────────────────────────────────────────────

class TestUserRequiresAal2:
    @pytest.mark.asyncio
    async def test_disabled_without_admin_credentials(self):
        settings = MagicMock(supabase_url="", supabase_service_role_key="")
        with patch("app.auth.mfa.get_settings", return_value=settings):
            assert await mfa.user_requires_aal2(USER_ID) is False

    @pytest.mark.asyncio
    async def test_verified_factor_requires_aal2(self):
        settings = MagicMock(
            supabase_url="https://proj.supabase.co",
            supabase_service_role_key="service-key",
        )
        resp = MagicMock()
        resp.json.return_value = [{"status": "verified", "factor_type": "totp"}]
        client = AsyncMock()
        client.get.return_value = resp
        client.__aenter__.return_value = client
        with patch("app.auth.mfa.get_settings", return_value=settings), \
             patch("app.auth.mfa.httpx.AsyncClient", return_value=client):
            assert await mfa.user_requires_aal2(USER_ID) is True

    @pytest.mark.asyncio
    async def test_unverified_factor_does_not_require_aal2(self):
        settings = MagicMock(
            supabase_url="https://proj.supabase.co",
            supabase_service_role_key="service-key",
        )
        resp = MagicMock()
        resp.json.return_value = [{"status": "unverified", "factor_type": "totp"}]
        client = AsyncMock()
        client.get.return_value = resp
        client.__aenter__.return_value = client
        with patch("app.auth.mfa.get_settings", return_value=settings), \
             patch("app.auth.mfa.httpx.AsyncClient", return_value=client):
            assert await mfa.user_requires_aal2(USER_ID) is False

    @pytest.mark.asyncio
    async def test_lookup_is_cached(self):
        settings = MagicMock(
            supabase_url="https://proj.supabase.co",
            supabase_service_role_key="service-key",
        )
        resp = MagicMock()
        resp.json.return_value = [{"status": "verified"}]
        client = AsyncMock()
        client.get.return_value = resp
        client.__aenter__.return_value = client
        with patch("app.auth.mfa.get_settings", return_value=settings), \
             patch("app.auth.mfa.httpx.AsyncClient", return_value=client):
            assert await mfa.user_requires_aal2(USER_ID) is True
            assert await mfa.user_requires_aal2(USER_ID) is True
        assert client.get.call_count == 1

    @pytest.mark.asyncio
    async def test_fails_open_on_admin_api_error(self):
        import httpx

        settings = MagicMock(
            supabase_url="https://proj.supabase.co",
            supabase_service_role_key="service-key",
        )
        client = AsyncMock()
        client.get.side_effect = httpx.ConnectError("boom")
        client.__aenter__.return_value = client
        with patch("app.auth.mfa.get_settings", return_value=settings), \
             patch("app.auth.mfa.httpx.AsyncClient", return_value=client):
            assert await mfa.user_requires_aal2(USER_ID) is False


# ── _check_aal ────────────────────────────────────────────────────────────

class TestCheckAal:
    @pytest.mark.asyncio
    async def test_aal2_token_always_passes(self):
        with patch("app.auth.dependencies.user_requires_aal2") as lookup:
            assert await _check_aal({"sub": USER_ID, "aal": "aal2"}) is True
            lookup.assert_not_called()

    @pytest.mark.asyncio
    async def test_aal1_token_passes_without_enrolled_factor(self):
        with patch(
            "app.auth.dependencies.user_requires_aal2",
            AsyncMock(return_value=False),
        ):
            assert await _check_aal({"sub": USER_ID, "aal": "aal1"}) is True

    @pytest.mark.asyncio
    async def test_aal1_token_rejected_with_enrolled_factor(self):
        with patch(
            "app.auth.dependencies.user_requires_aal2",
            AsyncMock(return_value=True),
        ):
            assert await _check_aal({"sub": USER_ID, "aal": "aal1"}) is False

    @pytest.mark.asyncio
    async def test_missing_aal_claim_treated_as_aal1(self):
        with patch(
            "app.auth.dependencies.user_requires_aal2",
            AsyncMock(return_value=True),
        ):
            assert await _check_aal({"sub": USER_ID}) is False


# ── Dependency integration ────────────────────────────────────────────────

class TestDependencies:
    @pytest.mark.asyncio
    async def test_get_current_user_rejects_aal1_when_mfa_enrolled(self):
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="tok")
        payload = {"sub": USER_ID, "aal": "aal1"}
        db = AsyncMock()
        with patch(
            "app.auth.dependencies.verify_supabase_token", return_value=payload
        ), patch(
            "app.auth.dependencies.user_requires_aal2",
            AsyncMock(return_value=True),
        ):
            with pytest.raises(HTTPException) as exc:
                await get_current_user(credentials=creds, db=db)
            assert exc.value.status_code == 401
            assert "Multi-factor" in exc.value.detail
        db.get.assert_not_called()

    @pytest.mark.asyncio
    async def test_get_current_user_accepts_aal2(self):
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="tok")
        payload = {"sub": USER_ID, "aal": "aal2"}
        user = MagicMock()
        db = AsyncMock()
        db.get.return_value = user
        with patch(
            "app.auth.dependencies.verify_supabase_token", return_value=payload
        ):
            assert await get_current_user(credentials=creds, db=db) is user

    @pytest.mark.asyncio
    async def test_get_ws_user_rejects_aal1_when_mfa_enrolled(self):
        payload = {"sub": USER_ID, "aal": "aal1"}
        db = AsyncMock()
        with patch(
            "app.auth.dependencies.verify_supabase_token", return_value=payload
        ), patch(
            "app.auth.dependencies.user_requires_aal2",
            AsyncMock(return_value=True),
        ):
            assert await get_ws_user("tok", db) is None
        db.get.assert_not_called()
