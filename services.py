"""
Video Call Services
Business logic for managing video calls, scheduling, and availability
"""

from datetime import datetime, time, timedelta
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import pytz
from models import VideoCall, UserAvailability, CallRating, CallStatus, User


class VideoCallService:
    """
    Service class for managing video calls
    Handles scheduling, validation, and call management logic
    """

    @staticmethod
    def check_availability_conflict(
        db: Session,
        user_id: int,
        scheduled_time: datetime,
        duration: int
    ) -> Tuple[bool, Optional[str]]:
        """
        Check if a user has any conflicting calls at the scheduled time
        
        Args:
            db: Database session
            user_id: User ID to check
            scheduled_time: When the call should occur
            duration: Duration of the call in minutes
            
        Returns:
            Tuple of (has_conflict: bool, conflict_message: str)
        """
        call_end_time = scheduled_time + timedelta(minutes=duration)
        
        # Check for overlapping calls
        conflicting_calls = db.query(VideoCall).filter(
            and_(
                or_(
                    VideoCall.caller_id == user_id,
                    VideoCall.recipient_id == user_id
                ),
                VideoCall.status.in_([CallStatus.PENDING, CallStatus.ACTIVE]),
                VideoCall.scheduled_time < call_end_time,
                (VideoCall.scheduled_time + timedelta(minutes=VideoCall.duration)) > scheduled_time
            )
        ).first()
        
        if conflicting_calls:
            return True, f"User has a conflicting call at {conflicting_calls.scheduled_time}"
        
        return False, None

    @staticmethod
    def check_user_availability(
        db: Session,
        user_id: int,
        scheduled_time: datetime,
        timezone: str = "UTC"
    ) -> Tuple[bool, Optional[str]]:
        """
        Check if the scheduled time falls within user's availability hours
        
        Args:
            db: Database session
            user_id: User ID to check
            scheduled_time: When the call should occur
            timezone: User's timezone
            
        Returns:
            Tuple of (is_available: bool, message: str)
        """
        try:
            tz = pytz.timezone(timezone)
        except:
            return False, f"Invalid timezone: {timezone}"
        
        # Convert scheduled time to user's timezone
        local_time = scheduled_time.astimezone(tz)
        day_of_week = local_time.weekday()
        call_time = local_time.time()
        
        # Get user availability for this day
        availability = db.query(UserAvailability).filter(
            and_(
                UserAvailability.user_id == user_id,
                UserAvailability.day_of_week == day_of_week,
                UserAvailability.is_active == True
            )
        ).all()
        
        if not availability:
            return False, f"User is not available on {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day_of_week]}"
        
        # Check if call time falls within any availability slot
        for slot in availability:
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
        notes: Optional[str] = None
    ) -> Tuple[bool, Optional[VideoCall], Optional[str]]:
        """
        Schedule a new video call with validation
        
        Args:
            db: Database session
            caller_id: ID of person initiating the call
            recipient_id: ID of person receiving the call
            scheduled_time: When the call should occur
            duration: Duration in minutes
            title: Call title/topic
            notes: Optional notes
            
        Returns:
            Tuple of (success: bool, call: VideoCall, error_message: str)
        """
        # Validation: caller and recipient must be different
        if caller_id == recipient_id:
            return False, None, "Cannot schedule call with yourself"
        
        # Validation: check recipient is available for calls
        recipient = db.query(User).filter(User.id == recipient_id).first()
        if not recipient or not recipient.is_available_for_calls:
            return False, None, "Recipient is not available for video calls"
        
        # Check caller's availability (no conflicting calls)
        has_conflict, conflict_msg = VideoCallService.check_availability_conflict(
            db, caller_id, scheduled_time, duration
        )
        if has_conflict:
            return False, None, f"Caller {conflict_msg}"
        
        # Check recipient's availability (no conflicting calls)
        has_conflict, conflict_msg = VideoCallService.check_availability_conflict(
            db, recipient_id, scheduled_time, duration
        )
        if has_conflict:
            return False, None, f"Recipient {conflict_msg}"
        
        # Check if recipient is available during scheduled time
        recipient_tz = recipient.timezone or "UTC"
        is_available, availability_msg = VideoCallService.check_user_availability(
            db, recipient_id, scheduled_time, recipient_tz
        )
        if not is_available:
            return False, None, availability_msg
        
        # Create the call
        new_call = VideoCall(
            caller_id=caller_id,
            recipient_id=recipient_id,
            scheduled_time=scheduled_time,
            duration=duration,
            title=title,
            notes=notes,
            status=CallStatus.PENDING
        )
        
        db.add(new_call)
        db.commit()
        db.refresh(new_call)
        
        return True, new_call, None

    @staticmethod
    def get_upcoming_calls(
        db: Session,
        user_id: int,
        limit: int = 20,
        offset: int = 0
    ) -> List[VideoCall]:
        """
        Get upcoming calls for a user (as caller or recipient)
        
        Args:
            db: Database session
            user_id: User ID
            limit: Maximum number of results
            offset: Pagination offset
            
        Returns:
            List of VideoCall objects
        """
        now = datetime.utcnow()
        
        return db.query(VideoCall).filter(
            and_(
                or_(
                    VideoCall.caller_id == user_id,
                    VideoCall.recipient_id == user_id
                ),
                VideoCall.scheduled_time >= now,
                VideoCall.status.in_([CallStatus.PENDING, CallStatus.ACTIVE])
            )
        ).order_by(VideoCall.scheduled_time).offset(offset).limit(limit).all()

    @staticmethod
    def get_call_history(
        db: Session,
        user_id: int,
        limit: int = 20,
        offset: int = 0
    ) -> List[VideoCall]:
        """
        Get completed calls for a user
        
        Args:
            db: Database session
            user_id: User ID
            limit: Maximum number of results
            offset: Pagination offset
            
        Returns:
            List of completed VideoCall objects
        """
        return db.query(VideoCall).filter(
            and_(
                or_(
                    VideoCall.caller_id == user_id,
                    VideoCall.recipient_id == user_id
                ),
                VideoCall.status == CallStatus.COMPLETED
            )
        ).order_by(VideoCall.scheduled_time.desc()).offset(offset).limit(limit).all()

    @staticmethod
    def cancel_call(
        db: Session,
        call_id: int,
        user_id: int
    ) -> Tuple[bool, Optional[str]]:
        """
        Cancel a scheduled call
        
        Args:
            db: Database session
            call_id: Call ID
            user_id: User requesting cancellation (must be caller or recipient)
            
        Returns:
            Tuple of (success: bool, error_message: str)
        """
        call = db.query(VideoCall).filter(VideoCall.id == call_id).first()
        
        if not call:
            return False, "Call not found"
        
        if call.caller_id != user_id and call.recipient_id != user_id:
            return False, "You don't have permission to cancel this call"
        
        if call.status == CallStatus.COMPLETED:
            return False, "Cannot cancel a completed call"
        
        if call.status == CallStatus.CANCELLED:
            return False, "Call is already cancelled"
        
        call.status = CallStatus.CANCELLED
        call.updated_at = datetime.utcnow()
        db.commit()
        
        return True, None

    @staticmethod
    def update_call_status(
        db: Session,
        call_id: int,
        new_status: CallStatus
    ) -> Tuple[bool, Optional[VideoCall], Optional[str]]:
        """
        Update the status of a call
        
        Args:
            db: Database session
            call_id: Call ID
            new_status: New status
            
        Returns:
            Tuple of (success: bool, call: VideoCall, error_message: str)
        """
        call = db.query(VideoCall).filter(VideoCall.id == call_id).first()
        
        if not call:
            return False, None, "Call not found"
        
        call.status = new_status
        call.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(call)
        
        return True, call, None


