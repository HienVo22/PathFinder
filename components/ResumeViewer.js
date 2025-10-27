"use client";

import { useState, useEffect } from 'react';

export default function ResumeViewer({ resumeFilename, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [contentType, setContentType] = useState('application/pdf');
  const [viewerUrl, setViewerUrl] = useState(null);

  useEffect(() => {
    if (!resumeFilename) return;
    let mounted = true;
    let objectUrl = null;

    const fetchFile = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`/api/upload/resume?file=${encodeURIComponent(resumeFilename)}`, { headers });
        if (!res.ok) throw new Error(`Failed to fetch resume: ${res.status}`);
        const arrayBuffer = await res.arrayBuffer();
        const fetchedContentType = res.headers.get('content-type') || 'application/pdf';
        setContentType(fetchedContentType);
        
        // Create blob URL for all file types
        const blob = new Blob([arrayBuffer], { type: fetchedContentType });
        objectUrl = URL.createObjectURL(blob);
        
        if (mounted) {
          setBlobUrl(objectUrl);
          
          // For DOCX files, we'll use Google Docs viewer for better formatting
          if (fetchedContentType.includes('wordprocessingml') || fetchedContentType.includes('msword')) {
            // Create a viewer URL using Google Docs viewer
            const fileUrl = encodeURIComponent(`${window.location.origin}/api/upload/resume?file=${encodeURIComponent(resumeFilename)}`);
            setViewerUrl(`https://docs.google.com/gview?url=${fileUrl}&embedded=true`);
          }
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Could not load resume');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchFile();

    return () => {
      mounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [resumeFilename]);

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => onClose && onClose()} />
      <div className="relative bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 h-3/4 overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b bg-gray-50">
          <h3 className="text-lg font-semibold">Resume Preview</h3>
          <div className="flex gap-2">
            <a
              href={`/api/upload/resume?file=${encodeURIComponent(resumeFilename)}&download=true`}
              download
              className="px-3 py-1 border rounded text-sm text-primary-600 hover:bg-primary-50"
              onClick={(e) => e.stopPropagation()}
            >
              Download
            </a>
            <button
              onClick={() => onClose && onClose()}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            >
              Close
            </button>
          </div>
        </div>

        <div className="w-full h-full bg-gray-100" onContextMenu={handleDownload}>
          {loading && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-gray-500">Loading resume...</div>
            </div>
          )}
          {error && (
            <div className="p-4 text-red-600">Error loading resume: {error}</div>
          )}
          {!loading && !error && (
            <>
              {/* DOCX files - use Google Docs viewer for original formatting */}
              {(contentType.includes('wordprocessingml') || contentType.includes('msword')) && viewerUrl && (
                <iframe
                  src={viewerUrl}
                  title="Resume Preview"
                  className="w-full h-full border-0"
                  onContextMenu={handleDownload}
                  onLoad={() => console.log('Google Docs viewer loaded')}
                  onError={() => {
                    console.warn('Google Docs viewer failed, falling back to direct view');
                    setError('Document viewer unavailable. Please download to view the original format.');
                  }}
                />
              )}
              
              {/* PDF files - native browser PDF viewer */}
              {contentType.includes('pdf') && blobUrl && (
                <object
                  data={blobUrl}
                  type="application/pdf"
                  className="w-full h-full"
                  onContextMenu={handleDownload}
                >
                  <iframe 
                    src={blobUrl} 
                    title="Resume PDF" 
                    className="w-full h-full border-0"
                    onContextMenu={handleDownload}
                  />
                </object>
              )}
              
              {/* Fallback for other file types */}
              {!contentType.includes('pdf') && !contentType.includes('wordprocessingml') && !contentType.includes('msword') && blobUrl && (
                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                  <div className="text-gray-600 mb-4">
                    Preview not available for this file type.
                  </div>
                  <a
                    href={`/api/upload/resume?file=${encodeURIComponent(resumeFilename)}&download=true`}
                    download
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                  >
                    Download to View
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
