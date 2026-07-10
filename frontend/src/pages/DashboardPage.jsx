// Dashboard: today's schedule, upcoming assignments, study stats.
import { useEffect, useState } from 'react'
import { features } from '../api/client'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  async function load() {
    try {
      const { data } = await features.dashboard()
      setData(data)
    } catch (err) {
      setError('Could not load dashboard')
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (error) return <div className="page"><p className="error">{error}</p></div>
  if (!data) return <div className="page">Loading…</div>

  return (
    <div className="page">
      <h1>Dashboard</h1>
    </div>
  )
}
