import { SKILLS_DATABASE } from '../data/skills';

/**
 * Extract skills from resume text using simple keyword matching
 * @param {string} resumeText - The resume text content
 * @returns {string[]} Array of found skills
 */
export const extractSkillsFromResume = (resumeText) => {
  if (!resumeText || typeof resumeText !== 'string') {
    return [];
  }
  
  const foundSkills = new Set();
  const resumeTextLower = resumeText.toLowerCase();
  
  // Simple keyword matching
  SKILLS_DATABASE.forEach(skill => {
    const skillLower = skill.toLowerCase();
    
    // Check for exact matches and common variations
    if (resumeTextLower.includes(skillLower) ||
        resumeTextLower.includes(skillLower.replace('.', '')) ||
        resumeTextLower.includes(skillLower.replace(' ', '')) ||
        resumeTextLower.includes(skillLower.replace('-', ''))) {
      foundSkills.add(skill);
    }
  });
  
  return Array.from(foundSkills).sort();
};

/**
 * Extract skills from resume text with better pattern matching
 * @param {string} resumeText - The resume text content
 * @returns {Object} Object with skills and confidence scores
 */
export const extractSkillsAdvanced = (resumeText) => {
  if (!resumeText || typeof resumeText !== 'string') {
    return { skills: [], confidence: 'low' };
  }
  
  const foundSkills = new Map(); // skill -> confidence score
  const resumeTextLower = resumeText.toLowerCase();
  
  SKILLS_DATABASE.forEach(skill => {
    const skillLower = skill.toLowerCase();
    let confidence = 0;
    
    // Exact match (highest confidence)
    if (resumeTextLower.includes(` ${skillLower} `) || 
        resumeTextLower.includes(`\n${skillLower}\n`) ||
        resumeTextLower.includes(`\t${skillLower}\t`)) {
      confidence = 3;
    }
    // Partial match
    else if (resumeTextLower.includes(skillLower)) {
      confidence = 2;
    }
    // Variation match
    else if (resumeTextLower.includes(skillLower.replace('.', '')) ||
             resumeTextLower.includes(skillLower.replace(' ', '')) ||
             resumeTextLower.includes(skillLower.replace('-', ''))) {
      confidence = 1;
    }
    
    if (confidence > 0) {
      foundSkills.set(skill, confidence);
    }
  });
  
  // Sort by confidence and then alphabetically
  const sortedSkills = Array.from(foundSkills.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1]; // Sort by confidence desc
      return a[0].localeCompare(b[0]); // Then alphabetically
    })
    .map(([skill]) => skill);
  
  const overallConfidence = sortedSkills.length > 10 ? 'high' : 
                           sortedSkills.length > 5 ? 'medium' : 'low';
  
  return {
    skills: sortedSkills,
    confidence: overallConfidence,
    totalFound: sortedSkills.length
  };
};

/**
 * Mock user skills for testing without resume upload
 * Different skill sets for different developer types
 */
export const MOCK_USER_PROFILES = {
  frontendDeveloper: [
    "JavaScript", "React", "HTML", "CSS", "Git", "TypeScript", 
    "Redux", "Tailwind CSS", "Webpack", "Jest"
  ],
  backendDeveloper: [
    "Node.js", "Express", "MongoDB", "PostgreSQL", "Docker", 
    "AWS", "Git", "JavaScript", "REST API", "Linux"
  ],
  fullStackDeveloper: [
    "JavaScript", "React", "Node.js", "Express", "MongoDB", 
    "HTML", "CSS", "Git", "AWS", "Docker", "TypeScript"
  ],
  pythonDeveloper: [
    "Python", "Django", "PostgreSQL", "Git", "Linux", "Docker", 
    "Flask", "Redis", "Celery", "AWS"
  ],
  mobileDeveloper: [
    "React Native", "JavaScript", "iOS", "Android", "Git", 
    "TypeScript", "Redux", "Firebase", "REST API"
  ],
  dataScientist: [
    "Python", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", 
    "Jupyter", "SQL", "R", "Git", "Apache Spark"
  ],
  devopsEngineer: [
    "AWS", "Docker", "Kubernetes", "Jenkins", "Linux", "Python", 
    "Terraform", "Ansible", "Git", "Monitoring"
  ]
};

/**
 * Get a mock user profile for testing
 * @param {string} profileType - Type of developer profile
 * @returns {string[]} Array of skills for that profile
 */
export const getMockUserSkills = (profileType = 'fullStackDeveloper') => {
  return MOCK_USER_PROFILES[profileType] || MOCK_USER_PROFILES.fullStackDeveloper;
};

/**
 * Validate and clean user-entered skills
 * @param {string[]} userSkills - Array of user-entered skills
 * @returns {string[]} Cleaned and validated skills array
 */
export const validateUserSkills = (userSkills) => {
  if (!Array.isArray(userSkills)) {
    return [];
  }
  
  const validSkills = [];
  const skillsLower = SKILLS_DATABASE.map(s => s.toLowerCase());
  
  userSkills.forEach(skill => {
    if (typeof skill === 'string' && skill.trim()) {
      const cleanSkill = skill.trim();
      const skillLower = cleanSkill.toLowerCase();
      
      // Check if skill exists in database (case insensitive)
      const matchIndex = skillsLower.indexOf(skillLower);
      if (matchIndex !== -1) {
        // Use the canonical form from database
        validSkills.push(SKILLS_DATABASE[matchIndex]);
      } else {
        // Allow custom skills but clean them up
        validSkills.push(cleanSkill);
      }
    }
  });
  
  // Remove duplicates and sort
  return [...new Set(validSkills)].sort();
};

/**
 * Suggest skills based on partial input (for autocomplete)
 * @param {string} input - Partial skill input
 * @param {number} limit - Maximum number of suggestions
 * @returns {string[]} Array of suggested skills
 */
export const suggestSkills = (input, limit = 10) => {
  if (!input || typeof input !== 'string' || input.length < 2) {
    return [];
  }
  
  const inputLower = input.toLowerCase();
  const suggestions = [];
  
  SKILLS_DATABASE.forEach(skill => {
    const skillLower = skill.toLowerCase();
    if (skillLower.startsWith(inputLower)) {
      suggestions.push({ skill, priority: 2 }); // Starts with - high priority
    } else if (skillLower.includes(inputLower)) {
      suggestions.push({ skill, priority: 1 }); // Contains - lower priority
    }
  });
  
  return suggestions
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.skill.localeCompare(b.skill);
    })
    .slice(0, limit)
    .map(item => item.skill);
};
