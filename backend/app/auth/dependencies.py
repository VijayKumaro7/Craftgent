"""
FastAPI dependencies for authentication.

Usage in any protected endpoint:
    async def my_endpoint(user: User = Depends(get_current_user)):
        ...

Usage in WebSocket:
    user = await get_ws_user(token, db)
"""
import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.mfa import user_requires_aal2
from app.auth.security import verify_supabase_token
from app.db.base import get_db
from app.models.models import User

bearer_scheme = HTTPBearer(auto_error=False)

CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid or expired token",
    headers={"WWW-Authenticate": "Bearer"},
)

MFA_REQUIRED_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Multi-factor authentication required",
    headers={"WWW-Authenticate": "Bearer"},
)


async def _check_aal(payload: dict) -> bool:
    """
    True if the token's assurance level is acceptable: AAL2 tokens always
    pass; AAL1 tokens pass only when the user has no verified MFA factor.
    """
    if payload.get("aal") == "aal2":
        return True
    return not await user_requires_aal2(payload["sub"])


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Verify the Supabase Bearer token and return the matching User (profile).
    Raises 401 if token is missing, invalid, expired, or no profile exists.
    """
    if not credentials:
        raise CREDENTIALS_EXCEPTION

    try:
        payload = verify_supabase_token(credentials.credentials)
        user_id: str = payload["sub"]
    except (JWTError, KeyError):
        raise CREDENTIALS_EXCEPTION

    if not await _check_aal(payload):
        raise MFA_REQUIRED_EXCEPTION

    user = await db.get(User, uuid.UUID(user_id))
    if not user:
        raise CREDENTIALS_EXCEPTION

    return user


async def get_ws_user(token: str, db: AsyncSession) -> User | None:
    """
    Same as get_current_user but for WebSocket connections where
    we can't raise HTTP exceptions — returns None on auth failure.
    """
    try:
        payload = verify_supabase_token(token)
        user_id: str = payload["sub"]
        parsed_id = uuid.UUID(user_id)
    except (JWTError, KeyError, ValueError):
        return None
    if not await _check_aal(payload):
        return None
    return await db.get(User, parsed_id)
