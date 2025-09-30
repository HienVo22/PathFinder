"use client";

import { useState, useEffect } from 'react';

export default function ResumeViewer({ resumeFilename, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    if (!resumeFilename) return;
    let mounted = true;
    let objectUrl = null;

    const fetchPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`/api/upload/resume?file=${encodeURIComponent(resumeFilename)}`, { headers });
        if (!res.ok) throw new Error(`Failed to fetch resume: ${res.status}`);
        const arrayBuffer = await res.arrayBuffer();
        const contentType = res.headers.get('content-type') || 'application/pdf';
        const blob = new Blob([arrayBuffer], { type: contentType });
        objectUrl = URL.createObjectURL(blob);
        if (mounted) setBlobUrl(objectUrl);
      } catch (err) {
        if (mounted) setError(err.message || 'Could not load resume');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPdf();

    return () => {
      mounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [resumeFilename]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => onClose && onClose()} />
      <div className="relative bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 h-3/4 overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="text-lg font-semibold">Resume Preview</h3>
          <div>
            <button
              onClick={() => onClose && onClose()}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>

        <div className="w-full h-full">
          {loading && (
            <div className="w-full h-full flex items-center justify-center">
              <div>Loading resume...</div>
            </div>
          )}
          {error && (
            <div className="p-4 text-red-600">Error loading resume: {error}</div>
          )}
          {!loading && !error && blobUrl && (
            <iframe src={blobUrl} title="Resume" className="w-full h-full border-0" />
          )}
        </div>
      </div>
    </div>
  );
}
