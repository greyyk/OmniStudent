"""CRUD routes for assignments.

An assignment belongs to a course, which belongs to a user.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Assignment, Course, User
from schemas import AssignmentCreate, AssignmentRead, AssignmentUpdate

router = APIRouter(prefix="/api/assignments", tags=["assignments"])


@router.get("", response_model=list[AssignmentRead])
def list_assignments(
    course_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Assignment)
        .join(Course)
        .filter(Course.user_id == current_user.id)
    )
    if course_id is not None:
        query = query.filter(Assignment.course_id == course_id)
    return query.order_by(Assignment.due_date).all()


@router.post("", response_model=AssignmentRead, status_code=201)
def create_assignment(
    assignment_in: AssignmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_owned_course(assignment_in.course_id, current_user.id, db)
    assignment = Assignment(**assignment_in.model_dump())
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.put("/{assignment_id}", response_model=AssignmentRead)
def update_assignment(
    assignment_id: int,
    assignment_in: AssignmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assignment = _get_owned_assignment(assignment_id, current_user.id, db)
    if assignment_in.course_id is not None:
        _require_owned_course(assignment_in.course_id, current_user.id, db)
    for field, value in assignment_in.model_dump(exclude_unset=True).items():
        setattr(assignment, field, value)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.delete("/{assignment_id}", status_code=204)
def delete_assignment(
    assignment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assignment = _get_owned_assignment(assignment_id, current_user.id, db)
    db.delete(assignment)
    db.commit()


def _require_owned_course(course_id: int, user_id: int, db: Session) -> None:
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course or course.user_id != user_id:
        raise HTTPException(status_code=404, detail="Course not found")


def _get_owned_assignment(assignment_id: int, user_id: int, db: Session) -> Assignment:
    assignment = (
        db.query(Assignment)
        .join(Course)
        .filter(Assignment.id == assignment_id, Course.user_id == user_id)
        .first()
    )
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment
