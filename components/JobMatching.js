'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { JobMatcher } from '../utils/jobMatcher';
import JobPreferencesModal from './JobPreferencesModal';

const JobMatching = () => {
  const [userSkills, setUserSkills] = useState([]);
  const [jobMatches, setJobMatches] = useState([]);
  const [skillGapAnalysis, setSkillGapAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    // New LinkedIn-style preferences (also used for filtering)
    jobTitles: [],
    locationTypes: [], // ['On-site','Hybrid','Remote']
    locations: [],
    employmentTypes: [],
    desiredPay: '',
    minSalary: null
  });
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
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

  const findMatches = () => {
    try {
      // Get job matches using the new JobMatcher
      const matches = JobMatcher.getJobMatches(userSkills, filters);
      
      // Get skill gap analysis
      const gapAnalysis = JobMatcher.getSkillGapAnalysis(userSkills, 10);
      
      setJobMatches(matches);
      setSkillGapAnalysis(gapAnalysis);
    } catch (error) {
      console.error('Error finding job matches:', error);
      setError('Failed to find job matches. Please try again.');
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
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Matches</h1>
        <p className="text-gray-600">
          Based on your extracted skills: <span className="font-medium">{userSkills.length} skills found</span>
        </p>
      </div>

      {/* User Skills Display */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Skills</h2>
        <div className="flex flex-wrap gap-2">
          {userSkills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
        <button 
          onClick={loadUserSkills}
          className="mt-4 text-sm text-primary-600 hover:text-primary-700 underline"
        >
          Refresh Skills
        </button>
      </div>

      {/* Skill Gap Analysis */}
      {skillGapAnalysis && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Skill Development Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Most In-Demand Missing Skills */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Top Skills to Learn</h3>
              <div className="space-y-3">
                {skillGapAnalysis.topMissingSkills.slice(0, 5).map((skillGap, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-gray-800">{skillGap.skill}</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          skillGap.importance === 'required' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {skillGap.importance}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{skillGap.opportunityCount} jobs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Match Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Match</span>
                  <span className="font-medium">{Math.round(skillGapAnalysis.averageMatchPercentage)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jobs Analyzed</span>
                  <span className="font-medium">{skillGapAnalysis.totalJobsAnalyzed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Skills</span>
                  <span className="font-medium">{userSkills.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences (replaces Filters) */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Job Preferences</h2>
          <button
            onClick={() => setIsPreferencesOpen(true)}
            className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 text-sm font-medium"
          >
            Edit Preferences
          </button>
        </div>

        {/* Summary pills */}
        <div className="flex flex-wrap gap-2">
          {(filters.locationTypes && filters.locationTypes.length > 0) && (
            filters.locationTypes.map((t, i) => (
              <span key={`lt-${i}`} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">{t}</span>
            ))
          )}
          {(filters.locations && filters.locations.length > 0) && (
            filters.locations.slice(0, 3).map((loc, i) => (
              <span key={`loc-${i}`} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{loc}</span>
            ))
          )}
          {(filters.employmentTypes && filters.employmentTypes.length > 0) && (
            filters.employmentTypes.map((t, i) => (
              <span key={`et-${i}`} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">{t}</span>
            ))
          )}
          {filters.desiredPay && (
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">Pay: {filters.desiredPay}</span>
          )}
          {(!filters.locationTypes?.length && !filters.locations?.length && !filters.employmentTypes?.length && !filters.desiredPay) && (
            <span className="text-sm text-gray-500">No preferences set. Click Edit Preferences to personalize matches.</span>
          )}
        </div>
      </div>

      {/* Modal */}
      <JobPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        onSave={handlePreferencesSaved}
      />

      {/* Job Matches */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Job Matches ({jobMatches.length} found)
        </h2>

        {jobMatches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-lg text-gray-600">No job matches found with current filters.</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters or develop more skills!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {jobMatches.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                {/* Job Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-lg text-gray-600">{job.company}</p>
                    <p className="text-sm text-gray-500">{job.location} • {job.type}</p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      job.matchAnalysis.matchPercentage >= 80 
                        ? 'bg-green-100 text-green-800'
                        : job.matchAnalysis.matchPercentage >= 60
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {job.matchAnalysis.matchPercentage}% Match
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{job.salary}</p>
                  </div>
                </div>

                {/* Skills Match Breakdown */}
                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Required Skills */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Required Skills ({job.matchAnalysis.matchedRequiredSkills.length}/{job.matchAnalysis.totalRequiredSkills})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {job.requiredSkills.map((skill, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded text-xs ${
                              job.matchAnalysis.matchedRequiredSkills.includes(skill)
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Preferred Skills */}
                    {job.preferredSkills && job.preferredSkills.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Preferred Skills ({job.matchAnalysis.matchedPreferredSkills.length}/{job.matchAnalysis.totalPreferredSkills})
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {job.preferredSkills.map((skill, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-xs ${
                                job.matchAnalysis.matchedPreferredSkills.includes(skill)
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Description */}
                <div className="mb-4">
                  <p className="text-gray-700 text-sm leading-relaxed">{job.description}</p>
                </div>

                {/* Benefits */}
                {job.benefits && job.benefits.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Benefits</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.benefits.map((benefit, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills & Action Items */}
                {job.matchAnalysis.missingRequiredSkills.length > 0 && (
                  <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                    <h4 className="text-sm font-medium text-orange-800 mb-2">Skills to Develop</h4>
                    <div className="flex flex-wrap gap-1">
                      {job.matchAnalysis.missingRequiredSkills.slice(0, 5).map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-orange-200 text-orange-800 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Posted: {new Date(job.posted).toLocaleDateString()}
                  </div>
                  <div className="space-x-3">
                    <button className="btn-secondary text-sm">Learn More</button>
                    <button 
                      className={`text-sm px-4 py-2 rounded-md font-medium ${
                        job.matchAnalysis.matchPercentage >= 60
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={job.matchAnalysis.matchPercentage < 60}
                    >
                      {job.matchAnalysis.matchPercentage >= 60 ? 'Apply Now' : 'Build Skills First'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobMatching;