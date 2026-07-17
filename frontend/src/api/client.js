// Central axios instance. All API calls go through here.
// The Vite dev proxy forwards /api/* to the FastAPI backend (see vite.config.js),
// so we can use relative URLs in development.
import axios from "axios";

const client = axios.create({
  baseURL: "/api",
});

// Attach the JWT token to every request if we have one.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Auth ----
export const auth = {
  register: (data) => client.post("/auth/register", data),
  login: (data) => client.post("/auth/login", data),
  me: () => client.get("/auth/me"),
};

// ---- Courses ----
export const courses = {
  list: () => client.get("/courses"),
  create: (data) => client.post("/courses", data),
  update: (id, data) => client.put(`/courses/${id}`, data),
  remove: (id) => client.delete(`/courses/${id}`),
};

// ---- Assignments ----
// The backend returns a flat list; `courseId` optionally filters to one course.
export const assignments = {
  list: (courseId) =>
    client.get("/assignments", {
      params: { course_id: courseId || undefined },
    }),
  create: (data) => client.post("/assignments", data),
  update: (id, data) => client.put(`/assignments/${id}`, data),
  remove: (id) => client.delete(`/assignments/${id}`),
};

// ---- Events ----
// `start`/`end` should be ISO strings; the backend filters events that fall
// within [start, end].
export const events = {
  list: (start, end) => client.get("/events", { params: { start, end } }),
  create: (data) => client.post("/events", data),
  update: (id, data) => client.put(`/events/${id}`, data),
  remove: (id) => client.delete(`/events/${id}`),
};

// ---- Features ----
export const features = {
  generateSchedule: (daysAhead = 7) =>
    client.post("/schedule/generate", null, {
      params: { days_ahead: daysAhead },
    }),
  prioritizedTasks: () => client.get("/tasks/prioritized"),
  createEmergency: (data) => client.post("/emergency/create", data),
  undoEmergency: (id) => client.post(`/emergency/${id}/undo`),
  dashboard: () => client.get("/dashboard"),
};

export default client;
