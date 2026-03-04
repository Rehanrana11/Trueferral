"""
Pydantic Schemas for Video Call API
Validation schemas for request/response handling
"""

from datetime import datetime, time
from typing import Optional, List
from pydantic import BaseModel, Field, validator, root_validator
from enum import Enum


class CallStatusEnum(str, Enum):
    """Enum for video call status"""
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


# ==================== VideoCall Schemas ====================

class VideoCallBase(BaseModel):
    """Base schema for video call"""
    title: str = Field(..., min_length=1, max_length=255, description="Call title/topic")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes")
    scheduled_time: datetime = Field(..., description="When the call should happen")
    duration: int = Field(..., gt=0, le=480, description="Call duration in minutes (max 8 hours)")
    recipient_id: int = Field(..., gt=0, description="ID of the person receiving the call")

    @validator('scheduled_time')
    def scheduled_time_must_be_future(cls, v):
        """Validate that scheduled time is in the future"""
        if v <= datetime.utcnow():
            raise ValueError('scheduled_time must be in the future')
        return v


class VideoCallCreate(VideoCallBase):
    """Schema for creating a new video call"""
    pass


class VideoCallUpdate(BaseModel):
    """Schema for updating a video call"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    notes: Optional[str] = Field(None, max_length=1000)
    scheduled_time: Optional[datetime] = None
    duration: Optional[int] = Field(None, gt=0, le=480)

    @validator('scheduled_time')
    def scheduled_time_must_be_future(cls, v):
        """Validate that scheduled time is in the future"""
        if v and v <= datetime.utcnow():
            raise ValueError('scheduled_time must be in the future')
        return v


class VideoCallStatusUpdate(BaseModel):
    """Schema for updating video call status"""
    status: CallStatusEnum = Field(..., description="New status for the call")


class VideoCallResponse(VideoCallBase):
    """Schema for returning video call data"""
    id: int
    caller_id: int
    room_id: Optional[str] = None
    status: CallStatusEnum
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VideoCallDetailResponse(VideoCallResponse):
    """Detailed response with caller and recipient info"""
    caller: Optional['UserBasic'] = None
    recipient: Optional['UserBasic'] = None
    ratings: List['CallRatingResponse'] = []


# ==================== UserAvailability Schemas ====================

class UserAvailabilityBase(BaseModel):
    """Base schema for user availability"""
    day_of_week: int = Field(..., ge=0, le=6, description="0=Monday, 6=Sunday")
    start_time: time = Field(..., description="Start time of availability")
    end_time: time = Field(..., description="End time of availability")
    timezone: str = Field(..., description="Timezone (e.g., 'UTC', 'America/New_York')")

    @root_validator
    def end_time_after_start_time(cls, values):
        """Validate that end time is after start time"""
        start = values.get('start_time')
        end = values.get('end_time')
        if start and end and end <= start:
            raise ValueError('end_time must be after start_time')
        return values


class UserAvailabilityCreate(UserAvailabilityBase):
    """Schema for creating user availability"""
    pass


class UserAvailabilityUpdate(BaseModel):
    """Schema for updating user availability"""
    day_of_week: Optional[int] = Field(None, ge=0, le=6)
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    timezone: Optional[str] = None
    is_active: Optional[bool] = None

    @root_validator
    def end_time_after_start_time(cls, values):
        """Validate that end time is after start time"""
        start = values.get('start_time')
        end = values.get('end_time')
        if start and end and end <= start:
            raise ValueError('end_time must be after start_time')
        return values


class UserAvailabilityResponse(UserAvailabilityBase):
    """Schema for returning user availability data"""
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserAvailabilityListResponse(BaseModel):
    """Response for user's availability schedule"""
    user_id: int
    timezone: str
    availability_slots: List[UserAvailabilityResponse]

    class Config:
        from_attributes = True


# ==================== CallRating Schemas ====================

class CallRatingBase(BaseModel):
    """Base schema for call rating"""
    rating: int = Field(..., ge=1, le=5, description="Rating from 1-5 stars")
    feedback: Optional[str] = Field(None, max_length=1000, description="Review feedback")
    is_professional: bool = Field(True, description="Was the service professional?")
    would_recommend: bool = Field(True, description="Would you recommend this person?")


class CallRatingCreate(CallRatingBase):
    """Schema for creating a call rating"""
    call_id: int = Field(..., gt=0, description="ID of the call being rated")


class CallRatingUpdate(BaseModel):
    """Schema for updating a call rating"""
    rating: Optional[int] = Field(None, ge=1, le=5)
    feedback: Optional[str] = Field(None, max_length=1000)
    is_professional: Optional[bool] = None
    would_recommend: Optional[bool] = None


class CallRatingResponse(CallRatingBase):
    """Schema for returning call rating data"""
    id: int
    call_id: int
    rater_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== User Schemas ====================

class UserBasic(BaseModel):
    """Basic user information"""
    id: int
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None

    class Config:
        from_attributes = True


class UserVideoCallProfile(UserBasic):
    """User profile with video call information"""
    timezone: str
    is_available_for_calls: bool
    availability_slots: List[UserAvailabilityResponse] = []


# ==================== Error Response Schemas ====================

class ErrorResponse(BaseModel):
    """Standard error response"""
    detail: str = Field(..., description="Error message")
    error_code: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ValidationErrorResponse(BaseModel):
    """Validation error response"""
    detail: str
    errors: List[dict] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ==================== Analytics/Stats Schemas ====================

class UserCallStats(BaseModel):
    """Statistics for a user's calls"""
    user_id: int
    total_calls_initiated: int
    total_calls_received: int
    completed_calls: int
    average_rating: Optional[float] = None
    total_hours_called: int
    recommended_by_count: int


class CallAvailabilityConflict(BaseModel):
    """Information about availability conflicts"""
    conflict_type: str  # "overlap", "outside_hours", etc.
    message: str
    suggested_times: Optional[List[datetime]] = None
