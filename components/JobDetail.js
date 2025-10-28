'use client';

import { useState } from 'react';

/**
 * JobDetail Component - Displays full job details on the right side
 * LinkedIn-style detailed job view with skills insight
 */
export default function JobDetail({ job, onSkillsInsightClick }) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  if (!job) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-lg">Select a job to view details</p>
        </div>
      </div>
    );
  }

  const matchPercentage = job.matchAnalysis?.matchPercentage || 0;
  const matchedSkills = [
    ...(job.matchAnalysis?.matchedRequiredSkills || []),
    ...(job.matchAnalysis?.matchedPreferredSkills || [])
  ];
  const missingSkills = [
    ...(job.matchAnalysis?.missingRequiredSkills || []),
    ...(job.matchAnalysis?.missingPreferredSkills || [])
  ];

  // Truncate description for initial view
  const descriptionLimit = 500;
  const shouldTruncate = job.description && job.description.length > descriptionLimit;
  const displayDescription = shouldTruncate && !showFullDescription
    ? job.description.slice(0, descriptionLimit) + '...'
    : job.description;

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {job.title}
            </h1>
            <div className="flex items-center gap-3 mb-3">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={`${job.company} logo`}
                  className="w-10 h-10 rounded object-contain bg-white border border-gray-200 dark:border-gray-600"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-300 font-semibold">
                    {job.company.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{job.company}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{job.location}</p>
              </div>
            </div>
            
            {/* Job Meta Info */}
            <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">{job.type}</span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">{job.locationType}</span>
              {job.experienceLevel && job.experienceLevel !== 'Not specified' && (
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">{job.experienceLevel}</span>
              )}
              <span className="text-gray-500 dark:text-gray-400">{job.postedDisplay}</span>
            </div>
          </div>
          
          {/* Match Badge - Large */}
          <div className="text-center ml-4">
            <div className={`
              text-3xl font-bold mb-1
              ${matchPercentage >= 80 ? 'text-green-600' : 
                matchPercentage >= 60 ? 'text-blue-600' : 
                matchPercentage >= 40 ? 'text-yellow-600' : 'text-gray-600'}
            `}>
              {matchPercentage}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Match</div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <a
            href={job.applyLink || job.jobLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            Apply
          </a>
          <button
            onClick={() => {
              // Save job functionality - placeholder for now
              alert('Job saved! (Feature coming soon)');
            }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Save
          </button>
          <button
            onClick={() => onSkillsInsightClick(job)}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            Skills Insight
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Salary */}
        {job.salary && job.salary !== 'Salary not specified' && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Salary</h2>
            <p className="text-gray-700 dark:text-gray-300">{job.salary}</p>
          </div>
        )}

        {/* Quick Skills Overview */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Skills Match</h2>
            <button
              onClick={() => onSkillsInsightClick(job)}
              className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline"
            >
              View Details →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">Matched Skills</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{matchedSkills.length}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">Skills to Learn</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{missingSkills.length}</p>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">About the Job</h2>
          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {displayDescription}
          </div>
          {shouldTruncate && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-blue-600 dark:text-blue-400 font-semibold mt-2 hover:underline"
            >
              {showFullDescription ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>

        {/* Highlights Sections */}
        {job.highlights?.qualifications?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Qualifications</h2>
            <ul className="space-y-2">
              {job.highlights.qualifications.map((qual, idx) => (
                <li key={idx} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{qual}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {job.highlights?.responsibilities?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Responsibilities</h2>
            <ul className="space-y-2">
              {job.highlights.responsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {job.highlights?.benefits?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Benefits</h2>
            <ul className="space-y-2">
              {job.highlights.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start">
                  <svg className="w-5 h-5 text-purple-500 dark:text-purple-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
          <p>Posted via {job.publisher || 'Job Board'}</p>
          {job.jobLink && (
            <a
              href={job.jobLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
            >
              View original posting →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

