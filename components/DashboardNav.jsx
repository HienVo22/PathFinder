'use client';

export default function DashboardNav({ activeTab, onChange }) {
  const tabs = [
    { id: 'overview', label: 'Home', icon: '🏠' },
    { id: 'jobs', label: 'Job Matches', icon: '💼' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 mb-6">
      <nav className="flex border-b border-gray-300 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 px-4 py-3 font-medium transition-colors flex items-center justify-center gap-2 border-b-2
              ${activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-700/50'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/30'
              }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="hidden sm:inline text-sm">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
