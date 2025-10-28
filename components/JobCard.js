'use client';

/**
 * JobCard Component - Displays a job listing in the left sidebar
 * LinkedIn-style compact job card with match percentage
 */
export default function JobCard({ job, isSelected, onClick }) {
  const matchPercentage = job.matchAnalysis?.matchPercentage || 0;
  
  // Determine match badge color based on percentage
  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div
      onClick={onClick}
      className={`
        p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors
        ${isSelected 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-l-transparent'
        }
      `}
    >
      {/* Header with Company Logo and Match % */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Company Logo */}
          {job.companyLogo ? (
            <img
              src={job.companyLogo}
              alt={`${job.company} logo`}
              className="w-12 h-12 rounded object-contain flex-shrink-0 bg-white border border-gray-200 dark:border-gray-600"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
              <span className="text-gray-600 dark:text-gray-300 font-semibold text-lg">
                {job.company.charAt(0)}
              </span>
            </div>
          )}
          
          {/* Job Title and Company */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {job.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{job.company}</p>
          </div>
        </div>
        
        {/* Match Badge */}
        <div className={`
          ${getMatchColor(matchPercentage)} 
          text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ml-2
        `}>
          {matchPercentage}%
        </div>
      </div>
      
      {/* Location and Job Type */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="truncate">{job.location}</span>
        
        {job.locationType && (
          <>
            <span>•</span>
            <span>{job.locationType}</span>
          </>
        )}
      </div>
      
      {/* Employment Type and Salary */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
          {job.type}
        </span>
        {job.salary && (
          <>
            <span>•</span>
            <span className="truncate text-xs">{job.salary}</span>
          </>
        )}
      </div>
      
      {/* Posted Time */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {job.postedDisplay || 'Recently posted'}
      </div>
      
      {/* Quick Skill Match Preview (first 2-3 matched skills) */}
      {job.matchAnalysis?.matchedRequiredSkills?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {job.matchAnalysis.matchedRequiredSkills.slice(0, 3).map((skill, idx) => (
            <span 
              key={idx} 
              className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded"
            >
              {skill}
            </span>
          ))}
          {job.matchAnalysis.matchedRequiredSkills.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{job.matchAnalysis.matchedRequiredSkills.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

