'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { findJobMatches, getMatchStatistics } from '../utils/jobMatcher';
import { getMockUserSkills, extractSkillsFromResume } from '../utils/skillsExtractor';

const JobMatching = () => {
  const [userSkills, setUserSkills] = useState([]);
  const [jobMatches, setJobMatches] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState('fullStackDeveloper');
  const [filters, setFilters] = useState({
    remote: null,
    minScore: 20,
    maxResults: 20,
    jobType: null,
    datePosted: null,
    salaryMin: null,
    salaryMax: null,
    searchQuery: ''
  });
  const { user } = useAuth();

  // Mock profiles for testing
  const profiles = {
    fullStackDeveloper: 'Full Stack Developer',
    frontendDeveloper: 'Frontend Developer', 
    backendDeveloper: 'Backend Developer',
    pythonDeveloper: 'Python Developer',
    mobileDeveloper: 'Mobile Developer',
    dataScientist: 'Data Scientist',
    devopsEngineer: 'DevOps Engineer'
  };

  useEffect(() => {
    loadUserSkills();
  }, [user, selectedProfile]);

  useEffect(() => {
    if (userSkills.length > 0) {
      findMatches();
    }
  }, [userSkills, filters]);

  const loadUserSkills = async () => {
    setLoading(true);
    
    try {
      // For MVP, use mock skills based on selected profile
      const skills = getMockUserSkills(selectedProfile);
      setUserSkills(skills);
      
      // TODO: Later, extract from uploaded resume
      // if (user?.resumePath) {
      //   const extractedSkills = await extractSkillsFromResume(resumeText);
      //   setUserSkills(extractedSkills);
      // }
    } catch (error) {
      console.error('Error loading user skills:', error);
      setUserSkills(getMockUserSkills('fullStackDeveloper'));
    }
    
    setLoading(false);
  };

  const findMatches = () => {
    // Load user preferences from localStorage
    const savedPreferences = localStorage.getItem('jobPreferences');
    const preferences = savedPreferences ? JSON.parse(savedPreferences) : {};
    
    // Combine filters with user preferences
    const combinedFilters = {
      ...filters,
      locationTypes: preferences.locationTypes?.length > 0 ? preferences.locationTypes : null,
      locations: preferences.locations?.length > 0 ? preferences.locations : null,
      employmentTypes: preferences.employmentTypes?.length > 0 ? preferences.employmentTypes : null,
      // Apply salary preferences if not overridden by filters
      salaryMin: filters.salaryMin || preferences.salaryMin,
      salaryMax: filters.salaryMax || preferences.salaryMax
    };
    
    const matches = findJobMatches(userSkills, combinedFilters);
    const stats = getMatchStatistics(userSkills);
    
    setJobMatches(matches);
    setStatistics(stats);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-lg">Finding your perfect job matches...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Top Job Picks for You</h1>
        <p className="text-gray-600 text-lg">
          Personalized recommendations based on your profile, skills, and preferences
        </p>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Skills-based matching
          </span>
          <span className="mx-3">•</span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Real-time filtering
          </span>
          <span className="mx-3">•</span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
            {jobMatches.length} opportunities found
          </span>
        </div>
      </div>

      {/* Profile Selector (MVP Testing) */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-yellow-800 mb-2">MVP Testing Mode</h3>
        <p className="text-yellow-700 text-sm mb-3">
          Select a developer profile to see job matches (resume parsing coming soon):
        </p>
        <select
          value={selectedProfile}
          onChange={(e) => setSelectedProfile(e.target.value)}
          className="border border-yellow-300 rounded px-3 py-2 bg-white"
        >
          {Object.entries(profiles).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* User Skills Display */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Skills ({userSkills.length})</h2>
        <div className="flex flex-wrap gap-2">
          {userSkills.map(skill => (
            <span 
              key={skill} 
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{statistics.matchingJobs}</div>
            <div className="text-sm text-gray-600">Matching Jobs</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{statistics.goodMatches}</div>
            <div className="text-sm text-gray-600">Good Matches (60%+)</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{statistics.excellentMatches}</div>
            <div className="text-sm text-gray-600">Excellent Matches (80%+)</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{statistics.averageScore}%</div>
            <div className="text-sm text-gray-600">Average Match</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold mb-3">Search & Filters</h3>
        
        {/* Search Bar */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Jobs
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by company name, job title, or type..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 pl-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Type
            </label>
            <select
              value={filters.jobType || 'all'}
              onChange={(e) => handleFilterChange('jobType', 
                e.target.value === 'all' ? null : e.target.value
              )}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            >
              <option value="all">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internships</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remote Work
            </label>
            <select
              value={filters.remote === null ? 'all' : filters.remote.toString()}
              onChange={(e) => handleFilterChange('remote', 
                e.target.value === 'all' ? null : e.target.value === 'true'
              )}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            >
              <option value="all">All Jobs</option>
              <option value="true">Remote Only</option>
              <option value="false">On-site Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Posted
            </label>
            <select
              value={filters.datePosted || 'all'}
              onChange={(e) => handleFilterChange('datePosted', 
                e.target.value === 'all' ? null : e.target.value
              )}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            >
              <option value="all">All Time</option>
              <option value="last-24-hours">Past 24 Hours</option>
              <option value="last-week">Past Week</option>
              <option value="last-month">Past Month</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Salary (Annual)
            </label>
            <select
              value={filters.salaryMin || 'all'}
              onChange={(e) => handleFilterChange('salaryMin', 
                e.target.value === 'all' ? null : parseInt(e.target.value)
              )}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            >
              <option value="all">Any Salary</option>
              <option value="40000">$40k+</option>
              <option value="60000">$60k+</option>
              <option value="80000">$80k+</option>
              <option value="100000">$100k+</option>
              <option value="120000">$120k+</option>
            </select>
          </div>
        </div>
        
        {/* Clear Filters Button */}
        {(filters.searchQuery || filters.jobType || filters.remote !== null || filters.datePosted || filters.salaryMin) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setFilters({
                remote: null,
                minScore: 20,
                maxResults: 20,
                jobType: null,
                datePosted: null,
                salaryMin: null,
                salaryMax: null,
                searchQuery: ''
              })}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Job Matches */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {jobMatches.length} Job{jobMatches.length !== 1 ? 's' : ''} Found
          {filters.searchQuery && (
            <span className="text-gray-500 font-normal text-lg ml-2">
              for "{filters.searchQuery}"
            </span>
          )}
        </h2>
      </div>
      
      <div className="space-y-6">
        {jobMatches.length > 0 ? (
          jobMatches.map(job => (
            <JobCard key={job.id} job={job} />
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Jobs Found</h3>
            <p className="text-gray-600">
              {filters.searchQuery ? (
                <>No jobs match your search "{filters.searchQuery}". Try different keywords or clear your filters.</>
              ) : (
                <>Try adjusting your filters or add more skills to your profile.</>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const JobCard = ({ job }) => {
  const { match } = job;
  
  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-100 border-orange-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getMatchLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Partial Match';
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h2>
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <span className="font-medium">{job.company}</span>
              <span className="mx-2">•</span>
              <span>{job.location}</span>
              <span className="mx-2">•</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                job.locationType === 'Remote' ? 'bg-green-100 text-green-800' :
                job.locationType === 'Hybrid' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-700'
              }`}>
                {job.locationType}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="text-green-600 font-semibold">{job.salary}</span>
              <span className="mx-2">•</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                job.type === 'Internship' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {job.type}
              </span>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg border font-semibold ${getMatchColor(match.score)}`}>
            <div className="text-lg">{match.score}%</div>
            <div className="text-xs">{getMatchLabel(match.score)}</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>

        {/* Skills Analysis */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Required Skills */}
          <div>
            <h4 className="font-semibold text-sm text-gray-800 mb-2">
              Required Skills ({match.requiredMatches}/{match.totalRequiredSkills} matches)
            </h4>
            <div className="flex flex-wrap gap-1">
              {job.requiredSkills.map(skill => {
                const isMatched = match.matchedRequiredSkills.includes(skill.toLowerCase());
                return (
                  <span 
                    key={skill} 
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      isMatched 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {skill}
                    {isMatched && ' ✓'}
                  </span>
                );
              })}
            </div>
          </div>
          
          {/* Preferred Skills */}
          {job.preferredSkills && job.preferredSkills.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-800 mb-2">
                Preferred Skills ({match.preferredMatches}/{match.totalPreferredSkills} matches)
              </h4>
              <div className="flex flex-wrap gap-1">
                {job.preferredSkills.map(skill => {
                  const isMatched = match.matchedPreferredSkills.includes(skill.toLowerCase());
                  return (
                    <span 
                      key={skill} 
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        isMatched 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {skill}
                      {isMatched && ' ✓'}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Missing Skills Alert */}
        {match.missingRequiredSkills.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4">
            <h5 className="font-medium text-orange-800 text-sm mb-1">
              Skills to improve your match:
            </h5>
            <div className="flex flex-wrap gap-1">
              {match.missingRequiredSkills.slice(0, 5).map(skill => (
                <span 
                  key={skill} 
                  className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <div className="mb-4">
            <h5 className="font-medium text-sm text-gray-800 mb-2">Benefits:</h5>
            <div className="flex flex-wrap gap-2">
              {job.benefits.map(benefit => (
                <span 
                  key={benefit}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button className="btn-primary flex-1">
            Apply Now
          </button>
          <button className="btn-secondary">
            Save Job
          </button>
          <button className="btn-secondary">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobMatching;
