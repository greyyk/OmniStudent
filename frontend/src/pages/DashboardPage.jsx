// Dashboard: upcoming assignments, this week's schedule, courses, and study stats.
import { useEffect, useState } from "react";
import { features } from "../api/client";

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff > 1 && diff < 7) return `In ${diff} days`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function dateLabel(value) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function courseName(courses, courseId) {
  const course = courses.find((item) => item.id === courseId);
  return course ? `${course.code} · ${course.name}` : "Course";
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const { data } = await features.dashboard();
      setData(data);
    } catch {
      setError("Could not load dashboard");
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (error) {
    return (
      <div className="page">
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!data) return <div className="page">Loading…</div>;

  const studyHours = Math.round((data.study_minutes_this_week / 60) * 10) / 10;
  const workload = data.workload;

  return (
    <div className="page">
      <h1>Dashboard</h1>

      <div className="grid grid-3 mb">
        <section className="card stat-card">
          <span className="muted">Courses</span>
          <strong>{data.courses.length}</strong>
        </section>
        <section className="card stat-card">
          <span className="muted">Upcoming assignments</span>
          <strong>{data.upcoming_assignments.length}</strong>
        </section>
        <section className="card stat-card">
          <span className="muted">Scheduled study this week</span>
          <strong>{studyHours}h</strong>
        </section>
        <section className="card stat-card">
          <span className="muted">Weekly workload</span>
          <strong>{workload.total_hours}h</strong>
        </section>
      </div>

      {workload.warning && (
        <section className={`workload-alert ${workload.status}`}>
          <div>
            <h2>
              {workload.status === "overloaded"
                ? "You may be overloaded this week"
                : "This week is getting busy"}
            </h2>
            <p>{workload.warning}</p>
          </div>
          <div className="workload-details">
            <span>{workload.scheduled_hours}h scheduled</span>
            <span>{workload.assignment_hours}h due</span>
            <span>{workload.remaining_assignment_hours}h still needed</span>
          </div>
        </section>
      )}

      <div className="grid grid-2">
        <section className="card">
          <h2>Upcoming Assignments</h2>
          {data.upcoming_assignments.length === 0 ? (
            <p className="muted">Nothing due. You&apos;re all caught up.</p>
          ) : (
            <div className="list">
              {data.upcoming_assignments.map((assignment) => (
                <div key={assignment.id} className="list-item">
                  <div>
                    <strong>{assignment.title}</strong>
                    <p className="muted">
                      {courseName(data.courses, assignment.course_id)}
                    </p>
                  </div>
                  <span className="muted">{fmtDate(assignment.due_date)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2>This Week</h2>
          {data.todays_events.length === 0 ? (
            <p className="muted">No events scheduled this week.</p>
          ) : (
            <div className="list">
              {data.todays_events.map((event) => (
                <div key={event.id} className={`event-card ${event.type}`}>
                  <div>
                    <strong>{event.title}</strong>
                    <p className="muted">{dateLabel(event.start)}</p>
                  </div>
                  <span className={`badge ${event.type}`}>{event.type}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="card">
        <h2>Courses</h2>
        {data.courses.length === 0 ? (
          <p className="muted">No courses yet. Add some on the Tasks page.</p>
        ) : (
          <div className="list">
            {data.courses.map((course) => (
              <div key={course.id} className="list-item">
                <div>
                  <strong>{course.code}</strong>
                  <p className="muted">{course.name}</p>
                </div>
                <span className="muted">
                  {course.current_grade != null ? `${course.current_grade}%` : "—"}
                  {course.target_grade != null ? ` → ${course.target_grade}%` : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
