import { Ollama } from 'ollama';
import { SKILLS_DATABASE, TECHNICAL_SKILLS, SOFT_SKILLS } from '../data/skills.js';

/**
 * Resume parsing service using Ollama
 */
export class ResumeParser {
  constructor() {
    this.ollama = new Ollama({
      host: 'http://localhost:11434', // Default Ollama host
    });
    this.model = 'llama3.2'; // Default model, can be changed
  }

  /**
   * Set the Ollama model to use
   * @param {string} model - Model name (e.g., 'llama3.2', 'mistral', etc.)
   */
  setModel(model) {
    this.model = model;
  }

  /**
   * Parse resume text and extract structured information
   * @param {string} resumeText - Extracted text from resume
   * @returns {Promise<Object>} Parsed resume data
   */
  async parseResume(resumeText) {
    try {
      // Create skills list for the prompt
      const skillsList = SKILLS_DATABASE.join(', ');
      
      const prompt = `
You are an AI resume parser that extracts technical and soft skills from resumes. Be thorough but accurate - extract skills that are clearly demonstrated or mentioned, but don't infer unrelated technologies.

RESUME TEXT:
${resumeText}

ALLOWED SKILLS LIST (ONLY extract skills from this list):
${skillsList}

Please extract and return ONLY a valid JSON object with the following structure:
{
  "extractedSkills": ["skill1", "skill2", "skill3"],
  "experience": "Brief summary of work experience",
  "education": "Education background",
  "jobTitles": ["title1", "title2"],
  "companies": ["company1", "company2"],
  "yearsOfExperience": number
}

COMPREHENSIVE SKILL EXTRACTION RULES:

TECHNICAL SKILLS - Extract when you find:
1. **Direct Usage**: "using X", "with X", "built in X", "developed using X"
2. **Project Context**: "X application", "X development", "X project"
3. **Coursework**: "X course", "X class", "studied X"
4. **Concentrations/Specializations**: "concentration in X", "focus on X"
5. **Tools/Libraries**: Any specifically named tools, libraries, frameworks
6. **Technologies in Project Descriptions**: Technologies mentioned in project details
7. **Academic Context**: Skills from coursework, research, academic projects

SOFT SKILLS - Extract when you find clear evidence:
1. **Leadership**: "led team", "managed", "supervised", "mentored", "guided"
2. **Communication**: "presented", "collaborated", "coordinated", "liaised"
3. **Problem Solving**: "solved", "debugged", "troubleshot", "optimized"
4. **Project Management**: "managed project", "coordinated", "planned", "delivered"
5. **Analytical Skills**: "analyzed", "evaluated", "assessed", "researched"

SKILL VARIATIONS TO RECOGNIZE:
- "JS", "Javascript" → "JavaScript"
- "Node", "NodeJS" → "Node.js"
- "Postgres" → "PostgreSQL"
- "React.js", "ReactJS" → "React"
- "Vue", "VueJS" → "Vue.js"
- "ML" → "Machine Learning"
- "AI" → "Artificial Intelligence"

EXTRACTION EXAMPLES:
✓ "Concentration: Machine Learning" → extract "Machine Learning"
✓ "Coursework: Data Structures and Algorithms" → extract both skills
✓ "Built React applications using TypeScript" → extract "React", "TypeScript"
✓ "Mentored 6 entry developers" → extract "Mentoring"
✓ "Managed project progress" → extract "Project Management"
✓ "Using FAISS for semantic search" → extract "FAISS" (if in allowed list)
✓ "JWT authentication" → extract "JWT" (if in allowed list)

STILL AVOID:
✗ Don't infer platform knowledge (Swift ≠ iOS unless iOS explicitly mentioned)
✗ Don't extract company/product names as skills
✗ Don't extract very generic terms without technical context

Be thorough - academic coursework, research projects, and work experience all count as valid skill sources.

Return ONLY the JSON object, no additional text.
`;

      const response = await this.ollama.generate({
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1, // Low temperature for more consistent results
          top_p: 0.9,
        }
      });

      // Parse the JSON response
      const cleanedResponse = this.cleanJsonResponse(response.response);
      const parsedData = JSON.parse(cleanedResponse);

      // Validate and clean the extracted skills
      parsedData.extractedSkills = this.validateSkills(parsedData.extractedSkills);

      return parsedData;
    } catch (error) {
      console.error('Resume parsing error:', error);
      throw new Error(`Failed to parse resume: ${error.message}`);
    }
  }

  /**
   * Clean the JSON response from Ollama to ensure it's valid JSON
   * @param {string} response - Raw response from Ollama
   * @returns {string} Cleaned JSON string
   */
  cleanJsonResponse(response) {
    // Remove any text before the first {
    const startIndex = response.indexOf('{');
    if (startIndex === -1) {
      throw new Error('No JSON object found in response');
    }
    
    // Find the last }
    const endIndex = response.lastIndexOf('}');
    if (endIndex === -1) {
      throw new Error('Invalid JSON object in response');
    }
    
    return response.substring(startIndex, endIndex + 1);
  }

  /**
   * Validate extracted skills against the skills database
   * @param {Array} extractedSkills - Skills extracted by AI
   * @returns {Array} Validated skills that exist in the database
   */
  validateSkills(extractedSkills) {
    if (!Array.isArray(extractedSkills)) {
      return [];
    }

    return extractedSkills.filter(skill => 
      SKILLS_DATABASE.includes(skill)
    );
  }

  /**
   * Check if Ollama is running and the model is available
   * @returns {Promise<boolean>} True if Ollama is ready
   */
  async checkOllamaHealth() {
    try {
      // Try to list available models
      const models = await this.ollama.list();
      const modelExists = models.models.some(m => m.name.includes(this.model));
      
      if (!modelExists) {
        console.warn(`Model ${this.model} not found. Available models:`, 
          models.models.map(m => m.name));
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Ollama health check failed:', error);
      return false;
    }
  }

  /**
   * Parse resume with fallback handling
   * @param {string} resumeText - Extracted text from resume
   * @returns {Promise<Object>} Parsed resume data with fallback
   */
  async parseResumeWithFallback(resumeText) {
    try {
      // Check if Ollama is healthy first
      const isHealthy = await this.checkOllamaHealth();
      if (!isHealthy) {
        console.warn('Ollama not available, using fallback parsing');
        return this.fallbackParsing(resumeText);
      }

      // Try AI parsing
      return await this.parseResume(resumeText);
    } catch (error) {
      console.error('AI parsing failed, using fallback:', error);
      return this.fallbackParsing(resumeText);
    }
  }

  /**
   * Enhanced fallback parsing using conservative keyword matching
   * @param {string} resumeText - Extracted text from resume
   * @returns {Object} Basic parsed data
   */
  fallbackParsing(resumeText) {
    const lowerText = resumeText.toLowerCase();
    const originalText = resumeText;
    const foundSkills = [];

    // Thorough technical skills and aggressive soft skills extraction
    SKILLS_DATABASE.forEach(skill => {
      const skillLower = skill.toLowerCase();
      const isSoftSkill = SOFT_SKILLS.includes(skill);
      
      if (isSoftSkill) {
        // Aggressive soft skills extraction - look for any mention
        const softSkillPatterns = [
          `\\b${skillLower}\\b`,
          `${skillLower} skills?`,
          `${skillLower} experience`,
          `${skillLower} abilities`,
          `strong ${skillLower}`,
          `excellent ${skillLower}`,
          `led`,
          `managed?`,
          `mentored?`,
          `collaborated?`,
          `communicated?`,
          `presented?`,
          `organized?`,
          `coordinated?`
        ];
        
        for (const pattern of softSkillPatterns) {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(lowerText)) {
            foundSkills.push(skill);
            break;
          }
        }
      } else {
        // Thorough technical skills extraction
        const technicalContextPatterns = [
          // Direct mentions
          `\\b${skillLower}\\b`,
          // Experience contexts
          `experience with ${skillLower}`,
          `proficient in ${skillLower}`,
          `skilled in ${skillLower}`,
          `using ${skillLower}`,
          `worked with ${skillLower}`,
          `knowledge of ${skillLower}`,
          `familiar with ${skillLower}`,
          // Development contexts
          `${skillLower} development`,
          `${skillLower} programming`,
          `${skillLower} framework`,
          `${skillLower} library`,
          `${skillLower} database`,
          `${skillLower} platform`,
          `programming in ${skillLower}`,
          `developed in ${skillLower}`,
          `coded in ${skillLower}`,
          // Project contexts
          `built with ${skillLower}`,
          `implemented using ${skillLower}`,
          `created with ${skillLower}`,
          `utilized ${skillLower}`,
          `employed ${skillLower}`,
          // Technology stack contexts
          `stack.*${skillLower}`,
          `technologies.*${skillLower}`,
          `tools.*${skillLower}`,
          // List contexts
          `${skillLower}[,\\s]`,
          `[,\\s]${skillLower}`,
          // Certification/education contexts
          `certified in ${skillLower}`,
          `trained in ${skillLower}`
        ];
        
        // Check for skill variations first
        const skillVariations = this.getSkillVariations(skill);
        let skillFound = false;
        
        // Check variations
        for (const variation of skillVariations) {
          const variationPattern = new RegExp(`\\b${variation.toLowerCase()}\\b`, 'i');
          if (variationPattern.test(lowerText)) {
            // For technical skills, be more lenient with context validation
            if (!this.isAmbiguousTerm(skill) || this.isValidSkillContext(lowerText, variation.toLowerCase())) {
              foundSkills.push(skill);
              skillFound = true;
              break;
            }
          }
        }
        
        if (!skillFound) {
          // Check main skill name with context patterns
          for (const pattern of technicalContextPatterns) {
            const regex = new RegExp(pattern, 'i');
            if (regex.test(lowerText)) {
              // For technical skills, be more lenient with context validation
              if (!this.isAmbiguousTerm(skill) || this.isValidSkillContext(lowerText, skillLower)) {
                foundSkills.push(skill);
                break;
              }
            }
          }
        }
      }
    });

    // Extract job titles and companies with better regex
    const jobTitles = this.extractJobTitles(originalText);
    const companies = this.extractCompanies(originalText);

    // Estimate years of experience
    const yearsOfExperience = this.estimateYearsOfExperience(originalText);

    // Better experience extraction
    const experience = this.extractTechnicalExperience(originalText);

    // Better education extraction
    const education = this.extractEducation(originalText);

    return {
      extractedSkills: [...new Set(foundSkills)], // Remove duplicates
      experience: experience || 'Technical experience information extracted from resume',
      education: education || 'Education information extracted from resume',
      jobTitles: jobTitles,
      companies: companies,
      yearsOfExperience: yearsOfExperience
    };
  }

  /**
   * Check if a skill term is ambiguous and needs context validation
   * @param {string} skill - Skill to check
   * @returns {boolean} True if skill is ambiguous
   */
  isAmbiguousTerm(skill) {
    const ambiguousTerms = [
      'Go', 'Swift', 'Ruby', 'Scala', 'R',
      'Android', 'iOS', 'Linux', 'Ubuntu', 'CentOS',
      'Hadoop', 'Spark', 'Kubernetes', 'Docker',
      'AWS', 'Azure', 'GCP', 'Firebase'
    ];
    return ambiguousTerms.includes(skill);
  }

  /**
   * Validate if a skill mention is in a valid technical context
   * @param {string} text - Full text to search in
   * @param {string} skill - Skill to validate
   * @returns {boolean} True if skill is in valid context
   */
  isValidSkillContext(text, skill) {
    const skillLower = skill.toLowerCase();
    
    // Define required context patterns for different skill types
    const contextPatterns = {
      // Programming Languages
      'go': ['golang', 'go programming', 'go development', 'go service', 'go api'],
      'swift': ['swift programming', 'swift development', 'swift app', 'developed in swift'],
      'ruby': ['ruby programming', 'ruby development', 'ruby on rails', 'developed in ruby'],
      'scala': ['scala programming', 'scala development', 'apache spark', 'developed in scala'],
      'r': ['r programming', 'r development', 'r statistical', 'r data', 'developed in r'],
      
      // Platforms & Tools
      'android': ['android development', 'android app', 'android sdk', 'android studio'],
      'ios': ['ios development', 'ios app', 'ios sdk', 'ios application'],
      'linux': ['linux server', 'linux system', 'linux administration', 'linux environment'],
      'ubuntu': ['ubuntu server', 'ubuntu system', 'ubuntu configuration'],
      'centos': ['centos server', 'centos system', 'centos configuration'],
      
      // Cloud & Big Data
      'hadoop': ['hadoop cluster', 'hadoop ecosystem', 'hadoop mapreduce'],
      'spark': ['apache spark', 'spark streaming', 'spark processing'],
      'kubernetes': ['kubernetes cluster', 'k8s', 'kubernetes deployment', 'kubernetes orchestration'],
      'docker': ['docker container', 'docker image', 'containerization', 'docker compose'],
      
      // Cloud Platforms
      'aws': ['amazon web services', 'aws cloud', 'aws service', 'aws lambda', 'aws ec2', 'aws s3'],
      'azure': ['microsoft azure', 'azure cloud', 'azure service', 'azure function'],
      'gcp': ['google cloud platform', 'gcp cloud', 'gcp service'],
      'firebase': ['firebase database', 'firebase auth', 'firebase hosting']
    };
    
    // If not an ambiguous term, still require some technical context
    const generalTechnicalContext = [
      'developed', 'implemented', 'built', 'created', 'designed',
      'programmed', 'engineered', 'architected', 'deployed',
      'experience with', 'worked with', 'using', 'utilized'
    ];
    
    // Get surrounding context (100 characters before and after the skill mention)
    const skillIndex = text.toLowerCase().indexOf(skillLower);
    if (skillIndex === -1) return false;
    
    const start = Math.max(0, skillIndex - 100);
    const end = Math.min(text.length, skillIndex + skill.length + 100);
    const context = text.substring(start, end).toLowerCase();
    
    // For ambiguous terms, check for specific required context
    if (contextPatterns[skillLower]) {
      return contextPatterns[skillLower].some(pattern => context.includes(pattern.toLowerCase()));
    }
    
    // For non-ambiguous terms, require at least one technical context indicator
    return generalTechnicalContext.some(keyword => context.includes(keyword.toLowerCase()));
  }

  /**
   * Get skill variations for better matching
   * @param {string} skill - Original skill name
   * @returns {Array} Array of skill variations
   */
  getSkillVariations(skill) {
    const variations = {
      'JavaScript': ['JS', 'Javascript', 'ECMAScript'],
      'TypeScript': ['TS', 'Typescript'],
      'Node.js': ['Node', 'NodeJS', 'node.js'],
      'React': ['ReactJS', 'React.js'],
      'Vue.js': ['Vue', 'VueJS', 'vue.js'],
      'Angular': ['AngularJS', 'Angular.js'],
      'PostgreSQL': ['Postgres', 'PostreSQL'],
      'MongoDB': ['Mongo'],
      'GitHub': ['Github'],
      'TensorFlow': ['Tensorflow'],
      'PyTorch': ['Pytorch'],
      'jQuery': ['JQuery'],
      'CSS': ['CSS3'],
      'HTML': ['HTML5'],
      'C#': ['C-sharp', 'CSharp'],
      'ASP.NET': ['ASP.Net', 'ASPNET'],
      '.NET': ['DotNet', 'Dotnet'],
      'SQL Server': ['SQLServer', 'MS SQL'],
      'Apache Spark': ['Spark'],
      'Spring Boot': ['SpringBoot'],
      'Google Cloud Platform': ['GCP'],
      'Amazon Web Services': ['AWS']
    };
    
    return variations[skill] || [];
  }

  /**
   * Extract job titles from resume text
   * @param {string} text - Resume text
   * @returns {Array} Array of job titles
   */
  extractJobTitles(text) {
    const titlePatterns = [
      /(?:^|\n)\s*([A-Z][A-Za-z\s]+(?:Engineer|Developer|Analyst|Manager|Specialist|Coordinator|Assistant|Intern|Lead|Senior|Junior|Principal|Staff|Director|VP|Chief|Head))\s*(?:\n|$)/gm,
      /(?:Title|Position|Role):\s*([A-Z][A-Za-z\s]+)/gi
    ];
    
    const titles = [];
    titlePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.replace(/^[\s\n]+|[\s\n]+$/g, '').replace(/^(Title|Position|Role):\s*/i, '');
          if (cleaned && cleaned.length > 3 && cleaned.length < 100) {
            titles.push(cleaned);
          }
        });
      }
    });
    
    return [...new Set(titles)];
  }

  /**
   * Extract company names from resume text
   * @param {string} text - Resume text
   * @returns {Array} Array of company names
   */
  extractCompanies(text) {
    const companyPatterns = [
      /(?:Company|Organization|Employer):\s*([A-Z][A-Za-z\s&.,]+)/gi,
      /(?:at|@)\s+([A-Z][A-Za-z\s&.,]{2,50})(?:\s+|$)/g
    ];
    
    const companies = [];
    companyPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.replace(/^(at|@|Company|Organization|Employer):\s*/i, '').trim();
          if (cleaned && cleaned.length > 2 && cleaned.length < 100) {
            companies.push(cleaned);
          }
        });
      }
    });
    
    return [...new Set(companies)];
  }

  /**
   * Estimate years of experience from resume text
   * @param {string} text - Resume text
   * @returns {number} Estimated years of experience
   */
  estimateYearsOfExperience(text) {
    // Look for explicit year mentions
    const yearPatterns = [
      /(\d+)\s*\+?\s*years?\s+(?:of\s+)?experience/gi,
      /(\d+)\s*\+?\s*yrs?\s+(?:of\s+)?experience/gi,
      /experience.*?(\d+)\s*\+?\s*years?/gi
    ];
    
    let maxYears = 0;
    yearPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const years = parseInt(match.match(/\d+/)[0]);
          if (years > maxYears) {
            maxYears = years;
          }
        });
      }
    });
    
    return maxYears;
  }

  /**
   * Extract technical experience summary
   * @param {string} text - Resume text
   * @returns {string} Technical experience summary
   */
  extractTechnicalExperience(text) {
    const experienceKeywords = [
      'experience', 'work experience', 'professional experience',
      'technical experience', 'software development', 'programming',
      'development', 'engineering', 'projects'
    ];
    
    for (const keyword of experienceKeywords) {
      const index = text.toLowerCase().indexOf(keyword);
      if (index !== -1) {
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + 300);
        const excerpt = text.substring(start, end).trim();
        if (excerpt.length > 50) {
          return excerpt.substring(0, 250) + (excerpt.length > 250 ? '...' : '');
        }
      }
    }
    
    return '';
  }

  /**
   * Extract education information
   * @param {string} text - Resume text
   * @returns {string} Education information
   */
  extractEducation(text) {
    const educationKeywords = [
      'education', 'academic', 'degree', 'university', 'college',
      'bachelor', 'master', 'phd', 'doctorate', 'certification'
    ];
    
    for (const keyword of educationKeywords) {
      const index = text.toLowerCase().indexOf(keyword);
      if (index !== -1) {
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + 200);
        const excerpt = text.substring(start, end).trim();
        if (excerpt.length > 20) {
          return excerpt.substring(0, 200) + (excerpt.length > 200 ? '...' : '');
        }
      }
    }
    
    return '';
  }
}
