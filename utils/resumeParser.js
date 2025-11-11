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
    this.model = 'llama3.2'; // Using llama3.2 (lighter model, good for 8GB RAM)
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
You are an expert AI resume parser. Your task is to extract ALL technical and soft skills mentioned in the resume. Be extremely thorough and comprehensive - extract every skill that is explicitly mentioned or clearly demonstrated.

RESUME TEXT:
${resumeText}

REFERENCE SKILLS LIST (extract skills from this list, but also extract similar/related skills):
${skillsList}

Return ONLY a valid JSON object with this EXACT structure:
{
  "extractedSkills": ["skill1", "skill2", "skill3"],
  "experience": "Brief summary of work experience",
  "education": "Education background", 
  "jobTitles": ["title1", "title2"],
  "companies": ["company1", "company2"],
  "yearsOfExperience": number
}

**CRITICAL: extractedSkills MUST be an array of INDIVIDUAL skill names ONLY.**
❌ WRONG: ["Frameworks & Libraries: React, Node.js, Express", "Tools: Git, Docker"]
✅ CORRECT: ["React", "Node.js", "Express", "Git", "Docker"]

DO NOT group skills into categories. List each skill separately.

COMPREHENSIVE EXTRACTION RULES:

🎯 **SKILLS SECTIONS**: Look for dedicated skills sections with headers like:
- "Skills", "Technical Skills", "Programming Languages", "Technologies"
- "Tools", "Frameworks", "Languages", "Proficiencies", "Competencies"
- "Software", "Platforms", "Databases", "Operating Systems"
- Extract EVERY skill listed in these sections

🔧 **TECHNICAL SKILLS** - Extract from ANY context:
1. **Direct Mentions**: "JavaScript", "Python", "React", "AWS", etc.
2. **Project Descriptions**: "built with X", "using X", "implemented in X"
3. **Work Experience**: "developed X applications", "maintained X systems"
4. **Education/Coursework**: "studied X", "coursework in X", "concentration in X"
5. **Certifications**: "certified in X", "X certification"
6. **Tools & Frameworks**: Any named tools, libraries, frameworks, platforms
7. **Databases**: Any database technologies mentioned
8. **Cloud Platforms**: AWS, Azure, GCP, etc.
9. **Programming Languages**: Including versions (Java 8, Python 3, etc.)
10. **Development Tools**: IDEs, version control, testing frameworks

👥 **SOFT SKILLS** - Extract when demonstrated:
1. **Leadership**: "led", "managed team", "supervised", "mentored"
2. **Communication**: "presented", "collaborated", "coordinated"
3. **Problem Solving**: "solved", "debugged", "optimized", "troubleshot"
4. **Project Management**: "managed projects", "planned", "delivered"
5. **Analytical**: "analyzed", "evaluated", "researched"

🔄 **SKILL VARIATIONS** - Normalize these common abbreviations:
- JS, Javascript → JavaScript
- TS → TypeScript  
- Node, NodeJS → Node.js
- ReactJS, React.js → React
- VueJS, Vue → Vue.js
- Postgres → PostgreSQL
- Mongo → MongoDB
- ML → Machine Learning
- AI → Artificial Intelligence
- C++ → C++
- C# → C#
- AWS → AWS
- GCP → Google Cloud Platform
- K8s → Kubernetes
- Docker Compose → Docker
- REST APIs → REST API
- GraphQL → GraphQL

📋 **EXTRACTION EXAMPLES**:
✅ "Skills: JavaScript, Python, React, Node.js, MongoDB" → extract all 5
✅ "Built a web application using React and TypeScript" → extract React, TypeScript
✅ "Experience with AWS, Docker, and Kubernetes" → extract all 3
✅ "Proficient in C++, Java, and Python programming" → extract all 3
✅ "Database: MySQL, PostgreSQL, Redis" → extract all 3
✅ "Led a team of 5 developers" → extract Leadership
✅ "Coursework: Data Structures, Machine Learning" → extract both
✅ "Managed project timelines and deliverables" → extract Project Management