class UserAvailabilityService:
    """
    Service class for managing user availability
    """

    @staticmethod
    def create_availability_slot(
        db: Session,
        user_id: int,
        day_of_week: int,
        start_time: time,
        end_time: time,
        timezone: str
    ) -> Tuple[bool, Optional[UserAvailability], Optional[str]]:
        """
        Create a new availability slot for a user
        
        Args:
            db: Database session
            user_id: User ID
            day_of_week: Day of week (0-6)
            start_time: Start time
            end_time: End time
            timezone: Timezone
            
        Returns:
            Tuple of (success: bool, availability: UserAvailability, error_message: str)
        """
        if end_time <= start_time:
            return False, None, "End time must be after start time"
        
        # Check for duplicate slots for same day
        existing = db.query(UserAvailability).filter(
            and_(
                UserAvailability.user_id == user_id,
                UserAvailability.day_of_week == day_of_week,
                UserAvailability.start_time == start_time,
                UserAvailability.end_time == end_time
            )
        ).first()
        
        if existing:
            return False, None, "This availability slot already exists"
        
        new_slot = UserAvailability(
            user_id=user_id,
            day_of_week=day_of_week,
            start_time=start_time,
            end_time=end_time,
            timezone=timezone
        )
        
        db.add(new_slot)
        db.commit()
        db.refresh(new_slot)
        
        return True, new_slot, None

    @staticmethod
    def get_user_availability(
        db: Session,
        user_id: int
    ) -> List[UserAvailability]:
        """
        Get all availability slots for a user
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            List of UserAvailability objects
        """
        return db.query(UserAvailability).filter(
            UserAvailability.user_id == user_id
        ).order_by(UserAvailability.day_of_week).all()

    @staticmethod
    def delete_availability_slot(
        db: Session,
        slot_id: int,
        user_id: int
    ) -> Tuple[bool, Optional[str]]:
        """
        Delete an availability slot
        
        Args:
            db: Database session
            slot_id: Availability slot ID
            user_id: User ID (must be owner)
            
        Returns:
            Tuple of (success: bool, error_message: str)
        """
        slot = db.query(UserAvailability).filter(
            and_(
                UserAvailability.id == slot_id,
                UserAvailability.user_id == user_id
            )
        ).first()
        
        if not slot:
            return False, "Availability slot not found or you don't have permission"
        
        db.delete(slot)
        db.commit()
        
        return True, None


