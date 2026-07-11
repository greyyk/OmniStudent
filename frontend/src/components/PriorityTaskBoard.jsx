import { useEffect, useState } from 'react'
import { features } from '../api/client'

export default function PriorityTaskBoard() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    features
      .prioritizedTasks()
      .then((res) => setTasks(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading priority tasks...</p>
  if (!tasks.length) return <p>No tasks found.</p>

  return (
    <div>
      <h2>Priority Task Board</h2>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            <strong>{t.priority.toUpperCase()}</strong> — {t.title}
          </li>
        ))}
      </ul>
    </div>
  )
}