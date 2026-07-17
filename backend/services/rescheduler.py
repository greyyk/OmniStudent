"""Emergency Block Rescheduler.

When a user creates an emergency block:
  1. Any scheduled study session that overlaps the emergency is marked "missed".
  2. Each missed session is rescheduled into the earliest free slot found after
     the emergency ends (within the next 7 days).

Returns the emergency event, the list of missed sessions, and the rescheduled
replacements.
"""

from datetime import timedelta

from sqlalchemy.orm import Session

from models import Event, User
from schemas import EventRead
from services.scheduler import find_free_slot


def create_emergency(
    user: User, db: Session, title: str, start, end
) -> tuple[Event, list[Event], list[Event]]:
    emergency = Event(
        user_id=user.id,
        title=title,
        start=start,
        end=end,
        type="emergency",
        status="scheduled",
    )
    db.add(emergency)
    db.flush()  # so emergency.id is populated and visible to the overlap query

    # Study sessions that overlap the emergency block -> mark missed.
    overlapping = (
        db.query(Event)
        .filter(
            Event.user_id == user.id,
            Event.type == "study",
            Event.status == "scheduled",
            Event.start < emergency.end,
            Event.end > emergency.start,
        )
        .all()
    )
    missed: list[Event] = []
    for study in overlapping:
        study.status = "missed"
        missed.append(study)

    # Existing busy times after the emergency, for finding free slots.
    # Exclude missed sessions (they're already accounted for) and the emergency
    # itself so its tail doesn't block the first available slot.
    horizon = emergency.end + timedelta(days=7)
    future_events = (
        db.query(Event)
        .filter(
            Event.user_id == user.id,
            Event.status == "scheduled",
            Event.end >= emergency.end,
            Event.start <= horizon,
            Event.id != emergency.id,
        )
        .all()
    )
    busy = [(e.start, e.end) for e in future_events]

    rescheduled: list[Event] = []
    for study in missed:
        # Only rebook the portion that was actually eaten by the emergency,
        # not the full original block length.
        overlap_start = max(study.start, emergency.start)
        overlap_end = min(study.end, emergency.end)
        duration = overlap_end - overlap_start
        if duration.total_seconds() <= 0:
            continue
        slot = find_free_slot(busy, emergency.end, horizon, duration)
        if slot is None:
            continue
        slot_start, slot_end = slot
        replacement = Event(
            user_id=user.id,
            title=f"{study.title} (rescheduled)",
            start=slot_start,
            end=slot_end,
            type="study",
            course_id=study.course_id,
            status="scheduled",
            system_generated=True,
        )
        db.add(replacement)
        rescheduled.append(replacement)
        busy.append((slot_start, slot_end))  # don't double-book the new slot

    db.commit()
    db.refresh(emergency)
    for e in rescheduled:
        db.refresh(e)
    return emergency, missed, rescheduled
