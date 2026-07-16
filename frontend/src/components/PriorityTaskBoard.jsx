import { useEffect, useState } from 'react'
import { features } from '../api/client'

const levels = ['high', 'medium', 'low']

export default function PriorityTaskBoard({ refreshKey = 0 }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPriorities() {
      try {
        setLoading(true)
        setError('')
        const { data } = await features.prioritizedTasks()
        setItems(data)
      } catch {
        setError('Could not load priorities')
      } finally {
        setLoading(false)
      }
    }

    loadPriorities()
  }, [refreshKey])

  if (loading) return <section className="card">Loading priority tasks...</section>
  if (error) return <section className="card"><p className="error">{error}</p></section>

  return (
    <section className="card">
      <h2>Priority Task Board</h2>
      {items.length === 0 ? (
        <p className="muted">No unfinished assignments yet.</p>
      ) : (
        <div className="task-board">
          {levels.map((level) => (
            <div key={level} className="task-column">
              <h3>{level}</h3>
              <div className="list">
                {items
                  .filter((item) => item.priority === level)
                  .map((item) => (
                    <div key={item.assignment.id} className="list-item">
                      <span className={`badge ${level}`}>{level}</span>
                      <strong>{item.assignment.title}</strong>
                      <p className="muted">
                        Due {new Date(item.assignment.due_date).toLocaleString()}
                      </p>
                      <p className="muted">Score: {item.score}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
