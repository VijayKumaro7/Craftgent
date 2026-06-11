"""
Server-side MFA (AAL2) enforcement.

Supabase issues an AAL1 access token after password/OAuth sign-in even
when the user has a verified TOTP factor — the session is only upgraded
to AAL2 once the factor is verified. The frontend gates on this, but
access tokens are bearer credentials, so the backend independently
rejects AAL1 tokens for users who have a verified MFA factor.

Whether a user has a verified factor is looked up via the Supabase Auth
admin API (service role key), with a short in-process TTL cache so we
don't pay a network round-trip on every request.
"""
import time

import httpx
import structlog

from app.core.config import get_settings

logger = structlog.get_logger(__name__)

_CACHE_TTL_SECONDS = 60.0
# user_id -> (expires_at_monotonic, has_verified_factor)
_factor_cache: dict[str, tuple[float, bool]] = {}


def reset_factor_cache() -> None:
    """Clear the factor lookup cache (used by tests)."""
    _factor_cache.clear()


async def user_requires_aal2(user_id: str) -> bool:
    """
    True if the user has at least one verified MFA factor, meaning only
    AAL2 tokens should be accepted for them.

    Fails open (returns False) when the admin API is unreachable or the
    service role key isn't configured, so a Supabase outage or a local
    dev setup without admin access doesn't lock out the whole API — the
    frontend still enforces the MFA step-up in those cases.
    """
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_role_key:
        return False

    now = time.monotonic()
    cached = _factor_cache.get(user_id)
    if cached and cached[0] > now:
        return cached[1]

    url = f"{settings.supabase_url.rstrip('/')}/auth/v1/admin/users/{user_id}/factors"
    headers = {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
    }
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            factors = resp.json()
    except (httpx.HTTPError, ValueError) as exc:
        logger.warning("mfa_factor_lookup_failed", user_id=user_id, error=str(exc))
        return False

    requires = isinstance(factors, list) and any(
        f.get("status") == "verified" for f in factors
    )
    _factor_cache[user_id] = (now + _CACHE_TTL_SECONDS, requires)
    return requires
