// Calendar: a week-at-a-glance view of events, color-coded by type.
// Events are grouped by day and sorted by start time. A legend explains the
// colors. This is a presentational component; the page passes the events in.
import { useMemo } from "react";

// Map event type -> label + CSS class for the left border color.
const TYPE_META = {
  class: { label: "Class", cls: "ev-class" },
  work: { label: "Work", cls: "ev-work" },
  study: { label: "Study", cls: "ev-study" },
  personal: { label: "Personal", cls: "ev-personal" },
  emergency: { label: "Emergency", cls: "ev-emergency" },
};

function meta(type) {
  return TYPE_META[type] || { label: type, cls: "ev-other" };
}

function fmtTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function fmtDay(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function Calendar({
  events = [],
  emptyMessage = "No events yet.",
  onDeleteEvent,
  onToggleStudy,
}) {
  // Group events by their start date, then sort each day ascending by time.
  const byDay = useMemo(() => {
    const groups = new Map();
    const sorted = [...events].sort(
      (a, b) => new Date(a.start) - new Date(b.start),
    );
    for (const ev of sorted) {
      const key = new Date(ev.start).toDateString();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(ev);
    }
    return [...groups.entries()];
  }, [events]);

  if (byDay.length === 0) {
    return <p className="muted">{emptyMessage}</p>;
  }

  return (
    <div className="calendar">
      <div className="legend">
        {Object.entries(TYPE_META).map(([type, m]) => (
          <span key={type} className="legend-item">
            <span className={`legend-swatch ${m.cls}`} />
            {m.label}
          </span>
        ))}
      </div>

      <div className="day-list">
        {byDay.map(([dayKey, dayEvents]) => (
          <div key={dayKey} className="day">
            <h3 className="day-title">{fmtDay(dayEvents[0].start)}</h3>
            <ul className="event-list">
              {dayEvents.map((ev) => {
                const m = meta(ev.type);
                return (
                  <li key={ev.id} className={`event ${m.cls}`}>
                    <span className="event-time">
                      {fmtTime(ev.start)} – {fmtTime(ev.end)}
                    </span>
                    <span className="event-title">{ev.title}</span>
                    {ev.status === "missed" && (
                      <span className="tag missed">missed</span>
                    )}
                    {ev.status === "completed" && (
                      <span className="tag done">done</span>
                    )}
                    <span className="event-type">{m.label}</span>
                    {onToggleStudy && ev.type === "study" && ev.status === "scheduled" && (
                      <button
                        type="button"
                        className="secondary event-action"
                        title="Mark study session complete"
                        onClick={() => onToggleStudy(ev, "completed")}
                      >
                        ✓ done
                      </button>
                    )}
                    {onToggleStudy && ev.type === "study" && ev.status === "completed" && (
                      <button
                        type="button"
                        className="secondary event-action"
                        title="Mark as not yet done"
                        onClick={() => onToggleStudy(ev, "scheduled")}
                      >
                        undo
                      </button>
                    )}
                    {onDeleteEvent && (
                      <button
                        type="button"
                        className="danger event-delete"
                        title="Delete event"
                        aria-label={`Delete ${ev.title}`}
                        onClick={() => onDeleteEvent(ev)}
                      >
                        ×
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
