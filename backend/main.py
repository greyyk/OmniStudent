"""OmniStudent API — FastAPI entry point.

Run locally:
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload
Then open http://localhost:8000/docs for the Swagger UI.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import Base, engine

# Import models so create_all() sees them.
import models  # noqa: F401
from routers import assignments, auth, courses, dashboard, events, schedule

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="OmniStudent API",
    description="Time-management backend for university students.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(assignments.router)
app.include_router(events.router)
app.include_router(schedule.router)
app.include_router(dashboard.router)


@app.get("/", tags=["health"])
def health():
    return {"status": "ok", "service": "OmniStudent API"}
