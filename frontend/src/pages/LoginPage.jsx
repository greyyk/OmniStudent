// Login + register on one page. Toggles between the two modes.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../api/client'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const payload =
        mode === 'login'
          ? { email: form.email, password: form.password }
          : form
      const { data } = await auth[mode](payload)
      login(data.access_token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: '380px' }}>
        <h1 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>OmniStudent</h1>
        <p className="muted" style={{ marginBottom: '1.25rem' }}>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </p>

        <form onSubmit={handleSubmit} className="col">
          {mode === 'register' && (
            <div>
              <label>Name</label>
              <input value={form.name} onChange={update('name')} required />
            </div>
          )}
          <div>
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={update('email')}
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="mt">
            {mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <p className="muted mt" style={{ fontSize: '0.85rem' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
            }}
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </a>
        </p>
      </div>
    </div>
  )
}
