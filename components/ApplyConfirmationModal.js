"use client"

export default function ApplyConfirmationModal({ job, isOpen, onConfirm, onCancel, isSubmitting }) {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Application check-in</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            Did you apply to {job.title}?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Let’s keep your tracker up to date. We&apos;ll store this role in your Applications tab so you can follow up later.
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{job.company}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{job.location || 'Location not specified'}</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Not yet
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:bg-green-400"
          >
            {isSubmitting ? 'Saving...' : 'Yes, mark as applied'}
          </button>
        </div>
      </div>
    </div>
  );
}

