"""CRUD routes for calendar events, scoped to the current user.

Study sessions and emergency blocks are stored here too, they are just events
with type="study" or type="emergency". The scheduler creates study events via
the schedule router. this router is for the user's own manual events.
"""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Event, User
from schemas import EventCreate, EventRead, EventUpdate

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=list[EventRead])
def list_events(
    start: datetime | None = None,
    end: datetime | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Event).filter(Event.user_id == current_user.id)
    if start is not None:
        query = query.filter(Event.end >= start)
    if end is not None:
        query = query.filter(Event.start <= end)
    return query.order_by(Event.start).all()


@router.post("", response_model=EventRead, status_code=201)
def create_event(
    event_in: EventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = Event(user_id=current_user.id, **event_in.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.put("/{event_id}", response_model=EventRead)
def update_event(
    event_id: int,
    event_in: EventUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = _get_owned_event(event_id, current_user.id, db)
    for field, value in event_in.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=204)
def delete_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = _get_owned_event(event_id, current_user.id, db)
    db.delete(event)
    db.commit()


def _get_owned_event(event_id: int, user_id: int, db: Session) -> Event:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event or event.user_id != user_id:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
