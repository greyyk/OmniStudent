import { useEffect, useState } from 'react'
import { assignments, courses } from '../api/client'
import PriorityTaskBoard from '../components/PriorityTaskBoard'

const emptyCourse = {
  name: '',
  code: '',
  current_grade: '',
  target_grade: '',
}

const emptyAssignment = {
  course_id: '',
  title: '',
  description: '',
  due_date: '',
  estimated_hours: 1,
  grade_weight: 10,
  status: 'todo',
}

function optionalNumber(value) {
  return value === '' ? null : Number(value)
}

function dateLabel(value) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function TasksPage() {
  const [courseList, setCourseList] = useState([])
  const [assignmentList, setAssignmentList] = useState([])
  const [courseForm, setCourseForm] = useState(emptyCourse)
  const [assignmentForm, setAssignmentForm] = useState(emptyAssignment)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  async function loadData() {
    try {
      setLoading(true)
      setError('')
      const [coursesResult, assignmentsResult] = await Promise.all([
        courses.list(),
        assignments.list(),
      ])
      setCourseList(coursesResult.data)
      setAssignmentList(assignmentsResult.data)
      setAssignmentForm((form) => ({
        ...form,
        course_id: form.course_id || String(coursesResult.data[0]?.id || ''),
      }))
    } catch {
      setError('Could not load courses and assignments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function courseName(courseId) {
    const course = courseList.find((item) => item.id === courseId)
    return course ? `${course.code} - ${course.name}` : 'Course'
  }

  async function createCourse(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await courses.create({
        name: courseForm.name,
        code: courseForm.code,
        current_grade: optionalNumber(courseForm.current_grade),
        target_grade: optionalNumber(courseForm.target_grade),
      })
      setCourseForm(emptyCourse)
      await loadData()
    } catch {
      setError('Could not create course')
    } finally {
      setSaving(false)
    }
  }

  async function createAssignment(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await assignments.create({
        ...assignmentForm,
        course_id: Number(assignmentForm.course_id),
        estimated_hours: Number(assignmentForm.estimated_hours),
        grade_weight: Number(assignmentForm.grade_weight),
      })
      setAssignmentForm({
        ...emptyAssignment,
        course_id: assignmentForm.course_id,
      })
      await loadData()
      setRefreshKey((key) => key + 1)
    } catch {
      setError('Could not create assignment')
    } finally {
      setSaving(false)
    }
  }

  async function changeStatus(assignment, status) {
    try {
      await assignments.update(assignment.id, { status })
      await loadData()
      setRefreshKey((key) => key + 1)
    } catch {
      setError('Could not update assignment')
    }
  }

  async function deleteAssignment(id) {
    try {
      await assignments.remove(id)
      setAssignmentList((list) => list.filter((item) => item.id !== id))
      setRefreshKey((key) => key + 1)
    } catch {
      setError('Could not delete assignment')
    }
  }

  if (loading) return <div className="page">Loading tasks...</div>

  return (
    <div className="page">
      <h1>Tasks</h1>
      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>Add Course</h2>
        <form className="grid grid-2" onSubmit={createCourse}>
          <div>
            <label>Course name</label>
            <input
              value={courseForm.name}
              onChange={(event) =>
                setCourseForm({ ...courseForm, name: event.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Course code</label>
            <input
              value={courseForm.code}
              onChange={(event) =>
                setCourseForm({ ...courseForm, code: event.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Current grade</label>
            <input
              type="number"
              value={courseForm.current_grade}
              onChange={(event) =>
                setCourseForm({ ...courseForm, current_grade: event.target.value })
              }
            />
          </div>
          <div>
            <label>Target grade</label>
            <input
              type="number"
              value={courseForm.target_grade}
              onChange={(event) =>
                setCourseForm({ ...courseForm, target_grade: event.target.value })
              }
            />
          </div>
          <button disabled={saving}>Save course</button>
        </form>
      </section>

      <section className="card">
        <h2>Add Assignment</h2>
        <form className="grid grid-2" onSubmit={createAssignment}>
          <div>
            <label>Course</label>
            <select
              value={assignmentForm.course_id}
              onChange={(event) =>
                setAssignmentForm({ ...assignmentForm, course_id: event.target.value })
              }
              required
            >
              <option value="">Choose a course</option>
              {courseList.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Title</label>
            <input
              value={assignmentForm.title}
              onChange={(event) =>
                setAssignmentForm({ ...assignmentForm, title: event.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Due date</label>
            <input
              type="datetime-local"
              value={assignmentForm.due_date}
              onChange={(event) =>
                setAssignmentForm({ ...assignmentForm, due_date: event.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Status</label>
            <select
              value={assignmentForm.status}
              onChange={(event) =>
                setAssignmentForm({ ...assignmentForm, status: event.target.value })
              }
            >
              <option value="todo">todo</option>
              <option value="in_progress">in_progress</option>
              <option value="done">done</option>
            </select>
          </div>
          <div>
            <label>Estimated hours</label>
            <input
              type="number"
              min="0.25"
              step="0.25"
              value={assignmentForm.estimated_hours}
              onChange={(event) =>
                setAssignmentForm({
                  ...assignmentForm,
                  estimated_hours: event.target.value,
                })
              }
              required
            />
          </div>
          <div>
            <label>Grade weight</label>
            <input
              type="number"
              min="0"
              step="1"
              value={assignmentForm.grade_weight}
              onChange={(event) =>
                setAssignmentForm({ ...assignmentForm, grade_weight: event.target.value })
              }
              required
            />
          </div>
          <div className="grid-wide">
            <label>Description</label>
            <textarea
              value={assignmentForm.description}
              onChange={(event) =>
                setAssignmentForm({ ...assignmentForm, description: event.target.value })
              }
              rows="3"
            />
          </div>
          <button disabled={saving || courseList.length === 0}>Save assignment</button>
        </form>
      </section>

      <PriorityTaskBoard refreshKey={refreshKey} />

      <section className="card">
        <h2>All Assignments</h2>
        {assignmentList.length === 0 ? (
          <p className="muted">No assignments yet.</p>
        ) : (
          <div className="list">
            {assignmentList.map((assignment) => (
              <div key={assignment.id} className="list-item">
                <div>
                  <strong>{assignment.title}</strong>
                  <p className="muted">{courseName(assignment.course_id)}</p>
                  <p className="muted">Due {dateLabel(assignment.due_date)}</p>
                </div>
                <div className="row">
                  <select
                    value={assignment.status}
                    onChange={(event) => changeStatus(assignment, event.target.value)}
                  >
                    <option value="todo">todo</option>
                    <option value="in_progress">in_progress</option>
                    <option value="done">done</option>
                  </select>
                  <button className="danger" onClick={() => deleteAssignment(assignment.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
