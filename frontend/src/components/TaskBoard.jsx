// Priority Task Board: assignments grouped into high/medium/low columns.
// Data comes from the prioritized tasks endpoint, which returns
// { assignment, priority, score } per item.
import { useEffect, useState } from "react";
import { features } from "../api/client";

const LEVELS = [
  { key: "high", label: "High" },
  { key: "medium", label: "Medium" },
  { key: "low", label: "Low" },
];

function fmtDue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function TaskBoard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    features
      .prioritizedTasks()
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Loading priority tasks…</p>;

  const grouped = LEVELS.reduce((acc, lvl) => {
    acc[lvl.key] = items.filter((t) => t.priority === lvl.key);
    return acc;
  }, {});

  return (
    <div className="task-board">
      {LEVELS.map((lvl) => (
        <div key={lvl.key} className={`task-column ${lvl.key}`}>
          <h2>
            {lvl.label} Priorities
            <span
              className="muted"
              style={{ fontSize: "0.85rem", marginLeft: "auto" }}
            >
              {grouped[lvl.key].length}
            </span>
          </h2>
          {grouped[lvl.key].length === 0 ? (
            <p className="muted" style={{ fontSize: "0.85rem" }}>
              Nothing here.
            </p>
          ) : (
            <ul>
              {grouped[lvl.key].map((t) => (
                <li key={t.assignment.id} className="task-card">
                  <div>{t.assignment.title}</div>
                  <div className="course">Score {t.score}</div>
                  <div className="due">Due {fmtDue(t.assignment.due_date)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
