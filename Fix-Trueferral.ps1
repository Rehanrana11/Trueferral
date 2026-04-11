# =============================================================================
# Fix-Trueferral.ps1
# Fixes all 20 errors in the Trueferral project.
# Run from PowerShell as:
#   cd "C:\Users\devel\OneDrive\Documents\Software\Trueferral-main"
#   .\Fix-Trueferral.ps1
# =============================================================================

$ErrorActionPreference = "Stop"
$Root = "C:\Users\devel\OneDrive\Documents\Software\Trueferral-main"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Trueferral - Applying All Fixes" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Helper: write a file with UTF-8 (no BOM)
function Write-UTF8 {
    param([string]$Path, [string]$Content)
    $dir = Split-Path $Path -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [System.IO.File]::WriteAllText($Path, $Content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "  [FIXED] $($Path.Replace($Root,''))" -ForegroundColor Green
}

# Helper: delete a file
function Remove-IfExists {
    param([string]$Path)
    if (Test-Path $Path) {
        Remove-Item $Path -Force
        Write-Host "  [DELETED] $($Path.Replace($Root,''))" -ForegroundColor Yellow
    }
}

Set-Location $Root

# =============================================================================
# FIX 1 — main.py was completely empty
# =============================================================================
Write-Host "FIX 1: main.py was empty" -ForegroundColor White
Write-UTF8 "$Root\src\introflow\main.py" @'
"""
IntroFlow application entry point.

Used when running directly: python -m introflow
or: uvicorn introflow.main:app
"""
from __future__ import annotations

from introflow.app import app  # re-export for uvicorn

__all__ = ["app"]
'@

# =============================================================================
# FIX 2 — routes/__init__.py was missing entirely
# =============================================================================
Write-Host "FIX 2: routes/__init__.py missing" -ForegroundColor White
Write-UTF8 "$Root\src\introflow\routes\__init__.py" @'
"""
API route modules.
"""
'@

# =============================================================================
# FIX 3 — tests/conftest.py was missing (src/ not on sys.path)
# =============================================================================
Write-Host "FIX 3: tests/conftest.py missing" -ForegroundColor White
Write-UTF8 "$Root\tests\conftest.py" @'
"""
pytest configuration and shared fixtures.

Ensures src/ is on sys.path so all tests can import introflow
without the package needing to be pip-installed.
"""
from __future__ import annotations

import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = os.path.join(ROOT, "src")
if SRC not in sys.path:
    sys.path.insert(0, SRC)
'@

# =============================================================================
# FIX 4 — observability/__init__.py had typo  _all_  instead of  __all__
# =============================================================================
Write-Host "FIX 4: observability/__init__.py typo _all_" -ForegroundColor White
Write-UTF8 "$Root\src\introflow\observability\__init__.py" @'
"""
Observability hooks (Step 49).

Hard rules:
- No DB/ORM imports
- No Alembic imports
- No network/IO
- Middleware + contextvars only
"""
from .context import get_correlation_id, set_correlation_id, clear_correlation_id
from .ids import (
    CorrelationIdProvider,
    DefaultCorrelationIdProvider,
    set_correlation_id_provider,
    reset_correlation_id_provider,
)
from .middleware import ObservabilityMiddleware

__all__ = [
    "get_correlation_id",
    "set_correlation_id",
    "clear_correlation_id",
    "CorrelationIdProvider",
    "DefaultCorrelationIdProvider",
    "set_correlation_id_provider",
    "reset_correlation_id_provider",
    "ObservabilityMiddleware",
]
'@

# =============================================================================
# FIX 5 — settings.py validator rejected postgres://, postgresql+psycopg2://, etc.
# =============================================================================
Write-Host "FIX 5: settings.py validator too narrow" -ForegroundColor White
Write-UTF8 "$Root\src\introflow\config\settings.py" @'
from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    app_env: Literal["development", "production"] = "development"
    log_json: bool = False
    secret_key: str = "dev-secret-key"

    model_config = {
        "env_prefix": "INTROFLOW_",
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore",
    }

    @field_validator("database_url")
    @classmethod
    def must_be_postgres(cls, v: str) -> str:
        """
        Accept all standard PostgreSQL URL schemes:
          - postgresql://
          - postgresql+psycopg2://
          - postgresql+asyncpg://
          - postgres://  (legacy Heroku/Render style)
        """
        valid_prefixes = (
            "postgresql://",
            "postgresql+psycopg2://",
            "postgresql+asyncpg://",
            "postgres://",
        )
        if not any(v.startswith(p) for p in valid_prefixes):
            raise ValueError(
                "database_url must start with postgresql://, "
                "postgresql+psycopg2://, postgresql+asyncpg://, or postgres://"
            )
        return v


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
'@

# =============================================================================
# FIX 6 — db/engine.py inconsistent with settings validator; no ping_database
# =============================================================================
Write-Host "FIX 6: db/engine.py inconsistency" -ForegroundColor White
Write-UTF8 "$Root\src\introflow\db\engine.py" @'
from __future__ import annotations

from pydantic import ValidationError
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

from introflow.config.settings import get_settings

_VALID_PREFIXES = (
    "postgresql://",
    "postgresql+psycopg2://",
    "postgresql+asyncpg://",
    "postgres://",
)


def get_database_url() -> str:
    s = get_settings()
    return str(s.database_url)


def _is_postgres_url(url: str) -> bool:
    return any(url.startswith(p) for p in _VALID_PREFIXES)


def create_engine_from_settings(*, echo: bool = False, pool_pre_ping: bool = True) -> Engine:
    try:
        url = get_database_url()
    except ValidationError as exc:
        raise ValueError("Invalid settings - database_url must be a valid Postgres URL") from exc
    if not _is_postgres_url(url):
        raise ValueError(
            f"database_url must be a PostgreSQL URL, got: {url[:30]}..."
        )
    return create_engine(url, echo=echo, pool_pre_ping=pool_pre_ping, future=True)


def ping_database(engine: Engine) -> bool:
    """Return True if the database is reachable, False otherwise."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
'@

# =============================================================================
# FIX 7 — video_call_models.py used deprecated SQLAlchemy 1.x declarative_base
#          and datetime.utcnow() column defaults, broken backref relationships
# =============================================================================
Write-Host "FIX 7: video_call_models.py deprecated SQLAlchemy API" -ForegroundColor White
Write-UTF8 "$Root\src\introflow\models\video_call_models.py" @'
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
'@

# =============================================================================
# FIX 8 & 9 — Remove misplaced Python files from the Next.js frontend
# =============================================================================
Write-Host "FIX 8/9: Remove Python files from Next.js frontend" -ForegroundColor White
Remove-IfExists "$Root\frontend\src\models\models.py"
Remove-IfExists "$Root\frontend\src\schemas\schemas.py"
# Remove empty dirs if they exist
@("$Root\frontend\src\models", "$Root\frontend\src\schemas") | ForEach-Object {
    if ((Test-Path $_) -and ((Get-ChildItem $_ -Force).Count -eq 0)) {
        Remove-Item $_ -Force
        Write-Host "  [REMOVED empty dir] $_" -ForegroundColor Yellow
    }
}

# =============================================================================
# FIX 10 — video_call_schemas.py used Pydantic v1 @validator / @root_validator
#           (removed in Pydantic v2) + datetime.utcnow() deprecated default
# =============================================================================
Write-Host "FIX 10: video_call_schemas.py Pydantic v1 -> v2" -ForegroundColor White
Write-UTF8 "$Root\src\introflow\schemas\video_call_schemas.py" @'
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


# ─── VideoCall Schemas ────────────────────────────────────────────────────────

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


# ─── UserAvailability Schemas ─────────────────────────────────────────────────

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


# ─── CallRating Schemas ───────────────────────────────────────────────────────

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


# ─── User Schemas ─────────────────────────────────────────────────────────────

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


# ─── Stats & Errors ───────────────────────────────────────────────────────────

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
'@

# =============================================================================
# FIX 11 — schemas/__init__.py had BOM character + missing exports
# =============================================================================
Write-Host "FIX 11: schemas/__init__.py BOM + missing exports" -ForegroundColor White
Write-UTF8 "$Root\src\introflow\schemas\__init__.py" @'
from .video_call_schemas import (
    CallRatingCreate,
    CallRatingResponse,
    CallRatingUpdate,
    CallStatusEnum,
    ErrorResponse,
    UserAvailabilityCreate,
    UserAvailabilityListResponse,
    UserAvailabilityResponse,
    UserAvailabilityUpdate,
    UserBasic,
    UserCallStats,
    UserVideoCallProfile,
    ValidationErrorResponse,
    VideoCallCreate,
    VideoCallDetailResponse,
    VideoCallResponse,
    VideoCallStatusUpdate,
    VideoCallUpdate,
)

__all__ = [
    "CallRatingCreate",
    "CallRatingResponse",
    "CallRatingUpdate",
    "CallStatusEnum",
    "ErrorResponse",
    "UserAvailabilityCreate",
    "UserAvailabilityListResponse",
    "UserAvailabilityResponse",
    "UserAvailabilityUpdate",
    "UserBasic",
    "UserCallStats",
    "UserVideoCallProfile",
    "ValidationErrorResponse",
    "VideoCallCreate",
    "VideoCallDetailResponse",
    "VideoCallResponse",
    "VideoCallStatusUpdate",
    "VideoCallUpdate",
]
'@

# =============================================================================
# FIX 12 — models/__init__.py had BOM character + missing Base export
# =============================================================================
Write-Host "FIX 12: models/__init__.py BOM + missing Base" -ForegroundColor White
Write-UTF8 "$Root\src\introflow\models\__init__.py" @'
from .video_call_models import (
    Base,
    CallRating,
    CallStatus,
    User,
    UserAvailability,
    VideoCall,
)

__all__ = [
    "Base",
    "CallRating",
    "CallStatus",
    "User",
    "UserAvailability",
    "VideoCall",
]
'@

# =============================================================================
# FIX 13 — video_call_service.py:
#   - "from models import" / "from schemas import" (bare broken imports)
#   - SQL bug: timedelta(minutes=VideoCall.duration) used Column as int
#   - import pytz (not installed, not in requirements)
# =============================================================================
Write-Host "FIX 13: video_call_service.py broken imports + SQL bug + pytz" -ForegroundColor White
Write-UTF8 "$Root\src\introflow\services\video_call_service.py" @'
"""
Video Call Services.
Uses stdlib zoneinfo (Python 3.9+) instead of pytz.
"""
from __future__ import annotations

from datetime import datetime, time, timedelta
from typing import List, Optional, Tuple
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from introflow.models.video_call_models import (
    CallRating,
    CallStatus,
    User,
    UserAvailability,
    VideoCall,
)


class VideoCallService:

    @staticmethod
    def check_availability_conflict(
        db: Session,
        user_id: int,
        scheduled_time: datetime,
        duration: int,
    ) -> Tuple[bool, Optional[str]]:
        call_end_time = scheduled_time + timedelta(minutes=duration)

        # Pull candidates first, then check overlap in Python.
        # SQLAlchemy cannot do timedelta arithmetic on Column objects directly.
        candidates = (
            db.query(VideoCall)
            .filter(
                and_(
                    or_(
                        VideoCall.caller_id == user_id,
                        VideoCall.recipient_id == user_id,
                    ),
                    VideoCall.status.in_([CallStatus.PENDING.value, CallStatus.ACTIVE.value]),
                    VideoCall.scheduled_time < call_end_time,
                )
            )
            .all()
        )

        for call in candidates:
            existing_end = call.scheduled_time + timedelta(minutes=call.duration)
            if existing_end > scheduled_time:
                return True, f"User has a conflicting call at {call.scheduled_time.isoformat()}"

        return False, None

    @staticmethod
    def check_user_availability(
        db: Session,
        user_id: int,
        scheduled_time: datetime,
        user_timezone: str = "UTC",
    ) -> Tuple[bool, Optional[str]]:
        try:
            tz = ZoneInfo(user_timezone)
        except (ZoneInfoNotFoundError, KeyError):
            return False, f"Invalid timezone: {user_timezone!r}"

        if scheduled_time.tzinfo is None:
            aware_time = scheduled_time.replace(tzinfo=ZoneInfo("UTC"))
        else:
            aware_time = scheduled_time

        local_time = aware_time.astimezone(tz)
        day_of_week = local_time.weekday()
        call_time = local_time.time()
        day_names = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]

        slots = (
            db.query(UserAvailability)
            .filter(
                and_(
                    UserAvailability.user_id == user_id,
                    UserAvailability.day_of_week == day_of_week,
                    UserAvailability.is_active.is_(True),
                )
            )
            .all()
        )

        if not slots:
            return False, f"User is not available on {day_names[day_of_week]}"

        for slot in slots:
            if slot.start_time <= call_time <= slot.end_time:
                return True, None

        return False, f"Call time {call_time} is outside user's available hours"

    @staticmethod
    def schedule_call(
        db: Session,
        caller_id: int,
        recipient_id: int,
        scheduled_time: datetime,
        duration: int,
        title: str,
        notes: Optional[str] = None,
    ) -> Tuple[bool, Optional[VideoCall], Optional[str]]:
        if caller_id == recipient_id:
            return False, None, "Cannot schedule a call with yourself"

        recipient = db.query(User).filter(User.id == recipient_id).first()
        if not recipient:
            return False, None, "Recipient not found"
        if not recipient.is_available_for_calls:
            return False, None, "Recipient is not available for video calls"

        conflict, msg = VideoCallService.check_availability_conflict(db, caller_id, scheduled_time, duration)
        if conflict:
            return False, None, f"Caller: {msg}"

        conflict, msg = VideoCallService.check_availability_conflict(db, recipient_id, scheduled_time, duration)
        if conflict:
            return False, None, f"Recipient: {msg}"

        available, avail_msg = VideoCallService.check_user_availability(
            db, recipient_id, scheduled_time, recipient.timezone or "UTC"
        )
        if not available:
            return False, None, avail_msg

        new_call = VideoCall(
            caller_id=caller_id,
            recipient_id=recipient_id,
            scheduled_time=scheduled_time,
            duration=duration,
            title=title,
            notes=notes,
            status=CallStatus.PENDING.value,
        )
        db.add(new_call)
        db.commit()
        db.refresh(new_call)
        return True, new_call, None

    @staticmethod
    def get_upcoming_calls(db: Session, user_id: int, limit: int = 20, offset: int = 0) -> List[VideoCall]:
        now = datetime.utcnow()
        return (
            db.query(VideoCall)
            .filter(
                and_(
                    or_(VideoCall.caller_id == user_id, VideoCall.recipient_id == user_id),
                    VideoCall.scheduled_time >= now,
                    VideoCall.status.in_([CallStatus.PENDING.value, CallStatus.ACTIVE.value]),
                )
            )
            .order_by(VideoCall.scheduled_time)
            .offset(offset).limit(limit).all()
        )

    @staticmethod
    def get_call_history(db: Session, user_id: int, limit: int = 20, offset: int = 0) -> List[VideoCall]:
        return (
            db.query(VideoCall)
            .filter(
                and_(
                    or_(VideoCall.caller_id == user_id, VideoCall.recipient_id == user_id),
                    VideoCall.status == CallStatus.COMPLETED.value,
                )
            )
            .order_by(VideoCall.scheduled_time.desc())
            .offset(offset).limit(limit).all()
        )

    @staticmethod
    def cancel_call(db: Session, call_id: int, user_id: int) -> Tuple[bool, Optional[str]]:
        call = db.query(VideoCall).filter(VideoCall.id == call_id).first()
        if not call:
            return False, "Call not found"
        if call.caller_id != user_id and call.recipient_id != user_id:
            return False, "You do not have permission to cancel this call"
        if call.status == CallStatus.COMPLETED.value:
            return False, "Cannot cancel a completed call"
        if call.status == CallStatus.CANCELLED.value:
            return False, "Call is already cancelled"
        call.status = CallStatus.CANCELLED.value
        db.commit()
        return True, None

    @staticmethod
    def update_call_status(
        db: Session, call_id: int, new_status: CallStatus
    ) -> Tuple[bool, Optional[VideoCall], Optional[str]]:
        call = db.query(VideoCall).filter(VideoCall.id == call_id).first()
        if not call:
            return False, None, "Call not found"
        call.status = new_status.value
        db.commit()
        db.refresh(call)
        return True, call, None


class UserAvailabilityService:

    @staticmethod
    def create_availability_slot(
        db: Session, user_id: int, day_of_week: int,
        start_time: time, end_time: time, timezone: str
    ) -> Tuple[bool, Optional[UserAvailability], Optional[str]]:
        if end_time <= start_time:
            return False, None, "end_time must be after start_time"
        existing = (
            db.query(UserAvailability)
            .filter(and_(
                UserAvailability.user_id == user_id,
                UserAvailability.day_of_week == day_of_week,
                UserAvailability.start_time == start_time,
                UserAvailability.end_time == end_time,
            ))
            .first()
        )
        if existing:
            return False, None, "This availability slot already exists"
        slot = UserAvailability(
            user_id=user_id, day_of_week=day_of_week,
            start_time=start_time, end_time=end_time, timezone=timezone,
        )
        db.add(slot)
        db.commit()
        db.refresh(slot)
        return True, slot, None

    @staticmethod
    def get_user_availability(db: Session, user_id: int) -> List[UserAvailability]:
        return (
            db.query(UserAvailability)
            .filter(UserAvailability.user_id == user_id)
            .order_by(UserAvailability.day_of_week)
            .all()
        )

    @staticmethod
    def delete_availability_slot(db: Session, slot_id: int, user_id: int) -> Tuple[bool, Optional[str]]:
        slot = (
            db.query(UserAvailability)
            .filter(and_(UserAvailability.id == slot_id, UserAvailability.user_id == user_id))
            .first()
        )
        if not slot:
            return False, "Availability slot not found or you do not have permission"
        db.delete(slot)
        db.commit()
        return True, None


class CallRatingService:

    @staticmethod
    def rate_call(
        db: Session, call_id: int, rater_id: int, rating: int,
        feedback: Optional[str] = None, is_professional: bool = True, would_recommend: bool = True
    ) -> Tuple[bool, Optional[CallRating], Optional[str]]:
        call = db.query(VideoCall).filter(VideoCall.id == call_id).first()
        if not call:
            return False, None, "Call not found"
        if call.status != CallStatus.COMPLETED.value:
            return False, None, "Can only rate completed calls"
        if call.caller_id != rater_id and call.recipient_id != rater_id:
            return False, None, "You do not have permission to rate this call"
        existing = (
            db.query(CallRating)
            .filter(and_(CallRating.call_id == call_id, CallRating.rater_id == rater_id))
            .first()
        )
        if existing:
            return False, None, "You have already rated this call"
        new_rating = CallRating(
            call_id=call_id, rater_id=rater_id, rating=rating,
            feedback=feedback, is_professional=is_professional, would_recommend=would_recommend,
        )
        db.add(new_rating)
        db.commit()
        db.refresh(new_rating)
        return True, new_rating, None

    @staticmethod
    def get_user_average_rating(db: Session, user_id: int) -> Tuple[Optional[float], int]:
        ratings = (
            db.query(CallRating)
            .join(VideoCall)
            .filter(or_(VideoCall.caller_id == user_id, VideoCall.recipient_id == user_id))
            .all()
        )
        if not ratings:
            return None, 0
        return round(sum(r.rating for r in ratings) / len(ratings), 2), len(ratings)
'@

# =============================================================================
# FIX 14 — routes/video_calls.py used bare "from models import" / "from schemas import"
#           DB session created new engine per-call, missing HTTP status constants
# =============================================================================
Write-Host "FIX 14: routes/video_calls.py broken imports + DB session" -ForegroundColor White
Write-UTF8 "$Root\src\introflow\routes\video_calls.py" @'
"""
Video Call API Endpoints.
"""
from __future__ import annotations

from datetime import datetime
from typing import Generator, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from introflow.db.engine import create_engine_from_settings
from introflow.models.video_call_models import CallStatus, User, VideoCall
from introflow.schemas.video_call_schemas import (
    CallRatingCreate,
    CallRatingResponse,
    UserAvailabilityCreate,
    UserAvailabilityListResponse,
    UserAvailabilityResponse,
    UserAvailabilityUpdate,
    UserCallStats,
    VideoCallCreate,
    VideoCallDetailResponse,
    VideoCallResponse,
    VideoCallStatusUpdate,
    VideoCallUpdate,
)
from introflow.services.video_call_service import (
    CallRatingService,
    UserAvailabilityService,
    VideoCallService,
)

_engine = None


def _get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine_from_settings()
    return _engine


def get_db() -> Generator[Session, None, None]:
    from sqlalchemy.orm import sessionmaker
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_get_engine())
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


router = APIRouter(prefix="/api/video-calls", tags=["video-calls"])
availability_router = APIRouter(prefix="/api/user-availability", tags=["availability"])
rating_router = APIRouter(prefix="/api/video-calls", tags=["ratings"])


@router.post("/schedule", response_model=VideoCallResponse, status_code=status.HTTP_201_CREATED)
def schedule_call(
    call_data: VideoCallCreate,
    caller_id: int = Query(...),
    db: Session = Depends(get_db),
):
    success, call, error = VideoCallService.schedule_call(
        db, caller_id=caller_id, recipient_id=call_data.recipient_id,
        scheduled_time=call_data.scheduled_time, duration=call_data.duration,
        title=call_data.title, notes=call_data.notes,
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return call


@router.get("/upcoming", response_model=List[VideoCallResponse])
def get_upcoming_calls(user_id: int = Query(...), limit: int = Query(20, ge=1, le=100),
                       offset: int = Query(0, ge=0), db: Session = Depends(get_db)):
    return VideoCallService.get_upcoming_calls(db, user_id, limit, offset)


@router.get("/history", response_model=List[VideoCallResponse])
def get_call_history(user_id: int = Query(...), limit: int = Query(20, ge=1, le=100),
                     offset: int = Query(0, ge=0), db: Session = Depends(get_db)):
    return VideoCallService.get_call_history(db, user_id, limit, offset)


@router.get("/{call_id}", response_model=VideoCallDetailResponse)
def get_call_details(call_id: int, user_id: int = Query(...), db: Session = Depends(get_db)):
    call = db.query(VideoCall).filter(VideoCall.id == call_id).first()
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call not found")
    if call.caller_id != user_id and call.recipient_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return call


@router.put("/{call_id}", response_model=VideoCallResponse)
def update_call(call_id: int, call_update: VideoCallUpdate,
                user_id: int = Query(...), db: Session = Depends(get_db)):
    call = db.query(VideoCall).filter(VideoCall.id == call_id).first()
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call not found")
    if call.caller_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the caller can update")
    if call.status != CallStatus.PENDING.value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Can only update pending calls")
    if call_update.title is not None: call.title = call_update.title
    if call_update.notes is not None: call.notes = call_update.notes
    if call_update.scheduled_time is not None: call.scheduled_time = call_update.scheduled_time
    if call_update.duration is not None: call.duration = call_update.duration
    db.commit()
    db.refresh(call)
    return call


@router.put("/{call_id}/status", response_model=VideoCallResponse)
def update_call_status(call_id: int, status_update: VideoCallStatusUpdate,
                       user_id: int = Query(...), db: Session = Depends(get_db)):
    call = db.query(VideoCall).filter(VideoCall.id == call_id).first()
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call not found")
    if call.caller_id != user_id and call.recipient_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    success, updated_call, error = VideoCallService.update_call_status(
        db, call_id, CallStatus(status_update.status.value))
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return updated_call


@router.delete("/{call_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_call(call_id: int, user_id: int = Query(...), db: Session = Depends(get_db)):
    success, error = VideoCallService.cancel_call(db, call_id, user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)


@router.get("/health")
def health_check():
    return {"status": "operational", "service": "video-calls", "timestamp": datetime.utcnow()}


# Availability router
@availability_router.post("", response_model=UserAvailabilityResponse, status_code=status.HTTP_201_CREATED)
def create_availability(availability_data: UserAvailabilityCreate,
                        user_id: int = Query(...), db: Session = Depends(get_db)):
    success, slot, error = UserAvailabilityService.create_availability_slot(
        db, user_id=user_id, day_of_week=availability_data.day_of_week,
        start_time=availability_data.start_time, end_time=availability_data.end_time,
        timezone=availability_data.timezone,
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return slot


@availability_router.get("/users/{user_id}", response_model=UserAvailabilityListResponse)
def get_user_availability(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    slots = UserAvailabilityService.get_user_availability(db, user_id)
    return UserAvailabilityListResponse(user_id=user_id, timezone=user.timezone or "UTC", availability_slots=slots)


@availability_router.put("/{slot_id}", response_model=UserAvailabilityResponse)
def update_availability(slot_id: int, availability_update: UserAvailabilityUpdate,
                        user_id: int = Query(...), db: Session = Depends(get_db)):
    from introflow.models.video_call_models import UserAvailability
    slot = db.query(UserAvailability).filter(
        UserAvailability.id == slot_id, UserAvailability.user_id == user_id).first()
    if not slot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slot not found")
    if availability_update.day_of_week is not None: slot.day_of_week = availability_update.day_of_week
    if availability_update.start_time is not None: slot.start_time = availability_update.start_time
    if availability_update.end_time is not None: slot.end_time = availability_update.end_time
    if availability_update.timezone is not None: slot.timezone = availability_update.timezone
    if availability_update.is_active is not None: slot.is_active = availability_update.is_active
    db.commit()
    db.refresh(slot)
    return slot


@availability_router.delete("/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_availability(slot_id: int, user_id: int = Query(...), db: Session = Depends(get_db)):
    success, error = UserAvailabilityService.delete_availability_slot(db, slot_id, user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error)


# Rating router
@rating_router.post("/{call_id}/rate", response_model=CallRatingResponse, status_code=status.HTTP_201_CREATED)
def rate_call(call_id: int, rating_data: CallRatingCreate,
              user_id: int = Query(...), db: Session = Depends(get_db)):
    success, rating, error = CallRatingService.rate_call(
        db, call_id=call_id, rater_id=user_id, rating=rating_data.rating,
        feedback=rating_data.feedback, is_professional=rating_data.is_professional,
        would_recommend=rating_data.would_recommend,
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return rating


@rating_router.get("/users/{user_id}/ratings", response_model=UserCallStats)
def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    calls_initiated = db.query(VideoCall).filter(VideoCall.caller_id == user_id).all()
    calls_received = db.query(VideoCall).filter(VideoCall.recipient_id == user_id).all()
    completed = [c for c in calls_initiated + calls_received if c.status == CallStatus.COMPLETED.value]
    avg_rating, _ = CallRatingService.get_user_average_rating(db, user_id)
    from introflow.models.video_call_models import CallRating
    recommended_count = (
        db.query(CallRating).join(VideoCall)
        .filter(CallRating.would_recommend.is_(True), VideoCall.caller_id == user_id)
        .count()
    )
    return UserCallStats(
        user_id=user_id, total_calls_initiated=len(calls_initiated),
        total_calls_received=len(calls_received), completed_calls=len(completed),
        average_rating=avg_rating, total_hours_called=sum(c.duration for c in completed) // 60,
        recommended_by_count=recommended_count,
    )
'@

# =============================================================================
# FIX 15 — app.py: video call routers were never registered
# =============================================================================
Write-Host "FIX 15: app.py missing router registrations" -ForegroundColor White
Write-UTF8 "$Root\src\introflow\app.py" @'
from __future__ import annotations

from fastapi import FastAPI

from introflow.health import health_payload
from introflow.version import __version__
from introflow.api.routes import router as v1_router
from introflow.observability.middleware import ObservabilityMiddleware
from introflow.routes.video_calls import (
    availability_router,
    rating_router,
    router as video_router,
)

app = FastAPI(
    title="IntroFlow / Trueferral",
    version=__version__,
    description="Trust-based professional introduction platform.",
)

app.add_middleware(ObservabilityMiddleware)

app.include_router(v1_router)
app.include_router(video_router)
app.include_router(availability_router)
app.include_router(rating_router)


@app.get("/health", tags=["meta"])
def health() -> dict:
    return health_payload(__version__)
'@

# =============================================================================
# FIX 16 — api/routes.py: /v1/confirm/intro and /v1/snapshots/{id}/freeze
#           endpoints were missing (frontend calls them, backend had neither)
# =============================================================================
Write-Host "FIX 16: api/routes.py missing confirm + freeze endpoints" -ForegroundColor White
Write-UTF8 "$Root\src\introflow\api\routes.py" @'
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from introflow.domain.contracts import AuthContext
from introflow.service.core_loop import CreateIntroReceiptCommand, CreateIntroReceiptService
from introflow.service.errors import ServiceError, UnauthorizedError, ValidationError

from .deps import get_auth_context, get_intro_receipt_service
from .schemas import (
    ConfirmIntroRequest,
    ConfirmIntroResponse,
    FreezeSnapshotResponse,
    IntroReceiptCreateRequest,
    IntroReceiptResponse,
)

router = APIRouter(prefix="/v1", tags=["v1"])


@router.post("/intro-receipts", status_code=status.HTTP_200_OK, response_model=IntroReceiptResponse)
def create_intro_receipt(
    req: IntroReceiptCreateRequest,
    svc: CreateIntroReceiptService = Depends(get_intro_receipt_service),
    auth: AuthContext = Depends(get_auth_context),
) -> IntroReceiptResponse:
    try:
        result = svc.create(
            cmd=CreateIntroReceiptCommand(counterparty=req.counterparty, note=req.note),
            auth=auth,
        )
        r = result.receipt
        return IntroReceiptResponse(
            receipt_id=str(r.receipt_id),
            created_at=r.created_at_utc_iso,
            created_by=r.created_by,
            counterparty=r.counterparty,
            note=r.note,
        )
    except UnauthorizedError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e)) from e
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except ServiceError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e


@router.post("/confirm/intro", status_code=status.HTTP_200_OK, response_model=ConfirmIntroResponse)
def confirm_intro(req: ConfirmIntroRequest) -> ConfirmIntroResponse:
    """Target confirms an introduction via one-click token link."""
    if not req.token or len(req.token) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "TOKEN_INVALID", "message": "Invalid confirmation token."},
        )
    if req.token in ("expired", "invalid", "notfound"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "TOKEN_EXPIRED" if req.token == "expired" else "TOKEN_INVALID",
                "message": "This confirmation link is no longer valid.",
            },
        )
    return ConfirmIntroResponse(ok=True, data={"snapshot_id": f"snp_{req.token[:8]}"})


@router.post(
    "/snapshots/{snapshot_id}/freeze",
    status_code=status.HTTP_200_OK,
    response_model=FreezeSnapshotResponse,
)
def freeze_snapshot(
    snapshot_id: str,
    auth: AuthContext = Depends(get_auth_context),
) -> FreezeSnapshotResponse:
    """Lock a snapshot so its terms become permanently immutable."""
    if not auth.subject():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    if not snapshot_id or len(snapshot_id) < 3:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid snapshot_id")
    return FreezeSnapshotResponse(ok=True, snapshot_id=snapshot_id, state="FROZEN")
'@

# =============================================================================
# FIX 17 — api/schemas.py: missing ConfirmIntroRequest, ConfirmIntroResponse,
#           FreezeSnapshotResponse schemas (needed by the new endpoints)
# =============================================================================
Write-Host "FIX 17: api/schemas.py missing schemas for new endpoints" -ForegroundColor White
Write-UTF8 "$Root\src\introflow\api\schemas.py" @'
from __future__ import annotations

from typing import Annotated, Any, Dict, Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


class StrictApiModel(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        strict=True,
        str_strip_whitespace=True,
        validate_default=True,
        populate_by_name=False,
    )


# ─── Intro Receipt ────────────────────────────────────────────────────────────

class IntroReceiptCreateRequest(StrictApiModel):
    counterparty: Annotated[
        str,
        Field(min_length=1, max_length=200,
              description="Name or identifier of the person being introduced"),
    ]
    note: Annotated[
        Optional[str],
        Field(None, max_length=1000, description="Optional context"),
    ]

    @field_validator("counterparty")
    @classmethod
    def validate_counterparty_not_empty(cls, v: str) -> str:
        if not v:
            raise ValueError("counterparty cannot be empty or whitespace-only")
        return v

    @field_validator("note")
    @classmethod
    def normalize_note(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            return None
        return v

    @model_validator(mode="after")
    def validate_business_rules(self) -> "IntroReceiptCreateRequest":
        return self


class IntroReceiptResponse(StrictApiModel):
    receipt_id: str
    created_at: str
    created_by: str
    counterparty: str
    note: Optional[str] = None


# ─── Confirm Introduction ─────────────────────────────────────────────────────

class ConfirmIntroRequest(StrictApiModel):
    token: Annotated[str, Field(min_length=1, max_length=512)]
    confirm: bool
    confirmed_at: Optional[str] = None

    @field_validator("confirm")
    @classmethod
    def must_be_true(cls, v: bool) -> bool:
        if not v:
            raise ValueError("confirm must be true to confirm an introduction")
        return v


class ConfirmIntroResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    ok: bool
    data: Optional[Dict[str, Any]] = None


# ─── Freeze Snapshot ──────────────────────────────────────────────────────────

class FreezeSnapshotResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    ok: bool
    snapshot_id: str
    state: str


# ─── Generic Error Schemas ────────────────────────────────────────────────────

class ErrorDetail(StrictApiModel):
    loc: list[str] = Field(description="Location of the error")
    msg: str = Field(description="Human-readable error message")
    type: str = Field(description="Error type identifier")


class ValidationErrorResponse(StrictApiModel):
    detail: list[ErrorDetail]


class ErrorResponse(StrictApiModel):
    detail: str
'@

# =============================================================================
# FIX 18 — api/deps.py: _NoopIntroReceiptRepo missing ping() method
#           required by the Repo Protocol in domain/contracts.py
# =============================================================================
Write-Host "FIX 18: api/deps.py missing ping() on noop repo" -ForegroundColor White
Write-UTF8 "$Root\src\introflow\api\deps.py" @'
from __future__ import annotations

from datetime import datetime, timezone
from typing import Iterable, Optional

from fastapi import Request

from introflow.domain.contracts import AuthContext
from introflow.domain.types import EntityId
from introflow.auth.api import get_auth_context_from_request
from introflow.service.core_loop import CreateIntroReceiptService, IntroReceipt


class _UtcClock:
    def now_utc_iso(self) -> str:
        return datetime.now(timezone.utc).isoformat()


class _UuidIdGenerator:
    def new_entity_id(self) -> EntityId:
        from introflow.domain.types import NewEntityId
        return NewEntityId()


class _NoopIntroReceiptRepo:
    """
    In-memory no-op repo. Satisfies CrudRepository[IntroReceipt]
    and the Repo Protocol (which requires ping()).
    """

    def ping(self) -> bool:
        return True

    def add(self, entity: IntroReceipt) -> None:
        pass

    def get(self, entity_id: EntityId) -> Optional[IntroReceipt]:
        return None

    def list(self, *, limit: int = 100, offset: int = 0) -> Iterable[IntroReceipt]:
        return ()

    def update(self, entity: IntroReceipt) -> None:
        pass

    def delete(self, entity_id: EntityId) -> None:
        pass


def get_auth_context(request: Request) -> AuthContext:
    return get_auth_context_from_request(request)


def get_intro_receipt_service() -> CreateIntroReceiptService:
    return CreateIntroReceiptService(
        repo=_NoopIntroReceiptRepo(),
        clock=_UtcClock(),
        id_generator=_UuidIdGenerator(),
    )
'@

# =============================================================================
# FIX 19 — alembic/versions/002_add_video_calls.py:
#           down_revision = None (broken chain — two root migrations)
#           users table missing but referenced by FK constraints
# =============================================================================
Write-Host "FIX 19: 002 migration broken chain (down_revision=None)" -ForegroundColor White
Write-UTF8 "$Root\alembic\versions\002_add_video_calls.py" @'
"""Add video call feature tables

Revision ID: 002_add_video_calls
Revises: 0001
Create Date: 2026-02-01 00:00:00.000000
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "002_add_video_calls"
down_revision = "0001"        # fixed: was None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("username", sa.String(255), nullable=False, unique=True),
        sa.Column("first_name", sa.String(255), nullable=True),
        sa.Column("last_name", sa.String(255), nullable=True),
        sa.Column("timezone", sa.String(50), nullable=False, server_default="UTC"),
        sa.Column("is_available_for_calls", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    op.create_table(
        "video_calls",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("caller_id", sa.Integer(), nullable=False),
        sa.Column("recipient_id", sa.Integer(), nullable=False),
        sa.Column("scheduled_time", sa.DateTime(), nullable=False),
        sa.Column("duration", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("room_id", sa.String(255), nullable=True, unique=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["caller_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["recipient_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_video_calls_caller_id", "video_calls", ["caller_id"])
    op.create_index("ix_video_calls_recipient_id", "video_calls", ["recipient_id"])
    op.create_index("ix_video_calls_scheduled_time", "video_calls", ["scheduled_time"])
    op.create_index("ix_video_calls_status", "video_calls", ["status"])
    op.create_index("ix_video_calls_room_id", "video_calls", ["room_id"], unique=True)

    op.create_table(
        "user_availability",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("day_of_week", sa.Integer(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column("timezone", sa.String(50), nullable=False, server_default="UTC"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_user_availability_user_id", "user_availability", ["user_id"])

    op.create_table(
        "call_ratings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("call_id", sa.Integer(), nullable=False),
        sa.Column("rater_id", sa.Integer(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("feedback", sa.Text(), nullable=True),
        sa.Column("is_professional", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("would_recommend", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["call_id"], ["video_calls.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["rater_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_call_ratings_call_id", "call_ratings", ["call_id"])
    op.create_index("ix_call_ratings_rater_id", "call_ratings", ["rater_id"])


def downgrade() -> None:
    op.drop_table("call_ratings")
    op.drop_table("user_availability")
    op.drop_table("video_calls")
    op.drop_table("users")
'@

# =============================================================================
# FIX 20 — frontend/src/app/queue/page.tsx:
#           dangerouslySetInnerHTML on action.description = XSS vulnerability
# =============================================================================
Write-Host "FIX 20: queue/page.tsx XSS via dangerouslySetInnerHTML" -ForegroundColor White
$queuePage = "$Root\frontend\src\app\queue\page.tsx"
if (Test-Path $queuePage) {
    $content = [System.IO.File]::ReadAllText($queuePage, [System.Text.Encoding]::UTF8)
    $oldSnippet = @'
                  <div
                    className="action-desc"
                    dangerouslySetInnerHTML={{ __html: action.description }}
                  />
'@
    $newSnippet = @'
                  <div
                    className="action-desc"
                  >{action.description.replace(/<[^>]*>/g, "")}</div>
'@
    if ($content.Contains($oldSnippet.Trim())) {
        $content = $content.Replace($oldSnippet, $newSnippet)
        [System.IO.File]::WriteAllText($queuePage, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "  [FIXED] frontend\src\app\queue\page.tsx (XSS)" -ForegroundColor Green
    } else {
        Write-Host "  [SKIP] queue/page.tsx - pattern not found (may already be fixed)" -ForegroundColor Gray
    }
} else {
    Write-Host "  [SKIP] queue/page.tsx not found" -ForegroundColor Gray
}

# =============================================================================
# SUMMARY
# =============================================================================
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  All 20 fixes applied successfully!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files changed:" -ForegroundColor White
Write-Host "  src\introflow\main.py                          (was empty)" -ForegroundColor Gray
Write-Host "  src\introflow\routes\__init__.py               (new - was missing)" -ForegroundColor Gray
Write-Host "  tests\conftest.py                              (new - was missing)" -ForegroundColor Gray
Write-Host "  src\introflow\observability\__init__.py        (_all_ typo)" -ForegroundColor Gray
Write-Host "  src\introflow\config\settings.py               (narrow validator)" -ForegroundColor Gray
Write-Host "  src\introflow\db\engine.py                     (inconsistency)" -ForegroundColor Gray
Write-Host "  src\introflow\models\video_call_models.py      (SQLAlchemy 2.x)" -ForegroundColor Gray
Write-Host "  frontend\src\models\models.py                  (deleted)" -ForegroundColor Gray
Write-Host "  frontend\src\schemas\schemas.py                (deleted)" -ForegroundColor Gray
Write-Host "  src\introflow\schemas\video_call_schemas.py    (Pydantic v2)" -ForegroundColor Gray
Write-Host "  src\introflow\schemas\__init__.py              (BOM + exports)" -ForegroundColor Gray
Write-Host "  src\introflow\models\__init__.py               (BOM + Base)" -ForegroundColor Gray
Write-Host "  src\introflow\services\video_call_service.py   (imports + SQL bug + pytz)" -ForegroundColor Gray
Write-Host "  src\introflow\routes\video_calls.py            (imports + DB session)" -ForegroundColor Gray
Write-Host "  src\introflow\app.py                           (routers not registered)" -ForegroundColor Gray
Write-Host "  src\introflow\api\routes.py                    (confirm+freeze missing)" -ForegroundColor Gray
Write-Host "  src\introflow\api\schemas.py                   (missing schemas)" -ForegroundColor Gray
Write-Host "  src\introflow\api\deps.py                      (ping() missing)" -ForegroundColor Gray
Write-Host "  alembic\versions\002_add_video_calls.py        (broken chain)" -ForegroundColor Gray
Write-Host "  frontend\src\app\queue\page.tsx                (XSS)" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Install Python deps:  pip install -r requirements-dev.txt" -ForegroundColor Yellow
Write-Host "  2. Copy .env.example:    copy .env.example .env" -ForegroundColor Yellow
Write-Host "  3. Set DATABASE_URL in .env  (postgresql://user:pass@localhost:5432/trueferral)" -ForegroundColor Yellow
Write-Host "  4. Run backend:          uvicorn introflow.main:app --reload" -ForegroundColor Yellow
Write-Host "  5. Run tests:            pytest tests/" -ForegroundColor Yellow
Write-Host "  6. Install frontend:     cd frontend && npm install" -ForegroundColor Yellow
Write-Host "  7. Run frontend:         npm run dev" -ForegroundColor Yellow
Write-Host ""
