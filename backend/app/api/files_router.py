"""
File upload endpoint: POST /api/upload

Accepts file uploads from authenticated users, validates them,
stores them on disk, and tracks metadata in the database.
"""
import os
import uuid
import structlog
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.models.models import FileUpload, ChatSession, User
from app.auth.dependencies import get_current_user
from app.schemas.schemas import FileUploadResponse

router = APIRouter(tags=["files"])
logger = structlog.get_logger()

# Configuration
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "/tmp/craftgent_uploads"))
ALLOWED_TYPES = {"pdf", "csv", "json", "txt", "doc", "docx", "xls", "xlsx", "py", "js", "ts"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

# Ensure upload directory exists
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _get_file_type(filename: str) -> str:
    """Extract file extension and validate it's allowed."""
    ext = filename.rsplit(".", 1)[1].lower() if "." in filename else ""
    if ext not in ALLOWED_TYPES:
        raise ValueError(f"File type '.{ext}' not allowed. Allowed: {', '.join(sorted(ALLOWED_TYPES))}")
    return ext


def _sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage."""
    # Use UUID + original extension to avoid collisions and path traversal
    ext = filename.rsplit(".", 1)[1].lower() if "." in filename else "bin"
    safe_name = f"{uuid.uuid4().hex}.{ext}"
    return safe_name


@router.post("/api/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    session_id: str = None,  # required — kept str for back-compat, validated below
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a file for a user session.

    - **file**: The file to upload (required)
    - **session_id**: Required session ID to associate the file with.
      Must reference an existing session owned by the authenticated user.
    - Returns: File metadata including file_id and download URL
    """
    log = logger.bind(user_id=str(current_user.id), filename=file.filename)

    # Validate session_id up front — FileUpload.session_id is NOT NULL, so
    # we must resolve a real session before writing the file to disk (and
    # before doing the expensive read).
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="session_id is required",
        )
    try:
        session_uuid = uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid session_id",
        )
    session = await db.get(ChatSession, session_uuid)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    if str(session.user_id) != str(current_user.id):
        log.warning("unauthorized_upload_session", session_id=session_id)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this session",
        )

    file_path: Path | None = None
    try:
        # Validate file type
        file_type = _get_file_type(file.filename)

        # Read file content and check size
        file_content = await file.read()
        file_size = len(file_content)

        if file_size > MAX_FILE_SIZE:
            raise ValueError(f"File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024:.0f}MB, got {file_size / 1024 / 1024:.1f}MB")

        if file_size == 0:
            raise ValueError("File is empty")

        # Generate safe filename and save to disk
        safe_filename = _sanitize_filename(file.filename)
        file_path = UPLOAD_DIR / safe_filename

        with open(file_path, "wb") as f:
            f.write(file_content)

        log.info("file_saved_to_disk", file_path=str(file_path), file_size=file_size)

        # Create FileUpload record (session ownership already validated above)
        file_upload = FileUpload(
            session_id=session.id,
            user_id=current_user.id,
            filename=file.filename,
            file_type=file_type,
            file_size=file_size,
            file_path=str(file_path),
        )
        db.add(file_upload)
        await db.commit()
        await db.refresh(file_upload)

        log.info("file_uploaded", file_id=str(file_upload.id), file_type=file_type, file_size=file_size)

        return FileUploadResponse(
            file_id=str(file_upload.id),
            filename=file.filename,
            file_type=file_type,
            file_size=file_size,
            session_id=str(file_upload.session_id),
            upload_time=file_upload.created_at.isoformat(),
        )

    except ValueError as e:
        # Validation failure (bad extension / too big / empty). If we already
        # wrote bytes to disk, clean up so we don't leak orphaned files.
        if file_path is not None and file_path.exists():
            try: file_path.unlink()
            except OSError: pass
        logger.error("upload_validation_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Upload failed: {str(e)}"
        )
    except Exception as e:
        # Any other failure (DB insert, disk write) — orphan-file cleanup too.
        if file_path is not None and file_path.exists():
            try: file_path.unlink()
            except OSError: pass
        logger.error("upload_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="File upload failed"
        )


@router.delete("/api/upload/{file_id}")
async def delete_file(
    file_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete an uploaded file (user can only delete their own files).

    - **file_id**: The ID of the file to delete
    """
    try:
        file_uuid = uuid.UUID(file_id)
        file_upload = await db.get(FileUpload, file_uuid)

        if not file_upload:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

        if str(file_upload.user_id) != str(current_user.id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this file")

        # Delete from disk
        file_path = Path(file_upload.file_path)
        if file_path.exists():
            file_path.unlink()

        # Delete database record
        await db.delete(file_upload)
        await db.commit()

        logger.info("file_deleted", file_id=file_id, user_id=str(current_user.id))
        return {"status": "deleted", "file_id": file_id}

    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file_id")
    except Exception as e:
        logger.error("delete_error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Delete failed")
