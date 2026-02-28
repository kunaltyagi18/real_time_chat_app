import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Fill all fields')
    setLoading(true)
    try {
      const data = await login(form)
      if (data.success) navigate('/')
      else toast.error(data.message)
    } catch {
      toast.error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <svg viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="white" fillOpacity="0.15"/>
              <path d="M8 14C8 11.8 9.8 10 12 10H28C30.2 10 32 11.8 32 14V24C32 26.2 30.2 28 28 28H22L16 32V28H12C9.8 28 8 26.2 8 24V14Z" fill="white"/>
            </svg>
            ChatFlow
          </div>
          <h1 className={styles.tagline}>Connect with everyone, everywhere.</h1>
          <p className={styles.sub}>Real-time messaging built for modern teams and friends.</p>
          <div className={styles.bubbles}>
            <div className={styles.bubble} style={{animationDelay:'0s'}}>Hey, how's it going? 👋</div>
            <div className={styles.bubble + ' ' + styles.bubbleRight} style={{animationDelay:'0.3s'}}>Great! Just shipped a new feature 🚀</div>
            <div className={styles.bubble} style={{animationDelay:'0.6s'}}>That's awesome! Let's celebrate 🎉</div>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Welcome back</h2>
            <p>Sign in to continue to ChatFlow</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({...p, email: e.target.value}))}
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({...p, password: e.target.value}))}
                className={styles.input}
              />
            </div>
            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? <span className={styles.spinner}/> : 'Sign In'}
            </button>
          </form>

          <p className={styles.switch}>
            Don't have an account? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}