'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setDataLoading(true);
      const response = await fetch('/api/user/resume-parsing-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const data = await response.json();
      setProfileData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setDataLoading(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-lg">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const extractedData = profileData?.extractedData || {};
  const hasResumeData = profileData?.hasResume && profileData?.parsing?.completed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/pathfinder-logo.svg" 
                alt="PathFinder Logo" 
                className="w-8 h-8"
              />
              <h1 className="text-2xl font-bold text-primary-600">
                Pathfinder
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle showLabel={true} />
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-secondary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Your professional profile based on AI-extracted resume data
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!hasResumeData && (
          <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">No Resume Data Available</h3>
            <p className="text-blue-700 mb-4">
              Upload and process your resume to see your professional profile with AI-extracted information.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-primary"
            >
              Upload Resume
            </button>
          </div>
        )}

        {hasResumeData && (
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{user.email}</p>
                </div>
                {extractedData.yearsOfExperience && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Years of Experience
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">{extractedData.yearsOfExperience} years</p>
                  </div>
                )}
                {user.resumeOriginalName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Resume
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">{user.resumeOriginalName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {extractedData.skills && extractedData.skills.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Skills
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {extractedData.skills.length} skills
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {extractedData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-700 text-primary-700 dark:text-primary-100 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {(extractedData.companies?.length > 0 || extractedData.jobTitles?.length > 0) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Work Experience
                </h2>
                <div className="space-y-4">
                  {extractedData.jobTitles?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Job Titles
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {extractedData.jobTitles.map((title, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-100 rounded-full text-sm"
                          >
                            {title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {extractedData.companies?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Companies
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {extractedData.companies.map((company, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-100 rounded-full text-sm"
                          >
                            {company}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {extractedData.experience && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Experience Summary
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {extractedData.experience}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Education */}
            {extractedData.education && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Education
                </h2>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-700 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600 dark:text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {extractedData.education}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Projects Section - Placeholder for future enhancement */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Projects
              </h2>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Project extraction coming soon! We're working on enhancing our AI to better identify and extract project information from resumes.
                </p>
              </div>
            </div>

            {/* Last Updated */}
            {extractedData.parsedAt && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Profile last updated: {new Date(extractedData.parsedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

