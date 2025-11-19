"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import ResumeUpload from '@/components/ResumeUpload'
import ResumeStatus from '@/components/ResumeStatus'
import JobMatching from '@/components/JobMatching'
import JobPreferences from '@/components/JobPreferences'
import TrackedApplications from '@/components/TrackedApplications'
import ProcessingSuccessModal from '@/components/ProcessingSuccessModal'
import UserDropdown from '@/components/UserDropdown'
import DashboardNav from '@/components/DashboardNav'
import ThemeToggle from '@/components/ThemeToggle'

export default function Dashboard() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const resumeStatusRef = useRef(null)
  const [activeTab, setActiveTab] = useState('overview')
  const searchParams = useSearchParams()

  // If a `tab` query param is present (for example when navigating from /settings),
  // use it to set the active dashboard tab. Valid tabs: overview, jobs, preferences.
  useEffect(() => {
    try {
      const tab = searchParams?.get?.('tab')
      const valid = ['overview', 'jobs', 'preferences', 'applications']
      if (tab && valid.includes(tab)) {
        setActiveTab(tab)
      }
    } catch (err) {
      // ignore malformed search params
      console.error('Error reading search params for dashboard tab:', err)
    }
  }, [searchParams])
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')
  // Used to force re-mount the ResumeUpload component when resume is removed
  const [resumeUploadVersion, setResumeUploadVersion] = useState(0)
  const [trackedJobs, setTrackedJobs] = useState([])
  const [trackedJobsLoading, setTrackedJobsLoading] = useState(false)
  const [trackedJobsError, setTrackedJobsError] = useState(null)

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

  const fetchTrackedJobs = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setTrackedJobs([])
      setTrackedJobsLoading(false)
      return
    }

    setTrackedJobsLoading(true)
    setTrackedJobsError(null)
    try {
      const res = await fetch('/api/user/jobs/tracked', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load tracked jobs')
      }
      setTrackedJobs(data.jobs || [])
    } catch (err) {
      console.error('Failed to fetch tracked jobs', err)
      setTrackedJobsError(err.message || 'Unable to load tracked jobs right now.')
    } finally {
      setTrackedJobsLoading(false)
    }
  }, [])

  const handleTrackedJobUpdate = useCallback(async (job, status) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      toast.error('Please sign in again to track job applications.')
      return Promise.reject(new Error('Missing auth token'))
    }

    try {
      const res = await fetch('/api/user/jobs/tracked', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ job, status })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update job status')
      }
      setTrackedJobs(data.jobs || [])
      setTrackedJobsError(null)
      const successMessages = {
        saved: 'Saved for later',
        applied: 'Marked as applied',
        interviewed: 'Updated to interviewed',
        rejected: 'Updated to rejected',
        offered: 'Updated to offered'
      }
      toast.success(successMessages[status] || 'Job updated')
      return data.jobs || []
    } catch (err) {
      console.error('Failed to update tracked job', err)
      toast.error(err.message || 'Unable to update job right now.')
      throw err
    }
  }, [])

  const handleManualApplicationAdd = useCallback(async (manualJob) => {
    const payload = {
      jobId: manualJob.jobId || `manual-${Date.now()}`,
      title: manualJob.title,
      company: manualJob.company,
      location: manualJob.location,
      locationType: manualJob.locationType || '',
      salary: manualJob.salary || '',
      type: manualJob.type || '',
      applyLink: manualJob.applyLink || '',
      jobLink: manualJob.jobLink || '',
      postedDisplay: manualJob.postedDisplay || '',
      matchPercentage: null,
      source: 'manual',
      appliedAt: manualJob.appliedAt
    }
    return handleTrackedJobUpdate(payload, manualJob.status || 'applied')
  }, [handleTrackedJobUpdate])

  const handleTrackedJobStatusChange = useCallback(async (job, nextStatus) => {
    if (!job?.jobId || job.status === nextStatus) return
    return handleTrackedJobUpdate(job, nextStatus)
  }, [handleTrackedJobUpdate])

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

  useEffect(() => {
    if (!loading && user) {
      fetchTrackedJobs()
    } else if (!user) {
      setTrackedJobs([])
    }
  }, [loading, user, fetchTrackedJobs])

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
    <div className="bg-gray-100 dark:bg-gray-900">
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
              <img
                src="/pathfinder-logo.svg"
                alt="PathFinder logo"
                className="w-8 h-8"
              />
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
        {/* Navigation Tabs */}
        <DashboardNav activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Resume Upload Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 transition-shadow">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Your Profile</h2>
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
                  className="btn-primary w-full"
                >
                  View Full Profile
                </button>
              </div>

              {/* Job Recommendations */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 transition-shadow">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Job Matches</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                  Discover jobs that match your skills and experience using our smart matching algorithm.
                </p>
                <button 
                  onClick={() => setActiveTab('jobs')}
                  className="btn-primary w-full"
                >
                  Find Jobs
                </button>
              </div>

              {/* Applications */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 transition-shadow">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Applications</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                  Track your job applications and their status in one convenient place.
                </p>
                <button 
                  onClick={() => setActiveTab('applications')}
                  className="btn-primary w-full"
                >
                  View Applications
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Job Matching Tab */}
        {activeTab === 'jobs' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <JobMatching 
              trackedJobs={trackedJobs}
              trackedJobsLoading={trackedJobsLoading}
              onSaveJob={(job) => handleTrackedJobUpdate(job, 'saved')}
              onMarkApplied={(job) => handleTrackedJobUpdate(job, 'applied')}
            />
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 transition-shadow">
                  <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Job Preferences</h2>
           <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                  Set your preferences to get more relevant job recommendations.
           </p>

      </div>
            <JobPreferences />
          </div>
        )}

        {activeTab === 'applications' && (
          <TrackedApplications
            jobs={trackedJobs}
            loading={trackedJobsLoading}
            error={trackedJobsError}
            onRefresh={fetchTrackedJobs}
            onMarkApplied={(job) => handleTrackedJobUpdate(job, 'applied')}
            onAddManualJob={handleManualApplicationAdd}
            onUpdateJobStatus={handleTrackedJobStatusChange}
          />
        )}
      </main>
    </div>
  )
}
