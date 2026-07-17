"""Dashboard route - aggregated data for the landing page."""

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Assignment, Course, Event, User
from schemas import AssignmentRead, CourseRead, EventRead

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


class WorkloadSummary(BaseModel):
    status: str
    warning: str | None
    total_hours: float
    scheduled_hours: float
    assignment_hours: float
    remaining_assignment_hours: float
    due_this_week_count: int


class Dashboard(BaseModel):
    upcoming_assignments: list[AssignmentRead]
    todays_events: list[EventRead]
    courses: list[CourseRead]
    study_minutes_this_week: int
    workload: WorkloadSummary


@router.get("", response_model=Dashboard)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now = datetime.now()
    week_end = now + timedelta(days=7)

    upcoming = (
        db.query(Assignment)
        .join(Course)
        .filter(
            Course.user_id == current_user.id,
            Assignment.status != "done",
            Assignment.due_date >= now,
        )
        .order_by(Assignment.due_date)
        .limit(10)
        .all()
    )

    todays = (
        db.query(Event)
        .filter(
            Event.user_id == current_user.id,
            Event.start < week_end,
            Event.end >= now,
        )
        .order_by(Event.start)
        .all()
    )

    courses = db.query(Course).filter(Course.user_id == current_user.id).all()

    due_this_week = (
        db.query(Assignment)
        .join(Course)
        .filter(
            Course.user_id == current_user.id,
            Assignment.status != "done",
            Assignment.due_date >= now,
            Assignment.due_date < week_end,
        )
        .all()
    )

    study_minutes = (
        db.query(Event)
        .filter(
            Event.user_id == current_user.id,
            Event.type == "study",
            Event.start < week_end,
            Event.end >= now,
        )
        .all()
    )
    total_minutes = sum(_event_minutes(study, now, week_end) for study in study_minutes)
    scheduled_minutes = sum(_event_minutes(event, now, week_end) for event in todays)
    assignment_minutes = int(sum(a.estimated_hours * 60 for a in due_this_week))
    remaining_assignment_minutes = max(0, assignment_minutes - total_minutes)
    workload_minutes = scheduled_minutes + remaining_assignment_minutes
    workload = _workload_summary(
        workload_minutes,
        scheduled_minutes,
        assignment_minutes,
        remaining_assignment_minutes,
        len(due_this_week),
    )

    return Dashboard(
        upcoming_assignments=upcoming,
        todays_events=todays,
        courses=courses,
        study_minutes_this_week=total_minutes,
        workload=workload,
    )


def _event_minutes(event: Event, start: datetime, end: datetime) -> int:
    if event.status == "missed":
        return 0
    event_start = max(event.start, start)
    event_end = min(event.end, end)
    if event_end <= event_start:
        return 0
    return int((event_end - event_start).total_seconds() / 60)


def _hours(minutes: int) -> float:
    return round(minutes / 60, 1)


def _workload_summary(
    workload_minutes: int,
    scheduled_minutes: int,
    assignment_minutes: int,
    remaining_assignment_minutes: int,
    due_this_week_count: int,
) -> WorkloadSummary:
    total_hours = _hours(workload_minutes)

    if total_hours >= 45:
        status = "overloaded"
        warning = (
            f"You have about {total_hours} hours booked or still needed this week. "
            "Try moving lower-priority commitments or generating more study sessions."
        )
    elif total_hours >= 35:
        status = "busy"
        warning = (
            f"You have about {total_hours} hours booked or still needed this week. "
            "Keep an eye on your remaining assignment work."
        )
    else:
        status = "ok"
        warning = None

    return WorkloadSummary(
        status=status,
        warning=warning,
        total_hours=total_hours,
        scheduled_hours=_hours(scheduled_minutes),
        assignment_hours=_hours(assignment_minutes),
        remaining_assignment_hours=_hours(remaining_assignment_minutes),
        due_this_week_count=due_this_week_count,
    )
