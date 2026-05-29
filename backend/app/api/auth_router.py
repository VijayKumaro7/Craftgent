"""
Auth API endpoints.

Authentication (register, login, logout, token refresh) is handled
directly by the Supabase Auth SDK on the frontend. The backend only
exposes /me to let clients fetch the authenticated user's profile.

GET  /api/auth/me  — return current user profile (protected)
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.auth.dependencies import get_current_user
from app.models.models import User

router = APIRouter(prefix="/auth", tags=["auth"])


class UserOut(BaseModel):
    id: str
    username: str

    model_config = {"from_attributes": True}


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)) -> UserOut:
    """Return the currently authenticated user's profile."""
    return UserOut(id=str(user.id), username=user.username)
