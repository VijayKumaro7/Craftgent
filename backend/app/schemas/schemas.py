"""
Pydantic v2 schemas for API request/response.
Kept separate from SQLAlchemy models intentionally —
never expose raw DB models directly to the API layer.
"""
import uuid
from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from app.models.models import AgentName, MessageRole


# ── Chat ──────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=8000)
    session_id: uuid.UUID | None = None
    agent: AgentName = AgentName.NEXUS

    @field_validator("message")
    @classmethod
    def strip_message(cls, v: str) -> str:
        return v.strip()


class MessageOut(BaseModel):
    id: uuid.UUID
    role: MessageRole
    content: str
    agent: AgentName | None
    created_at: datetime

    model_config = {"from_attributes": True}


class SessionOut(BaseModel):
    id: uuid.UUID
    active_agent: AgentName
    created_at: datetime
    messages: list[MessageOut] = []

    model_config = {"from_attributes": True}


# ── Health ────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    db: str = "unknown"


# ── Error ─────────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    error: str
    detail: str | None = None


# ── Files ──────────────────────────────────────────────────────────────────

class FileUploadResponse(BaseModel):
    file_id: str
    filename: str
    file_type: str
    file_size: int
    session_id: str | None = None
    upload_time: str
