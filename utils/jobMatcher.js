import { SAMPLE_JOBS } from '../data/jobs.js';

/**
 * Job matching algorithm that compares user skills with job requirements
 */
export class JobMatcher {
  /**
   * Calculate match percentage between user skills and job requirements
   * @param {Array} userSkills - Array of user's skills
   * @param {Object} job - Job object with requiredSkills and preferredSkills
   * @returns {Object} Match analysis
   */
  static calculateJobMatch(userSkills, job) {
    if (!userSkills || !Array.isArray(userSkills) || userSkills.length === 0) {
      return {
        matchPercentage: 0,
        requiredSkillsMatch: 0,
        preferredSkillsMatch: 0,
        matchedRequiredSkills: [],
        matchedPreferredSkills: [],
        missingRequiredSkills: job.requiredSkills || [],
        missingPreferredSkills: job.preferredSkills || [],
        overallScore: 0
      };
    }

    const requiredSkills = job.requiredSkills || [];
    const preferredSkills = job.preferredSkills || [];
    
    // Normalize skills for case-insensitive comparison
    const userSkillsLower = userSkills.map(skill => skill.toLowerCase());
    
    // Calculate required skills match
    const matchedRequiredSkills = requiredSkills.filter(skill => 
      userSkillsLower.includes(skill.toLowerCase())
    );
    const missingRequiredSkills = requiredSkills.filter(skill => 
      !userSkillsLower.includes(skill.toLowerCase())
    );
    
    // Calculate preferred skills match
    const matchedPreferredSkills = preferredSkills.filter(skill => 
      userSkillsLower.includes(skill.toLowerCase())
    );
    const missingPreferredSkills = preferredSkills.filter(skill => 
      !userSkillsLower.includes(skill.toLowerCase())
    );
    
    // Calculate match percentages
    const requiredSkillsMatch = requiredSkills.length > 0 
      ? (matchedRequiredSkills.length / requiredSkills.length) * 100 
      : 100;
      
    const preferredSkillsMatch = preferredSkills.length > 0 
      ? (matchedPreferredSkills.length / preferredSkills.length) * 100 
      : 100;
    
    // Overall match percentage (weighted: 70% required, 30% preferred)
    const matchPercentage = (requiredSkillsMatch * 0.7) + (preferredSkillsMatch * 0.3);
    
    // Calculate overall score considering both match percentage and absolute skill coverage
    const totalSkillsRequired = requiredSkills.length + preferredSkills.length;
    const totalSkillsMatched = matchedRequiredSkills.length + matchedPreferredSkills.length;
    const skillCoverageBonus = totalSkillsRequired > 0 ? (totalSkillsMatched / totalSkillsRequired) * 20 : 0;
    
    const overallScore = Math.min(100, matchPercentage + skillCoverageBonus);

    return {
      matchPercentage: Math.round(matchPercentage),
      requiredSkillsMatch: Math.round(requiredSkillsMatch),
      preferredSkillsMatch: Math.round(preferredSkillsMatch),
      matchedRequiredSkills,
      matchedPreferredSkills,
      missingRequiredSkills,
      missingPreferredSkills,
      overallScore: Math.round(overallScore),
      totalRequiredSkills: requiredSkills.length,
      totalPreferredSkills: preferredSkills.length,
      totalMatchedSkills: matchedRequiredSkills.length + matchedPreferredSkills.length
    };
  }

