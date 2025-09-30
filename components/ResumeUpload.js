'use client';

import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ResumeUpload = () => {
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
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Complete the upload and refresh user data
      setTimeout(async() => {
        setUploadProgress(100);
        setUploadedFile({
          name: file.name,
          path: result.filePath,
          uploadedAt: new Date().toISOString()
        });
        setUploading(false);
        try {
          if (typeof refreshUser === 'function') await refreshUser();
        } catch(err) {
          console.error('Failed to refresh user after upload:', err);
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
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Upload Resume</h3>
      
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          dragActive 
            ? 'border-primary-500 bg-primary-50' 
            : uploadedFile 
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
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
          accept=".pdf,.doc,.docx"
          onChange={handleChange}
        />

        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600">Uploading resume...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">{uploadProgress}%</p>
          </div>
        ) : uploadedFile ? (
          <div className="space-y-3">
            <div className="text-green-600 text-4xl">✓</div>
            <p className="text-green-700 font-medium">Resume uploaded successfully!</p>
            <p className="text-sm text-gray-600">{uploadedFile.name}</p>
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
              <p className="text-gray-600 mb-2">
                {dragActive ? 'Drop your resume here' : 'Drag and drop your resume here'}
              </p>
              <p className="text-gray-500 text-sm mb-4">or</p>
              <button
                onClick={onButtonClick}
                className="btn-primary"
              >
                Choose File
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Supports PDF, DOC, DOCX (max 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {uploadedFile && !uploading && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700 text-sm">
            Your resume has been uploaded and will be used for job matching!
          </p>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