🚫 **AVOID**:
- Company names (Google, Microsoft, Apple) unless they're technologies
- Generic terms without technical context
- Inferring skills not explicitly mentioned

**BE EXTREMELY THOROUGH**: Extract every single skill mentioned anywhere in the resume. If someone lists "JavaScript, Python, React, Node.js, MongoDB, AWS, Docker" in a skills section, extract ALL of them. If they mention using C++ in a project, extract C++. If they say they have experience with machine learning, extract Machine Learning.

Return ONLY the JSON object.
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

      console.log('🤖 Ollama Raw Response (first 500 chars):', response.response.substring(0, 500));

      // Parse the JSON response
      const cleanedResponse = this.cleanJsonResponse(response.response);
      const parsedData = JSON.parse(cleanedResponse);

      console.log('📊 AI Extracted Skills (before validation):', parsedData.extractedSkills);
      console.log('📊 Total skills extracted by AI:', parsedData.extractedSkills?.length || 0);

      // Validate and clean the extracted skills
      parsedData.extractedSkills = this.validateSkills(parsedData.extractedSkills);

      // Remove duplicates
      parsedData.extractedSkills = [...new Set(parsedData.extractedSkills)];

      console.log('✅ AI Extracted Skills (after validation):', parsedData.extractedSkills);
      console.log('✅ Total validated skills (after dedup):', parsedData.extractedSkills.length);

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

    const validatedSkills = [];
    const rejected = [];

    extractedSkills.forEach(skill => {
      const normalizedSkill = this.normalizeSkill(skill);
      
      // Check if skill exists in database (exact match)
      if (SKILLS_DATABASE.includes(normalizedSkill)) {
        validatedSkills.push(normalizedSkill);
      } 
      // Check if skill exists in database (case-insensitive)
      else {
        const matchedSkill = SKILLS_DATABASE.find(dbSkill => 
          dbSkill.toLowerCase() === normalizedSkill.toLowerCase()
        );
        if (matchedSkill) {
          validatedSkills.push(matchedSkill);
        } 
        // Check if it's a valid technical skill (even if not in database)
        else if (this.isLikelyTechnicalSkill(skill)) {
          validatedSkills.push(normalizedSkill);
        } else {
          rejected.push(skill);
        }
      }
    });

    console.log('🚫 Rejected skills (not in database):', rejected);

    return validatedSkills;
  }

  /**
   * Check if a skill is likely a valid technical skill
   * @param {string} skill - Skill to check
   * @returns {boolean} True if likely a technical skill
   */
  isLikelyTechnicalSkill(skill) {
    // Allow skills that look like technical terms
    const technicalPatterns = [
      /^[A-Z][a-zA-Z0-9]*(\.[a-z]+)?$/, // React, Node.js, Vue.js
      /^[A-Z][a-zA-Z0-9]*\s*(\/|\+|#).*$/, // C++, C#, HTML/CSS
      /^[a-zA-Z]+\s+\d+(\.\d+)?$/, // Java 8, Python 3
      /^[A-Z]{2,}$/, // AWS, GCP, AI, ML, CI, CD
    ];

    // Check if skill matches technical patterns
    return technicalPatterns.some(pattern => pattern.test(skill)) && 
           skill.length >= 2 && 
           skill.length <= 50;
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
   * Parse resume with AI - requires Ollama to be running
   * @param {string} resumeText - Extracted text from resume
   * @returns {Promise<Object>} Parsed resume data
   * @throws {Error} If Ollama is not available
   */
  async parseResumeWithFallback(resumeText) {
    // Check if Ollama is healthy first
    const isHealthy = await this.checkOllamaHealth();
    if (!isHealthy) {
      throw new Error('AI_NOT_AVAILABLE: Ollama service is not running. Please start Ollama with "ollama serve" to enable AI-powered resume parsing.');
    }

    // Try AI parsing
    return await this.parseResume(resumeText);
  }

  /**
   * Enhanced fallback parsing using comprehensive skill detection
   * @param {string} resumeText - Extracted text from resume
   * @returns {Object} Basic parsed data
   */
  fallbackParsing(resumeText) {
    const lowerText = resumeText.toLowerCase();
    const originalText = resumeText;
    const foundSkills = [];

    // First, extract skills from dedicated skills sections
    const skillsSectionSkills = this.extractFromSkillsSections(originalText);
    foundSkills.push(...skillsSectionSkills);

    // Then, search for skills throughout the document
    SKILLS_DATABASE.forEach(skill => {
      const skillLower = skill.toLowerCase();
      const isSoftSkill = SOFT_SKILLS.includes(skill);
      
      // Skip if already found in skills section
      if (foundSkills.includes(skill)) return;
      
      if (isSoftSkill) {
        // Soft skills extraction with action words
        const softSkillPatterns = [
          `\\b${this.escapeRegex(skillLower)}\\b`,
          `${this.escapeRegex(skillLower)} skills?`,
          `${this.escapeRegex(skillLower)} experience`,
          `strong ${this.escapeRegex(skillLower)}`,
          `excellent ${this.escapeRegex(skillLower)}`,
          // Action-based patterns
          `led`, `managed?`, `mentored?`, `collaborated?`, 
          `communicated?`, `presented?`, `organized?`, `coordinated?`,
          `supervised`, `guided`, `facilitated`, `coached`
        ];
        
        for (const pattern of softSkillPatterns) {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(lowerText)) {
            foundSkills.push(this.normalizeSkill(skill));
            break;
          }
        }
      } else {
        // Technical skills extraction - comprehensive patterns
        let skillFound = false;
        
        // Check skill variations first (handles C++, C#, etc.)
        const skillVariations = this.getSkillVariations(skill);
        for (const variation of skillVariations) {
          if (this.findSkillInText(lowerText, variation.toLowerCase(), skill)) {
            foundSkills.push(this.normalizeSkill(skill));
            skillFound = true;
            break;
          }
        }
        
        // Check main skill name if not found in variations
        if (!skillFound && this.findSkillInText(lowerText, skillLower, skill)) {
          foundSkills.push(this.normalizeSkill(skill));
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
   * Extract skills from dedicated skills sections
   * @param {string} text - Resume text
   * @returns {Array} Array of found skills
   */
  extractFromSkillsSections(text) {
    const foundSkills = [];
    const lines = text.split('\n');
    
    // Skills section headers to look for (more comprehensive)
    const skillsHeaders = [
      /^skills?:?$/i,
      /^technical skills?:?$/i,
      /^programming languages?:?$/i,
      /^technologies?:?$/i,
      /^tools?:?$/i,
      /^frameworks?:?$/i,
      /^languages?:?$/i,
      /^proficiencies:?$/i,
      /^competencies:?$/i,
      /^software:?$/i,
      /^platforms?:?$/i,
      /^databases?:?$/i,
      /^core competencies:?$/i,
      /^technical competencies:?$/i,
      /^relevant skills?:?$/i,
      /^frameworks?\s*(&|and)\s*libraries:?$/i,
      /^programming\s*languages?:?$/i,
      /^tools?\s*(&|and)\s*technologies:?$/i,
      /^technical\s*tools?:?$/i
    ];

    let inSkillsSection = false;
    let skillsSectionContent = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this line is a skills section header
      const isSkillsHeader = skillsHeaders.some(header => header.test(line));
      
      if (isSkillsHeader) {
        inSkillsSection = true;
        skillsSectionContent = '';
        continue;
      }
      
      // If we're in a skills section
      if (inSkillsSection) {
        // Check if we've reached a new section (usually starts with capital letter and ends with colon)
        if (line.match(/^[A-Z][^:]*:$/) && !skillsHeaders.some(h => h.test(line))) {
          inSkillsSection = false;
          break;
        }
        
        // Add line to skills content
        if (line) {
          skillsSectionContent += line + ' ';
        }
        
        // Stop if we hit an empty line followed by a new section
        if (!line && i + 1 < lines.length && lines[i + 1].trim().match(/^[A-Z]/)) {
          inSkillsSection = false;
          break;
        }
      }
    }

    // Parse the skills section content
    if (skillsSectionContent) {
      // Split by common delimiters (commas, semicolons, bullets, slashes, pipes, newlines)
      const skillsText = skillsSectionContent.toLowerCase();
      const potentialSkills = skillsText
        .split(/[,;•·\n\r\t\|\/]+/)
        .map(s => s.trim())
        .map(s => s.replace(/^[-–—]\s*/, '')) // Remove leading dashes
        .map(s => s.replace(/^[•◦▪▫]\s*/, '')) // Remove bullets
        .filter(s => s.length > 1);

      console.log(`Found ${potentialSkills.length} potential skills in skills section:`, potentialSkills.slice(0, 20));

      // Match against our skills database
      SKILLS_DATABASE.forEach(skill => {
        const skillLower = skill.toLowerCase();
        const skillVariations = [skillLower, ...this.getSkillVariations(skill).map(v => v.toLowerCase())];
        
        for (const variation of skillVariations) {
          // Check for exact matches or if the potential skill contains the variation
          const found = potentialSkills.some(ps => {
            // Exact match
            if (ps === variation) return true;
            // Potential skill contains the variation (e.g., "html/css" contains "html")
            if (ps.includes(variation)) {
              // Make sure it's a word boundary match
              const regex = new RegExp(`\\b${this.escapeRegex(variation)}\\b`, 'i');
              return regex.test(ps);
            }
            // Variation contains potential skill (e.g., "javascript" matches "js")
            if (variation.includes(ps) && ps.length >= 2) {
              return variation === ps;
            }
            return false;
          });
          
          if (found) {
            foundSkills.push(this.normalizeSkill(skill));
            break;
          }
        }
      });
      
      console.log(`Extracted ${foundSkills.length} skills from skills section`);
    }

    return foundSkills;
  }

  /**
   * Find a skill in text using comprehensive patterns
   * @param {string} text - Text to search in
   * @param {string} skillLower - Skill name in lowercase
   * @param {string} originalSkill - Original skill name
   * @returns {boolean} True if skill found
   */
  findSkillInText(text, skillLower, originalSkill) {
    const escapedSkill = this.escapeRegex(skillLower);
    
    const patterns = [
      // Direct mentions
      `\\b${escapedSkill}\\b`,
      // Experience contexts
      `experience with ${escapedSkill}`,
      `proficient in ${escapedSkill}`,
      `skilled in ${escapedSkill}`,
      `using ${escapedSkill}`,
      `worked with ${escapedSkill}`,
      `knowledge of ${escapedSkill}`,
      `familiar with ${escapedSkill}`,
      // Development contexts
      `${escapedSkill} development`,
      `${escapedSkill} programming`,
      `${escapedSkill} application`,
      `${escapedSkill} project`,
      `programming in ${escapedSkill}`,
      `developed in ${escapedSkill}`,
      `coded in ${escapedSkill}`,
      `built with ${escapedSkill}`,
      `implemented using ${escapedSkill}`,
      `created with ${escapedSkill}`,
      `utilized ${escapedSkill}`,
      // List contexts (common in skills sections)
      `${escapedSkill}[,;\\s]`,
      `[,;\\s]${escapedSkill}`,
      // Education contexts
      `coursework.*${escapedSkill}`,
      `studied ${escapedSkill}`,
      `concentration.*${escapedSkill}`,
      `certified in ${escapedSkill}`
    ];
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(text)) {
        // For ambiguous terms, validate context
        if (!this.isAmbiguousTerm(originalSkill) || this.isValidSkillContext(text, skillLower)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Escape special regex characters
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeRegex(str) {
    return str.replace(/[+\-\[\]{}()*?.,\\^$|#\s]/g, '\\$&');
  }

  /**
   * Normalize skill names to handle common abbreviations and misspellings
   * @param {string} skill - Raw skill name
   * @returns {string} Normalized skill name
   */
  normalizeSkill(skill) {
    const normalizations = {
      // Programming Languages
      'js': 'JavaScript',
      'javascript': 'JavaScript',
      'ecmascript': 'JavaScript',
      'es6': 'JavaScript',
      'es2015': 'JavaScript',
      'ts': 'TypeScript',
      'typescript': 'TypeScript',
      'py': 'Python',
      'python3': 'Python',
      'cpp': 'C++',
      'c plus plus': 'C++',
      'c-sharp': 'C#',
      'csharp': 'C#',
      'c sharp': 'C#',
      'golang': 'Go',
      'go lang': 'Go',
      
      // Frontend
      'reactjs': 'React',
      'react.js': 'React',
      'vuejs': 'Vue.js',
      'vue': 'Vue.js',
      'angularjs': 'Angular',
      'angular.js': 'Angular',
      'nextjs': 'Next.js',
      'next': 'Next.js',
      'jquery': 'jQuery',
      
      // Backend
      'nodejs': 'Node.js',
      'node': 'Node.js',
      'expressjs': 'Express',
      'express.js': 'Express',
      'dotnet': '.NET',
      '.net core': '.NET',
      'aspnet': 'ASP.NET',
      'asp.net core': 'ASP.NET',
      
      // Databases
      'postgres': 'PostgreSQL',
      'psql': 'PostgreSQL',
      'mongo': 'MongoDB',
      'mongodb': 'MongoDB',
      'mysql': 'MySQL',
      'my sql': 'MySQL',
      'sqlserver': 'SQL Server',
      'ms sql': 'SQL Server',
      'microsoft sql': 'SQL Server',
      
      // Cloud
      'amazon web services': 'AWS',
      'amazon aws': 'AWS',
      'microsoft azure': 'Azure',
      'azure cloud': 'Azure',
      'gcp': 'Google Cloud Platform',
      'google cloud': 'Google Cloud Platform',
      'gcloud': 'Google Cloud Platform',
      
      // DevOps
      'k8s': 'Kubernetes',
      'github': 'GitHub',
      'git hub': 'GitHub',
      'gitlab': 'GitLab',
      'git lab': 'GitLab',
      
      // Data Science
      'ml': 'Machine Learning',
      'machine learning': 'Machine Learning',
      'ai': 'Artificial Intelligence',
      'artificial intelligence': 'Artificial Intelligence',
      'tensorflow': 'TensorFlow',
      'tf': 'TensorFlow',
      'pytorch': 'PyTorch',
      'torch': 'PyTorch',
      'sklearn': 'Scikit-learn',
      'scikit learn': 'Scikit-learn',
      'numpy': 'NumPy',
      'pandas': 'Pandas',
      
      // Mobile
      'react native': 'React Native',
      'rn': 'React Native',
      'react-native': 'React Native',
      
      // Styling
      'css3': 'CSS',
      'html5': 'HTML',
      'scss': 'Sass',
      'tailwindcss': 'Tailwind CSS',
      'tailwind': 'Tailwind CSS',
      
      // Other
      'restful api': 'REST API',
      'rest apis': 'REST API',
      'restful apis': 'REST API',
      'graphql': 'GraphQL',
      'graph ql': 'GraphQL',
      'websocket': 'WebSocket',
      'web socket': 'WebSocket',
      'json web token': 'JWT',
      'json web tokens': 'JWT'
    };

    const skillLower = skill.toLowerCase().trim();
    return normalizations[skillLower] || skill;
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
      // Programming Languages
      'JavaScript': ['JS', 'Javascript', 'ECMAScript', 'ES6', 'ES2015', 'ES2020', 'ES2021'],
      'TypeScript': ['TS', 'Typescript'],
      'Python': ['Python3', 'Python 3', 'Py'],
      'Java': ['Java 8', 'Java 11', 'Java 17', 'OpenJDK'],
      'C++': ['C plus plus', 'Cpp', 'CPP', 'c++'],
      'C#': ['C-sharp', 'CSharp', 'C sharp', 'c#'],
      'C': ['C programming', 'C language'],
      'PHP': ['PHP7', 'PHP8'],
      'Ruby': ['Ruby on Rails', 'RoR'],
      'Go': ['Golang', 'Go lang'],
      'Rust': ['Rust lang'],
      'Swift': ['Swift 5', 'SwiftUI'],
      'Kotlin': ['Kotlin/JVM'],
      'Scala': ['Scala 2', 'Scala 3'],
      'R': ['R programming', 'R language'],
      
      // Frontend Frameworks/Libraries
      'React': ['ReactJS', 'React.js', 'React Native'],
      'Vue.js': ['Vue', 'VueJS', 'vue.js', 'Vue 3'],
      'Angular': ['AngularJS', 'Angular.js', 'Angular 2+'],
      'Next.js': ['NextJS', 'Next'],
      'Svelte': ['SvelteKit'],
      'jQuery': ['JQuery'],
      
      // Backend Frameworks
      'Node.js': ['Node', 'NodeJS', 'node.js', 'Express.js'],
      'Django': ['Django REST'],
      'Flask': ['Flask-RESTful'],
      'FastAPI': ['Fast API'],
      'Spring Boot': ['Spring', 'Spring Framework'],
      'ASP.NET': ['ASP.Net', 'ASPNET', 'ASP.NET Core'],
      '.NET': ['DotNet', 'Dotnet', '.NET Core', '.NET 5', '.NET 6'],
      'Express': ['Express.js', 'ExpressJS'],
      
      // Databases
      'PostgreSQL': ['Postgres', 'PostreSQL', 'psql'],
      'MySQL': ['My SQL'],
      'MongoDB': ['Mongo', 'Mongo DB'],
      'Redis': ['Redis Cache'],
      'SQL Server': ['SQLServer', 'MS SQL', 'Microsoft SQL'],
      'Oracle': ['Oracle DB'],
      'SQLite': ['SQLite3'],
      
      // Cloud Platforms
      'AWS': ['Amazon Web Services', 'Amazon AWS'],
      'Azure': ['Microsoft Azure', 'Azure Cloud'],
      'Google Cloud Platform': ['GCP', 'Google Cloud', 'GCloud'],
      'Firebase': ['Google Firebase'],
      
      // DevOps/Tools
      'Docker': ['Docker Compose', 'Containerization'],
      'Kubernetes': ['K8s', 'K8S'],
      'Jenkins': ['Jenkins CI/CD'],
      'GitHub': ['Github', 'Git Hub'],
      'GitLab': ['Git Lab'],
      'Git': ['Version Control'],
      
      // Testing
      'Jest': ['Jest.js'],
      'Cypress': ['Cypress.io'],
      'Selenium': ['Selenium WebDriver'],
      'JUnit': ['JUnit 5'],
      'PyTest': ['pytest'],
      
      // Data Science/ML
      'Machine Learning': ['ML', 'Machine learning'],
      'Artificial Intelligence': ['AI', 'Artificial intelligence'],
      'TensorFlow': ['Tensorflow', 'TF'],
      'PyTorch': ['Pytorch', 'Torch'],
      'Scikit-learn': ['sklearn', 'scikit learn'],
      'Pandas': ['pandas'],
      'NumPy': ['numpy'],
      'Matplotlib': ['matplotlib'],
      'Apache Spark': ['Spark', 'PySpark'],
      
      // Mobile
      'React Native': ['RN', 'React-Native'],
      'Flutter': ['Dart Flutter'],
      'Android': ['Android SDK', 'Android Development'],
      'iOS': ['iOS SDK', 'iOS Development'],
      
      // Styling/CSS
      'CSS': ['CSS3', 'Cascading Style Sheets'],
      'HTML': ['HTML5', 'HyperText Markup Language'],
      'Sass': ['SCSS'],
      'Tailwind CSS': ['TailwindCSS', 'Tailwind'],
      'Bootstrap': ['Bootstrap 4', 'Bootstrap 5'],
      
      // Other
      'REST API': ['RESTful API', 'REST APIs', 'RESTful APIs'],
      'GraphQL': ['Graph QL'],
      'WebSocket': ['Web Socket', 'Socket.io'],
      'JWT': ['JSON Web Token', 'JSON Web Tokens'],
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
