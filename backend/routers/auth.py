"""Auth routes: register, login, and the current user."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import get_current_user, login, register
from database import get_db
from models import User
from schemas import Token, UserCreate, UserLogin, UserRead

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=201)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    return register(user_in, db)


@router.post("/login", response_model=Token)
def login_user(login_in: UserLogin, db: Session = Depends(get_db)):
    return login(login_in, db)


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
