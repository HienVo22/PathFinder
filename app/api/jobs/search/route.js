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

    const response = await fetch(
      `https://${process.env.RAPIDAPI_HOST}/search?${params.toString()}`,
      options
    );

    if (!response.ok) {
      throw new Error(`JSearch API error: ${response.statusText}`);
    }

    const data = await response.json();
    
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

// Helper function to extract skills from job text
function extractSkillsFromText(text) {
  if (!text) return [];
  
  const textLower = text.toLowerCase();
  const found = SKILLS_DATABASE.filter(skill => {
    const skillLower = skill.toLowerCase();
    // Use word boundary regex to avoid partial matches
    const regex = new RegExp(`\\b${escapeRegex(skillLower)}\\b`, 'i');
    return regex.test(textLower);
  });
  
  // Remove duplicates and limit to top skills
  return [...new Set(found)].slice(0, 20);
}

// Helper function to escape regex special characters
function escapeRegex(str) {
  return str.replace(/[+\-\[\]{}()*?.,\\^$|#\s]/g, '\\$&');
}

// Helper function to extract experience level from job text
function extractExperienceLevel(text) {
  const textLower = text.toLowerCase();
  
  if (textLower.includes('senior') || textLower.includes('sr.') || textLower.includes('lead')) {
    return 'Senior';
  } else if (textLower.includes('junior') || textLower.includes('jr.') || textLower.includes('entry')) {
    return 'Entry Level';
  } else if (textLower.includes('mid-level') || textLower.includes('intermediate')) {
    return 'Mid Level';
  } else if (textLower.includes('intern') || textLower.includes('internship')) {
    return 'Internship';
  }
  
  return 'Not specified';
}

// Helper function to get time ago string
function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - (timestamp * 1000); // Convert to milliseconds
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));
  
  if (days > 30) return 'Over a month ago';
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

