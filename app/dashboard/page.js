"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import ResumeUpload from '@/components/ResumeUpload'
import ResumeStatus from '@/components/ResumeStatus'
import JobMatching from '@/components/JobMatching'
import JobPreferences from '@/components/JobPreferences'
// LinkedIn link components removed from dashboard overview to simplify layout
import DashboardNav from '@/components/DashboardNav'

export default function Dashboard() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const resumeStatusRef = useRef(null)
  const [activeTab, setActiveTab] = useState('overview')
  const searchParams = useSearchParams()

  // If the URL includes a ?tab=... param, honor it as the initial tab
  useEffect(() => {
    try {
      const tab = searchParams?.get('tab')
      if (tab && ['overview', 'jobs', 'preferences'].includes(tab)) {
        setActiveTab(tab)
      }
    } catch (err) {
      // ignore
    }
  }, [searchParams])

  // Handle successful resume upload
  const handleUploadSuccess = (result) => {
    console.log('Resume uploaded successfully:', result);
    // Refresh the resume status component
    if (resumeStatusRef.current) {
      resumeStatusRef.current.refreshStatus();
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto dark:border-primary-400 dark:border-b-primary-400"></div>
          <p className="mt-4 text-secondary-600 dark:text-secondary-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">
                🧭 Pathfinder
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-secondary-600 dark:text-secondary-400">Welcome, {user.name}!</span>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white dark:bg-gray-900">
          {/* Navigation Tabs */}
          <DashboardNav activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Resume Upload Section */}
            <div className="mb-8">
              <ResumeUpload onUploadSuccess={handleUploadSuccess} />
            </div>

            {/* Resume Status Section */}
            <div className="mb-8">
              <ResumeStatus ref={resumeStatusRef} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Job Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Job Recommendations</h2>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">
              Discover jobs that match your skills and experience using our smart matching algorithm.
            </p>
            <button 
              onClick={() => setActiveTab('jobs')}
              className="btn-primary w-full"
            >
              View Job Matches
            </button>
          </div>

          {/* Applications */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Applications</h2>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">
              Track your job applications and their status.
            </p>
            <button className="btn-secondary w-full">
              View Applications
            </button>
          </div>
        </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveTab('jobs')}
                  className="btn-primary"
                >
                  Find Job Matches
                </button>
                <button 
                  onClick={() => setActiveTab('preferences')}
                  className="btn-secondary"
                >
                  Update Preferences
                </button>
                <button className="btn-secondary">
                  View Analytics
                </button>
              </div>
            </div>
          </>
        )}

        {/* Job Matching Tab */}
        {activeTab === 'jobs' && (
          <JobMatching />
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <JobPreferences />
        )}
      </main>
    </div>
  )
}
