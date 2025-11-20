'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle({ showLabel = false }) {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">
          {darkMode ? 'Dark' : 'Light'}
        </span>
      )}

      <button
        type="button"
        onClick={toggleDarkMode}
        aria-pressed={darkMode}
        aria-label="Toggle dark mode"
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 dark:focus:ring-yellow-400 ${
          darkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600' : 'bg-gradient-to-r from-yellow-400 to-yellow-300'
        }`}
      >
        {/* Sun icon (left) */}
        <span className={`absolute left-2 text-[10px] transition-opacity ${darkMode ? 'opacity-0' : 'opacity-100'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 4.5a.75.75 0 01.75-.75h0a.75.75 0 010 1.5H10.75A.75.75 0 0110 4.5zM10 15.25a.75.75 0 01.75-.75h0a.75.75 0 010 1.5H10.75a.75.75 0 01-.75-.75zM4.5 10a.75.75 0 01-.75-.75v0a.75.75 0 011.5 0V9.25A.75.75 0 014.5 10zM15.25 10a.75.75 0 01-.75-.75v0a.75.75 0 011.5 0V9.25a.75.75 0 01-.75.75zM6.22 6.22a.75.75 0 01-1.06-1.06l0 0a.75.75 0 011.06 1.06zM14.84 14.84a.75.75 0 01-1.06-1.06l0 0a.75.75 0 011.06 1.06zM6.22 13.78a.75.75 0 01-1.06 1.06l0 0a.75.75 0 011.06-1.06zM14.84 5.16a.75.75 0 01-1.06 1.06l0 0a.75.75 0 011.06-1.06zM10 6.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
          </svg>
        </span>

        {/* Moon icon (right) */}
        <span className={`absolute right-2 text-[10px] transition-opacity ${darkMode ? 'opacity-100' : 'opacity-0'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 116.707 2.707a7 7 0 0010.586 10.586z" />
          </svg>
        </span>

        {/* Toggle knob */}
        <span
          className={`relative inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
            darkMode ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
