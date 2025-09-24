'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ResumeStatus = () => {
  const [resumeStatus, setResumeStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchResumeStatus = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/user/resume-status', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch resume status');
        }

        const data = await response.json();
        setResumeStatus(data);
      } catch (err) {
        setError('Could not fetch resume status');
        console.error('Resume status error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResumeStatus();
  }, [user]);

  const handleRemoveResume = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/user/resume-status', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete resume');
      }

      setResumeStatus(null);
      alert('Resume deleted successfully');
    } catch (err) {
      setError('Could not delete resume');
      console.error('Resume delete error:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Resume Status</h3>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Resume Status</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Resume Status</h3>
      
      {resumeStatus?.hasResume ? (
        <div className="space-y-3">
          <div className="flex items-center text-green-600">
            <span className="text-xl mr-2">✅</span>
            <span className="font-medium">Resume uploaded</span>
          </div>
          
          <div className="bg-gray-50 rounded p-4 space-y-2">
            <div>
              <strong>File:</strong> {resumeStatus.resumeInfo.resumeOriginalName}
            </div>
            <div>
              <strong>Uploaded:</strong> {
                resumeStatus.resumeInfo.resumeUploadedAt 
                  ? new Date(resumeStatus.resumeInfo.resumeUploadedAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })
                  : 'Unknown'
              }
            </div>
            {resumeStatus.resumeInfo.resumeUrl && (
              <div>
                <a 
                  href={resumeStatus.resumeInfo.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Download Resume
                </a>
              </div>
            )}
          </div>

          <button 
            onClick={handleRemoveResume}
            className="btn-secondary mt-4"
          >
            Remove Resume
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center text-yellow-600">
            <span className="text-xl mr-2">⚠️</span>
            <span className="font-medium">No resume uploaded</span>
          </div>
          <p className="text-gray-600">Upload your resume to get started with job matching!</p>
        </div>
      )}

    </div>
  );
};

export default ResumeStatus;
