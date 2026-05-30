from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.core.database import get_db
from app.models.models import Meeting, Summary
from app.api.auth import get_current_user
from app.models.models import User
from app.services.email_service import send_meeting_summary_email

router = APIRouter()


class EmailRequest(BaseModel):
    recipients: List[str]


@router.get("/{meeting_id}")
def get_summary(meeting_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id, Meeting.owner_id == user.id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if not meeting.summary:
        raise HTTPException(status_code=404, detail="Summary not ready yet")

    s = meeting.summary
    return {
        "meeting_id": meeting_id,
        "title": meeting.title,
        "overview": s.overview,
        "key_decisions": s.key_decisions,
        "action_items": s.action_items,
        "next_steps": s.next_steps,
        "email_sent_to": s.email_sent_to,
    }


@router.post("/{meeting_id}/send-email")
def send_summary_email(
    meeting_id: int,
    body: EmailRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id, Meeting.owner_id == user.id).first()
    if not meeting or not meeting.summary:
        raise HTTPException(status_code=404, detail="Summary not available")

    s = meeting.summary
    summary_data = {
        "overview": s.overview,
        "key_decisions": s.key_decisions,
        "action_items": s.action_items,
        "next_steps": s.next_steps,
    }

    success = send_meeting_summary_email(body.recipients, meeting.title, summary_data)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email")

    s.email_sent_to = body.recipients
    db.commit()
    return {"message": f"Email sent to {', '.join(body.recipients)}"}
