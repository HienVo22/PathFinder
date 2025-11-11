import { NextResponse } from 'next/server';
import { SKILLS_DATABASE } from '../../../../data/skills';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract parameters from query string
    const query = searchParams.get('query') || 'software developer';
    const location = searchParams.get('location') || '';
    const page = searchParams.get('page') || '1';
    const numPages = searchParams.get('num_pages') || '10';
    const employmentTypes = searchParams.get('employment_types') || '';
    const remoteJobsOnly = searchParams.get('remote_jobs_only') || 'false';
    
    // Check if we have API credentials
    if (!process.env.RAPIDAPI_KEY) {
      console.error('RAPIDAPI_KEY not found in environment variables');
      return NextResponse.json({ 
        success: false,
        error: 'API credentials not configured',
        message: 'RAPIDAPI_KEY environment variable is missing'
      }, { status: 500 });
    }

    // Build JSearch API request
    const params = new URLSearchParams({
      query: query,
      page: page,
      num_pages: numPages,
    });

    if (location) params.append('location', location);
    if (employmentTypes) params.append('employment_types', employmentTypes);
    if (remoteJobsOnly === 'true') params.append('remote_jobs_only', 'true');

    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com'
      }
    };

    console.log('Making JSearch API request:', `https://${process.env.RAPIDAPI_HOST}/search?${params.toString()}`);

    const response = await fetch(
      `https://${process.env.RAPIDAPI_HOST}/search?${params.toString()}`,
      options
    );

    console.log('JSearch API response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('JSearch API error response:', errorText);
      
      // If rate limited, return mock data in development
      if (response.status === 429) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Rate limited - returning mock JSearch data for development');
          return getMockJSearchResponse(query, location);
        }
        return NextResponse.json({ 
          success: false,
          error: 'Rate limit exceeded',
          message: 'JSearch API rate limit exceeded. Please try again later.',
          rateLimited: true
        }, { status: 429 });
      }
      
      throw new Error(`JSearch API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('JSearch API returned', data.data?.length || 0, 'jobs');
    
    // Transform JSearch response to match your job format
    const jobs = (data.data || []).map((job) => ({
      // Basic Info
      id: job.job_id || `jsearch-${Math.random()}`,
      title: job.job_title,
      company: job.employer_name,
      companyLogo: job.employer_logo,
      
      // Location
      location: job.job_city && job.job_state 
        ? `${job.job_city}, ${job.job_state}` 
        : job.job_country || 'Location not specified',
      locationType: job.job_is_remote ? 'Remote' : (job.job_employment_type?.includes('hybrid') ? 'Hybrid' : 'On-site'),
      remote: job.job_is_remote || false,
      
      // Employment
      type: job.job_employment_type || 'Full-time',
      salary: job.job_min_salary && job.job_max_salary
        ? `$${job.job_min_salary.toLocaleString()} - $${job.job_max_salary.toLocaleString()}`
        : job.job_salary_period ? `Salary: ${job.job_salary_period}` : 'Salary not specified',
      
      // Description & Details
      description: job.job_description || '',
      highlights: {
        responsibilities: job.job_highlights?.Responsibilities || [],
        qualifications: job.job_highlights?.Qualifications || [],
        benefits: job.job_highlights?.Benefits || []
      },
      
      // Skills (extracted from description and qualifications)
      requiredSkills: extractSkillsFromText(
        job.job_description + ' ' + 
        (job.job_highlights?.Qualifications || []).join(' ')
      ),
      preferredSkills: extractSkillsFromText(
        (job.job_highlights?.Responsibilities || []).join(' ')
      ),
      
      // Additional Info
      posted: job.job_posted_at_datetime_utc || job.job_posted_at_timestamp || new Date().toISOString(),
      postedDisplay: job.job_posted_at_timestamp 
        ? getTimeAgo(job.job_posted_at_timestamp) 
        : 'Recently posted',
      applyLink: job.job_apply_link,
      jobLink: job.job_google_link || job.job_apply_link,
      benefits: job.job_benefits || [],
      
      // Publisher Info
      publisher: job.job_publisher,
      
      // Experience Level
      experienceLevel: extractExperienceLevel(job.job_title + ' ' + job.job_description),
      
      // Raw data for future use
      rawData: {
        minSalary: job.job_min_salary,
        maxSalary: job.job_max_salary,
        salaryPeriod: job.job_salary_period,
        salaryCurrency: job.job_salary_currency,
        employerWebsite: job.employer_website,
        employerCompanyType: job.employer_company_type,
        jobOnetSoc: job.job_onet_soc,
        jobOnetJobZone: job.job_onet_job_zone
      }
    }));

    return NextResponse.json({ 
      success: true,
      jobs, 
      total: jobs.length,
      query,
      page: parseInt(page),
      hasMore: data.data && data.data.length === 10
    });
    
  } catch (error) {
    console.error('JSearch API error:', error);
    
    // If we're in development and hit rate limits, return mock data
    if (process.env.NODE_ENV === 'development' && (error.message.includes('429') || error.message.includes('Too Many Requests'))) {
      console.log('🔄 Returning mock JSearch data for development (rate limited)');
      return getMockJSearchResponse(query, location);
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch jobs from JSearch API',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// Mock JSearch response for development when rate limited
function getMockJSearchResponse(query, location) {
  const mockJobs = [
    {
      job_id: 'mock-1',
      job_title: 'Senior Software Engineer',
      employer_name: 'OpenAI',
      employer_logo: null,
      job_city: 'San Francisco',
      job_state: 'CA',
      job_country: 'US',
      job_is_remote: false,
      job_employment_type: 'Full-time',
      job_min_salary: 180000,
      job_max_salary: 250000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_description: 'We are looking for a Senior Software Engineer to join our team building the future of AI. You will work on cutting-edge machine learning systems, develop scalable backend services, and collaborate with world-class researchers. Requirements include 5+ years of software engineering experience, proficiency in Python, JavaScript, and React, experience with distributed systems, and knowledge of machine learning frameworks like PyTorch or TensorFlow.',
      job_highlights: {
        Qualifications: [
          '5+ years of software engineering experience',
          'Proficiency in Python, JavaScript, and React',
          'Experience with distributed systems and microservices',
          'Knowledge of machine learning frameworks (PyTorch, TensorFlow)',
          'Strong problem-solving and communication skills'
        ],
        Responsibilities: [
          'Design and implement scalable backend services',
          'Develop user-facing applications using React and TypeScript',
          'Collaborate with ML researchers on model deployment',
          'Optimize system performance and reliability',
          'Mentor junior engineers and contribute to technical decisions'
        ],
        Benefits: [
          'Competitive salary and equity package',
          'Comprehensive health, dental, and vision insurance',
          'Flexible work arrangements and unlimited PTO',
          'Learning and development budget',
          'State-of-the-art equipment and workspace'
        ]
      },
      job_posted_at_timestamp: Date.now() / 1000 - 86400 * 2, // 2 days ago
      job_posted_at_datetime_utc: new Date(Date.now() - 86400 * 2 * 1000).toISOString(),
      job_apply_link: 'https://openai.com/careers',
      job_google_link: 'https://www.google.com/search?q=openai+software+engineer+jobs',
      job_publisher: 'OpenAI Careers'
    },
    {
      job_id: 'mock-2',
      job_title: 'Full Stack Developer',
      employer_name: 'Meta',
      employer_logo: null,
      job_city: 'Menlo Park',
      job_state: 'CA',
      job_country: 'US',
      job_is_remote: true,
      job_employment_type: 'Full-time',
      job_min_salary: 150000,
      job_max_salary: 200000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_description: 'Join Meta as a Full Stack Developer working on products used by billions of people worldwide. You will build scalable web applications, work with React, Node.js, and GraphQL, and contribute to our mission of connecting the world. We are looking for someone with experience in modern web technologies, database design, and API development.',
      job_highlights: {
        Qualifications: [
          '3+ years of full stack development experience',
          'Proficiency in React, Node.js, and TypeScript',
          'Experience with GraphQL and REST APIs',
          'Knowledge of database design (PostgreSQL, MongoDB)',
          'Familiarity with cloud platforms (AWS, GCP)'
        ],
        Responsibilities: [
          'Develop and maintain web applications using React and Node.js',
          'Design and implement RESTful APIs and GraphQL schemas',
          'Collaborate with product managers and designers',
          'Write clean, maintainable, and well-tested code',
          'Participate in code reviews and technical discussions'
        ],
        Benefits: [
          'Competitive compensation and RSUs',
          'Health, dental, and vision coverage',
          'Remote work flexibility',
          'Professional development opportunities',
          'Wellness and fitness benefits'
        ]
      },
      job_posted_at_timestamp: Date.now() / 1000 - 86400 * 5, // 5 days ago
      job_posted_at_datetime_utc: new Date(Date.now() - 86400 * 5 * 1000).toISOString(),
      job_apply_link: 'https://www.metacareers.com',
      job_google_link: 'https://www.google.com/search?q=meta+full+stack+developer+jobs',
      job_publisher: 'Meta Careers'
    },
    {
      job_id: 'mock-3',
      job_title: 'Software Engineer - Infrastructure',
      employer_name: 'Google',
      employer_logo: null,
      job_city: 'Mountain View',
      job_state: 'CA',
      job_country: 'US',
      job_is_remote: false,
      job_employment_type: 'Full-time',
      job_min_salary: 160000,
      job_max_salary: 220000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_description: 'Google is seeking a Software Engineer to work on infrastructure systems that power our global services. You will design and build distributed systems, work with cutting-edge technologies, and solve complex scalability challenges. This role requires expertise in system design, proficiency in Go or Java, and experience with Kubernetes and cloud technologies.',
      job_highlights: {
        Qualifications: [
          'BS/MS in Computer Science or equivalent experience',
          'Strong programming skills in Go, Java, or Python',
          'Experience with distributed systems and microservices',
          'Knowledge of Kubernetes, Docker, and cloud platforms',
          'Understanding of system design and scalability principles'
        ],
        Responsibilities: [
          'Design and implement large-scale distributed systems',
          'Build and maintain infrastructure services and tools',
          'Optimize system performance and reliability',
          'Collaborate with teams across Google on infrastructure needs',
          'Participate in on-call rotation and incident response'
        ],
        Benefits: [
          'Industry-leading compensation and stock options',
          'Comprehensive health and wellness benefits',
          'Flexible work arrangements',
          'Learning and development programs',
          'Access to cutting-edge technology and resources'
        ]
      },
      job_posted_at_timestamp: Date.now() / 1000 - 86400 * 1, // 1 day ago
      job_posted_at_datetime_utc: new Date(Date.now() - 86400 * 1 * 1000).toISOString(),
      job_apply_link: 'https://careers.google.com',
      job_google_link: 'https://www.google.com/search?q=google+software+engineer+infrastructure+jobs',
      job_publisher: 'Google Careers'
    }
  ];

  // Transform mock data using the same logic as real JSearch data
  const jobs = mockJobs.map((job) => ({
    // Basic Info
    id: job.job_id,
    title: job.job_title,
    company: job.employer_name,
    companyLogo: job.employer_logo,
    
    // Location
    location: job.job_city && job.job_state 
      ? `${job.job_city}, ${job.job_state}` 
      : job.job_country || 'Location not specified',
    locationType: job.job_is_remote ? 'Remote' : 'On-site',
    remote: job.job_is_remote || false,
    
    // Employment
    type: job.job_employment_type || 'Full-time',
    salary: job.job_min_salary && job.job_max_salary
      ? `$${job.job_min_salary.toLocaleString()} - $${job.job_max_salary.toLocaleString()}`
      : 'Salary not specified',
    
    // Description & Details
    description: job.job_description || '',
    highlights: {
      responsibilities: job.job_highlights?.Responsibilities || [],
      qualifications: job.job_highlights?.Qualifications || [],
      benefits: job.job_highlights?.Benefits || []
    },
    
    // Skills (extracted from description and qualifications)
    requiredSkills: extractSkillsFromText(
      job.job_description + ' ' + 
      (job.job_highlights?.Qualifications || []).join(' ')
    ),
    preferredSkills: extractSkillsFromText(
      (job.job_highlights?.Responsibilities || []).join(' ')
    ),
    
    // Additional Info
    posted: job.job_posted_at_datetime_utc || new Date().toISOString(),
    postedDisplay: getTimeAgo(job.job_posted_at_timestamp),
    applyLink: job.job_apply_link,
    jobLink: job.job_google_link || job.job_apply_link,
    benefits: job.job_highlights?.Benefits || [],
    
    // Publisher Info
    publisher: job.job_publisher,
    
    // Experience Level
    experienceLevel: extractExperienceLevel(job.job_title + ' ' + job.job_description),
    
    // Raw data for future use
    rawData: {
      minSalary: job.job_min_salary,
      maxSalary: job.job_max_salary,
      salaryPeriod: job.job_salary_period,
      salaryCurrency: job.job_salary_currency
    }
  }));

  return NextResponse.json({ 
    success: true,
    jobs, 
    total: jobs.length,
    query,
    page: 1,
    hasMore: false,
    mockData: true // Flag to indicate this is mock data
  });
}

// Helper function to extract skills from job text
function extractSkillsFromText(text) {
  if (!text) return [];
  
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'TypeScript', 'Go', 'C++',
    'SQL', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'GraphQL',
    'REST API', 'Git', 'Linux', 'Machine Learning', 'TensorFlow', 'PyTorch',
    'HTML', 'CSS', 'Vue.js', 'Angular', 'Express.js', 'Django', 'Flask',
    'Redis', 'Elasticsearch', 'Microservices', 'System Design', 'Agile'
  ];
  
  const foundSkills = [];
  const textLower = text.toLowerCase();
  
  commonSkills.forEach(skill => {
    if (textLower.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  
  return foundSkills;
}

// Helper function to extract experience level
function extractExperienceLevel(text) {
  if (!text) return 'Not specified';
  
  const textLower = text.toLowerCase();
  
  if (textLower.includes('senior') || textLower.includes('lead') || textLower.includes('principal')) {
    return 'Senior level';
  } else if (textLower.includes('junior') || textLower.includes('entry') || textLower.includes('associate')) {
    return 'Entry level';
  } else if (textLower.includes('mid') || textLower.includes('intermediate')) {
    return 'Mid level';
  }
  
  return 'Not specified';
}

// Helper function to get time ago display
function getTimeAgo(timestamp) {
  if (!timestamp) return 'Recently posted';
  
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  const days = Math.floor(diff / 86400);
  
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

