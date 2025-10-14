'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import ResumeStatus from '@/components/ResumeStatus'
import LinkedInLinkPopup from '@/components/LinkedInLinkPopup'
import LinkedInMockLink from '@/components/LinkedInMockLink'

export default function Settings() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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

  if (!user) {
    router.push('/')
    return null
  }

  const handleNameUpdate = async () => {
    if (!newName.trim()) {
      setError('Name cannot be empty')
      return
    }

    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newName.trim() })
      })

      if (!response.ok) {
        throw new Error('Failed to update name')
      }

      setSuccess('Name updated successfully')
      setIsEditing(false)
      window.location.reload() // Refresh to update the user context
    } catch (err) {
      setError('Could not update name. Please try again.')
      console.error('Name update error:', err)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid date'
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      })
    } catch (error) {
      console.error('Date formatting error:', error)
      return 'Invalid date'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">
                Settings
              </h1>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Profile</h2>
            <div className="space-y-3">
              <div className="space-y-2">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter new name"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleNameUpdate}
                        className="btn-primary"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setNewName('')
                          setError('')
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p><span className="font-medium">Name:</span> {user.name}</p>
                )}
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Account Created:</span> {formatDate(user.createdAt)}</p>
              </div>
              
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              {success && (
                <div className="text-green-600 text-sm">{success}</div>
              )}
              
              <div className="mt-4 space-y-3">
                {!isEditing && (
                  <button
                    onClick={() => {
                      setIsEditing(true)
                      setNewName(user.name)
                      setError('')
                      setSuccess('')
                    }}
                    className="btn-primary w-full"
                  >
                    Change Name
                  </button>
                )}
                <div className="flex items-center justify-center gap-3">
                  <LinkedInLinkPopup />
                  <LinkedInMockLink />
                </div>

                {/* Delete Account Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                    >
                      Delete Account
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Are you sure you want to delete your account? This action cannot be undone.
                        All your data, including your resume and job preferences, will be permanently deleted.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/user/delete', {
                                method: 'DELETE',
                                headers: {
                                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                              })

                              if (!response.ok) {
                                throw new Error('Failed to delete account')
                              }

                              // First clear token and user data
                              logout()
                              // Then redirect to home
                              window.location.href = '/'
                            } catch (err) {
                              console.error('Delete account error:', err)
                              setDeleteError('Failed to delete account. Please try again.')
                            }
                          }}
                          className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                        >
                          Yes, Delete My Account
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(false)
                            setDeleteError('')
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                      {deleteError && (
                        <p className="text-sm text-red-600">{deleteError}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Resume Status Section taking up 2 columns */}
          <div className="md:col-span-2">
            <ResumeStatus />
          </div>
        </div>
      </main>
    </div>
  )
}