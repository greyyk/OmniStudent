"""Smart Schedule Sync.

Generates a study schedule for the next N days by:
  1. Collecting the user's existing events (class/work/personal) as "busy".
  2. Finding free gaps during study hours (08:00-22:00) each day.
  3. Filling those gaps with study sessions for incomplete assignments,
     most urgent (soonest due) first.

The algorithm is intentionally simple, a greedy fill. It's easy to reason
about and good enough for this.
"""

from datetime import datetime, time, timedelta

from sqlalchemy.orm import Session

from models import Assignment, Course, Event, User

STUDY_START = time(8, 0)
STUDY_END = time(22, 0)
MIN_GAP_MINUTES = 30
MAX_BLOCK_HOURS = 2


def generate_schedule(user: User, db: Session, days_ahead: int = 7) -> list[Event]:
    # Round "now" UP to the next hour so sessions start on clean boundaries
    # and never in the past. Local time (the app runs in naive local time).
    now = datetime.now()
    if now.minute or now.second or now.microsecond:
        now = now.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
    horizon = now + timedelta(days=days_ahead)

    events = (
        db.query(Event)
        .filter(
            Event.user_id == user.id,
            Event.end >= now,
            Event.start <= horizon,
        )
        .all()
    )
    busy = [(e.start, e.end) for e in events]

    free_gaps = _collect_free_gaps(now, horizon, busy)
    free_gaps.sort()

    assignments = (
        db.query(Assignment)
        .join(Course)
        .filter(Course.user_id == user.id, Assignment.status != "done")
        .order_by(Assignment.due_date)
        .all()
    )

    created: list[Event] = []
    gap_idx = 0
    for assignment in assignments:
        hours_left = assignment.estimated_hours
        due = assignment.due_date
        while hours_left > 0 and gap_idx < len(free_gaps):
            gap_start, gap_end = free_gaps[gap_idx]
            if gap_start >= due:
                break  # can't study after the due date
            block_end = min(
                gap_end,
                gap_start + timedelta(hours=MAX_BLOCK_HOURS),
                due,
            )
            if block_end <= gap_start:
                gap_idx += 1
                continue

            study = Event(
                user_id=user.id,
                title=f"Study: {assignment.title}",
                start=gap_start,
                end=block_end,
                type="study",
                course_id=assignment.course_id,
                status="scheduled",
                system_generated=True,
            )
            db.add(study)
            created.append(study)

            hours_left -= (block_end - gap_start).total_seconds() / 3600
            if block_end < gap_end:
                free_gaps[gap_idx] = (block_end, gap_end)
            else:
                gap_idx += 1

    db.commit()
    for e in created:
        db.refresh(e)
    return created


# ---------- helpers (also used by rescheduler.py) ----------


def _collect_free_gaps(
    start: datetime, end: datetime, busy: list[tuple[datetime, datetime]]
) -> list[tuple[datetime, datetime]]:
    """Build free gaps during study hours across each day in [start, end]."""
    gaps: list[tuple[datetime, datetime]] = []
    day = start.date()
    span = (end - start).days + 1
    for _ in range(span):
        window_start = datetime.combine(day, STUDY_START)
        window_end = datetime.combine(day, STUDY_END)
        if window_end > start:
            day_busy = [
                (max(s, window_start), min(e, window_end))
                for s, e in busy
                if s < window_end and e > window_start
            ]
            day_free = _subtract_intervals((window_start, window_end), day_busy)
            for s, e in day_free:
                # Skip gaps entirely in the past; clamp the start to "now".
                if e <= start:
                    continue
                if s < start:
                    s = start
                if (e - s).total_seconds() >= MIN_GAP_MINUTES * 60:
                    gaps.append((s, e))
        day += timedelta(days=1)
    return gaps


def _subtract_intervals(
    window: tuple[datetime, datetime],
    busy: list[tuple[datetime, datetime]],
) -> list[tuple[datetime, datetime]]:
    """Subtract a list of busy intervals from a window, returning free gaps."""
    result = [window]
    for b_start, b_end in busy:
        new_result: list[tuple[datetime, datetime]] = []
        for w_start, w_end in result:
            if b_end <= w_start or b_start >= w_end:
                new_result.append((w_start, w_end))
            else:
                if b_start > w_start:
                    new_result.append((w_start, b_start))
                if b_end < w_end:
                    new_result.append((b_end, w_end))
        result = new_result
    return result


def find_free_slot(
    busy: list[tuple[datetime, datetime]],
    search_from: datetime,
    search_to: datetime,
    duration: timedelta,
) -> tuple[datetime, datetime] | None:
    """Return the earliest free slot of at least `duration`, or None."""
    gaps = _collect_free_gaps(search_from, search_to, busy)
    gaps.sort()
    for gap_start, gap_end in gaps:
        if gap_end - gap_start >= duration:
            return (gap_start, gap_start + duration)
    return None
