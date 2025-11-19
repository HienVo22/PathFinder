'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const JobPreferences = () => {
  const [preferences, setPreferences] = useState({
    locationTypes: [], // ['Remote', 'Hybrid', 'In-Person']
    locations: [], // ['San Francisco, CA', 'New York, NY', etc.]
    employmentTypes: [], // ['Full-time', 'Part-time', 'Internship']
    salaryMin: null,
    salaryMax: null,
    remote: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuth();

  // Available options
  const locationTypeOptions = ['Remote', 'Hybrid', 'In-Person'];
  const locationOptions = [
    'San Francisco, CA',
    'New York, NY', 
    'Los Angeles, CA',
    'Seattle, WA',
    'Austin, TX',
    'Chicago, IL',
    'Boston, MA',
    'Denver, CO',
    'Charlotte, NC',
    'Portland, OR',
    'Miami, FL',
    'Dallas, TX',
    'Phoenix, AZ'
  ];
  const employmentTypeOptions = ['Full-time', 'Part-time', 'Internship'];
  const salaryRanges = [
    { label: 'Any Salary', min: null, max: null },
    { label: '$40k - $60k', min: 40000, max: 60000 },
    { label: '$60k - $80k', min: 60000, max: 80000 },
    { label: '$80k - $100k', min: 80000, max: 100000 },
    { label: '$100k - $120k', min: 100000, max: 120000 },
    { label: '$120k - $150k', min: 120000, max: 150000 },
    { label: '$150k+', min: 150000, max: null }
  ];

  // Load preferences from localStorage on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('jobPreferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handleCheckboxChange = (category, value) => {
    setPreferences(prev => {
      const currentArray = prev[category] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return { ...prev, [category]: newArray };
    });
    setIsSaved(false);
  };

  const handleSalaryRangeChange = (range) => {
    setPreferences(prev => ({
      ...prev,
      salaryMin: range.min,
      salaryMax: range.max
    }));
    setIsSaved(false);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save to localStorage for now (in production, save to database)
      localStorage.setItem('jobPreferences', JSON.stringify(preferences));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const resetPreferences = {
      locationTypes: [],
      locations: [],
      employmentTypes: [],
      salaryMin: null,
      salaryMax: null,
      remote: null
    };
    setPreferences(resetPreferences);
    localStorage.removeItem('jobPreferences');
    setIsSaved(false);
  };

  const getCurrentSalaryRange = () => {
    return salaryRanges.find(range => 
      range.min === preferences.salaryMin && range.max === preferences.salaryMax
    ) || salaryRanges[0];
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      {/* Header */}


      <div>
        {/* Location Types */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Work Location Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {locationTypeOptions.map(type => (
              <label key={type} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.locationTypes.includes(type)}
                  onChange={() => handleCheckboxChange('locationTypes', type)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{type}</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {type === 'Remote' && 'Work from anywhere'}
                    {type === 'Hybrid' && 'Mix of office and remote'}
                    {type === 'In-Person' && 'Work from office'}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Preferred Cities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {locationOptions.map(location => (
              <label key={location} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.locations.includes(location)}
                  onChange={() => handleCheckboxChange('locations', location)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-gray-900 dark:text-gray-100">{location}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Employment Types */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Employment Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {employmentTypeOptions.map(type => (
              <label key={type} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.employmentTypes.includes(type)}
                  onChange={() => handleCheckboxChange('employmentTypes', type)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{type}</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {type === 'Full-time' && 'Standard 40+ hours per week'}
                    {type === 'Part-time' && 'Less than 40 hours per week'}
                    {type === 'Internship' && 'Temporary learning position'}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Salary Range */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Salary Range</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {salaryRanges.map((range, index) => (
              <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="salaryRange"
                  checked={range.min === preferences.salaryMin && range.max === preferences.salaryMax}
                  onChange={() => handleSalaryRangeChange(range)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="text-gray-900 dark:text-gray-100">{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Current Preferences Summary */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Current Preferences Summary:</h4>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <p><strong>Location Types:</strong> {preferences.locationTypes.length > 0 ? preferences.locationTypes.join(', ') : 'Any'}</p>
            <p><strong>Cities:</strong> {preferences.locations.length > 0 ? preferences.locations.slice(0, 3).join(', ') + (preferences.locations.length > 3 ? ` +${preferences.locations.length - 3} more` : '') : 'Any'}</p>
            <p><strong>Employment:</strong> {preferences.employmentTypes.length > 0 ? preferences.employmentTypes.join(', ') : 'Any'}</p>
            <p><strong>Salary:</strong> {getCurrentSalaryRange().label}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium"
          >
            Reset All
          </button>
          
          <div className="flex items-center space-x-3">
            {isSaved && (
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                ✓ Preferences saved!
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg font-medium ${
                isLoading 
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white'
              }`}
            >
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPreferences;
