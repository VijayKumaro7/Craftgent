"""
Auth API endpoints.

POST /api/auth/register  — create account
POST /api/auth/login     — get access + refresh tokens
POST /api/auth/refresh   — exchange refresh token for new access token
GET  /api/auth/me        — get current user info (protected)
"""
import structlog
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field, field_validator, model_validator

from app.auth.password_policy import (
    MIN_PASSWORD_LENGTH,
    validate_password_strength,
)
from app.auth.security import (
    DUMMY_BCRYPT_HASH,
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_refresh_token,
)
from app.auth.dependencies import get_current_user
from app.db.base import get_db
from app.models.models import User

router = APIRouter(prefix="/auth", tags=["auth"])
logger = structlog.get_logger()
limiter = Limiter(key_func=get_remote_address)


# ── Schemas (local to auth — keep it self-contained) ──────────────────────

def _normalise_username(v: object) -> str:
    """Reject null / non-string / empty / whitespace-only usernames.

    Run with ``mode='before'`` so the surrounding ``Field(min_length=3)``
    constraint then validates the *stripped* value, not the raw one.
    """
    if not isinstance(v, str):
        raise ValueError("Username is required")
    v = v.strip()
    if not v:
        raise ValueError("Username is required")
    return v


def _require_password(v: object) -> str:
    """Reject null / non-string / empty passwords.

    Whitespace-only passwords are still rejected by the strength
    policy (no lower/upper/digit/special), but we don't ``.strip()``
    here — leading/trailing whitespace is technically a valid choice.
    """
    if not isinstance(v, str) or not v:
        raise ValueError("Password is required")
    return v


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=32)
    password: str = Field(..., min_length=MIN_PASSWORD_LENGTH, max_length=128)

    _normalise_username = field_validator("username", mode="before")(
        lambda cls, v: _normalise_username(v)
    )
    _require_password = field_validator("password", mode="before")(
        lambda cls, v: _require_password(v)
    )

    @model_validator(mode="after")
    def _check_password_policy(self) -> "RegisterRequest":
        # Run the full strength policy here (rather than in a field
        # validator) so we can compare the password against the username.
        validate_password_strength(self.password, self.username)
        return self


class LoginRequest(BaseModel):
    username: str
    password: str

    _normalise_username = field_validator("username", mode="before")(
        lambda cls, v: _normalise_username(v)
    )
    _require_password = field_validator("password", mode="before")(
        lambda cls, v: _require_password(v)
    )


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    username: str

    model_config = {"from_attributes": True}


# ── Endpoints ─────────────────────────────────────────────────────────────

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, req: RegisterRequest, db: AsyncSession = Depends(get_db)) -> UserOut:
    """Create a new user account."""
    # Case-insensitive uniqueness — preserves display case but blocks
    # collisions like "Alice" vs "alice".
    existing = await db.execute(
        select(User).where(func.lower(User.username) == req.username.lower())
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken",
        )

    user = User(
        username=req.username,
        hashed_password=hash_password(req.password),
    )
    db.add(user)
    await db.flush()
    # Don't return 201 until the row is durable — see the WebSocket fix in
    # ws_router for the same pattern.
    await db.commit()
    logger.info("user_registered", username=req.username, user_id=str(user.id))
    return UserOut(id=str(user.id), username=user.username)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(
    request: Request,
    req: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Authenticate and return tokens."""
    # Case-insensitive lookup — keeps "Alice" working for legacy rows while
    # making the new uniqueness rule on register stick.
    result = await db.execute(
        select(User).where(func.lower(User.username) == req.username.lower())
    )
    user = result.scalar_one_or_none()

    # Always run bcrypt — against the real hash if the user exists, against a
    # dummy hash otherwise — so login latency does not leak user existence.
    target_hash = user.hashed_password if user else DUMMY_BCRYPT_HASH
    password_ok = verify_password(req.password, target_hash)

    if not user or not password_ok:
        logger.warning("login_failed", username=req.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    access_token  = create_access_token(str(user.id), user.username)
    refresh_token = create_refresh_token(str(user.id))

    # httpOnly + Secure + SameSite=Strict: same-origin only, no JS access,
    # HTTPS only. The refresh flow is same-origin (frontend served behind
    # the same nginx), so Strict is correct here.
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=60 * 60 * 24 * 7,  # 7 days
    )

    logger.info("user_login", username=req.username)
    return TokenResponse(access_token=access_token)


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("10/minute")
async def refresh(
    request: Request,
    db: AsyncSession = Depends(get_db),
    refresh_token: str | None = Cookie(default=None),
) -> TokenResponse:
    """Exchange a refresh token cookie for a new access token."""
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")

    try:
        user_id = decode_refresh_token(refresh_token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    import uuid
    try:
        user = await db.get(User, uuid.UUID(user_id))
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return TokenResponse(access_token=create_access_token(str(user.id), user.username))


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)) -> UserOut:
    """Return the currently authenticated user."""
    return UserOut(id=str(user.id), username=user.username)
