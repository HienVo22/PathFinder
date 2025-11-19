"use client"

import React, { useMemo, useState } from 'react'

const formatDate = (value) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch (err) {
    return value
  }
}

const getDefaultDate = () => new Date().toISOString().slice(0, 10)

const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { value: 'interviewed', label: 'Interviewed', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'offered', label: 'Offered', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  { value: 'rejected', label: 'Rejected', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' }
]

const FILTER_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...STATUS_OPTIONS
]

const SavedJobList = ({ title, jobs, emptyMessage, onMarkApplied }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/60 rounded-lg shadow p-5 h-full">
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
            <div key={job.jobId} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
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

const TrackedJobCard = ({ job, onUpdateJobStatus }) => {
  const statusStyle = STATUS_OPTIONS.find(opt => opt.value === job.status)?.badge || STATUS_OPTIONS[0].badge
  const handleStatusChange = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const nextStatus = event.target.value
    onUpdateJobStatus?.(job, nextStatus)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{job.company || 'Company not specified'}</p>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{job.title || 'Role not specified'}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{job.location || 'Location not specified'}</p>
        </div>
        <select
          value={job.status}
          onChange={handleStatusChange}
          className={`text-xs font-semibold rounded-full px-3 py-1 cursor-pointer border border-transparent focus:outline-none ${statusStyle}`}
        >
          {STATUS_OPTIONS.map(option => (
            <option key={option.value} value={option.value} className="text-gray-900">
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex flex-col gap-1">
        {job.appliedAt && <span>Applied on {formatDate(job.appliedAt)}</span>}
        {job.updatedAt && <span>Updated {formatDate(job.updatedAt)}</span>}
      </div>
      {(job.applyLink || job.jobLink) && (
        <div className="mt-4">
          <a
            href={job.applyLink || job.jobLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Listing
          </a>
        </div>
      )}
    </div>
  )
}

export default function TrackedApplications({
  jobs = [],
  loading,
  error,
  onRefresh,
  onMarkApplied,
  onAddManualJob,
  onUpdateJobStatus
}) {
  const [filter, setFilter] = useState('all')
  const [manualOpen, setManualOpen] = useState(false)
  const [manualForm, setManualForm] = useState(() => ({ title: '', company: '', location: '', appliedAt: getDefaultDate() }))
  const [manualSubmitting, setManualSubmitting] = useState(false)

  const savedJobs = useMemo(() => jobs.filter(job => job.status === 'saved'), [jobs])
  const trackedJobs = useMemo(() => jobs.filter(job => job.status !== 'saved'), [jobs])
  const filteredTrackedJobs = useMemo(() => {
    if (filter === 'all') return trackedJobs
    return trackedJobs.filter(job => job.status === filter)
  }, [filter, trackedJobs])

  const handleManualSubmit = async (event) => {
    event.preventDefault()
    if (!manualForm.title || !manualForm.company) {
      alert('Please provide both role and company names.')
      return
    }
    setManualSubmitting(true)
    try {
      await onAddManualJob?.({
        ...manualForm,
        appliedAt: manualForm.appliedAt ? new Date(manualForm.appliedAt).toISOString() : undefined,
        source: 'manual'
      })
      setManualForm({ title: '', company: '', location: '', appliedAt: getDefaultDate() })
      setManualOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setManualSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tracked Applications</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            {jobs.length > 0
              ? `Saved ${savedJobs.length} • Active ${trackedJobs.length}`
              : 'Save or apply to jobs to track them here.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8 8 0 104.582 9" />
            </svg>
            Refresh
          </button>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
          >
            {FILTER_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
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
          <SavedJobList
            title="Saved Jobs"
            jobs={savedJobs}
            emptyMessage="No saved jobs yet. Use the Save button on any job to bookmark it."
            onMarkApplied={onMarkApplied}
          />

          <div className="bg-gray-50 dark:bg-gray-900/60 rounded-lg shadow p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tracked Applications</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredTrackedJobs.length} job{filteredTrackedJobs.length === 1 ? '' : 's'} shown
                </p>
              </div>
              <button
                onClick={() => setManualOpen(prev => !prev)}
                className="w-9 h-9 rounded-full border border-dashed border-gray-400 dark:border-gray-600 text-xl text-gray-600 dark:text-gray-200 flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-colors"
                aria-label="Add manual application"
              >
                +
              </button>
            </div>

              {manualOpen && (
              <form onSubmit={handleManualSubmit} className="mb-5 bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3 shadow">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Role *</label>
                  <input
                    type="text"
                    value={manualForm.title}
                    onChange={(e) => setManualForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-900"
                    placeholder="e.g. Data Engineer Intern"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Company *</label>
                  <input
                    type="text"
                    value={manualForm.company}
                    onChange={(e) => setManualForm(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-900"
                    placeholder="e.g. Trimble"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={manualForm.location}
                    onChange={(e) => setManualForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-900"
                    placeholder="City, State"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Applied Date</label>
                  <input
                    type="date"
                    value={manualForm.appliedAt}
                    onChange={(e) => setManualForm(prev => ({ ...prev, appliedAt: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-900"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setManualOpen(false)}
                    className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={manualSubmitting}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {manualSubmitting ? 'Adding…' : 'Add Job'}
                  </button>
                </div>
              </form>
            )}

            {filteredTrackedJobs.length === 0 ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
                No applications match this filter yet.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTrackedJobs.map(job => (
                  <TrackedJobCard key={job.jobId} job={job} onUpdateJobStatus={onUpdateJobStatus} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

