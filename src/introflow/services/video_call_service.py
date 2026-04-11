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