import { Ollama } from 'ollama';
import { SKILLS_DATABASE } from '../data/skills.js';

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
You are an AI technical resume parser specialized in extracting technical skills. Analyze the following resume text and extract structured information with a focus on technical skills.

RESUME TEXT:
${resumeText}

AVAILABLE TECHNICAL SKILLS LIST:
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

CRITICAL TECHNICAL SKILLS EXTRACTION INSTRUCTIONS:
1. PRIORITY: Focus heavily on extracting ALL technical skills mentioned in the resume
2. Look for programming languages, frameworks, libraries, tools, databases, cloud platforms, etc.
3. Check for skills in these sections: Technical Skills, Skills, Technologies, Tools, Programming Languages, Frameworks, Experience descriptions, Project descriptions
4. For "extractedSkills": Include ALL technical skills found that exist in the provided skills list
5. Be thorough - look for skills mentioned in context like "experience with Python", "proficient in React", "used AWS", "worked with MongoDB", etc.
6. Match skills exactly as they appear in the skills list (case-sensitive)
7. Don't miss variations like "JS" for "JavaScript", "Node" for "Node.js" - use the exact match from the skills list
8. Include both explicitly listed skills AND skills mentioned in project/work descriptions
9. For "experience": Provide a 2-3 sentence summary focusing on technical experience
10. For "education": Include degrees, institutions, relevant technical coursework
11. For "jobTitles": Extract all job titles/positions held
12. For "companies": Extract all company names worked at
13. For "yearsOfExperience": Estimate total years of professional/technical experience as a number
14. Return ONLY the JSON object, no additional text or explanations
15. If information is not found, use empty array [] for arrays, empty string "" for strings, and 0 for numbers

EXAMPLES OF SKILL EXTRACTION:
- "Proficient in Python and Django" → extract "Python", "Django"
- "Built React applications using Redux" → extract "React", "Redux"  
- "Experience with AWS, Docker, and Kubernetes" → extract "AWS", "Docker", "Kubernetes"
- "Database experience: MySQL, PostgreSQL" → extract "MySQL", "PostgreSQL"
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
   * Enhanced fallback parsing using comprehensive keyword matching
   * @param {string} resumeText - Extracted text from resume
   * @returns {Object} Basic parsed data
   */
  fallbackParsing(resumeText) {
    const lowerText = resumeText.toLowerCase();
    const originalText = resumeText;
    const foundSkills = [];

    // Enhanced technical skills extraction with context awareness
    SKILLS_DATABASE.forEach(skill => {
      const skillLower = skill.toLowerCase();
      
      // Direct match
      if (lowerText.includes(skillLower)) {
        foundSkills.push(skill);
        return;
      }
      
      // Check for variations and context
      const skillVariations = this.getSkillVariations(skill);
      for (const variation of skillVariations) {
        if (lowerText.includes(variation.toLowerCase())) {
          foundSkills.push(skill);
          return;
        }
      }
      
      // Context-based matching
      const contextPatterns = [
        `experience with ${skillLower}`,
        `proficient in ${skillLower}`,
        `skilled in ${skillLower}`,
        `using ${skillLower}`,
        `worked with ${skillLower}`,
        `knowledge of ${skillLower}`,
        `familiar with ${skillLower}`,
        `${skillLower} development`,
        `${skillLower} programming`
      ];
      
      for (const pattern of contextPatterns) {
        if (lowerText.includes(pattern)) {
          foundSkills.push(skill);
          return;
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
      'Spring Boot': ['SpringBoot']
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
