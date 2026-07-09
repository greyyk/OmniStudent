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


class Dashboard(BaseModel):
    upcoming_assignments: list[AssignmentRead]
    todays_events: list[EventRead]
    courses: list[CourseRead]
    study_minutes_this_week: int


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

    courses = (
        db.query(Course).filter(Course.user_id == current_user.id).all()
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
    total_minutes = sum(
        int((s.end - s.start).total_seconds() / 60)
        for s in study_minutes
        if s.status != "missed"
    )

    return Dashboard(
        upcoming_assignments=upcoming,
        todays_events=todays,
        courses=courses,
        study_minutes_this_week=total_minutes,
    )
