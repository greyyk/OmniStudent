// Dashboard: upcoming assignments, this week's schedule, courses, and study stats.
import { useEffect, useState } from "react";
import { features } from "../api/client";
import Calendar from "../components/Calendar";

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

  if (error)
    return (
      <div className="page">
        <p className="error">{error}</p>
      </div>
    );
  if (!data) return <div className="page">Loading…</div>;

  const studyHours = Math.round((data.study_minutes_this_week / 60) * 10) / 10;

  return (
    <div className="page">
      <h1>Dashboard</h1>

      <div className="stat-grid">
        <div className="stat">
          <div className="label">Scheduled study this week</div>
          <div className="value">{studyHours}h</div>
        </div>
        <div className="stat">
          <div className="label">Upcoming assignments</div>
          <div className="value">{data.upcoming_assignments.length}</div>
        </div>
        <div className="stat">
          <div className="label">Courses</div>
          <div className="value">{data.courses.length}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
            Upcoming assignments
          </h2>
          {data.upcoming_assignments.length === 0 ? (
            <p className="muted">Nothing due. You're all caught up.</p>
          ) : (
            <ul className="event-list">
              {data.upcoming_assignments.map((a) => (
                <li key={a.id} className="event ev-other">
                  <span className="event-title">{a.title}</span>
                  <span className="event-time">{fmtDate(a.due_date)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Courses</h2>
          {data.courses.length === 0 ? (
            <p className="muted">No courses yet. Add some on the Tasks page.</p>
          ) : (
            <ul className="event-list">
              {data.courses.map((c) => (
                <li key={c.id} className="event ev-other">
                  <span className="event-title">
                    {c.code} · {c.name}
                  </span>
                  <span className="event-type">
                    {c.current_grade != null ? `${c.current_grade}%` : "—"}
                    {c.target_grade != null ? ` → ${c.target_grade}%` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>This week</h2>
        <Calendar
          events={data.todays_events}
          emptyMessage="No events scheduled this week."
        />
      </div>
    </div>
  );
}
