// Central axios instance. All API calls go through here.
// The Vite dev proxy forwards /api/* to the FastAPI backend (see vite.config.js),
// so we can use relative URLs in development.
import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
})

// Attach the JWT token to every request if we have one.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ---- Auth ----
export const auth = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  me: () => client.get('/auth/me'),
}

export default client
