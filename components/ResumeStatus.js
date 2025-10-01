'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ResumeViewer from './ResumeViewer';

const ResumeStatus = forwardRef((props, ref) => {
  const [resumeStatus, setResumeStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchResumeStatus = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

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

  // Expose refresh function to parent component
  useImperativeHandle(ref, () => ({
    refreshStatus: fetchResumeStatus
  }));

  useEffect(() => {
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

      // Refresh the status after deletion
      await fetchResumeStatus();
      alert('Resume deleted successfully');
    } catch (err) {
      setError('Could not delete resume');
      console.error('Resume delete error:', err);
    }
  };

  const [viewerOpen, setViewerOpen] = useState(false);

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
            <div className="flex gap-3 mt-2">
              {resumeStatus.resumeInfo.resumeFilename && (
                <>
                  <button
                    onClick={() => setViewerOpen(true)}
                    className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700"
                  >
                    View Resume
                  </button>
                  <a
                    href={resumeStatus.resumeInfo.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 border rounded text-primary-600 hover:bg-gray-50"
                  >
                    Download
                  </a>
                </>
              )}
            </div>
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

      {viewerOpen && (
        <ResumeViewer
          resumeFilename={resumeStatus?.resumeInfo?.resumeFilename}
          onClose={() => setViewerOpen(false)}
        />
      )}

    </div>
  );
});

ResumeStatus.displayName = 'ResumeStatus';

export default ResumeStatus;
