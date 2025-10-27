'use client';

import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ResumeUpload = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const { user, refreshUser } = useAuth();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a PDF, DOC, or DOCX file';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  const uploadFile = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('userId', user.id);

    try {
      const response = await fetch('/api/upload/resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Complete the upload and refresh user data
      setTimeout(async () => {
        setUploadProgress(100);
        setUploadedFile({
          name: file.name,
          path: result.filePath,
          uploadedAt: new Date().toISOString(),
          fileType: file.type
        });
        setUploading(false);

        try {
          if (typeof refreshUser === 'function') await refreshUser();
        } catch (err) {
          console.error('Failed to refresh user after upload:', err);
        }

        // Notify parent component about successful upload
        if (onUploadSuccess) {
          onUploadSuccess(result);
        }
      }, 1500);

    } catch (err) {
      setError('Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Upload Resume</h3>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          dragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
            : uploadedFile
            ? 'border-green-400 bg-green-50 dark:bg-green-900'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".docx,.doc,.pdf"
          onChange={handleChange}
        />

        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300">Uploading resume...</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{uploadProgress}%</p>
          </div>
        ) : uploadedFile ? (
          <div className="space-y-3">
            <div className="text-green-600 text-4xl">✓</div>
            <p className="text-green-700 dark:text-green-400 font-medium">Resume uploaded successfully!</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{uploadedFile.name}</p>
            <button
              onClick={() => {
                setUploadedFile(null);
                setUploadProgress(0);
              }}
              className="text-primary-600 hover:text-primary-700 text-sm underline"
            >
              Upload a different resume
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-gray-400 text-4xl">📄</div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {dragActive ? 'Drop your resume here' : 'Drag and drop your resume here'}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">or</p>
              <button
                onClick={onButtonClick}
                className="btn-primary px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
              >
                Choose File
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Best: DOCX for AI parsing | Also supports: PDF, DOC (max 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {uploadedFile && !uploading && (
        <div className="mt-4 space-y-3">
          <div className="p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md">
            <p className="text-green-700 dark:text-green-300 text-sm">
              Your resume has been uploaded successfully!
            </p>
          </div>

          {uploadedFile.fileType === 'application/pdf' && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md">
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                <strong>Note:</strong> PDF parsing is temporarily limited. For best AI skill extraction, consider uploading a DOCX version of your resume.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
