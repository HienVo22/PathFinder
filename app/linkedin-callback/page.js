'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LinkedInCallbackPage({ searchParams }) {
  const router = useRouter()

  useEffect(() => {
    // Read token from query param and store in localStorage
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      localStorage.setItem('token', token)
    }
    // Redirect to dashboard or home
    router.push('/dashboard')
  }, [])

  return (
    <div className="p-8">
      <h2>Signing you in...</h2>
    </div>
  )
}
