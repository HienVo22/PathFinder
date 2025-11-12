import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function AboutAI() {
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
              About Our AI
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Harnessing the Power of AI for Intelligent Job Matching
            </p>
          </header>

          <div className="prose prose-xl text-gray-700 dark:text-gray-300 mx-auto space-y-6">
            <p className="text-lg">
              At Pathfinder, we are committed to providing the most accurate and personalized job recommendations possible. To achieve this, we leverage the advanced capabilities of Llama, a state-of-the-art large language model (LLM).
            </p>
            
            <h2 className="text-3xl font-bold !mt-12 dark:text-gray-100">How It Works</h2>
            <p>
              When you upload your resume and specify your job preferences, our system doesn't just look for simple keyword matches. Instead, it uses Llama to perform a deep, semantic analysis of your skills, experience, and career goals.
            </p>
            <ul className="space-y-4">
              <li><strong>Resume Parsing:</strong> The AI reads and understands the nuances of your resume, identifying not just your listed skills but also the context in which you used them.</li>
              <li><strong>Skill Inference:</strong> It can infer related skills that you might not have explicitly listed, giving you a more comprehensive professional profile.</li>
              <li><strong>Job Description Analysis:</strong> Similarly, it analyzes job descriptions to understand the true requirements and responsibilities beyond the bullet points.</li>
              <li><strong>Intelligent Matching:</strong> By comparing the rich understanding of your profile with its analysis of available jobs, Llama identifies opportunities that are a genuine fit for your career trajectory, not just a keyword match.</li>
            </ul>

            <h2 className="text-3xl font-bold !mt-12 dark:text-gray-100">Why Llama?</h2>
            <p>
              We chose Llama for its exceptional natural language understanding and generation capabilities. This allows us to create a more human-like matching process that considers the subtleties of language and intent, resulting in higher quality recommendations for our users.
            </p>

            <p>
              Our goal is to make your job search smarter, faster, and more effective. With the power of Llama, Pathfinder is your trusted co-pilot in navigating the path to your dream job.
            </p>
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
