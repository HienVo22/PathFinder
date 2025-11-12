"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { useAuth } from '@/contexts/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const form = searchParams.get('form')
  const [isLogin, setIsLogin] = useState(form !== 'signup')
  const [is2FA, setIs2FA] = useState(false)
  const [twoFACode, setTwoFACode] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const { user, register, loading } = useAuth()
  const router = useRouter()
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    setIsLogin(form !== 'signup')
  }, [form])

  // Google login handler
  const handleGoogleLogin = async (credential) => {
    setGoogleLoading(true)
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      })
      const data = await response.json()
      if (response.ok && data.token) {
        localStorage.setItem('token', data.token)
        window.location.href = '/dashboard'
      } else {
        alert(data.error || 'Google login failed')
      }
    } catch (err) {
      console.error(err)
      alert('Google login failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  // Render Google button
  const renderGoogleButton = () => {
    try {
      if (typeof window === 'undefined' || !window.google?.accounts?.id) return
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: (r) => handleGoogleLogin(r.credential),
      })
      const container = document.getElementById('google-login-btn')
      if (container) {
        container.innerHTML = ''
        window.google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          shape: 'rectangular',
        })
      }
    } catch (err) {
      console.error('Error rendering Google button', err)
    }
  }

  useEffect(() => {
    renderGoogleButton()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!loading && user) router.push('/dashboard')
  }, [user, loading, router])

  // Handle email/password + 2FA login
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (is2FA) {
      // Step 2: verify code
      try {
        const verifyRes = await fetch('/api/auth/verify-2fa-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, code: twoFACode }),
        })
        if (verifyRes.ok) {
          const data = await verifyRes.json()
          localStorage.setItem('token', data.token)
          router.push('/dashboard')
        } else {
          const err = await verifyRes.json()
          alert(err.error || 'Invalid or expired 2FA code.')
        }
      } catch (error) {
        console.error('2FA verify error:', error)
        alert('Error verifying 2FA code. Please try again.')
      }
      return
    }

    if (isLogin) {
      // Step 1: validate credentials
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        })

        if (res.ok) {
          // Send 2FA code after credentials verified
          const sendRes = await fetch('/api/auth/send-2fa-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email }),
          })
          if (sendRes.ok) {
            setIs2FA(true)
          } else {
            alert('Failed to send 2FA code.')
          }
        } else {
          const error = await res.json()
          alert(error.error || 'Invalid credentials')
        }
      } catch (err) {
        console.error('Login error:', err)
        alert('Login failed. Please try again.')
      }
    } else {
      // Sign up flow (unchanged)
      const success = await register(formData.name, formData.email, formData.password)
      if (success) router.push('/dashboard')
    }
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Loading...</p>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 px-4">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle showLabel={true} />
      </div>

      <div className="w-full max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src="/pathfinder-logo.svg" alt="PathFinder Logo" className="w-24 h-24" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-600 mb-4">Pathfinder</h1>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Find Your <span className="text-primary-600">Dream Job</span>
            <br />
            with AI
          </h2>
          <p className="text-lg text-secondary-600 mb-8">
            Pathfinder uses machine learning to match you with the perfect job opportunities. Upload your
            resume, set your preferences, and let AI do the work.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="mb-4 flex flex-col items-center">
            <style jsx global>{`
              #google-login-btn {
                width: 100% !important;
              }
              #google-login-btn > div {
                width: 100% !important;
                border-radius: 0.5rem !important;
                background-color: rgb(243 244 246) !important;
                transition: background-color 0.2s !important;
              }
              #google-login-btn > div:hover {
                background-color: rgb(229 231 235) !important;
              }
              #google-login-btn > div > iframe {
                width: 100% !important;
              }
              #google-login-btn > div > div {
                padding: 8px !important;
              }
            `}</style>
            <div id="google-login-btn" className="w-full flex justify-center mb-2"></div>
          </div>
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onLoad={() => renderGoogleButton()}
          />

          <div className="flex mb-6">
            <button
              onClick={() => {
                setIsLogin(true)
                setIs2FA(false)
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                isLogin ? 'bg-primary-600 text-white' : 'text-secondary-600 hover:text-primary-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false)
                setIs2FA(false)
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                !isLogin ? 'bg-primary-600 text-white' : 'text-secondary-600 hover:text-primary-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          {isLogin ? (
            !is2FA ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Login
                </button>
                <p className="text-sm text-center text-secondary-600">
                  Demo: demo@pathfinder.com / password
                </p>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="twoFACode" className="block text-sm font-medium text-gray-700 mb-1">
                    Enter 2FA Code
                  </label>
                  <input
                    type="text"
                    id="twoFACode"
                    name="twoFACode"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value)}
                    className="input-field"
                    placeholder="6-digit code"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Verify Code
                </button>
                <p className="text-sm text-center text-secondary-600">
                  A 6-digit code has been sent to your email.
                </p>
              </form>
            )
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Create a password"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Create Account
              </button>
            </form>
          )}
        </div>

        <div className="text-center pb-12">
          <Link href="/" className="text-primary-600 font-medium hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
