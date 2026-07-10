"""Feature routes: Smart Schedule Sync, Priority Task Board, Emergency Rescheduler.

These endpoints drive the three core features. They all depend on the current
user and the service modules in services/.
"""

from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User
from schemas import (
    EmergencyResult,
    EventRead,
    PrioritizedTask,
    ScheduleResult,
    _strip_tz,
)
from services.priority import prioritize
from services.rescheduler import create_emergency
from services.scheduler import generate_schedule

router = APIRouter(prefix="/api", tags=["features"])


@router.post("/schedule/generate", response_model=ScheduleResult)
def generate_study_schedule(
    days_ahead: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Smart Schedule Sync — generate study sessions for the next N days."""
    created = generate_schedule(current_user, db, days_ahead=days_ahead)
    return ScheduleResult(created=created)


@router.get("/tasks/prioritized", response_model=list[PrioritizedTask])
def prioritized_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Priority Task Board — assignments ranked high/medium/low."""
    return prioritize(current_user, db)


class EmergencyCreate(BaseModel):
    title: str
    start: datetime
    end: datetime

    @field_validator("start", "end", mode="after")
    @classmethod
    def _naive(cls, v):
        return _strip_tz(v)


@router.post("/emergency/create", response_model=EmergencyResult)
def create_emergency_block(
    body: EmergencyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Emergency Block Rescheduler — block time out, auto-reschedule missed study."""
    emergency, missed, rescheduled = create_emergency(
        current_user, db, body.title, body.start, body.end
    )
    return EmergencyResult(
        emergency=EventRead.model_validate(emergency),
        missed=[EventRead.model_validate(m) for m in missed],
        rescheduled=[EventRead.model_validate(r) for r in rescheduled],
    )
