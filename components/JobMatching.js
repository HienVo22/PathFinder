'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { JobMatcher } from '../utils/jobMatcher';
import JobPreferencesModal from './JobPreferencesModal';
import JobCard from './JobCard';
import JobDetail from './JobDetail';
import SkillsInsightModal from './SkillsInsightModal';
import ApplyConfirmationModal from './ApplyConfirmationModal';

const getJobKey = (job) => {
  if (!job) return null;
  const value = job.id ?? job.jobId;
  return value === undefined || value === null ? null : String(value);
};

const JobMatching = ({ 
  trackedJobs = [], 
  trackedJobsLoading = false,
  onSaveJob,
  onMarkApplied
}) => {
  const [userSkills, setUserSkills] = useState([]);
  const [jobMatches, setJobMatches] = useState([]);
  const [skillGapAnalysis, setSkillGapAnalysis] = useState(null);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [skillsModalJob, setSkillsModalJob] = useState(null);
  const [pendingApplyJob, setPendingApplyJob] = useState(null);
  const [savingJobId, setSavingJobId] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filters, setFilters] = useState({
    jobTitles: [],
    locationTypes: [],
    locations: [],
    employmentTypes: [],
    desiredPay: '',
    minSalary: null,
    query: 'software developer'
  });
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const { user } = useAuth();
  const cacheKey = user ? `jobMatches:${user._id || user.email}` : null;
  const selectedJobIdRef = useRef(null);

  const isLoading = loadingSkills || loadingJobs;

  const trackedJobMap = useMemo(() => {
    return trackedJobs.reduce((acc, job) => {
      if (job?.jobId) {
        acc[String(job.jobId)] = job;
      }
      return acc;
    }, {});
  }, [trackedJobs]);

  useEffect(() => {
    selectedJobIdRef.current = getJobKey(selectedJob);
  }, [selectedJob]);

  const buildCacheSignature = useCallback((skills, prefs) => {
    const normalizeArray = (arr = []) => [...arr].map(item => (typeof item === 'string' ? item.toLowerCase() : String(item))).sort();
    return JSON.stringify({
      skills: normalizeArray(skills),
      jobTitles: normalizeArray(prefs.jobTitles),
      locationTypes: normalizeArray(prefs.locationTypes),
      locations: normalizeArray(prefs.locations),
      employmentTypes: normalizeArray(prefs.employmentTypes),
      desiredPay: prefs.desiredPay || '',
      minSalary: prefs.minSalary || null,
      query: prefs.query || ''
    });
  }, []);

  const readCache = useCallback(() => {
    if (typeof window === 'undefined' || !cacheKey) return null;
    try {
      const raw = sessionStorage.getItem(cacheKey);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error('Failed to read job cache', err);
      return null;
    }
  }, [cacheKey]);

  const writeCache = useCallback((payload) => {
    if (typeof window === 'undefined' || !cacheKey) return;
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(payload));
    } catch (err) {
      console.error('Failed to write job cache', err);
    }
  }, [cacheKey]);

  useEffect(() => {
    if (!selectedJob) return;
    const cache = readCache();
    const key = getJobKey(selectedJob);
    if (cache && cache.selectedJobId !== key) {
      writeCache({ ...cache, selectedJobId: key });
    }
  }, [selectedJob, readCache, writeCache]);

  const loadUserSkills = useCallback(async () => {
    setLoadingSkills(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setError('Please log in to see job matches.');
        setUserSkills([]);
        return;
      }

      const response = await fetch('/api/user/resume-parsing-status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resume data');
      }

      const parsingStatus = await response.json();
      if (parsingStatus.hasResume && parsingStatus.extractedData?.skills) {
        setUserSkills(parsingStatus.extractedData.skills);
      } else {
        setUserSkills([]);
        setError('No resume uploaded. Upload a resume to see personalized job matches.');
      }
    } catch (err) {
      console.error('Error loading user skills:', err);
      setError('Failed to load your skills. Please try refreshing the page.');
      setUserSkills([]);
    } finally {
      setLoadingSkills(false);
    }
  }, []);

  const loadSavedPreferences = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;
      const res = await fetch('/api/user/preferences', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.preferences) {
          setFilters(prev => ({ ...prev, ...data.preferences }));
        }
      }
    } catch (err) {
      console.error('Failed to load saved preferences', err);
    }
  }, []);

  const findMatches = useCallback(async ({ signature, forceRefresh = false } = {}) => {
    if (!userSkills.length) return;
    const cacheSignature = signature || buildCacheSignature(userSkills, filters);
    const cached = !forceRefresh ? readCache() : null;

    if (cached && cached.signature === cacheSignature && cached.jobs?.length) {
      setJobMatches(cached.jobs);
      setSkillGapAnalysis(cached.skillGapAnalysis || null);
      setUsingMockData(!!cached.usingMockData);
      setLastUpdated(cached.lastUpdated || null);
      const cachedSelection = cached.jobs.find(job => getJobKey(job) === cached.selectedJobId) || cached.jobs[0] || null;
      setSelectedJob(cachedSelection);
      setLoadingJobs(false);
      return;
    }

    setLoadingJobs(true);
    setError(null);
    try {
      const matches = await JobMatcher.getJobMatches(userSkills, filters);
      const isMock = matches.some(job => {
        const id = getJobKey(job);
        return id?.startsWith('mock-');
      });
      setUsingMockData(isMock);

      const gapAnalysis = await JobMatcher.getSkillGapAnalysis(userSkills, 10, matches);
      setJobMatches(matches);
      setSkillGapAnalysis(gapAnalysis);

      const preferredId = selectedJobIdRef.current || cached?.selectedJobId;
      const nextSelected = matches.find(job => getJobKey(job) === preferredId) || matches[0] || null;
      setSelectedJob(nextSelected);

      const timestamp = new Date().toISOString();
      setLastUpdated(timestamp);

      writeCache({
        signature: cacheSignature,
        jobs: matches,
        skillGapAnalysis: gapAnalysis,
        usingMockData: isMock,
        selectedJobId: getJobKey(nextSelected),
        lastUpdated: timestamp
      });
    } catch (err) {
      console.error('Error finding job matches:', err);
      setError('Failed to find job matches. Please try again.');
    } finally {
      setLoadingJobs(false);
      setRefreshing(false);
    }
  }, [userSkills, filters, buildCacheSignature, readCache, writeCache]);

  useEffect(() => {
    loadUserSkills();
    loadSavedPreferences();
  }, [user, loadUserSkills, loadSavedPreferences]);

  useEffect(() => {
    if (!userSkills.length) {
      setJobMatches([]);
      setLoadingJobs(false);
      return;
    }
    const signature = buildCacheSignature(userSkills, filters);
    findMatches({ signature });
  }, [userSkills, filters, findMatches, buildCacheSignature]);

  const handlePreferencesSaved = (prefs) => {
    setFilters(prev => ({ ...prev, ...prefs }));
  };

  const handleRefreshClick = () => {
    setRefreshing(true);
    findMatches({ forceRefresh: true });
  };

  const isJobSaved = (job) => {
    const key = getJobKey(job);
    if (!key) return false;
    return Boolean(trackedJobMap[key]);
  };

  const isJobApplied = (job) => {
    const key = getJobKey(job);
    if (!key) return false;
    return trackedJobMap[key]?.status === 'applied';
  };

  const handleSaveJob = async (job) => {
    if (!job || !onSaveJob || isJobSaved(job)) return;
    const key = getJobKey(job);
    if (!key) return;
    setSavingJobId(key);
    try {
      await onSaveJob(job, 'saved');
    } catch (err) {
      console.error('Failed to save job', err);
    } finally {
      setSavingJobId(null);
    }
  };

  const handleApplyClick = (job) => {
    if (!job) return;
    const link = job.applyLink || job.jobLink;
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
    setPendingApplyJob(job);
  };

  const handleConfirmApplied = async () => {
    if (!pendingApplyJob || !onMarkApplied) {
      setPendingApplyJob(null);
      return;
    }
    const key = getJobKey(pendingApplyJob);
    if (!key) {
      setPendingApplyJob(null);
      return;
    }
    setApplyingJobId(key);
    try {
      await onMarkApplied(pendingApplyJob, 'applied');
      setPendingApplyJob(null);
    } catch (err) {
      console.error('Failed to mark job as applied', err);
    } finally {
      setApplyingJobId(null);
    }
  };

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) return 'Cached from previous search';
    try {
      const date = new Date(lastUpdated);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.round(diffMs / 60000);
      if (diffMins <= 1) return 'Updated just now';
      if (diffMins < 60) return `Updated ${diffMins} min ago`;
      return `Updated at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'Recently updated';
    }
  }, [lastUpdated]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-lg">Analyzing your skills and finding job matches...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.936 5.036a9 9 0 1112.1 0" />
            </svg>
            {error}
          </div>
          {error.includes('No resume uploaded') && (
            <div className="text-gray-600">
              <p>Go to the Overview tab to upload your resume and get personalized job matches!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <SkillsInsightModal
        job={skillsModalJob}
        isOpen={!!skillsModalJob}
        onClose={() => setSkillsModalJob(null)}
      />

      <JobPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        onSave={handlePreferencesSaved}
      />

      <ApplyConfirmationModal
        job={pendingApplyJob}
        isOpen={!!pendingApplyJob}
        onCancel={() => setPendingApplyJob(null)}
        onConfirm={handleConfirmApplied}
        isSubmitting={applyingJobId === getJobKey(pendingApplyJob)}
      />

      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Top picks for you
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex flex-wrap items-center gap-2">
                {userSkills.length} skills matched • {jobMatches.length} jobs found
                {usingMockData && (
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded-full">
                    Demo Data (API Rate Limited)
                  </span>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">{lastUpdatedLabel}</span>
                {trackedJobsLoading && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                    Syncing applications
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefreshClick}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 flex items-center gap-2"
                disabled={refreshing || loadingJobs}
              >
                <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8 8 0 104.582 9" />
                </svg>
                {refreshing ? 'Refreshing...' : 'Refresh Jobs'}
              </button>
              <button
                onClick={() => setIsPreferencesOpen(true)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                Preferences
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            {jobMatches.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p>No job matches found.</p>
                <p className="text-sm mt-2">Try adjusting your preferences.</p>
              </div>
            ) : (
              jobMatches.map((job) => (
                <JobCard
                  key={getJobKey(job)}
                  job={job}
                  isSelected={getJobKey(selectedJob) === getJobKey(job)}
                  isSaved={isJobSaved(job)}
                  isApplied={isJobApplied(job)}
                  isSaving={savingJobId === getJobKey(job)}
                  onSave={() => handleSaveJob(job)}
                  onClick={() => setSelectedJob(job)}
                />
              ))
            )}
          </div>

          <div className="flex-1 bg-white dark:bg-gray-800">
            <JobDetail
              job={selectedJob}
              onSkillsInsightClick={(job) => setSkillsModalJob(job)}
              onSaveClick={() => handleSaveJob(selectedJob)}
              onApplyClick={handleApplyClick}
              isSaved={isJobSaved(selectedJob)}
              isApplied={isJobApplied(selectedJob)}
              isSaving={savingJobId === getJobKey(selectedJob)}
              isMarkingApplied={applyingJobId === getJobKey(selectedJob)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default JobMatching;