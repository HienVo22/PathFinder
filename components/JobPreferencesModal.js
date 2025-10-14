'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const JobPreferencesModal = ({ isOpen, onClose, onSave }) => {
  const [jobTitles, setJobTitles] = useState([]);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [locationTypes, setLocationTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState('');
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [desiredPay, setDesiredPay] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  // Load existing preferences from database
  useEffect(() => {
    if (isOpen && user) {
      loadPreferences();
    }
  }, [isOpen, user]);

  const loadPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setJobTitles(data.preferences.jobTitles || []);
          setLocationTypes(data.preferences.locationTypes || []);
          setLocations(data.preferences.locations || []);
          setEmploymentTypes(data.preferences.employmentTypes || []);
          setDesiredPay(data.preferences.desiredPay || '');
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const toggleLocationType = (type) => {
    setLocationTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleEmploymentType = (type) => {
    setEmploymentTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const addJobTitle = () => {
    if (newJobTitle.trim() && !jobTitles.includes(newJobTitle.trim())) {
      setJobTitles([...jobTitles, newJobTitle.trim()]);
      setNewJobTitle('');
    }
  };

  const removeJobTitle = (title) => {
    setJobTitles(jobTitles.filter(t => t !== title));
  };

  const addLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation('');
    }
  };

  const removeLocation = (location) => {
    setLocations(locations.filter(l => l !== location));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const preferences = {
        jobTitles,
        locationTypes,
        locations,
        employmentTypes,
        desiredPay
      };

      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ preferences })
      });

      if (response.ok) {
        if (onSave) {
          onSave(preferences);
        }
        onClose();
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Tell us what kind of work you're open to
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Job Titles */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Job titles<span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {jobTitles.map((title, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-700 text-white rounded-full text-sm mr-2 mb-2"
                >
                  <span>{title}</span>
                  <button
                    onClick={() => removeJobTitle(title)}
                    className="text-white hover:text-gray-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addJobTitle()}
                placeholder="e.g., Software Engineer"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={addJobTitle}
                className="px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 rounded-md border border-green-700"
              >
                + Add title
              </button>
            </div>
          </div>

          {/* Location Types */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Location types<span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {['On-site', 'Hybrid', 'Remote'].map((type) => (
                <button
                  key={type}
                  onClick={() => toggleLocationType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    locationTypes.includes(type)
                      ? 'bg-green-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {locationTypes.includes(type) ? '✓ ' : '+ '}{type}
                </button>
              ))}
            </div>
          </div>

          {/* Locations (on-site) */}
          {(locationTypes.includes('On-site') || locationTypes.includes('Hybrid')) && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Locations (on-site)<span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {locations.map((location, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-700 text-white rounded-full text-sm mr-2 mb-2"
                  >
                    <span>{location}</span>
                    <button
                      onClick={() => removeLocation(location)}
                      className="text-white hover:text-gray-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                  placeholder="e.g., Knoxville, Tennessee, United States"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={addLocation}
                  className="px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 rounded-md border border-green-700"
                >
                  + Add location
                </button>
              </div>
            </div>
          )}

          {/* Employment Types */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Employment types
            </label>
            <div className="flex flex-wrap gap-2">
              {['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'].map((type) => (
                <button
                  key={type}
                  onClick={() => toggleEmploymentType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    employmentTypes.includes(type)
                      ? 'bg-green-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {employmentTypes.includes(type) ? '✓ ' : '+ '}{type}
                </button>
              ))}
            </div>
          </div>

          {/* Desired Pay */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Desired pay (annual salary in USD)
            </label>
            <input
              type="text"
              value={desiredPay}
              onChange={(e) => setDesiredPay(e.target.value)}
              placeholder="e.g., $80,000 - $100,000"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional: Enter your desired salary range
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2 rounded-md font-medium ${
              saving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-700 text-white hover:bg-green-800'
            }`}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobPreferencesModal;

