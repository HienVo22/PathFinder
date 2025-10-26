'use client';

export default function ProcessingSuccessModal({ isOpen, onClose, onViewJobs, uploadedFileName }) {
  if (!isOpen) return null;

  return (
          {/* Message */}
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {uploadedFileName && <span className="font-medium block mb-2">{uploadedFileName}</span>}
              Your resume is being processed to extract skills and find matching jobs.
              Would you like to view your job matches now?
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row sm:gap-3 justify-center">
            <button
              onClick={onViewJobs}
              className="w-full sm:w-auto mb-2 sm:mb-0 inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
            >
              View Job Matches
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative z-10 transform transition-all">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
            Resume Uploaded Successfully! 🎉
          </h3>
