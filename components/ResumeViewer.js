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
          
          // For DOCX files, check if we can use Google Docs viewer
          if (fetchedContentType.includes('wordprocessingml') || fetchedContentType.includes('msword')) {
            // Google Docs viewer only works with publicly accessible URLs
            // For localhost/development, we'll skip the Google viewer and show a message
            const isLocalhost = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1' || 
                               window.location.hostname.includes('localhost');
            
            if (!isLocalhost && window.location.protocol === 'https:') {
              // Only use Google Docs viewer for HTTPS production URLs
              const fileUrl = encodeURIComponent(`${window.location.origin}/api/upload/resume?file=${encodeURIComponent(resumeFilename)}`);
              setViewerUrl(`https://docs.google.com/gview?url=${fileUrl}&embedded=true`);
            } else {
              // For localhost or non-HTTPS, we'll show a fallback message
              setViewerUrl(null);
            }
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
              {/* DOCX files - use Google Docs viewer for original formatting when available */}
              {(contentType.includes('wordprocessingml') || contentType.includes('msword')) && (
                <>
                  {viewerUrl ? (
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
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-8">
                      <div className="max-w-md text-center">
                        <div className="mb-4">
                          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">DOCX Preview Not Available</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Document preview is not available in development mode. 
                          Please download the file to view the original formatting.
                        </p>
                        <button
                          onClick={handleDownload}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Resume
                        </button>
                      </div>
                    </div>
                  )}
                </>
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
