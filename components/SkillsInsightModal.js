'use client';

/**
 * SkillsInsightModal Component - Shows detailed skill comparison
 * Displays matched skills (with checkmarks) and missing skills (crossed out)
 */
export default function SkillsInsightModal({ job, isOpen, onClose }) {
  if (!isOpen || !job) return null;

  const matchedRequiredSkills = job.matchAnalysis?.matchedRequiredSkills || [];
  const matchedPreferredSkills = job.matchAnalysis?.matchedPreferredSkills || [];
  const missingRequiredSkills = job.matchAnalysis?.missingRequiredSkills || [];
  const missingPreferredSkills = job.matchAnalysis?.missingPreferredSkills || [];
  
  const totalMatched = matchedRequiredSkills.length + matchedPreferredSkills.length;
  const totalMissing = missingRequiredSkills.length + missingPreferredSkills.length;
  const matchPercentage = job.matchAnalysis?.matchPercentage || 0;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Skills Insight
              </h2>
              <p className="text-gray-600">{job.title} at {job.company}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Overall Match Stats */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{matchPercentage}%</div>
              <div className="text-sm text-gray-600 mt-1">Overall Match</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{totalMatched}</div>
              <div className="text-sm text-gray-600 mt-1">Skills You Have</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">{totalMissing}</div>
              <div className="text-sm text-gray-600 mt-1">Skills to Learn</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Matched Required Skills */}
          {matchedRequiredSkills.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">
                  Required Skills You Have
                </h3>
                <span className="text-sm text-gray-500">
                  ({matchedRequiredSkills.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchedRequiredSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-2 bg-green-100 text-green-800 rounded-lg border border-green-300"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Preferred Skills */}
          {matchedPreferredSkills.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">
                  Preferred Skills You Have
                </h3>
                <span className="text-sm text-gray-500">
                  ({matchedPreferredSkills.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchedPreferredSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg border border-blue-300"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Required Skills */}
          {missingRequiredSkills.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">
                  Required Skills to Learn
                </h3>
                <span className="text-sm text-gray-500">
                  ({missingRequiredSkills.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingRequiredSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium line-through">{skill}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>💡 Priority:</strong> These are required skills. Focus on learning these to significantly increase your match percentage.
                </p>
              </div>
            </div>
          )}

          {/* Missing Preferred Skills */}
          {missingPreferredSkills.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">
                  Preferred Skills to Learn
                </h3>
                <span className="text-sm text-gray-500">
                  ({missingPreferredSkills.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingPreferredSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg border border-orange-200"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium line-through">{skill}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>📚 Nice to have:</strong> These preferred skills can give you an edge over other candidates.
                </p>
              </div>
            </div>
          )}

          {/* Recommendation Section */}
          {totalMissing > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">💪 How to Improve Your Match</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {missingRequiredSkills.length > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">1.</span>
                    <span>
                      Focus on learning the <strong>{missingRequiredSkills.length} required skill{missingRequiredSkills.length > 1 ? 's' : ''}</strong> first - these are essential for the role.
                    </span>
                  </li>
                )}
                {missingPreferredSkills.length > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">2.</span>
                    <span>
                      Consider adding the <strong>{missingPreferredSkills.length} preferred skill{missingPreferredSkills.length > 1 ? 's' : ''}</strong> to stand out from other candidates.
                    </span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>
                    Update your resume with projects or experience that demonstrate your <strong>{totalMatched} matching skill{totalMatched > 1 ? 's' : ''}</strong>.
                  </span>
                </li>
              </ul>
            </div>
          )}

          {totalMissing === 0 && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-green-900">Perfect Match!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    You have all the skills required and preferred for this position. You're an excellent candidate!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

