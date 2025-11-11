'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function JobPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    jobTypes: [],
    locations: [],
    salaryMin: '',
    remoteOnly: false,
  });
  const [loading, setLoading] = useState(false);

  // Load existing preferences
  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/preferences');
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast.success('Preferences saved successfully!');
      } else {
        toast.error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Error saving preferences');
    } finally {
      setLoading(false);
    }
  };

  const jobTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Internship'];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Types */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Job Types
          </label>
          <div className="grid grid-cols-2 gap-3">
            {jobTypeOptions.map((type) => (
              <label
                key={type}
                className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={preferences.jobTypes.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPreferences({
                        ...preferences,
                        jobTypes: [...preferences.jobTypes, type],
                      });
                    } else {
                      setPreferences({
                        ...preferences,
                        jobTypes: preferences.jobTypes.filter((t) => t !== type),
                      });
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-900 dark:text-gray-100">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Remote Work */}
        <div>
          <label className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <input
              type="checkbox"
              checked={preferences.remoteOnly}
              onChange={(e) =>
                setPreferences({ ...preferences, remoteOnly: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-gray-900 dark:text-gray-100 font-medium">
              Remote work only
            </span>
          </label>
        </div>

        {/* Minimum Salary */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Minimum Salary (USD)
          </label>
          <input
            type="number"
            value={preferences.salaryMin}
            onChange={(e) =>
              setPreferences({ ...preferences, salaryMin: e.target.value })
            }
            placeholder="e.g., 50000"
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Preferred Locations */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Preferred Locations (comma-separated)
          </label>
          <input
            type="text"
            value={preferences.locations.join(', ')}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                locations: e.target.value.split(',').map((l) => l.trim()).filter(Boolean),
              })
            }
            placeholder="e.g., New York, San Francisco, Remote"
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
}
