"""
Video Call Feature Database Models.

SQLAlchemy 2.x-compatible models.
"""
from __future__ import annotations

from enum import Enum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Time,
    func,
)
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    """Project-wide SQLAlchemy declarative base (SQLAlchemy 2.x style)."""
    pass


class CallStatus(str, Enum):
    """Enum for video call status."""
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class VideoCall(Base):
    """Scheduled video call between two users."""
    __tablename__ = "video_calls"

    id = Column(Integer, primary_key=True, index=True)
    caller_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_time = Column(DateTime, nullable=False, index=True)
    duration = Column(Integer, nullable=False)
    status = Column(String(20), default=CallStatus.PENDING.value, nullable=False, index=True)
    room_id = Column(String(255), unique=True, nullable=True, index=True)
    title = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    caller = relationship("User", foreign_keys=[caller_id], back_populates="calls_initiated")
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="calls_received")
    ratings = relationship("CallRating", back_populates="video_call", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return (
            f"<VideoCall(id={self.id}, caller={self.caller_id}, "
            f"recipient={self.recipient_id}, status={self.status!r})>"
        )


class UserAvailability(Base):
    """User availability slots. day_of_week: 0=Monday, 6=Sunday."""
    __tablename__ = "user_availability"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    timezone = Column(String(50), nullable=False, default="UTC")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="availability_slots")

    def __repr__(self) -> str:
        return (
            f"<UserAvailability(user={self.user_id}, "
            f"day={self.day_of_week}, {self.start_time}-{self.end_time})>"
        )


class CallRating(Base):
    """Rating submitted after a completed call. rating: 1-5 stars."""
    __tablename__ = "call_ratings"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("video_calls.id", ondelete="CASCADE"), nullable=False, index=True)
    rater_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    feedback = Column(Text, nullable=True)
    is_professional = Column(Boolean, default=True, nullable=False)
    would_recommend = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    video_call = relationship("VideoCall", back_populates="ratings")
    rater = relationship("User", back_populates="ratings_given", foreign_keys=[rater_id])

    def __repr__(self) -> str:
        return f"<CallRating(call={self.call_id}, rater={self.rater_id}, rating={self.rating})>"


class User(Base):
    """User model."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(255), unique=True, nullable=False, index=True)
    first_name = Column(String(255), nullable=True)
    last_name = Column(String(255), nullable=True)
    timezone = Column(String(50), default="UTC", nullable=False)
    is_available_for_calls = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    calls_initiated = relationship("VideoCall", foreign_keys="VideoCall.caller_id", back_populates="caller")
    calls_received = relationship("VideoCall", foreign_keys="VideoCall.recipient_id", back_populates="recipient")
    availability_slots = relationship("UserAvailability", back_populates="user")
    ratings_given = relationship("CallRating", foreign_keys="CallRating.rater_id", back_populates="rater")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email!r}, username={self.username!r})>"