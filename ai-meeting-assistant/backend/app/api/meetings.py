from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.models.models import Meeting, User
from app.api.auth import get_current_user

router = APIRouter()


class MeetingCreate(BaseModel):
    title: str
    description: str = ""


class MeetingOut(BaseModel):
    id: int
    title: str
    description: str | None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[MeetingOut])
def list_meetings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Meeting).filter(Meeting.owner_id == user.id).order_by(Meeting.created_at.desc()).all()


@router.post("/", response_model=MeetingOut, status_code=status.HTTP_201_CREATED)
def create_meeting(data: MeetingCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    meeting = Meeting(title=data.title, description=data.description, owner_id=user.id)
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


@router.get("/{meeting_id}", response_model=MeetingOut)
def get_meeting(meeting_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id, Meeting.owner_id == user.id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(meeting_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id, Meeting.owner_id == user.id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    db.delete(meeting)
    db.commit()
