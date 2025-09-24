import { SAMPLE_JOBS } from '../data/jobs';

/**
 * Calculate job match score based on user skills vs job requirements
 * @param {string[]} userSkills - Array of user's skills
 * @param {Object} job - Job object with requiredSkills and preferredSkills
 * @returns {Object} Match analysis object
 */
export const calculateJobMatch = (userSkills, job) => {
  const requiredSkills = job.requiredSkills.map(s => s.toLowerCase());
  const preferredSkills = job.preferredSkills?.map(s => s.toLowerCase()) || [];
  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  
  // Find matching skills
  const requiredMatches = requiredSkills.filter(skill => 
    userSkillsLower.includes(skill)
  );
  
  const preferredMatches = preferredSkills.filter(skill => 
    userSkillsLower.includes(skill)
  );
  
  // Calculate scores
  const requiredScore = requiredSkills.length > 0 
    ? (requiredMatches.length / requiredSkills.length) * 70 // 70% weight for required
    : 0;
    
  const preferredScore = preferredSkills.length > 0 
    ? (preferredMatches.length / preferredSkills.length) * 30 // 30% weight for preferred
    : 30; // If no preferred skills, give full 30 points
  
  const totalScore = Math.round(requiredScore + preferredScore);
  
  // Find missing skills
  const missingRequired = requiredSkills.filter(skill => 
    !userSkillsLower.includes(skill)
  );
  
  const missingPreferred = preferredSkills.filter(skill => 
    !userSkillsLower.includes(skill)
  );
  
  return {
    score: Math.min(totalScore, 100), // Cap at 100%
    requiredMatches: requiredMatches.length,
    preferredMatches: preferredMatches.length,
    totalRequiredSkills: requiredSkills.length,
    totalPreferredSkills: preferredSkills.length,
    matchedRequiredSkills: requiredMatches,
    matchedPreferredSkills: preferredMatches,
    missingRequiredSkills: missingRequired,
    missingPreferredSkills: missingPreferred,
    isGoodMatch: totalScore >= 60,
    isExcellentMatch: totalScore >= 80
  };
};

/**
 * Find and rank job matches for a user
 * @param {string[]} userSkills - Array of user's skills
 * @param {Object} options - Filtering options
 * @returns {Object[]} Array of jobs with match data, sorted by score
 */
export const findJobMatches = (userSkills, options = {}) => {
  const {
    jobs = SAMPLE_JOBS,
    minScore = 20,
    maxResults = 50,
    remote = null, // true, false, or null for both
    location = null,
    jobType = null, // 'Full-time', 'Internship', or null for both
    datePosted = null, // 'last-week', 'last-month', or null for all
    salaryMin = null,
    salaryMax = null,
    searchQuery = '',
    // New preference-based filters
    locationTypes = null, // ['Remote', 'Hybrid', 'In-Person']
    locations = null, // ['San Francisco, CA', 'New York, NY']
    employmentTypes = null // ['Full-time', 'Part-time', 'Internship']
  } = options;
  
  if (!userSkills || userSkills.length === 0) {
    return [];
  }
  
  let filteredJobs = jobs;
  
  // Apply filters
  if (remote !== null) {
    filteredJobs = filteredJobs.filter(job => job.remote === remote);
  }
  
  if (location) {
    filteredJobs = filteredJobs.filter(job => 
      job.location.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  if (jobType) {
    filteredJobs = filteredJobs.filter(job => job.type === jobType);
  }
  
  // Apply preference-based filters
  if (locationTypes && locationTypes.length > 0) {
    filteredJobs = filteredJobs.filter(job => 
      locationTypes.includes(job.locationType)
    );
  }
  
  if (locations && locations.length > 0) {
    filteredJobs = filteredJobs.filter(job => 
      locations.some(loc => job.location.includes(loc))
    );
  }
  
  if (employmentTypes && employmentTypes.length > 0) {
    filteredJobs = filteredJobs.filter(job => 
      employmentTypes.includes(job.type)
    );
  }
  
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filteredJobs = filteredJobs.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.type.toLowerCase().includes(query)
    );
  }
  
  if (datePosted) {
    const now = new Date();
    const filterDate = new Date();
    
    if (datePosted === 'last-24-hours') {
      filterDate.setDate(now.getDate() - 1);
    } else if (datePosted === 'last-week') {
      filterDate.setDate(now.getDate() - 7);
    } else if (datePosted === 'last-month') {
      filterDate.setMonth(now.getMonth() - 1);
    }
    
    filteredJobs = filteredJobs.filter(job => {
      const jobDate = new Date(job.posted);
      return jobDate >= filterDate;
    });
  }
  
  if (salaryMin !== null || salaryMax !== null) {
    filteredJobs = filteredJobs.filter(job => {
      const salaryStr = job.salary;
      
      // Handle hourly rates for internships
      if (salaryStr.includes('/hour')) {
        const hourlyMatch = salaryStr.match(/\$(\d+)\s*-\s*\$(\d+)\/hour/);
        if (hourlyMatch) {
          const minHourly = parseInt(hourlyMatch[1]);
          const maxHourly = parseInt(hourlyMatch[2]);
          // Convert to rough annual equivalent (assuming 40 hours/week, 50 weeks/year)
          const annualMin = minHourly * 40 * 50;
          const annualMax = maxHourly * 40 * 50;
          
          if (salaryMin !== null && annualMax < salaryMin) return false;
          if (salaryMax !== null && annualMin > salaryMax) return false;
        }
      } else {
        // Handle annual salaries
        const salaryMatch = salaryStr.match(/\$([0-9,]+)\s*-\s*\$([0-9,]+)/);
        if (salaryMatch) {
          const minSalary = parseInt(salaryMatch[1].replace(/,/g, ''));
          const maxSalary = parseInt(salaryMatch[2].replace(/,/g, ''));
          
          if (salaryMin !== null && maxSalary < salaryMin) return false;
          if (salaryMax !== null && minSalary > salaryMax) return false;
        }
      }
      
      return true;
    });
  }
  
  // Calculate matches and sort
  const jobsWithMatches = filteredJobs
    .map(job => ({
      ...job,
      match: calculateJobMatch(userSkills, job)
    }))
    .filter(job => job.match.score >= minScore)
    .sort((a, b) => {
      // Primary sort: match score (descending)
      if (b.match.score !== a.match.score) {
        return b.match.score - a.match.score;
      }
      // Secondary sort: required skills matches (descending)
      if (b.match.requiredMatches !== a.match.requiredMatches) {
        return b.match.requiredMatches - a.match.requiredMatches;
      }
      // Tertiary sort: preferred skills matches (descending)
      return b.match.preferredMatches - a.match.preferredMatches;
    })
    .slice(0, maxResults);
  
  return jobsWithMatches;
};

