'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { setTheme } = useTheme()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUser(token)
    } else {
      setLoading(false)
      setTheme('light')
    }
  }, [])

  const fetchUser = async (token) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        if (data.user?.theme) {
          setTheme(data.user.theme)
        } else {
          setTheme('light')
        }
      } else {
        localStorage.removeItem('token')
        setTheme('light')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      localStorage.removeItem('token')
      setTheme('light')
    } finally {
      setLoading(false)
    }
  }

  // Allow manual refresh of user data (e.g., after upload)
  const refreshUser = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      await fetchUser(token)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        // Prefer fetching fresh user (ensures theme and other fields are up-to-date)
        await fetchUser(data.token)
        return true
      } else {
        const error = await response.json()
        alert(error.error || 'Login failed')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed. Please try again.')
      return false
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        setUser(data.user)
        setTheme('light')
        return true
      } else {
        const error = await response.json()
        alert(error.error || 'Registration failed')
        return false
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('Registration failed. Please try again.')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setTheme('light')
  }

  const googleLogin = async (credential) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      })
      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        await fetchUser(data.token)
        return true
      } else {
        const error = await response.json()
        alert(error.error || 'Google login failed')
        return false
      }
    } catch (error) {
      console.error('Google login error:', error)
      alert('Google login failed. Please try again.')
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, googleLogin, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
