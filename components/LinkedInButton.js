'use client'

import React from 'react'

export default function LinkedInButton({ label = 'Sign in with LinkedIn' }) {
  const onClick = () => {
    // Open the start route in a new window (LinkedIn will redirect back to our callback)
    window.location.href = '/api/auth/linkedin/start'
  }

  return (
    <button onClick={onClick} className="px-4 py-2 bg-blue-700 text-white rounded">
      {label}
    </button>
  )
}
