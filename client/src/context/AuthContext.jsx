import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

const API = axios.create({ baseURL: '/api' })

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [])

  const checkAuth = async () => {
    try {
      const { data } = await API.get('/auth/check')
      if (data.success) setUser(data.user)
    } catch {
      localStorage.removeItem('token')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const signup = async (formData) => {
    const { data } = await API.post('/auth/signup', formData)
    if (data.success) {
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.userData)
      toast.success('Account created!')
    }
    return data
  }

  const login = async (formData) => {
    const { data } = await API.post('/auth/login', formData)
    if (data.success) {
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.userData)
      toast.success('Welcome back!')
    }
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    toast.success('Logged out')
  }

  const updateProfile = async (formData) => {
    const { data } = await API.put('/auth/update-profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (data.success) {
      setUser(data.user)
      toast.success('Profile updated!')
    }
    return data
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout, updateProfile, API }}>
      {children}
    </AuthContext.Provider>
  )
}