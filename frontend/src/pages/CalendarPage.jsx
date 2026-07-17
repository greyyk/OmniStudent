// Calendar page: view events, add class/work/personal events, generate a
// study schedule, and trigger the emergency block rescheduler.
import { useEffect, useState } from "react";
import { events, features, courses as coursesApi } from "../api/client";
import Calendar from "../components/Calendar";

const EVENT_TYPES = ["class", "work", "personal"];

function EmergencyModal({ onClose, onSuccess }) {
  function localNow(offsetHours = 0) {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + offsetHours);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }

  const [form, setForm] = useState(() => ({
    title: "",
    start: localNow(),
    end: localNow(1),
  }));
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await features.createEmergency({
        title: form.title,
        start: form.start,
        end: form.end,
      });
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Could not create emergency block",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {result ? (
          <>
            <h2>Emergency block created</h2>
            <p className="muted mb">
              “{result.emergency.title}” is now on your calendar.
            </p>
            {result.missed.length > 0 ? (
              <>
                <p className="mb">
                  Marked missed and rescheduled {result.rescheduled.length} of{" "}
                  {result.missed.length} study session(s):
                </p>
                <ul className="event-list mb">
                  {result.missed.map((m) => (
                    <li key={m.id} className="event ev-study">
                      <span className="event-title">{m.title}</span>
                      <span className="tag missed">missed</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mb">No study sessions overlapped this block.</p>
            )}
            <div className="modal-actions">
              <button onClick={() => { onSuccess?.(); onClose(); }}>Done</button>
            </div>
          </>
        ) : (
          <>
            <h2>Emergency block</h2>
            <p className="muted mb">
              Block out time you can no longer study. Overlapping study sessions
              are marked missed and rescheduled automatically.
            </p>
            <form onSubmit={submit} className="col">
              <div>
                <label>What happened?</label>
                <input
                  value={form.title}
                  onChange={set("title")}
                  placeholder="e.g. Sick child"
                  required
                />
              </div>
              <div>
                <label>Starts</label>
                <input
                  type="datetime-local"
                  value={form.start}
                  onChange={set("start")}
                  required
                />
              </div>
              <div>
                <label>Ends</label>
                <input
                  type="datetime-local"
                  value={form.end}
                  onChange={set("end")}
                  required
                />
              </div>
              {error && <p className="error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" disabled={busy}>
                  {busy ? "Saving…" : "Block & reschedule"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [eventList, setEventList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEmergency, setShowEmergency] = useState(false);
  const [genMsg, setGenMsg] = useState("");
  const [form, setForm] = useState({
    title: "",
    type: "class",
    start: "",
    end: "",
    course_id: "",
  });

  function load() {
    setLoading(true);
    setError("");
    // Only load events within a reasonable window so the calendar doesn't
    // accumulate stale history forever.
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 14);
    Promise.all([
      events.list(start.toISOString(), end.toISOString()),
      coursesApi.list(),
    ])
      .then(([evRes, cRes]) => {
        setEventList(evRes.data);
        setCourseList(cRes.data);
      })
      .catch(() => setError("Could not load calendar"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function addEvent(e) {
    e.preventDefault();
    setError("");
    try {
      await events.create({
        title: form.title,
        type: form.type,
        start: form.start,
        end: form.end,
        course_id: form.course_id || null,
      });
      setForm({ title: "", type: "class", start: "", end: "", course_id: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not add event");
    }
  }

  async function deleteEvent(event) {
    if (!confirm(`Delete "${event.title}"?`)) return;
    setError("");
    try {
      await events.remove(event.id);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not delete event");
    }
  }

  async function toggleStudy(event, status) {
    setError("");
    try {
      await events.update(event.id, { status });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not update event");
    }
  }

  async function generateSchedule() {
    setGenMsg("");
    setError("");
    try {
      const { data } = await features.generateSchedule(7);
      setGenMsg(`Generated ${data.created.length} study session(s).`);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not generate schedule");
    }
  }

  function handleEmergencySuccess() {
    load();
    setGenMsg("");
  }

  return (
    <div className="page">
      <div className="row between mb">
        <h1 style={{ margin: 0 }}>Calendar</h1>
        <div className="row">
          <button className="secondary" onClick={generateSchedule}>
            Generate study schedule
          </button>
          <button className="danger" onClick={() => setShowEmergency(true)}>
            Emergency block
          </button>
        </div>
      </div>

      {genMsg && <p className="success mb">{genMsg}</p>}
      {error && <p className="error mb">{error}</p>}

      <div className="card mb">
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Add event</h2>
        <form onSubmit={addEvent} className="col">
          <div className="grid grid-2">
            <div>
              <label>Title</label>
              <input
                value={form.title}
                onChange={set("title")}
                placeholder="e.g. CSCI 3300 lecture"
                required
              />
            </div>
            <div>
              <label>Type</label>
              <select value={form.type} onChange={set("type")}>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Start</label>
              <input
                type="datetime-local"
                value={form.start}
                onChange={set("start")}
                required
              />
            </div>
            <div>
              <label>End</label>
              <input
                type="datetime-local"
                value={form.end}
                onChange={set("end")}
                required
              />
            </div>
            {courseList.length > 0 && (
              <div>
                <label>Course (optional)</label>
                <select value={form.course_id} onChange={set("course_id")}>
                  <option value="">— none —</option>
                  {courseList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} · {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div>
            <button type="submit">Add event</button>
          </div>
        </form>
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <Calendar
          events={eventList}
          onDeleteEvent={deleteEvent}
          onToggleStudy={toggleStudy}
          emptyMessage="No events yet. Add one above, or generate a study schedule."
        />
      )}

      {showEmergency && (
        <EmergencyModal
          onClose={() => setShowEmergency(false)}
          onSuccess={handleEmergencySuccess}
        />
      )}
    </div>
  );
}
