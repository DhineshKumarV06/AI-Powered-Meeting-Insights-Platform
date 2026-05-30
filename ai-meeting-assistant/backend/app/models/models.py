from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    meetings = relationship("Meeting", back_populates="owner")


class Meeting(Base):
    __tablename__ = "meetings"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    owner_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")  # pending | recording | processing | done | failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="meetings")
    recordings = relationship("Recording", back_populates="meeting")
    summary = relationship("Summary", back_populates="meeting", uselist=False)


class Recording(Base):
    __tablename__ = "recordings"
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    file_path = Column(String)
    duration_seconds = Column(Integer)
    transcript = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    meeting = relationship("Meeting", back_populates="recordings")


class Summary(Base):
    __tablename__ = "summaries"
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), unique=True)
    overview = Column(Text)
    key_decisions = Column(JSON)   # list of strings
    action_items = Column(JSON)    # list of {task, owner, due_date}
    next_steps = Column(JSON)      # list of strings
    email_sent_to = Column(JSON)   # list of email addresses
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    meeting = relationship("Meeting", back_populates="summary")
