"""Pydantic schemas (request/response DTOs).

Each model has a Create (input), Update (partial input), and Read (output)
schema. The Read schemas have `from_attributes = True` so the SQL model
instances can be returned directly from endpoints.

Time handling: the app runs in naive local time throughout. The frontend
sends datetime-local strings; the backend stores and returns them as-is.
This keeps everything consistent on a single machine (the class demo).
Any timezone-aware datetime that arrives is stripped to naive so comparisons
don't mix aware/naive values.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


def _strip_tz(v: datetime | None) -> datetime | None:
    """Drop timezone info so all datetimes are naive (treated as local)."""
    if v is not None and isinstance(v, datetime) and v.tzinfo is not None:
        return v.replace(tzinfo=None)
    return v


# ---------- Auth ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


# ---------- Course ----------
class CourseCreate(BaseModel):
    name: str
    code: str
    current_grade: float | None = None
    target_grade: float | None = None


class CourseUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    current_grade: float | None = None
    target_grade: float | None = None


class CourseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    code: str
    current_grade: float | None
    target_grade: float | None


# ---------- Assignment ----------
class AssignmentCreate(BaseModel):
    course_id: int
    title: str
    description: str | None = None
    due_date: datetime
    estimated_hours: float = 1.0
    grade_weight: float = 10.0
    status: str = "todo"

    @field_validator("due_date", mode="after")
    @classmethod
    def _strip(cls, v):
        return _strip_tz(v)


class AssignmentUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    due_date: datetime | None = None
    estimated_hours: float | None = None
    grade_weight: float | None = None
    status: str | None = None

    @field_validator("due_date", mode="after")
    @classmethod
    def _strip(cls, v):
        return _strip_tz(v)


class AssignmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    course_id: int
    title: str
    description: str | None
    due_date: datetime
    estimated_hours: float
    grade_weight: float
    status: str


# ---------- Event ----------
class EventCreate(BaseModel):
    title: str
    start: datetime
    end: datetime
    type: str  # class, work, study, personal, emergency
    course_id: int | None = None
    status: str = "scheduled"

    @field_validator("start", "end", mode="after")
    @classmethod
    def _strip(cls, v):
        return _strip_tz(v)


class EventUpdate(BaseModel):
    title: str | None = None
    start: datetime | None = None
    end: datetime | None = None
    type: str | None = None
    course_id: int | None = None
    status: str | None = None

    @field_validator("start", "end", mode="after")
    @classmethod
    def _strip(cls, v):
        return _strip_tz(v)


class EventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    start: datetime
    end: datetime
    type: str
    course_id: int | None
    status: str
    system_generated: bool


# ---------- Feature outputs ----------
class PrioritizedTask(BaseModel):
    assignment: AssignmentRead
    priority: str  # high, medium, low
    score: float


class EmergencyResult(BaseModel):
    emergency: EventRead
    missed: list[EventRead]
    rescheduled: list[EventRead]


class ScheduleResult(BaseModel):
    created: list[EventRead]
