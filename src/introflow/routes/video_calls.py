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