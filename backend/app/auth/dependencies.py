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

from app.auth.security import decode_access_token
from app.db.base import get_db
from app.models.models import User

bearer_scheme = HTTPBearer(auto_error=False)

CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid or expired token",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Extract and validate the Bearer token, return the User.
    Raises 401 if token is missing, invalid, or user doesn't exist.
    """
    if not credentials:
        raise CREDENTIALS_EXCEPTION

    try:
        payload = decode_access_token(credentials.credentials)
        user_id: str = payload["sub"]
    except (JWTError, KeyError):
        raise CREDENTIALS_EXCEPTION

    user = await db.get(User, uuid.UUID(user_id))
    if not user:
        raise CREDENTIALS_EXCEPTION

    return user


async def get_ws_user(token: str, db: AsyncSession) -> User | None:
    """
    Same as get_current_user but for WebSocket connections where
    we can't raise HTTP exceptions — returns None on failure instead.
    """
    try:
        payload = decode_access_token(token)
        user_id: str = payload["sub"]
        return await db.get(User, uuid.UUID(user_id))
    except Exception:
        return None