  /**
   * Get all jobs with match analysis sorted by match percentage
   * @param {Array} userSkills - Array of user's skills
   * @param {Object} filters - Optional filters (location, jobType, etc.)
   * @returns {Promise<Array>} Array of jobs with match analysis, sorted by match percentage
   */
  static async getJobMatches(userSkills, filters = {}) {
    // Fetch jobs from JSearch API
    let jobs = [];
    try {
      const params = new URLSearchParams();
      
      // Build search query from filters
      const query = filters.query || filters.jobTitle || 'software developer';
      params.append('query', query);
      
      if (filters.location && filters.location !== 'any') {
        params.append('location', filters.location);
      }
      
      if (filters.remoteOnly) {
        params.append('remote_jobs_only', 'true');
      }
      
      const response = await fetch(`/api/jobs/search?${params.toString()}`);
      const data = await response.json();
      
      if (data.success && data.jobs) {
        jobs = data.jobs;
        if (data.mockData) {
          console.log('🔄 Using mock JSearch data (rate limited):', jobs.length, 'jobs');
        } else {
          console.log('✅ Successfully fetched', jobs.length, 'jobs from JSearch API');
        }
      } else {
        console.error('❌ Failed to fetch jobs from JSearch API:', data.error);
        if (data.rateLimited) {
          console.warn('⚠️ JSearch API rate limit exceeded, using sample jobs');
        } else if (data.message?.includes('RAPIDAPI_KEY')) {
          console.error('🔑 API credentials not configured properly');
        }
        // Fallback to sample jobs if API fails
        jobs = [...SAMPLE_JOBS];
        console.log('📋 Using', jobs.length, 'sample jobs as fallback');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Fallback to sample jobs on error
      jobs = [...SAMPLE_JOBS];
    }
    
    // Normalize new preferences structure
    const pref = {
      locations: Array.isArray(filters.locations) ? filters.locations : (filters.location ? [filters.location] : []),
      locationTypes: Array.isArray(filters.locationTypes) ? filters.locationTypes : [],
      employmentTypes: Array.isArray(filters.employmentTypes) ? filters.employmentTypes : (filters.jobType ? [filters.jobType] : []),
      desiredPay: filters.desiredPay || null,
      minSalary: filters.minSalary || null
    };

    // Apply location filter (supports multiple)
    if (pref.locations.length > 0 && !(pref.locations.length === 1 && pref.locations[0] === 'any')) {
      jobs = jobs.filter(job => 
        pref.locations.some(loc => {
          const locLower = String(loc).toLowerCase();
          if (locLower === 'remote') return job.remote === true || (job.locationType && job.locationType.toLowerCase() === 'remote');
          return job.location.toLowerCase().includes(locLower);
        })
      );
    }
    
    // Apply location types (On-site, Hybrid, Remote)
    if (pref.locationTypes.length > 0) {
      jobs = jobs.filter(job => {
        const jobType = (job.locationType || (job.remote ? 'Remote' : 'In-Person')).toLowerCase();
        return pref.locationTypes.some(t => jobType === t.toLowerCase());
      });
    }

    // Employment types
    if (pref.employmentTypes.length > 0) {
      jobs = jobs.filter(job => 
        pref.employmentTypes.some(t => job.type.toLowerCase() === String(t).toLowerCase())
      );
    }
    
    // Desired pay / min salary parsing
    const parseMinPay = (pay) => {
      if (!pay) return null;
      const match = String(pay).match(/\$?\s*(\d{2,3})(?:[, ]?(\d{3}))?/); // rough parse like 80,000
      if (match) {
        return parseInt((match[1] || '0') + (match[2] || '000'));
      }
      return null;
    };

    const effectiveMinSalary = parseMinPay(pref.desiredPay) || pref.minSalary || null;

    if (effectiveMinSalary) {
      jobs = jobs.filter(job => {
        const salaryMatch = job.salary.match(/\$(\d+),?(\d+)?/);
        if (salaryMatch) {
          const minJobSalary = parseInt(salaryMatch[1] + (salaryMatch[2] || '000'));
          return minJobSalary >= effectiveMinSalary;
        }
        return true;
      });
    }
    
    // Calculate matches and sort
    const jobsWithMatches = jobs.map(job => ({
      ...job,
      matchAnalysis: this.calculateJobMatch(userSkills, job)
    }));
    
    // Sort by overall score (descending)
    return jobsWithMatches.sort((a, b) => b.matchAnalysis.overallScore - a.matchAnalysis.overallScore);
  }

  /**
   * Get skill gap analysis for career development
   * @param {Array} userSkills - Array of user's skills
   * @param {number} topN - Number of top jobs to analyze (default: 10)
   * @returns {Promise<Object>} Skill gap analysis
   */
  static async getSkillGapAnalysis(userSkills, topN = 10, precomputedMatches = null) {
    const allJobs = Array.isArray(precomputedMatches) && precomputedMatches.length
      ? precomputedMatches
      : await this.getJobMatches(userSkills);
    const topJobs = allJobs.slice(0, topN);
    
    // Count frequency of missing skills across top jobs
    const skillGaps = {};
    const skillImportance = {};
    
    topJobs.forEach(job => {
      const { missingRequiredSkills, missingPreferredSkills } = job.matchAnalysis;
      
      // Required skills have higher weight
      missingRequiredSkills.forEach(skill => {
        skillGaps[skill] = (skillGaps[skill] || 0) + 2; // Weight: 2 for required
        skillImportance[skill] = 'required';
      });
      
      // Preferred skills have lower weight
      missingPreferredSkills.forEach(skill => {
        skillGaps[skill] = (skillGaps[skill] || 0) + 1; // Weight: 1 for preferred
        if (!skillImportance[skill]) {
          skillImportance[skill] = 'preferred';
        }
      });
    });
    
    // Sort skills by frequency/importance
    const sortedSkillGaps = Object.entries(skillGaps)
      .sort(([,a], [,b]) => b - a)
      .map(([skill, frequency]) => ({
        skill,
        frequency,
        importance: skillImportance[skill],
        opportunityCount: Math.floor(frequency / (skillImportance[skill] === 'required' ? 2 : 1))
      }));
    
    return {
      topMissingSkills: sortedSkillGaps.slice(0, 10),
      totalJobsAnalyzed: topJobs.length,
      averageMatchPercentage: topJobs.reduce((sum, job) => sum + job.matchAnalysis.matchPercentage, 0) / topJobs.length,
      recommendations: this.generateSkillRecommendations(sortedSkillGaps.slice(0, 5))
    };
  }

  /**
   * Generate learning recommendations based on skill gaps
   * @param {Array} topSkillGaps - Top missing skills
   * @returns {Array} Learning recommendations
   */
  static generateSkillRecommendations(topSkillGaps) {
    const learningPaths = {
      // Frontend
      'React': 'Learn modern React development with hooks, context, and component patterns',
      'Vue.js': 'Master Vue.js for building interactive user interfaces',
      'Angular': 'Develop expertise in Angular framework and TypeScript',
      'TypeScript': 'Add type safety to JavaScript projects with TypeScript',
      'Tailwind CSS': 'Learn utility-first CSS framework for rapid UI development',
      
      // Backend
      'Node.js': 'Build server-side applications with Node.js and Express',
      'Python': 'Learn Python for backend development, data science, and automation',
      'Django': 'Master Django framework for rapid web development',
      'Express': 'Build REST APIs and web servers with Express.js',
      
      // Databases
      'MongoDB': 'Learn NoSQL database design and operations with MongoDB',
      'PostgreSQL': 'Master relational database design and advanced SQL queries',
      'Redis': 'Implement caching and session management with Redis',
      
      // Cloud & DevOps
      'AWS': 'Get cloud computing skills with Amazon Web Services',
      'Docker': 'Learn containerization for consistent development and deployment',
      'Kubernetes': 'Master container orchestration and microservices deployment',
      
      // Tools
      'Git': 'Essential version control skills for software development',
      'Jenkins': 'Automate CI/CD pipelines with Jenkins',
      'Terraform': 'Learn infrastructure as code with Terraform'
    };
    
    return topSkillGaps.map(({ skill, frequency, importance, opportunityCount }) => ({
      skill,
      priority: importance === 'required' ? 'high' : 'medium',
      impact: `Could unlock ${opportunityCount} additional job opportunities`,
      learningPath: learningPaths[skill] || `Develop expertise in ${skill}`,
      estimatedLearningTime: this.estimateLearningTime(skill),
      resources: this.getLearningResources(skill)
    }));
  }

  /**
   * Estimate learning time for a skill
   * @param {string} skill - Skill name
   * @returns {string} Estimated learning time
   */
  static estimateLearningTime(skill) {
    const timeEstimates = {
      // Programming Languages
      'JavaScript': '4-8 weeks',
      'Python': '6-10 weeks',
      'TypeScript': '2-4 weeks',
      'Java': '8-12 weeks',
      
      // Frameworks
      'React': '4-6 weeks',
      'Vue.js': '3-5 weeks',
      'Angular': '6-8 weeks',
      'Django': '4-6 weeks',
      'Express': '2-4 weeks',
      
      // Databases
      'MongoDB': '2-3 weeks',
      'PostgreSQL': '3-5 weeks',
      'Redis': '1-2 weeks',
      
      // Cloud & DevOps
      'AWS': '6-10 weeks',
      'Docker': '2-4 weeks',
      'Kubernetes': '4-8 weeks',
      
      // Tools
      'Git': '1-2 weeks',
      'Jenkins': '2-3 weeks'
    };
    
    return timeEstimates[skill] || '2-6 weeks';
  }

  /**
   * Get learning resources for a skill
   * @param {string} skill - Skill name
   * @returns {Array} Learning resources
   */
  static getLearningResources(skill) {
    const resources = {
      'React': ['React Official Docs', 'freeCodeCamp React Course', 'React Patterns'],
      'Python': ['Python.org Tutorial', 'Automate the Boring Stuff', 'Python Crash Course'],
      'Node.js': ['Node.js Docs', 'Node.js Design Patterns', 'Express.js Guide'],
      'AWS': ['AWS Free Tier', 'AWS Certified Developer Course', 'AWS Documentation'],
      'Docker': ['Docker Official Tutorial', 'Docker Mastery Course', 'Play with Docker'],
      'MongoDB': ['MongoDB University', 'MongoDB Docs', 'MongoDB Atlas Tutorial']
    };
    
    return resources[skill] || ['Official Documentation', 'Online Tutorials', 'Practice Projects'];
  }

  /**
   * Get personalized job recommendations based on user profile
   * @param {Array} userSkills - User's skills
   * @param {Object} userPreferences - User preferences (location, jobType, etc.)
   * @param {number} limit - Number of recommendations to return
   * @returns {Promise<Array>} Personalized job recommendations
   */
  static async getPersonalizedRecommendations(userSkills, userPreferences = {}, limit = 5) {
    const matches = await this.getJobMatches(userSkills, userPreferences);
    
    return matches.slice(0, limit).map(job => ({
      ...job,
      recommendationReason: this.generateRecommendationReason(job.matchAnalysis),
      nextSteps: this.generateNextSteps(job.matchAnalysis)
    }));
  }

  /**
   * Generate recommendation reason for a job
   * @param {Object} matchAnalysis - Match analysis object
   * @returns {string} Recommendation reason
   */
  static generateRecommendationReason(matchAnalysis) {
    const { matchPercentage, matchedRequiredSkills, matchedPreferredSkills, totalRequiredSkills } = matchAnalysis;
    
    if (matchPercentage >= 80) {
      return `Excellent match! You have ${matchedRequiredSkills.length}/${totalRequiredSkills} required skills.`;
    } else if (matchPercentage >= 60) {
      return `Good match with room to grow. Strong foundation in ${matchedRequiredSkills.length} core skills.`;
    } else if (matchPercentage >= 40) {
      return `Potential opportunity. You have ${matchedRequiredSkills.length} required skills to build upon.`;
    } else {
      return `Growth opportunity. Consider developing the missing skills for future applications.`;
    }
  }

  /**
   * Generate next steps for a job application
   * @param {Object} matchAnalysis - Match analysis object
   * @returns {Array} Next steps
   */
  static generateNextSteps(matchAnalysis) {
    const { matchPercentage, missingRequiredSkills, missingPreferredSkills } = matchAnalysis;
    const steps = [];
    
    if (matchPercentage >= 70) {
      steps.push('Apply now - strong candidate profile');
      if (missingPreferredSkills.length > 0) {
        steps.push(`Consider learning: ${missingPreferredSkills.slice(0, 2).join(', ')}`);
      }
    } else if (matchPercentage >= 50) {
      if (missingRequiredSkills.length <= 2) {
        steps.push(`Learn ${missingRequiredSkills[0]} to become a strong candidate`);
        steps.push('Apply after gaining missing required skills');
      } else {
        steps.push('Focus on building required skills first');
      }
    } else {
      steps.push('Develop core skills before applying');
      if (missingRequiredSkills.length > 0) {
        steps.push(`Priority skills: ${missingRequiredSkills.slice(0, 3).join(', ')}`);
      }
    }
    
    return steps;
  }
}