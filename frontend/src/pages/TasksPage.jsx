// Tasks page: manage courses and assignments, and view the priority task board.
import { useEffect, useState } from "react";
import {
  courses as coursesApi,
  assignments as assignmentsApi,
} from "../api/client";
import TaskBoard from "../components/TaskBoard";

function CoursesPanel({ courses, onAdd, onDelete, onError }) {
  const [form, setForm] = useState({
    name: "",
    code: "",
    current_grade: "",
    target_grade: "",
  });
  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }
  async function submit(e) {
    e.preventDefault();
    onError("");
    try {
      await onAdd({
        name: form.name,
        code: form.code,
        current_grade: form.current_grade ? Number(form.current_grade) : null,
        target_grade: form.target_grade ? Number(form.target_grade) : null,
      });
      setForm({ name: "", code: "", current_grade: "", target_grade: "" });
    } catch (err) {
      onError(err.response?.data?.detail || "Could not add course");
    }
  }
  return (
    <div className="card">
      <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Courses</h2>
      {courses.length === 0 ? (
        <p className="muted mb">No courses yet.</p>
      ) : (
        <ul className="event-list mb">
          {courses.map((c) => (
            <li key={c.id} className="event ev-other">
              <span className="event-title">
                {c.code} · {c.name}
              </span>
              <span className="event-type">
                {c.current_grade != null ? `${c.current_grade}%` : "—"}
                {c.target_grade != null ? ` → ${c.target_grade}%` : ""}
              </span>
              <button className="danger" onClick={() => onDelete(c.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={submit} className="col">
        <div className="grid grid-2">
          <div>
            <label>Code</label>
            <input
              value={form.code}
              onChange={set("code")}
              placeholder="CSCI 3300"
              required
            />
          </div>
          <div>
            <label>Name</label>
            <input
              value={form.name}
              onChange={set("name")}
              placeholder="Software Engineering"
              required
            />
          </div>
          <div>
            <label>Current grade</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.current_grade}
              onChange={set("current_grade")}
            />
          </div>
          <div>
            <label>Target grade</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.target_grade}
              onChange={set("target_grade")}
            />
          </div>
        </div>
        <div>
          <button type="submit">Add course</button>
        </div>
      </form>
    </div>
  );
}

function AssignmentsPanel({ courses, assignments, onAdd, onDelete, onError }) {
  const [form, setForm] = useState({
    course_id: courses[0]?.id || "",
    title: "",
    description: "",
    due_date: "",
    estimated_hours: "1",
    grade_weight: "10",
  });
  // If the default course disappears, reset.
  useEffect(() => {
    if (!courses.find((c) => c.id === Number(form.course_id)) && courses[0]) {
      setForm((f) => ({ ...f, course_id: courses[0].id }));
    }
  }, [courses, form.course_id]);

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }
  async function submit(e) {
    e.preventDefault();
    onError("");
    if (!form.course_id) {
      onError("Add a course before creating assignments.");
      return;
    }
    try {
      await onAdd({
        course_id: Number(form.course_id),
        title: form.title,
        description: form.description || null,
        due_date: form.due_date,
        estimated_hours: Number(form.estimated_hours),
        grade_weight: Number(form.grade_weight),
      });
      setForm({
        ...form,
        title: "",
        description: "",
        due_date: "",
      });
    } catch (err) {
      onError(err.response?.data?.detail || "Could not add assignment");
    }
  }

  const courseName = (id) => {
    const c = courses.find((c) => c.id === id);
    return c ? `${c.code} · ${c.name}` : `Course #${id}`;
  };

  return (
    <div className="card">
      <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Assignments</h2>
      {courses.length === 0 ? (
        <p className="muted mb">Add a course first to create assignments.</p>
      ) : assignments.length === 0 ? (
        <p className="muted mb">No assignments yet.</p>
      ) : (
        <ul className="event-list mb">
          {assignments.map((a) => (
            <li key={a.id} className="event ev-other">
              <span className="event-title">{a.title}</span>
              <span className="event-time">
                {new Date(a.due_date).toLocaleString()}
              </span>
              <span className="event-type">{courseName(a.course_id)}</span>
              <button className="danger" onClick={() => onDelete(a.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={submit} className="col">
        <div className="grid grid-2">
          <div>
            <label>Course</label>
            <select value={form.course_id} onChange={set("course_id")}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} · {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Title</label>
            <input
              value={form.title}
              onChange={set("title")}
              placeholder="e.g. Problem set 7"
              required
            />
          </div>
          <div>
            <label>Due</label>
            <input
              type="datetime-local"
              value={form.due_date}
              onChange={set("due_date")}
              required
            />
          </div>
          <div>
            <label>Estimated hours</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={form.estimated_hours}
              onChange={set("estimated_hours")}
            />
          </div>
          <div>
            <label>Grade weight (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.grade_weight}
              onChange={set("grade_weight")}
            />
          </div>
        </div>
        <div>
          <button type="submit">Add assignment</button>
        </div>
      </form>
    </div>
  );
}

export default function TasksPage() {
  const [courseList, setCourseList] = useState([]);
  const [assignmentList, setAssignmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    Promise.all([coursesApi.list(), assignmentsApi.list()])
      .then(([cRes, aRes]) => {
        setCourseList(cRes.data);
        setAssignmentList(aRes.data);
      })
      .catch(() => setError("Could not load tasks"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function addCourse(payload) {
    await coursesApi.create(payload);
    load();
  }
  async function deleteCourse(id) {
    await coursesApi.remove(id);
    load();
  }
  async function addAssignment(payload) {
    await assignmentsApi.create(payload);
    load();
  }
  async function deleteAssignment(id) {
    await assignmentsApi.remove(id);
    load();
  }

  return (
    <div className="page">
      <h1>Tasks</h1>

      {error && <p className="error mb">{error}</p>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <>
          <div className="card">
            <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
              Priority task board
            </h2>
            <TaskBoard />
          </div>

          <CoursesPanel
            courses={courseList}
            onAdd={addCourse}
            onDelete={deleteCourse}
            onError={setError}
          />

          <AssignmentsPanel
            courses={courseList}
            assignments={assignmentList}
            onAdd={addAssignment}
            onDelete={deleteAssignment}
            onError={setError}
          />
        </>
      )}
    </div>
  );
}
