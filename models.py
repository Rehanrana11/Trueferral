"""
Video Call Feature Database Models
Models for managing video calls, user availability, and call ratings
"""

from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text, Boolean, Time
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class CallStatus(str, Enum):
    """Enum for video call status"""
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class VideoCall(Base):
    """
    Database model for video calls
    Stores information about scheduled video calls between users
    """
    __tablename__ = "video_calls"

    id = Column(Integer, primary_key=True, index=True)
    caller_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    scheduled_time = Column(DateTime, nullable=False, index=True)
    duration = Column(Integer, nullable=False)  # in minutes
    status = Column(String(20), default=CallStatus.PENDING, nullable=False, index=True)
    room_id = Column(String(255), unique=True, nullable=True, index=True)
    title = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    caller = relationship("User", foreign_keys=[caller_id], backref="calls_initiated")
    recipient = relationship("User", foreign_keys=[recipient_id], backref="calls_received")
    ratings = relationship("CallRating", back_populates="video_call", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<VideoCall(id={self.id}, caller={self.caller_id}, recipient={self.recipient_id}, status={self.status})>"


class UserAvailability(Base):
    """
    Database model for user availability slots
    Stores the availability schedule for users who offer video calls
    """
    __tablename__ = "user_availability"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    timezone = Column(String(50), nullable=False, default="UTC")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", backref="availability_slots")

    def __repr__(self):
        return f"<UserAvailability(user={self.user_id}, day={self.day_of_week}, {self.start_time}-{self.end_time})>"


class CallRating(Base):
    """
    Database model for video call ratings and reviews
    Stores ratings and feedback from users after completing a call
    """
    __tablename__ = "call_ratings"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("video_calls.id"), nullable=False, index=True)
    rater_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1-5 stars
    feedback = Column(Text, nullable=True)
    is_professional = Column(Boolean, default=True)  # Was the service professional?
    would_recommend = Column(Boolean, default=True)  # Would recommend this person?
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    video_call = relationship("VideoCall", back_populates="ratings")
    rater = relationship("User", backref="ratings_given", foreign_keys=[rater_id])

    def __repr__(self):
        return f"<CallRating(call={self.call_id}, rater={self.rater_id}, rating={self.rating})>"


# Note: The following is a placeholder for the User model
# You should integrate this with your existing User model from the Trueferral project
class User(Base):
    """
    Placeholder User model
    Replace this with your actual User model from the Trueferral project
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(255), unique=True, nullable=False, index=True)
    first_name = Column(String(255), nullable=True)
    last_name = Column(String(255), nullable=True)
    timezone = Column(String(50), default="UTC")
    is_available_for_calls = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, username={self.username})>"
