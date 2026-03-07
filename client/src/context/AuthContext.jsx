import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export const API = axios.create({ baseURL: 'http://localhost:5000/api' })

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
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
      else {
        localStorage.removeItem('token')
        setUser(null)
      }
    } catch {
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signup = async (formData) => {
    const { data } = await API.post('/auth/signup', formData)
    if (data.success) {
      localStorage.setItem('token', data.token)
      setUser(data.userData)
      toast.success('Account created!')
    }
    return data
  }

  const login = async (formData) => {
    const { data } = await API.post('/auth/login', formData)
    if (data.success) {
      localStorage.setItem('token', data.token)
      setUser(data.userData)
      toast.success('Welcome back!')
    }
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    toast.success('Logged out')
  }

  const updateProfile = async ({ fullName, bio, imageFile }) => {
    let data

    if (imageFile) {
      // Has image → multipart
      const formData = new FormData()
      formData.append('fullName', fullName)
      formData.append('bio', bio)
      formData.append('profilePic', imageFile)
      const res = await API.put('/auth/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      data = res.data
    } else {
      // No image → JSON
      const res = await API.put('/auth/update-profile', { fullName, bio })
      data = res.data
    }

    if (data.success) {
      setUser(data.user)
      toast.success('Profile updated!')
    }
    return data
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}