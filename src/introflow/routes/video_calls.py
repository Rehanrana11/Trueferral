"""
Video Call API Endpoints
FastAPI routes for managing video calls, availability, and ratings
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from models import VideoCall, User, CallStatus
from schemas import (
    VideoCallCreate, VideoCallResponse, VideoCallDetailResponse,
    VideoCallStatusUpdate, VideoCallUpdate,
    UserAvailabilityCreate, UserAvailabilityResponse, UserAvailabilityListResponse,
    UserAvailabilityUpdate,
    CallRatingCreate, CallRatingResponse, CallRatingUpdate,
    ErrorResponse, UserCallStats, UserVideoCallProfile
)
from services import (
    VideoCallService, UserAvailabilityService, CallRatingService
)

# Create router
router = APIRouter(prefix="/api/video-calls", tags=["video-calls"])

# Dependency to get database session
def get_db() -> Session:
    """Get database session - adjust based on your project's DB setup"""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    
    # This is a placeholder - use your actual database URL
    DATABASE_URL = "sqlite:///./test.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()


# ==================== Video Call Endpoints ====================

@router.post(
    "/schedule",
    response_model=VideoCallResponse,
    status_code=201,
    summary="Schedule a new video call",
    description="Create and schedule a new video call with another user"
)
def schedule_call(
    call_data: VideoCallCreate,
    caller_id: int = Query(..., description="ID of the person initiating the call"),
    db: Session = Depends(get_db)
):
    """
    Schedule a new video call with validation
    
    - Validates time conflicts for both users
    - Checks recipient availability
    - Validates duration and time constraints
    """
    success, call, error = VideoCallService.schedule_call(
        db,
        caller_id=caller_id,
        recipient_id=call_data.recipient_id,
        scheduled_time=call_data.scheduled_time,
        duration=call_data.duration,
        title=call_data.title,
        notes=call_data.notes
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=error)
    
    return call


