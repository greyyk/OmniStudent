# OmniStudent

OmniStudent is a web-based application that helps university students manage their time across school, work, and personal life. It combines an automated calendar that intelligently schedules study sessions, a priority task board, and an emergency rescheduler that rebooks missed study time when life gets in the way.

Built for CSCI3300 Software Engineering (University of North Georgia), Dr. Jason Porter.

## Features

### Smart Schedule Sync
- Enter class times, work shifts, and assignment deadlines.
- OmniStudent scans your calendar for free time and automatically generates conflict-free study sessions, prioritizing the work due soonest.

### Priority Task Board
- Assignments are ranked **high / medium / low** based on a blend of urgency (days until due), grade weight, and estimated effort.
- See at a glance what deserves your attention first.

### Emergency Block Rescheduler
- When something unexpected comes up (a sick child, a called-in shift), block out the time.
- OmniStudent marks any overlapping study sessions as **missed** and automatically reschedules them into the next available free slots.

### Additional Capabilities
- **Account system** — register and log in; passwords are hashed, never stored in plaintext.
- **Course & grade tracking** — record current vs. target grades per course.
- **Dashboard** — a single view of upcoming assignments, the week's schedule, and total scheduled study time.
- **Calendar** — color-coded events by type (class, work, study, personal, emergency).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), React Router, Axios |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | SQLite (dev) — swappable to PostgreSQL for production |
| Auth | JWT tokens, bcrypt password hashing |

## Getting Started

### Prerequisites
- [Python 3.11+](https://www.python.org/)
- [Node.js 18+](https://nodejs.org/)

### 1. Clone the repository
```bash
git clone https://github.com/greyyk/OmniStudent.git
cd OmniStudent
```

### 2. Set up the backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
The API runs at `http://localhost:8000`. Interactive docs (Swagger UI) are available at `http://localhost:8000/docs`.

### 3. Set up the frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The app runs at `http://localhost:5173`. The Vite dev server proxies `/api` requests to the backend, so both servers must be running.

### 4. (Optional) Load demo data
```bash
cd backend
python seed.py
```
Creates a demo account (`demo@omnistudent.app` / `demo1234`) with sample courses, assignments, and events so you can try the features immediately.

## Project Structure
```
OmniStudent/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Settings (DB URL, JWT secret, CORS)
│   ├── database.py          # SQLAlchemy engine + session
│   ├── models.py            # ORM models (User, Course, Assignment, Event)
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── auth.py              # Register, login, JWT, get_current_user
│   ├── seed.py              # Demo data script
│   ├── routers/             # API route handlers
│   │   ├── auth.py
│   │   ├── courses.py
│   │   ├── assignments.py
│   │   ├── events.py
│   │   ├── schedule.py      # Smart sync, priority board, emergency
│   │   └── dashboard.py
│   └── services/            # Feature business logic
│       ├── scheduler.py     # Smart Schedule Sync
│       ├── priority.py      # Priority Task Board ranking
│       └── rescheduler.py   # Emergency Block Rescheduler
├── frontend/
│   └── src/
│       ├── api/client.js    # Axios instance + all API calls
│       ├── contexts/AuthContext.jsx
│       ├── pages/           # Login, Dashboard, Calendar, Tasks
│       └── components/      # NavBar, Calendar, TaskBoard, EmergencyModal
└── docs/                    # Assignment documentation (proposal, personas, stories)
```

## API Documentation

Once the backend is running, full interactive API documentation is available at:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

Key endpoints:
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in |
| GET/POST | `/api/courses` | List / create courses |
| GET/POST | `/api/assignments` | List / create assignments |
| GET/POST | `/api/events` | List / create calendar events |
| POST | `/api/schedule/generate` | Generate a study schedule |
| GET | `/api/tasks/prioritized` | Get the priority task board |
| POST | `/api/emergency/create` | Create an emergency block + reschedule |
| GET | `/api/dashboard` | Aggregated dashboard data |

## Database

The app uses **SQLite** for development (a single `omnistudent.db` file, zero setup). To switch to **PostgreSQL** for the final submission, set `DATABASE_URL` in `backend/.env`:

```
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/omnistudent
```

SQLAlchemy handles the rest — no code changes needed.

## Team

| Member | Role |
|--------|------|
| Greyson Kline | Backend lead |
| Samuel Bowen | Frontend lead |
| Sarah Ganthier | Frontend |
| Ronnie Bitzer | Frontend |
| Seth Causey | Documentation & testing |

Instructor: Dr. Jason Porter, University of North Georgia
