'use client'

import React, { useCallback, useEffect, useState } from 'react'

export default function LinkedInLinkPopup({ onLinked }) {
  const [linking, setLinking] = useState(false)

  const openPopup = useCallback(() => {
    const width = 600
    const height = 700
    const left = (window.screen.width / 2) - (width / 2)
    const top = (window.screen.height / 2) - (height / 2)
    const popup = window.open(`/api/auth/linkedin/start?popup=1`, 'linkedin_popup', `width=${width},height=${height},top=${top},left=${left}`)

    if (!popup) {
      alert('Popup blocked. Please allow popups for this site.')
      return
    }

    setLinking(true)

    function handleMessage(event) {
      // Only accept messages from same origin
      if (event.origin !== window.location.origin) return
      const data = event.data || {}
      if (data.linkedinAccessToken) {
        // Exchange token with our server to link to the logged-in user
        const token = localStorage.getItem('token')
        if (!token) {
          alert('You must be logged in to link accounts')
          setLinking(false)
          return
        }

        fetch('/api/auth/linkedin/link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ accessToken: data.linkedinAccessToken })
        }).then(res => res.json()).then(result => {
          setLinking(false)
          if (result?.message) {
            if (onLinked) onLinked(result)
            alert('LinkedIn account linked successfully')
          } else {
            alert('Failed to link LinkedIn account')
          }
        }).catch(err => {
          console.error(err)
          setLinking(false)
          alert('Linking failed')
        })
      }
    }

    window.addEventListener('message', handleMessage, { once: true })
  }, [onLinked])

  return (
    <button
      onClick={openPopup}
      disabled={linking}
      className="btn-primary sm:w-1/2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {linking ? 'Linking...' : 'Link LinkedIn'}
    </button>
  )
}
