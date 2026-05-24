import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.db.connection import get_db
from app.models.models import ChatSession, User
from app.services.report_service import generate_report, generate_report_from_session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/reports", tags=["reports"])


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
