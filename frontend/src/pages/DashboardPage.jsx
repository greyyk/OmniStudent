import { useEffect, useState } from 'react'
import { features } from '../api/client'

function dateLabel(value) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  async function load() {
    try {
      const { data } = await features.dashboard()
      setData(data)
    } catch {
      setError('Could not load dashboard')
    }
  }

  useEffect(() => {
    load()
  }, [])

  function courseName(courseId) {
    const course = data.courses.find((item) => item.id === courseId)
    return course ? `${course.code} - ${course.name}` : 'Course'
  }

  if (error) return <div className="page"><p className="error">{error}</p></div>
  if (!data) return <div className="page">Loading…</div>

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <div className="grid grid-3">
        <section className="card stat-card">
          <span className="muted">Courses</span>
          <strong>{data.courses.length}</strong>
        </section>
        <section className="card stat-card">
          <span className="muted">Upcoming assignments</span>
          <strong>{data.upcoming_assignments.length}</strong>
        </section>
        <section className="card stat-card">
          <span className="muted">Study minutes this week</span>
          <strong>{data.study_minutes_this_week}</strong>
        </section>
      </div>

      <section className="card">
        <h2>Upcoming Assignments</h2>
        {data.upcoming_assignments.length === 0 ? (
          <p className="muted">No upcoming assignments.</p>
        ) : (
          <div className="list">
            {data.upcoming_assignments.map((assignment) => (
              <div key={assignment.id} className="list-item">
                <div>
                  <strong>{assignment.title}</strong>
                  <p className="muted">{courseName(assignment.course_id)}</p>
                </div>
                <span className="muted">{dateLabel(assignment.due_date)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Schedule</h2>
        {data.todays_events.length === 0 ? (
          <p className="muted">No events coming up.</p>
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

      <section className="card">
        <h2>Courses</h2>
        {data.courses.length === 0 ? (
          <p className="muted">No courses yet.</p>
        ) : (
          <div className="list">
            {data.courses.map((course) => (
              <div key={course.id} className="list-item">
                <div>
                  <strong>{course.code}</strong>
                  <p className="muted">{course.name}</p>
                </div>
                <span className="muted">
                  {course.current_grade ?? '-'} / {course.target_grade ?? '-'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
