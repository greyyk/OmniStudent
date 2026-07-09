"""Priority Task Board.

Ranks incomplete assignments by a score that blends:
  - urgency  (fewer days until due = higher)
  - grade_weight (how much of the course grade it's worth)
  - effort   (estimated hours — longer work should start sooner)

Assignments are split into high / medium / low priority thirds.
"""

from datetime import datetime

from sqlalchemy.orm import Session

from models import Assignment, Course, User
from schemas import AssignmentRead, PrioritizedTask


def prioritize(user: User, db: Session) -> list[PrioritizedTask]:
    now = datetime.now()
    assignments = (
        db.query(Assignment)
        .join(Course)
        .filter(Course.user_id == user.id, Assignment.status != "done")
        .order_by(Assignment.due_date)
        .all()
    )

    scored: list[tuple[Assignment, float]] = []
    for a in assignments:
        days_until = max((a.due_date - now).total_seconds() / 86400, 0.0)
        urgency = 1.0 / (days_until + 1.0)  # +1 flattens far-future work
        score = urgency * 50.0 + a.grade_weight + a.estimated_hours
        scored.append((a, score))

    scored.sort(key=lambda x: x[1], reverse=True)

    n = len(scored)
    result: list[PrioritizedTask] = []
    for i, (a, score) in enumerate(scored):
        if n == 0:
            priority = "medium"
        elif i < max(1, n / 3):
            priority = "high"
        elif i < max(1, 2 * n / 3):
            priority = "medium"
        else:
            priority = "low"
        result.append(
            PrioritizedTask(
                assignment=AssignmentRead.model_validate(a),
                priority=priority,
                score=round(score, 2),
            )
        )
    return result
