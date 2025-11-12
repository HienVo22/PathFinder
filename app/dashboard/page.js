"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import ResumeUpload from '@/components/ResumeUpload'
import ResumeStatus from '@/components/ResumeStatus'
import JobMatching from '@/components/JobMatching'
import JobPreferences from '@/components/JobPreferences'
import ProcessingSuccessModal from '@/components/ProcessingSuccessModal'
import UserDropdown from '@/components/UserDropdown'
import DashboardNav from '@/components/DashboardNav'
import ThemeToggle from '@/components/ThemeToggle'

export default function Dashboard() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const resumeStatusRef = useRef(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')
  // Used to force re-mount the ResumeUpload component when resume is removed
  const [resumeUploadVersion, setResumeUploadVersion] = useState(0)

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <ProcessingSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onViewJobs={handleViewJobs}
        uploadedFileName={uploadedFileName}
      />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                PathFinder
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle showLabel={false} />
              <UserDropdown user={user} onLogout={logout} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Banner */}
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                Welcome back, {user.name?.split(' ')[0]}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Let's find your dream job today
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-blue-600 flex items-center justify-center">
                <span className="text-4xl">🎯</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <DashboardNav activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Resume Upload Section */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-600 flex items-center justify-center">
                  <span className="text-xl">📄</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Upload Your Resume</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get personalized job matches based on your skills</p>
                </div>
              </div>
              <ResumeUpload 
                key={resumeUploadVersion}
                onUploadSuccess={handleUploadSuccess}
                onProcessingComplete={handleProcessingComplete}
                onShowModal={handleShowModal}
              />
            </div>

            {/* Resume Status Section */}
            <div>
              <ResumeStatus
                ref={resumeStatusRef}
                onResumeRemoved={() => setResumeUploadVersion(v => v + 1)}
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Profile Card */}
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-600 flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Your Profile</h2>
                </div>
                <div className="space-y-2 mb-5 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[50px]">Name:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">{user.name}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[50px]">Email:</span>
                    <span className="text-gray-900 dark:text-gray-100 break-all">{user.email}</span>
                  </div>
                  {user.resumeOriginalName && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[50px]">Resume:</span>
                      <span className="text-gray-900 dark:text-gray-100">{user.resumeOriginalName}</span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => router.push('/profile')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 transition-colors"
                >
                  View Full Profile
                </button>
              </div>

              {/* Job Recommendations */}
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 flex items-center justify-center">
                    <span className="text-xl">💼</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Job Matches</h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                  Discover jobs that match your skills and experience using our smart matching algorithm.
                </p>
                <button 
                  onClick={() => setActiveTab('jobs')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 transition-colors"
                >
                  Find Jobs
                </button>
              </div>

              {/* Applications */}
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-600 flex items-center justify-center">
                    <span className="text-xl">📊</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Applications</h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                  Track your job applications and their status in one convenient place.
                </p>
                <button className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-semibold py-2.5 px-4 transition-colors">
                  View Applications
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Job Matching Tab */}
        {activeTab === 'jobs' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6">
            <JobMatching />
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-4">
            {/* Back Button */}
            <button
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>

            {/* Preferences Content */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-600 flex items-center justify-center">
                  <span className="text-xl">⚙️</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Job Preferences</h2>
              </div>
              <JobPreferences />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
