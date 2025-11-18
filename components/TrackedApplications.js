"use client"

import React from 'react'

const formatDate = (value) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch (err) {
    return value
  }
}

const JobList = ({ title, jobs, emptyMessage, onMarkApplied }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">{jobs.length} job{jobs.length === 1 ? '' : 's'}</span>
      </div>
      {jobs.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.jobId} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{job.company}</p>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{job.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{job.location || 'Location not specified'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.status === 'applied' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                  {job.status === 'applied' ? 'Applied' : 'Saved'}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                {job.type && <span>{job.type}</span>}
                {job.locationType && (
                  <>
                    <span>•</span>
                    <span>{job.locationType}</span>
                  </>
                )}
                {job.matchPercentage != null && (
                  <>
                    <span>•</span>
                    <span>{job.matchPercentage}% match</span>
                  </>
                )}
              </div>
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex flex-col gap-1">
                <span>Saved on {formatDate(job.savedAt)}</span>
                {job.status === 'applied' && job.appliedAt && (
                  <span>Applied on {formatDate(job.appliedAt)}</span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={job.applyLink || job.jobLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Listing
                </a>
                {job.status === 'saved' && (
                  <button
                    onClick={() => onMarkApplied?.(job)}
                    className="px-4 py-2 border border-green-600 text-green-700 dark:text-green-300 text-sm font-semibold rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  >
                    Mark as Applied
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TrackedApplications({ jobs = [], loading, error, onRefresh, onMarkApplied }) {
  const savedJobs = jobs.filter(job => job.status === 'saved')
  const appliedJobs = jobs.filter(job => job.status === 'applied')

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tracked Applications</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            {jobs.length > 0
              ? `Saved ${savedJobs.length} • Applied ${appliedJobs.length}`
              : 'Save or apply to jobs to track them here.'}
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8 8 0 104.582 9" />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">Loading tracked jobs...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <JobList
            title="Saved Jobs"
            jobs={savedJobs}
            emptyMessage="No saved jobs yet. Use the Save button on any job to bookmark it."
            onMarkApplied={onMarkApplied}
          />
          <JobList
            title="Applied Jobs"
            jobs={appliedJobs}
            emptyMessage="Jobs you mark as applied will show up here."
            onMarkApplied={onMarkApplied}
          />
        </div>
      )}
    </div>
  )
}

