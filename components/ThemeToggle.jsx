'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle({ showLabel = false }) {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {darkMode ? 'Dark' : 'Light'}
        </span>
      )}
      <button
        onClick={toggleDarkMode}
        className="relative inline-flex h-6 w-11 items-center border border-gray-300 dark:border-gray-600 transition-colors"
        style={{
          backgroundColor: darkMode ? '#3B82F6' : '#E5E7EB',
        }}
        aria-label="Toggle dark mode"
      >
        <span
          className={`inline-block h-4 w-4 transform bg-white transition-transform ${
            darkMode ? 'translate-x-6' : 'translate-x-1'
          }`}
        >
          <span className="flex items-center justify-center h-full w-full text-xs">
            {darkMode ? '🌙' : '☀️'}
          </span>
        </span>
      </button>
    </div>
  );
}
