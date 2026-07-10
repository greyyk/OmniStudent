// App routing. Protected routes redirect to /login if not signed in.
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import NavBar from './components/NavBar'
import LoginPage from './pages/LoginPage'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="app-layout">
      <NavBar />
      {children}
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <DashboardPage />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
