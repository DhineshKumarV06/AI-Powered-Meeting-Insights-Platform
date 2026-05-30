import os
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.models.models import Meeting, Recording, Summary
from app.api.auth import get_current_user
from app.models.models import User
from app.services.ai_service import process_meeting_audio

router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def process_and_save(meeting_id: int, file_path: str, db: Session):
    """Background task: transcribe, summarize, update DB."""
    try:
        meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
        meeting.status = "processing"
        db.commit()

        result = await process_meeting_audio(file_path, meeting.title)

        # Save transcript to recording
        recording = db.query(Recording).filter(Recording.meeting_id == meeting_id).first()
        recording.transcript = result["transcript"]
        db.commit()

        # Save summary
        s = result["summary"]
        summary = Summary(
            meeting_id=meeting_id,
            overview=s.get("overview", ""),
            key_decisions=s.get("key_decisions", []),
            action_items=s.get("action_items", []),
            next_steps=s.get("next_steps", []),
        )
        db.add(summary)
        meeting.status = "done"
        db.commit()
    except Exception as e:
        meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
        if meeting:
            meeting.status = "failed"
            db.commit()
        print(f"Processing error: {e}")


@router.post("/{meeting_id}/upload")
async def upload_recording(
    meeting_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id, Meeting.owner_id == user.id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    allowed = {".mp3", ".mp4", ".wav", ".m4a", ".webm", ".ogg"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"File type {ext} not supported")

    filename = f"{meeting_id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    async with aiofiles.open(file_path, "wb") as out:
        content = await file.read()
        await out.write(content)

    recording = Recording(meeting_id=meeting_id, file_path=file_path)
    db.add(recording)
    meeting.status = "recording"
    db.commit()
    db.refresh(recording)

    background_tasks.add_task(process_and_save, meeting_id, file_path, db)

    return {"message": "Upload successful, processing started", "recording_id": recording.id}
