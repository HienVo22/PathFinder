import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function AboutUs() {
  const teamMembers = ["Anjaney", "Hien", "Jubin", "Parker", "Ziad"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <img 
                  src="/pathfinder-logo.svg" 
                  alt="PathFinder Logo" 
                  className="w-8 h-8"
                />
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">Pathfinder</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle showLabel={false} />
              <Link href="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Log In</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-16">
            <h1 className="text-5xl font-extrabold text-gray-900 dark:text-gray-100">
              The Pathfinder Team
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              The innovative minds behind your career co-pilot.
            </p>
          </header>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12 border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">Meet the Team</h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-10">
              We are a dedicated team of students passionate about leveraging technology to solve real-world challenges. Pathfinder was born from our shared vision to make the job search process more intelligent, personal, and effective for everyone.
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              {teamMembers.map((name) => (
                <div key={name} className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">{name.charAt(0)}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{name}</h3>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <Link href="/" className="btn-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
