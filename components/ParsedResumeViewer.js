'use client';

import { useState, useEffect } from 'react';

const ParsedResumeViewer = () => {
  const [parsingData, setParsingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllSkills, setShowAllSkills] = useState(false);

  useEffect(() => {
    fetchParsingStatus();
  }, []);

  const fetchParsingStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/resume-parsing-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch parsing status');
      }

      const data = await response.json();
      setParsingData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">AI Extracted Skills</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading skills...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">AI Extracted Skills</h3>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!parsingData?.hasResume) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">AI Extracted Skills</h3>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700 text-sm">
            Upload a resume to see AI-powered skill extraction!
          </p>
        </div>
      </div>
    );
  }

  const { parsing, extractedData, userSkills } = parsingData;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800">AI Extracted Skills</h3>
      </div>

      {/* Parsing Status */}
      {!parsing?.completed && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-700 text-sm">
            ⏳ AI skill extraction in progress... Refresh to see results.
          </p>
          <button 
            onClick={fetchParsingStatus}
            className="mt-2 text-sm text-yellow-800 underline hover:text-yellow-900"
          >
            Refresh Status
          </button>
        </div>
      )}

      {/* Extracted Skills */}
      {extractedData?.skills && extractedData.skills.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-700">
              Extracted Skills ({extractedData.skills.length})
            </h4>
            <button 
              onClick={fetchParsingStatus}
              className="px-3 py-1 bg-gray-900 text-white text-xs rounded hover:bg-gray-800 transition-colors"
            >
              Refresh
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(showAllSkills ? extractedData.skills : extractedData.skills.slice(0, 12)).map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
          {extractedData.skills.length > 12 && (
            <button 
              onClick={() => setShowAllSkills(!showAllSkills)}
              className="mt-3 text-xs text-primary-600 hover:text-primary-700 underline"
            >
              {showAllSkills ? 'Show Less' : `Show All ${extractedData.skills.length} Skills`}
            </button>
          )}
        </div>
      )}

      {/* Job Titles */}
      {extractedData?.jobTitles && extractedData.jobTitles.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Previous Roles</h4>
          <div className="flex flex-wrap gap-2">
            {extractedData.jobTitles.map((title, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm"
              >
                {title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Years of Experience */}
      {extractedData?.yearsOfExperience > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Experience Level</h4>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{extractedData.yearsOfExperience}</span> years of professional experience
          </p>
        </div>
      )}

      {/* Parsed Timestamp */}
      {parsing?.parsedAt && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Analyzed on {new Date(parsing.parsedAt).toLocaleDateString()} at {new Date(parsing.parsedAt).toLocaleTimeString()}
          </p>
        </div>
      )}

    </div>
  );
};

export default ParsedResumeViewer;
