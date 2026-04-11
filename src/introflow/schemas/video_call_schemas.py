"""
Pydantic v2 schemas for the Video Call API.
"""
from __future__ import annotations

from datetime import datetime, time, timezone
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class CallStatusEnum(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


# â”€â”€â”€ VideoCall Schemas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class VideoCallBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    notes: Optional[str] = Field(None, max_length=1000)
    scheduled_time: datetime = Field(..., description="UTC datetime for the call")
    duration: int = Field(..., gt=0, le=480, description="Duration in minutes (max 8 hours)")
    recipient_id: int = Field(..., gt=0)

    @field_validator("scheduled_time")
    @classmethod
    def scheduled_time_must_be_future(cls, v: datetime) -> datetime:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        compare = v.replace(tzinfo=None) if v.tzinfo else v
        if compare <= now:
            raise ValueError("scheduled_time must be in the future")
        return v


class VideoCallCreate(VideoCallBase):
    pass


class VideoCallUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    notes: Optional[str] = Field(None, max_length=1000)
    scheduled_time: Optional[datetime] = None
    duration: Optional[int] = Field(None, gt=0, le=480)

    @field_validator("scheduled_time", mode="before")
    @classmethod
    def scheduled_time_must_be_future(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v is None:
            return v
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        compare = v.replace(tzinfo=None) if v.tzinfo else v
        if compare <= now:
            raise ValueError("scheduled_time must be in the future")
        return v


class VideoCallStatusUpdate(BaseModel):
    status: CallStatusEnum


class VideoCallResponse(VideoCallBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    caller_id: int
    room_id: Optional[str] = None
    status: CallStatusEnum
    created_at: datetime
    updated_at: datetime


class VideoCallDetailResponse(VideoCallResponse):
    caller: Optional["UserBasic"] = None
    recipient: Optional["UserBasic"] = None
    ratings: List["CallRatingResponse"] = []


# â”€â”€â”€ UserAvailability Schemas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class UserAvailabilityBase(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6, description="0=Monday, 6=Sunday")
    start_time: time
    end_time: time
    timezone: str = Field(..., description="IANA timezone e.g. UTC or America/New_York")

    @model_validator(mode="after")
    def end_time_after_start_time(self) -> "UserAvailabilityBase":
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class UserAvailabilityCreate(UserAvailabilityBase):
    pass


class UserAvailabilityUpdate(BaseModel):
    day_of_week: Optional[int] = Field(None, ge=0, le=6)
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    timezone: Optional[str] = None
    is_active: Optional[bool] = None

    @model_validator(mode="after")
    def end_time_after_start_time(self) -> "UserAvailabilityUpdate":
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class UserAvailabilityResponse(UserAvailabilityBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserAvailabilityListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    user_id: int
    timezone: str
    availability_slots: List[UserAvailabilityResponse]


# â”€â”€â”€ CallRating Schemas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class CallRatingBase(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="1-5 stars")
    feedback: Optional[str] = Field(None, max_length=1000)
    is_professional: bool = True
    would_recommend: bool = True


class CallRatingCreate(CallRatingBase):
    pass


class CallRatingUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    feedback: Optional[str] = Field(None, max_length=1000)
    is_professional: Optional[bool] = None
    would_recommend: Optional[bool] = None


class CallRatingResponse(CallRatingBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    call_id: int
    rater_id: int
    created_at: datetime
    updated_at: datetime


# â”€â”€â”€ User Schemas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class UserBasic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None


class UserVideoCallProfile(UserBasic):
    timezone: str
    is_available_for_calls: bool
    availability_slots: List[UserAvailabilityResponse] = []


# â”€â”€â”€ Stats & Errors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class UserCallStats(BaseModel):
    user_id: int
    total_calls_initiated: int
    total_calls_received: int
    completed_calls: int
    average_rating: Optional[float] = None
    total_hours_called: int
    recommended_by_count: int


class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
    timestamp: datetime = Field(default_factory=_utcnow)


class ValidationErrorResponse(BaseModel):
    detail: str
    errors: List[dict] = []
    timestamp: datetime = Field(default_factory=_utcnow)


VideoCallDetailResponse.model_rebuild()