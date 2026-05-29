"""
Supabase JWT verification.

Tokens are issued by Supabase Auth and verified here using the
project's JWT secret. The frontend calls Supabase directly for
login/register/logout; the backend only verifies the resulting tokens.
"""
from typing import Any
from jose import JWTError, jwt
from app.core.config import get_settings

ALGORITHM = "HS256"


def verify_supabase_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a Supabase-issued access token.
    Raises JWTError on invalid or expired tokens.
    Returns the full JWT payload (includes 'sub', 'email', 'role', etc.).
    """
    settings = get_settings()
    return jwt.decode(
        token,
        settings.supabase_jwt_secret,
        algorithms=[ALGORITHM],
        audience="authenticated",
    )
