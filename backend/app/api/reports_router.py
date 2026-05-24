import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.db.connection import get_db
from app.models.models import ChatSession, User
from app.services.report_service import generate_report, generate_report_from_session
from app.services.email_service import EmailService
from app.core.config import get_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/reports", tags=["reports"])


class EmailReportRequest(BaseModel):
    """Request model for sending reports via email."""
    session_id: str
    format: str = "pdf"
    recipient_email: str
    message: str | None = None

    @field_validator("format")
    def validate_format(cls, v: str) -> str:
        if v not in ("pdf", "docx"):
            raise ValueError("Format must be 'pdf' or 'docx'")
        return v

    @field_validator("recipient_email")
    def validate_email(cls, v: str) -> str:
        if "@" not in v or "." not in v:
            raise ValueError("Invalid email address")
        return v


@router.post("/generate")
async def generate_report_endpoint(
    session_id: str = Query(...),
    format: str = Query("pdf", regex="^(pdf|docx)$"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """
    Generate a report from a chat session.

    Query Parameters:
    - session_id: UUID of the chat session
    - format: Report format ('pdf' or 'docx')
    """
    try:
        session = await db.execute(
            select(ChatSession).where(ChatSession.id == session_id)
        )
        session_obj = session.scalar()

        if not session_obj:
            raise HTTPException(status_code=404, detail="Session not found")

        if session_obj.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

        result = await generate_report_from_session(session_obj, format=format)

        if not result.get("success"):
            raise HTTPException(
                status_code=500, detail=result.get("error", "Report generation failed")
            )

        file_content = result.pop("file_content")

        file_extension = "pdf" if format == "pdf" else "docx"
        filename = f"report_{session_id[:8]}.{file_extension}"

        return {
            "success": True,
            "filename": filename,
            "file_size": result.get("file_size"),
            "format": format,
            "generated_at": result.get("generated_at").isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error generating report for session {session_id}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/preview")
async def preview_report(
    session_id: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """
    Get a preview of what the report will look like.

    Query Parameters:
    - session_id: UUID of the chat session
    """
    try:
        session = await db.execute(
            select(ChatSession).where(ChatSession.id == session_id)
        )
        session_obj = session.scalar()

        if not session_obj:
            raise HTTPException(status_code=404, detail="Session not found")

        if session_obj.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

        preview = {
            "session_id": str(session_obj.id),
            "title": session_obj.id if not hasattr(session_obj, "title") else getattr(session_obj, "title", ""),
            "message_count": len(session_obj.messages) if session_obj.messages else 0,
            "created_at": session_obj.created_at.isoformat(),
            "has_messages": len(session_obj.messages) > 0 if session_obj.messages else False,
        }

        if session_obj.messages:
            preview["first_message"] = session_obj.messages[0].content[:200]
            preview["last_message"] = session_obj.messages[-1].content[:200]

        return {
            "success": True,
            "preview": preview,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error generating preview for session {session_id}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/send-email")
async def send_report_via_email(
    request: EmailReportRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """
    Generate and send a report via email.

    Body:
    - session_id: UUID of the chat session
    - format: Report format ('pdf' or 'docx')
    - recipient_email: Email address to send to
    - message: Optional custom message to include
    """
    try:
        session = await db.execute(
            select(ChatSession).where(ChatSession.id == request.session_id)
        )
        session_obj = session.scalar()

        if not session_obj:
            raise HTTPException(status_code=404, detail="Session not found")

        if session_obj.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

        result = await generate_report_from_session(session_obj, format=request.format)

        if not result.get("success"):
            raise HTTPException(
                status_code=500, detail=result.get("error", "Report generation failed")
            )

        settings = get_settings()

        if not settings.smtp_host or not settings.smtp_user or not settings.smtp_password:
            raise HTTPException(
                status_code=503,
                detail="Email service is not configured. Contact administrator.",
            )

        email_service = EmailService(
            smtp_host=settings.smtp_host,
            smtp_port=getattr(settings, "smtp_port", 587),
            sender_email=settings.smtp_user,
            sender_password=settings.smtp_password,
            use_tls=getattr(settings, "smtp_use_tls", True),
        )

        file_content = result.get("file_content")
        success = email_service.send_report(
            recipient_email=request.recipient_email,
            report_title=session_obj.id if not hasattr(session_obj, "title") else getattr(session_obj, "title", ""),
            report_content=file_content,
            format=request.format,
        )

        if not success:
            raise HTTPException(status_code=500, detail="Failed to send email")

        return {
            "success": True,
            "message": f"Report sent to {request.recipient_email}",
            "recipient": request.recipient_email,
            "format": request.format,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error sending report via email")
        raise HTTPException(status_code=500, detail="Internal server error")
