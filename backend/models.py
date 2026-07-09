"""The SQL models.

Four models cover the whole app:
  - User        accounts (login lives in auth.py)
  - Course      a class the user is taking, with current/target grades
  - Assignment  graded work belonging to a course
  - Event       anything on the calendar: class, work, study, personal,
                or emergency. Study sessions and emergency blocks are just
                events with a different `type`, which keeps the schema small.
"""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    courses: Mapped[list["Course"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    events: Mapped[list["Event"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(255))
    code: Mapped[str] = mapped_column(String(50))
    current_grade: Mapped[float | None] = mapped_column(Float, nullable=True)
    target_grade: Mapped[float | None] = mapped_column(Float, nullable=True)

    user: Mapped["User"] = relationship(back_populates="courses")
    assignments: Mapped[list["Assignment"]] = relationship(
        back_populates="course", cascade="all, delete-orphan"
    )


class Assignment(Base):
    __tablename__ = "assignments"

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    due_date: Mapped[datetime] = mapped_column(DateTime)
    estimated_hours: Mapped[float] = mapped_column(Float, default=1.0)
    # Grade weight as a percentage (0-100) of the course grade.
    grade_weight: Mapped[float] = mapped_column(Float, default=10.0)
    # One of: todo, in_progress, done
    status: Mapped[str] = mapped_column(String(20), default="todo")

    course: Mapped["Course"] = relationship(back_populates="assignments")


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255))
    start: Mapped[datetime] = mapped_column(DateTime)
    end: Mapped[datetime] = mapped_column(DateTime)
    # One of: class, work, study, personal, emergency
    type: Mapped[str] = mapped_column(String(20))
    course_id: Mapped[int | None] = mapped_column(
        ForeignKey("courses.id"), nullable=True
    )
    # For study events: scheduled, missed, completed
    status: Mapped[str] = mapped_column(String(20), default="scheduled")
    # True for study sessions the scheduler created automatically.
    system_generated: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship(back_populates="events")
