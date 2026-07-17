# OmniStudent

OmniStudent is a web application that helps university students manage their time across school, work, and personal life. It combines an automated calendar that intelligently schedules study sessions, a priority task board, and an emergency rescheduler that rebooks missed study time when life gets in the way.

Built for CSCI3300 Software Engineering (University of North Georgia), Dr. Jason Porter.

## Features

### Smart Schedule Sync
- Enter your class times, work shifts, and assignment deadlines.
- OmniStudent scans your calendar for free time and automatically generates conflict-free study sessions, prioritizing the work due soonest.

### Priority Task Board
- Assignments are ranked **high / medium / low** based on a blend of urgency (days until due), grade weight, and estimated effort.
- See easily what needs your attention first.

### Emergency Block Rescheduler
- When something unexpected comes up (a sick child, a called-in shift), you can block out that time.
- OmniStudent marks any overlapping study sessions as **missed** and reschedules them into the next available free slots.

### Additional Capabilities
- **Account system** — register and log in.
- **Course & grade tracking** — record current vs. target grades per course.
- **Calendar** — color-coded events by type (class, work, study, personal, emergency).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), React Router, Axios |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | SQLite (default) / PostgreSQL (configurable) |
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

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get the logged-in user |
| GET/POST | `/api/courses` | List / create courses |
| PUT/DELETE | `/api/courses/{id}` | Update / delete a course |
| GET/POST | `/api/assignments` | List / create assignments |
| PUT/DELETE | `/api/assignments/{id}` | Update / delete an assignment |
| GET/POST | `/api/events` | List / create calendar events |
| PUT/DELETE | `/api/events/{id}` | Update / delete an event |
| POST | `/api/schedule/generate` | Generate a study schedule |
| GET | `/api/tasks/prioritized` | Get the priority task board |
| POST | `/api/emergency/create` | Create an emergency block + reschedule |
| GET | `/api/dashboard` | Aggregated dashboard data |

## The Team

| Member | Role |
|--------|------|
| Greyson Kline | Backend |
| Samuel Bowen | Frontend |
| Sarah Ganthier | Frontend |
| Ronnie Bitzer | Frontend |
| Seth Causey | Documentation & testing |

Instructor: Dr. Jason Porter, University of North Georgia