/**
 * Get match statistics for user's skills
 * @param {string[]} userSkills - Array of user's skills
 * @param {Object[]} jobs - Array of jobs to analyze
 * @returns {Object} Statistics object
 */
export const getMatchStatistics = (userSkills, jobs = SAMPLE_JOBS) => {
  const matches = findJobMatches(userSkills, { jobs, minScore: 0 });
  
  const stats = {
    totalJobs: jobs.length,
    matchingJobs: matches.filter(job => job.match.score >= 20).length,
    goodMatches: matches.filter(job => job.match.isGoodMatch).length,
    excellentMatches: matches.filter(job => job.match.isExcellentMatch).length,
    averageScore: matches.length > 0 
      ? Math.round(matches.reduce((sum, job) => sum + job.match.score, 0) / matches.length)
      : 0,
    topSkills: getTopSkillsInDemand(jobs),
    recommendedSkills: getRecommendedSkills(userSkills, jobs)
  };
  
  return stats;
};

/**
 * Find most in-demand skills across all jobs
 * @param {Object[]} jobs - Array of jobs
 * @returns {Object[]} Array of skills with frequency count
 */
export const getTopSkillsInDemand = (jobs = SAMPLE_JOBS) => {
  const skillCounts = {};
  
  jobs.forEach(job => {
    [...job.requiredSkills, ...(job.preferredSkills || [])].forEach(skill => {
      const skillLower = skill.toLowerCase();
      skillCounts[skillLower] = (skillCounts[skillLower] || 0) + 1;
    });
  });
  
  return Object.entries(skillCounts)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
};

/**
 * Get skill recommendations based on user's current skills and job market
 * @param {string[]} userSkills - Array of user's skills
 * @param {Object[]} jobs - Array of jobs
 * @returns {string[]} Array of recommended skills to learn
 */
export const getRecommendedSkills = (userSkills, jobs = SAMPLE_JOBS) => {
  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  const skillCounts = {};
  
  // Count skills in jobs that match user's existing skills
  const relevantJobs = jobs.filter(job => {
    const jobSkills = [...job.requiredSkills, ...(job.preferredSkills || [])];
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
    
    // Job is relevant if user has at least 1 skill match
    return jobSkillsLower.some(skill => userSkillsLower.includes(skill));
  });
  
  relevantJobs.forEach(job => {
    [...job.requiredSkills, ...(job.preferredSkills || [])].forEach(skill => {
      const skillLower = skill.toLowerCase();
      if (!userSkillsLower.includes(skillLower)) {
        skillCounts[skillLower] = (skillCounts[skillLower] || 0) + 1;
      }
    });
  });
  
  return Object.entries(skillCounts)
    .map(([skill, count]) => skill)
    .sort((a, b) => skillCounts[b] - skillCounts[a])
    .slice(0, 10);
};
