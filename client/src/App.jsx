import { useEffect, useState } from 'react'

const api = {
  async getPublicTips() {
    const res = await fetch('/api/public/tips', { credentials: 'include' })
    if (!res.ok) throw new Error('Could not load public tips')
    return res.json()
  },
  async getSession() {
    const res = await fetch('/api/session/me', { credentials: 'include' })
    if (!res.ok) throw new Error('Not logged in')
    return res.json()
  },
  async login(username, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    return data
  },
  async logout() {
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
    if (!res.ok) throw new Error('Logout failed')
    return res.json()
  },
  async getTodos() {
    const res = await fetch('/api/todos', { credentials: 'include' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Could not load todos')
    return data
  },
  async addTodo(title) {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Could not add todo')
    return data
  },
  async toggleTodo(id) {
    const res = await fetch(`/api/todos/${id}/toggle`, {
      method: 'PATCH',
      credentials: 'include'
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Could not update todo')
    return data
  }
}

export default function App() {
  const [tips, setTips] = useState([])
  const [tipsTime, setTipsTime] = useState('')
  const [username, setUsername] = useState('student')
  const [password, setPassword] = useState('password123')
  const [sessionUser, setSessionUser] = useState(null)
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [message, setMessage] = useState('')

  const loadPublicTips = async () => {
    try {
      const data = await api.getPublicTips()
      setTips(data.tips)
      setTipsTime(data.generatedAt)
    } catch (err) {
      setMessage(err.message)
    }
  }

  const loadSession = async () => {
    try {
      const data = await api.getSession()
      setSessionUser(data.user)
      setMessage('Session loaded successfully.')
    } catch {
      setSessionUser(null)
    }
  }

  const loadTodos = async () => {
    try {
      const data = await api.getTodos()
      setTodos(data)
    } catch (err) {
      setMessage(err.message)
    }
  }

  useEffect(() => {
    loadPublicTips()
    loadSession()
  }, [])

  useEffect(() => {
    if (sessionUser) loadTodos()
    else setTodos([])
  }, [sessionUser])

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const data = await api.login(username, password)
      setSessionUser(data.user)
      setMessage('Logged in.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleLogout = async () => {
    try {
      await api.logout()
      setSessionUser(null)
      setTodos([])
      setMessage('Logged out.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleAddTodo = async (e) => {
    e.preventDefault()
    if (!newTodo.trim()) return
    try {
      const created = await api.addTodo(newTodo)
      setTodos((current) => [created, ...current])
      setNewTodo('')
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleToggle = async (id) => {
    try {
      const updated = await api.toggleTodo(id)
      setTodos((current) => current.map((t) => (t._id === id ? updated : t)))
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <h1>React + Express + MongoDB Atlas</h1>
        <p>
          Classroom demo for session-based authentication, caching, and deployment on Render.
        </p>
      </header>

      <div className="grid">
        <section className="card">
          <h2>Public cache demo</h2>
          <p>
            This route is meant to demonstrate a short-lived cache header for public, non-sensitive data.
          </p>
          <button onClick={loadPublicTips}>Reload public tips</button>
          <p><strong>Generated at:</strong> {tipsTime || 'Not loaded yet'}</p>
          <ul>
            {tips.map((tip, index) => <li key={index}>{tip}</li>)}
          </ul>
        </section>

        <section className="card">
          <h2>Session demo</h2>
          {!sessionUser ? (
            <form onSubmit={handleLogin} className="stack">
              <label>
                Username
                <input value={username} onChange={(e) => setUsername(e.target.value)} />
              </label>
              <label>
                Password
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
              <button type="submit">Login</button>
              <p className="muted">Default classroom credentials: student / password123</p>
            </form>
          ) : (
            <div className="stack">
              <p><strong>Logged in as:</strong> {sessionUser.username}</p>
              <p><strong>Role:</strong> {sessionUser.role}</p>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </section>

        <section className="card wide">
          <h2>Protected todo list</h2>
          {!sessionUser ? (
            <p>Please log in first.</p>
          ) : (
            <>
              <form onSubmit={handleAddTodo} className="todo-form">
                <input
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add a task"
                />
                <button type="submit">Add</button>
              </form>
              <ul className="todo-list">
                {todos.map((todo) => (
                  <li key={todo._id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggle(todo._id)}
                      />
                      <span className={todo.completed ? 'done' : ''}>{todo.title}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  )
}
