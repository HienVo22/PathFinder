'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { JobMatcher } from '../utils/jobMatcher';
import JobPreferencesModal from './JobPreferencesModal';
import JobCard from './JobCard';
import JobDetail from './JobDetail';
import SkillsInsightModal from './SkillsInsightModal';

const JobMatching = () => {
  const [userSkills, setUserSkills] = useState([]);
  const [jobMatches, setJobMatches] = useState([]);
  const [skillGapAnalysis, setSkillGapAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [skillsModalJob, setSkillsModalJob] = useState(null);
  const [filters, setFilters] = useState({
    // New LinkedIn-style preferences (also used for filtering)
    jobTitles: [],
    locationTypes: [], // ['On-site','Hybrid','Remote']
    locations: [],
    employmentTypes: [],
    desiredPay: '',
    minSalary: null,
    query: 'software developer' // Default search query
  });
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadUserSkills();
    loadSavedPreferences();
  }, [user]);

  useEffect(() => {
    if (userSkills.length > 0) {
      findMatches();
    }
  }, [userSkills, filters]);

  const loadUserSkills = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get extracted skills from uploaded resume via API
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to see job matches.');
        setUserSkills([]);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/resume-parsing-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resume data');
      }

      const parsingStatus = await response.json();
      
      if (parsingStatus.hasResume && parsingStatus.extractedData?.skills) {
        setUserSkills(parsingStatus.extractedData.skills);
      } else {
        // No resume uploaded yet
        setUserSkills([]);
        setError('No resume uploaded. Upload a resume to see personalized job matches.');
      }
    } catch (error) {
      console.error('Error loading user skills:', error);
      setError('Failed to load your skills. Please try refreshing the page.');
      setUserSkills([]);
    }
    
    setLoading(false);
  };

  const findMatches = async () => {
    try {
      setLoading(true);
      // Get job matches using the new JobMatcher (now async)
      const matches = await JobMatcher.getJobMatches(userSkills, filters);
      
      // Check if we're using mock data (look for mock job IDs)
      const isMockData = matches.some(job => job.id && job.id.startsWith('mock-'));
      setUsingMockData(isMockData);
      
      // Get skill gap analysis
      const gapAnalysis = await JobMatcher.getSkillGapAnalysis(userSkills, 10);
      
      setJobMatches(matches);
      setSkillGapAnalysis(gapAnalysis);
      
      // Auto-select first job
      if (matches.length > 0 && !selectedJob) {
        setSelectedJob(matches[0]);
      }
    } catch (error) {
      console.error('Error finding job matches:', error);
      setError('Failed to find job matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
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
  };

  const handlePreferencesSaved = (prefs) => {
    setFilters(prev => ({ ...prev, ...prefs }));
  };

  if (loading) {
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
      {/* Skills Insight Modal */}
      <SkillsInsightModal
        job={skillsModalJob}
        isOpen={!!skillsModalJob}
        onClose={() => setSkillsModalJob(null)}
      />

      {/* Job Preferences Modal */}
      <JobPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        onSave={handlePreferencesSaved}
      />

      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Top Header Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Top picks for you
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {userSkills.length} skills matched • {jobMatches.length} jobs found
                {usingMockData && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded-full">
                    Demo Data (API Rate Limited)
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setIsPreferencesOpen(true)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              Preferences
            </button>
          </div>
        </div>

        {/* LinkedIn-Style Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Job Listings */}
          <div className="w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
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
                  key={job.id}
                  job={job}
                  isSelected={selectedJob?.id === job.id}
                  onClick={() => setSelectedJob(job)}
                />
              ))
            )}
          </div>

          {/* Right Side - Job Detail */}
          <div className="flex-1 bg-white dark:bg-gray-800">
            <JobDetail
              job={selectedJob}
              onSkillsInsightClick={(job) => setSkillsModalJob(job)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default JobMatching;