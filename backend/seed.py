"""Seed script — populate a demo user with sample courses, assignments, and events.

Run it once after starting the backend:
    cd backend
    python seed.py

It creates a demo user (demo@omnistudent.app / password: demo1234) and a
week of data so the scheduler, priority board, and emergency
rescheduler all have something to work with.

Seth: extend this with more courses/assignments to make the demo richer.
"""

from datetime import datetime, timedelta

from auth import hash_password
from database import Base, SessionLocal, engine
import models  # noqa: F401  (ensures tables exist)
from models import Assignment, Course, Event, User

Base.metadata.create_all(bind=engine)

DEMO_EMAIL = "demo@omnistudent.app"
DEMO_PASSWORD = "demo1234"


def seed():
    db = SessionLocal()
    if db.query(User).filter(User.email == DEMO_EMAIL).first():
        print(f"Demo user {DEMO_EMAIL} already exists — skipping seed.")
        db.close()
        return

    user = User(
        name="Demo Student",
        email=DEMO_EMAIL,
        password_hash=hash_password(DEMO_PASSWORD),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    courses = [
        Course(
            user_id=user.id,
            name="Software Engineering",
            code="CSCI 3300",
            current_grade=88.0,
            target_grade=93.0,
        ),
        Course(
            user_id=user.id,
            name="Calculus II",
            code="MATH 2460",
            current_grade=76.0,
            target_grade=85.0,
        ),
        Course(
            user_id=user.id,
            name="Marketing Principles",
            code="MKTG 3100",
            current_grade=91.0,
            target_grade=95.0,
        ),
    ]
    db.add_all(courses)
    db.commit()
    db.refresh(courses[0])
    db.refresh(courses[1])
    db.refresh(courses[2])

    now = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    in_days = lambda n: now + timedelta(days=n)

    assignments = [
        Assignment(
            course_id=courses[0].id,
            title="Group project milestone",
            due_date=in_days(4),
            estimated_hours=4,
            grade_weight=15,
        ),
        Assignment(
            course_id=courses[1].id,
            title="Problem set 7",
            due_date=in_days(2),
            estimated_hours=2,
            grade_weight=8,
        ),
        Assignment(
            course_id=courses[2].id,
            title="Case study write-up",
            due_date=in_days(7),
            estimated_hours=3,
            grade_weight=12,
        ),
        Assignment(
            course_id=courses[0].id,
            title="Reading quiz",
            due_date=in_days(1),
            estimated_hours=1,
            grade_weight=5,
        ),
    ]
    db.add_all(assignments)

    events = [
        # Recurring-ish class/work blocks (just the next week, hardcoded).
        Event(
            user_id=user.id,
            title="CSCI 3300 lecture",
            start=in_days(1).replace(hour=10),
            end=in_days(1).replace(hour=11, minute=15),
            type="class",
            course_id=courses[0].id,
        ),
        Event(
            user_id=user.id,
            title="MATH 2460 lecture",
            start=in_days(1).replace(hour=13),
            end=in_days(1).replace(hour=14, minute=15),
            type="class",
            course_id=courses[1].id,
        ),
        Event(
            user_id=user.id,
            title="MKTG 3100 lecture",
            start=in_days(2).replace(hour=9),
            end=in_days(2).replace(hour=10, minute=15),
            type="class",
            course_id=courses[2].id,
        ),
        Event(
            user_id=user.id,
            title="Retail shift",
            start=in_days(2).replace(hour=16),
            end=in_days(2).replace(hour=21),
            type="work",
        ),
        Event(
            user_id=user.id,
            title="Retail shift",
            start=in_days(4).replace(hour=12),
            end=in_days(4).replace(hour=20),
            type="work",
        ),
        Event(
            user_id=user.id,
            title="Volunteer tutoring",
            start=in_days(3).replace(hour=17),
            end=in_days(3).replace(hour=18, minute=30),
            type="personal",
        ),
    ]
    db.add_all(events)
    db.commit()

    print(f"Seeded demo user: {DEMO_EMAIL} / {DEMO_PASSWORD}")
    print("3 courses, 4 assignments, 6 events added.")
    db.close()


if __name__ == "__main__":
    seed()