@router.get(
    "/upcoming",
    response_model=List[VideoCallResponse],
    summary="Get upcoming calls",
    description="Retrieve all upcoming calls for the current user"
)
def get_upcoming_calls(
    user_id: int = Query(..., description="User ID"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Get upcoming calls for a user (both initiated and received)
    
    Returns calls that are pending or active and scheduled for the future
    """
    calls = VideoCallService.get_upcoming_calls(db, user_id, limit, offset)
    return calls


@router.get(
    "/history",
    response_model=List[VideoCallResponse],
    summary="Get call history",
    description="Retrieve completed calls for the current user"
)
def get_call_history(
    user_id: int = Query(..., description="User ID"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Get completed calls for a user
    
    Returns calls that have been completed, sorted by most recent first
    """
    calls = VideoCallService.get_call_history(db, user_id, limit, offset)
    return calls


@router.get(
    "/{call_id}",
    response_model=VideoCallDetailResponse,
    summary="Get call details",
    description="Retrieve detailed information about a specific call"
)
def get_call_details(
    call_id: int,
    user_id: int = Query(..., description="User ID requesting the details"),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific call
    
    Includes caller/recipient information and any ratings
    """
    call = db.query(VideoCall).filter(VideoCall.id == call_id).first()
    
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    # Verify user has permission to view this call
    if call.caller_id != user_id and call.recipient_id != user_id:
        raise HTTPException(status_code=403, detail="You don't have permission to view this call")
    
    return call


@router.put(
    "/{call_id}",
    response_model=VideoCallResponse,
    summary="Update call details",
    description="Modify call title, notes, time, or duration"
)
def update_call(
    call_id: int,
    call_update: VideoCallUpdate,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """
    Update call details
    
    Only callable before the call starts. Must be the call initiator.
    """
    call = db.query(VideoCall).filter(VideoCall.id == call_id).first()
    
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    if call.caller_id != user_id:
        raise HTTPException(status_code=403, detail="Only the call initiator can update it")
    
    if call.status != CallStatus.PENDING:
        raise HTTPException(status_code=400, detail="Can only update pending calls")
    
    # Update fields if provided
    if call_update.title:
        call.title = call_update.title
    if call_update.notes is not None:
        call.notes = call_update.notes
    if call_update.scheduled_time:
        call.scheduled_time = call_update.scheduled_time
    if call_update.duration:
        call.duration = call_update.duration
    
    call.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(call)
    
    return call


@router.put(
    "/{call_id}/status",
    response_model=VideoCallResponse,
    summary="Update call status",
    description="Change the status of a call (active, completed, cancelled, etc.)"
)
def update_call_status(
    call_id: int,
    status_update: VideoCallStatusUpdate,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """
    Update the status of a call
    
    Valid statuses: pending, active, completed, cancelled, no_show
    """
    call = db.query(VideoCall).filter(VideoCall.id == call_id).first()
    
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    # Only caller or recipient can update status
    if call.caller_id != user_id and call.recipient_id != user_id:
        raise HTTPException(status_code=403, detail="You don't have permission to update this call")
    
    success, updated_call, error = VideoCallService.update_call_status(
        db, call_id, status_update.status
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=error)
    
    return updated_call


@router.delete(
    "/{call_id}",
    status_code=204,
    summary="Cancel a call",
    description="Cancel a scheduled video call"
)
def cancel_call(
    call_id: int,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """
    Cancel a scheduled call
    
    Can only cancel pending calls. Must be caller or recipient.
    """
    success, error = VideoCallService.cancel_call(db, call_id, user_id)
    
    if not success:
        raise HTTPException(status_code=400, detail=error)


# ==================== User Availability Endpoints ====================

availability_router = APIRouter(prefix="/api/user-availability", tags=["availability"])


@availability_router.post(
    "",
    response_model=UserAvailabilityResponse,
    status_code=201,
    summary="Create availability slot",
    description="Add a new availability time slot"
)
def create_availability(
    availability_data: UserAvailabilityCreate,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """
    Create a new availability slot for a user
    
    Availability is specified as day of week and time range in user's timezone
    """
    success, slot, error = UserAvailabilityService.create_availability_slot(
        db,
        user_id=user_id,
        day_of_week=availability_data.day_of_week,
        start_time=availability_data.start_time,
        end_time=availability_data.end_time,
        timezone=availability_data.timezone
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=error)
    
    return slot


@availability_router.get(
    "/users/{user_id}",
    response_model=UserAvailabilityListResponse,
    summary="Get user availability",
    description="Retrieve all availability slots for a user"
)
def get_user_availability(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all availability slots for a specific user
    
    Returns all active availability slots organized by day of week
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    slots = UserAvailabilityService.get_user_availability(db, user_id)
    
    return UserAvailabilityListResponse(
        user_id=user_id,
        timezone=user.timezone or "UTC",
        availability_slots=slots
    )


@availability_router.put(
    "/{slot_id}",
    response_model=UserAvailabilityResponse,
    summary="Update availability slot",
    description="Modify an existing availability slot"
)
def update_availability(
    slot_id: int,
    availability_update: UserAvailabilityUpdate,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """
    Update an existing availability slot
    """
    from models import UserAvailability
    
    slot = db.query(UserAvailability).filter(
        UserAvailability.id == slot_id,
        UserAvailability.user_id == user_id
    ).first()
    
    if not slot:
        raise HTTPException(status_code=404, detail="Availability slot not found")
    
    # Update fields if provided
    if availability_update.day_of_week is not None:
        slot.day_of_week = availability_update.day_of_week
    if availability_update.start_time:
        slot.start_time = availability_update.start_time
    if availability_update.end_time:
        slot.end_time = availability_update.end_time
    if availability_update.timezone:
        slot.timezone = availability_update.timezone
    if availability_update.is_active is not None:
        slot.is_active = availability_update.is_active
    
    slot.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(slot)
    
    return slot


@availability_router.delete(
    "/{slot_id}",
    status_code=204,
    summary="Delete availability slot",
    description="Remove an availability slot"
)
def delete_availability(
    slot_id: int,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """
    Delete an availability slot
    """
    success, error = UserAvailabilityService.delete_availability_slot(db, slot_id, user_id)
    
    if not success:
        raise HTTPException(status_code=404, detail=error)


# ==================== Rating Endpoints ====================

rating_router = APIRouter(prefix="/api/video-calls", tags=["ratings"])


@rating_router.post(
    "/{call_id}/rate",
    response_model=CallRatingResponse,
    status_code=201,
    summary="Rate a call",
    description="Submit a rating and review for a completed call"
)
def rate_call(
    call_id: int,
    rating_data: CallRatingCreate,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """
    Rate a completed video call
    
    Users can rate calls they participated in (1-5 stars)
    Includes optional feedback and recommendations
    """
    success, rating, error = CallRatingService.rate_call(
        db,
        call_id=call_id,
        rater_id=user_id,
        rating=rating_data.rating,
        feedback=rating_data.feedback,
        is_professional=rating_data.is_professional,
        would_recommend=rating_data.would_recommend
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=error)
    
    return rating


@rating_router.get(
    "/users/{user_id}/ratings",
    response_model=UserCallStats,
    summary="Get user call statistics",
    description="Retrieve calling statistics and ratings for a user"
)
def get_user_stats(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get call statistics for a user
    
    Includes:
    - Total calls initiated and received
    - Completed calls count
    - Average rating
    - Total hours spent on calls
    - Recommendation count
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get calls initiated
    calls_initiated = db.query(VideoCall).filter(
        VideoCall.caller_id == user_id
    ).all()
    
    # Get calls received
    calls_received = db.query(VideoCall).filter(
        VideoCall.recipient_id == user_id
    ).all()
    
    # Get completed calls
    completed_calls = [c for c in calls_initiated + calls_received if c.status == CallStatus.COMPLETED]
    
    # Calculate average rating
    avg_rating, rating_count = CallRatingService.get_user_average_rating(db, user_id)
    
    # Calculate total hours
    total_minutes = sum(c.duration for c in completed_calls)
    total_hours = total_minutes // 60
    
    # Count recommendations
    from models import CallRating
    recommendations = db.query(CallRating).filter(
        CallRating.would_recommend == True
    ).all()
    recommended_count = len(recommendations)
    
    return UserCallStats(
        user_id=user_id,
        total_calls_initiated=len(calls_initiated),
        total_calls_received=len(calls_received),
        completed_calls=len(completed_calls),
        average_rating=avg_rating,
        total_hours_called=total_hours,
        recommended_by_count=recommended_count
    )


# ==================== Health Check ====================

@router.get(
    "/health",
    status_code=200,
    summary="Health check",
    description="Check if video call service is operational"
)
def health_check():
    """
    Health check endpoint for video call service
    """
    return {
        "status": "operational",
        "service": "video-calls",
        "timestamp": datetime.utcnow()
    }
