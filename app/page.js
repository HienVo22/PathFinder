import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 text-gray-800">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                🧭 Pathfinder
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <p className="text-secondary-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary-600 font-medium hover:underline">
                    Log In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <header className="text-center py-16 px-4">
        <h2 className="text-3xl font-bold text-primary-600 mb-2">🧭 Pathfinder</h2>
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
          Your AI-Powered Career Co-Pilot
        </h1>
        <p className="text-xl text-secondary-700 max-w-3xl mx-auto">
          Upload your resume, set your preferences, and let Pathfinder discover jobs tailored just for you.
        </p>
      </header>

      {/* Image Banner */}
      <div className="w-full h-96 overflow-hidden">
        <img 
          src="https://image.shutterstock.com/image-photo/appealing-woman-engages-conversation-man-260nw-2474018917.jpg" 
          alt="Professional woman in a discussion during an interview" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Call-to-action Banner */}
      <main className="text-center py-16 px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Find Your Perfect Job Today</h2>
        <p className="text-secondary-600 mb-8 max-w-2xl mx-auto">
          Stop searching, start matching. Our intelligent platform analyzes your skills and experience to connect you with opportunities that truly fit.
        </p>
        <Link href="/login?form=signup" className="btn-primary inline-block px-10 py-4 text-lg font-semibold">
          Get Started
        </Link>
      </main>

      <footer className="bg-transparent text-center py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-secondary-600">
          <Link href="/about-us" className="hover:text-primary-600 hover:underline">About Us</Link>
          <Link href="/about-ai" className="hover:text-primary-600 hover:underline">About the AI</Link>
          <span>Pathfinder 2025</span>
        </div>
      </footer>
    </div>
  )
}
