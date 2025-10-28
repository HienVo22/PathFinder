'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import ResumeUpload from '@/components/ResumeUpload'
import ResumeStatus from '@/components/ResumeStatus'
import JobMatching from '@/components/JobMatching'
import JobPreferences from '@/components/JobPreferences'
import LinkedInLinkPopup from '@/components/LinkedInLinkPopup'
import LinkedInMockLink from '@/components/LinkedInMockLink'
import ProcessingSuccessModal from '@/components/ProcessingSuccessModal'

export default function Dashboard() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const resumeStatusRef = useRef(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')

  // Handle successful resume upload
  const handleUploadSuccess = (result) => {
    console.log('Resume uploaded successfully:', result);
    // Refresh the resume status component
    if (resumeStatusRef.current) {
      resumeStatusRef.current.refreshStatus();
    }
    toast.success('Resume uploaded successfully! Processing your document...');
  }

  // Handle showing the modal after upload
  const handleShowModal = (fileInfo) => {
    setUploadedFileName(fileInfo.name);
    setShowSuccessModal(true);
  }

  // Handle resume processing completion
  const handleProcessingComplete = (result) => {
    console.log('Processing completion result:', result);
    
    if (result.parsing?.completed) {
      toast.success('Resume processing complete! Your skills have been extracted.');
    } else if (result.parsing?.failed) {
      toast.error(result.error || 'Resume processing failed. Please try uploading again.');
    } else if (result.error) {
      toast.error(result.error);
    } else {
      toast.error('Resume processing took longer than expected. Please check back in a few minutes.');
    }
  }

  // Handle viewing job matches
  const handleViewJobs = () => {
    setShowSuccessModal(false);
    setActiveTab('jobs');
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
      <ProcessingSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onViewJobs={handleViewJobs}
        uploadedFileName={uploadedFileName}
      />
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
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'jobs'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Job Matches
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'preferences'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Preferences
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Resume Upload Section */}
            <div className="mb-8">
              <ResumeUpload 
                onUploadSuccess={handleUploadSuccess}
                onProcessingComplete={handleProcessingComplete}
                onShowModal={handleShowModal}
              />
            </div>

            {/* Resume Status Section */}
            <div className="mb-8">
              <ResumeStatus ref={resumeStatusRef} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Profile</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {user.name}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              {user.resumeOriginalName && (
                <p><span className="font-medium">Resume:</span> {user.resumeOriginalName}</p>
              )}
            </div>
            <div className="mt-4 space-y-3">
              <button className="btn-primary w-full">
                Edit Profile
              </button>
              <div className="flex items-center justify-center gap-3">
                <LinkedInLinkPopup />
                <LinkedInMockLink />
              </div>
            </div>
          </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <button 
                  onClick={() => router.push('/dashboard/settings')}
                  className="btn-secondary"
                >
                  Settings
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
