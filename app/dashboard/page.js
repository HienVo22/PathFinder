'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ResumeUpload from '@/components/ResumeUpload'

export default function Dashboard() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

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
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">
                🧭 Pathfinder
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-secondary-600">Welcome, {user.name}!</span>
              <button
                onClick={logout}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resume Upload Section */}
        <div className="mb-8">
          <ResumeUpload />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Profile</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {user.name}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              {user.resumeOriginalName && (
                <p><span className="font-medium">Resume:</span> {user.resumeOriginalName}</p>
              )}
            </div>
            <button className="btn-primary mt-4 w-full">
              Edit Profile
            </button>
          </div>

          {/* Job Recommendations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Recommendations</h2>
            <p className="text-secondary-600 mb-4">
              {user.resumeUrl 
                ? "Your resume has been uploaded! Job recommendations will appear here."
                : "Upload your resume to get personalized job recommendations."
              }
            </p>
            <button className="btn-primary w-full" disabled={!user.resumeUrl}>
              {user.resumeUrl ? "View Recommendations" : "Upload Resume First"}
            </button>
          </div>

          {/* Applications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Applications</h2>
            <p className="text-secondary-600 mb-4">
              Track your job applications and their status.
            </p>
            <button className="btn-secondary w-full">
              View Applications
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="btn-primary">
              Search Jobs
            </button>
            <button className="btn-secondary">
              Update Preferences
            </button>
            <button className="btn-secondary">
              View Analytics
            </button>
            <button className="btn-secondary">
              Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
