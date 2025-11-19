'use client'

import React, { useState } from 'react'

export default function LinkedInMockLink({ onLinked }) {
  const [loading, setLoading] = useState(false)

  const handleMockLink = async () => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('token')
    if (!token) {
      alert('You must be logged in to link')
      return
    }

    setLoading(true)
    try {
      const fake = {
        linkedinId: 'mock-' + Math.random().toString(36).slice(2, 9),
        name: 'Mock LinkedIn User',
        email: 'mock+' + Math.random().toString(36).slice(2,5) + '@example.com',
        profileUrl: 'https://linkedin.com/in/mock',
        picture: ''
      }
      const res = await fetch('/api/auth/linkedin/mock/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fake)
      })
      const data = await res.json()
      if (res.ok) {
        alert('Mock LinkedIn linked')
        if (onLinked) onLinked(data)
      } else {
        alert(data.error || 'Mock link failed')
      }
    } catch (err) {
      console.error(err)
      alert('Mock link error')
    } finally {
      setLoading(false)
    }
  }

  // Only show on localhost or development
  if (typeof window !== 'undefined') {
    const host = window.location.host || ''
    if (!host.includes('localhost') && process.env.NODE_ENV === 'production') return null
  }

  return (
    <button
      onClick={handleMockLink}
      className="btn-primary sm:w-1/2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={loading}
    >
      {loading ? 'Linking...' : 'Mock LinkedIn'}
    </button>
  )
}
