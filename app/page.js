'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">PathFinder</span>
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <ThemeToggle showLabel={false} />
              <div className="hidden md:block">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 bg-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-6xl">P</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            PathFinder
          </h1>
          <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-6">
            AI-Powered Job Matching Platform
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Upload your resume, set your preferences, and let PathFinder discover jobs tailored just for you.
          </p>
        </div>
      </header>

      {/* CTA Section */}
      <main className="bg-white dark:bg-gray-900 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Find Your Perfect Job Today
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto text-base">
            Stop searching, start matching. Our intelligent platform analyzes your skills and experience to connect you with opportunities that truly fit.
          </p>
          <Link 
            href="/login?form=signup" 
            className="inline-block px-8 py-3 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/about-us" className="hover:text-blue-600 dark:hover:text-blue-400">About Us</Link>
          <Link href="/about-ai" className="hover:text-blue-600 dark:hover:text-blue-400">About the AI</Link>
          <span>© PathFinder 2025</span>
        </div>
      </footer>
    </div>
  )
}
