'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const { user, login, register, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (isLogin) {
      const success = await login(formData.email, formData.password)
      if (success) {
        router.push('/dashboard')
      }
    } else {
      const success = await register(formData.name, formData.email, formData.password)
      if (success) {
        router.push('/dashboard')
      }
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-600 mb-4">
            🧭 Pathfinder
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Find Your
            <span className="text-primary-600"> Dream Job</span>
            <br />
            with AI
          </h2>
          <p className="text-lg text-secondary-600 mb-8">
            Pathfinder uses machine learning to match you with the perfect job opportunities. 
            Upload your resume, set your preferences, and let AI do the work.
          </p>
        </div>
        
        {/* Auth Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                isLogin 
                  ? 'bg-primary-600 text-white' 
                  : 'text-secondary-600 hover:text-primary-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                !isLogin 
                  ? 'bg-primary-600 text-white' 
                  : 'text-secondary-600 hover:text-primary-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          {isLogin ? (
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
      </div>
    </div>
  )
}