class CallRatingService:
    """
    Service class for managing call ratings and reviews
    """

    @staticmethod
    def rate_call(
        db: Session,
        call_id: int,
        rater_id: int,
        rating: int,
        feedback: Optional[str] = None,
        is_professional: bool = True,
        would_recommend: bool = True
    ) -> Tuple[bool, Optional[CallRating], Optional[str]]:
        """
        Rate a completed call
        
        Args:
            db: Database session
            call_id: Call ID
            rater_id: User ID rating the call
            rating: Rating 1-5
            feedback: Optional feedback text
            is_professional: Was service professional?
            would_recommend: Would recommend this person?
            
        Returns:
            Tuple of (success: bool, rating: CallRating, error_message: str)
        """
        call = db.query(VideoCall).filter(VideoCall.id == call_id).first()
        
        if not call:
            return False, None, "Call not found"
        
        if call.status != CallStatus.COMPLETED:
            return False, None, "Can only rate completed calls"
        
        if call.caller_id != rater_id and call.recipient_id != rater_id:
            return False, None, "You don't have permission to rate this call"
        
        # Check if already rated
        existing_rating = db.query(CallRating).filter(
            and_(
                CallRating.call_id == call_id,
                CallRating.rater_id == rater_id
            )
        ).first()
        
        if existing_rating:
            return False, None, "You have already rated this call"
        
        new_rating = CallRating(
            call_id=call_id,
            rater_id=rater_id,
            rating=rating,
            feedback=feedback,
            is_professional=is_professional,
            would_recommend=would_recommend
        )
        
        db.add(new_rating)
        db.commit()
        db.refresh(new_rating)
        
        return True, new_rating, None

    @staticmethod
    def get_user_average_rating(
        db: Session,
        user_id: int
    ) -> Tuple[Optional[float], int]:
        """
        Get average rating for a user
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            Tuple of (average_rating: float, count: int)
        """
        ratings = db.query(CallRating).join(VideoCall).filter(
            or_(
                VideoCall.caller_id == user_id,
                VideoCall.recipient_id == user_id
            )
        ).all()
        
        if not ratings:
            return None, 0
        
        average = sum(r.rating for r in ratings) / len(ratings)
        return average, len(ratings)
