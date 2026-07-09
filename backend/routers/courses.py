"""CRUD routes for courses, scoped to the current user."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Course, User
from schemas import CourseCreate, CourseRead, CourseUpdate

router = APIRouter(prefix="/api/courses", tags=["courses"])


@router.get("", response_model=list[CourseRead])
def list_courses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Course)
        .filter(Course.user_id == current_user.id)
        .order_by(Course.name)
        .all()
    )


@router.post("", response_model=CourseRead, status_code=201)
def create_course(
    course_in: CourseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = Course(user_id=current_user.id, **course_in.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.put("/{course_id}", response_model=CourseRead)
def update_course(
    course_id: int,
    course_in: CourseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = _get_owned_course(course_id, current_user.id, db)
    for field, value in course_in.model_dump(exclude_unset=True).items():
        setattr(course, field, value)
    db.commit()
    db.refresh(course)
    return course


@router.delete("/{course_id}", status_code=204)
def delete_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = _get_owned_course(course_id, current_user.id, db)
    db.delete(course)
    db.commit()


def _get_owned_course(course_id: int, user_id: int, db: Session) -> Course:
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course or course.user_id != user_id:
        raise HTTPException(status_code=404, detail="Course not found")
    return course
