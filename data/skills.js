// Job-focused technical skills database - only skills explicitly mentioned in job listings
export const TECHNICAL_SKILLS = {
  // Core Programming Languages (commonly required in job listings)
  languages: [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++',
    'PHP', 'Ruby', 'Swift', 'Kotlin', 'Go'
  ],
  
  // Frontend Development (key skills in frontend job listings)
  frontend: [
    'React', 'Vue.js', 'Angular', 'HTML', 'CSS',
    'Redux', 'Next.js', 'Webpack', 'Tailwind CSS',
    'Bootstrap', 'Material-UI', 'Sass'
  ],
  
  // Backend Development (common backend requirements)
  backend: [
    'Node.js', 'Express', 'Django', 'Flask', 'FastAPI',
    'Spring Boot', '.NET', 'ASP.NET', 'GraphQL', 'REST API'
  ],
  
  // Database Technologies (frequently required)
  databases: [
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
    'SQL Server', 'Oracle', 'Firebase'
  ],
  
  // Cloud & DevOps (key modern requirements)
  cloudDevOps: [
    'AWS', 'Azure', 'Google Cloud Platform',
    'Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions',
    'Linux', 'Ubuntu', 'CI/CD'
  ],
  
  // Mobile Development (specific to mobile jobs)
  mobile: [
    'React Native', 'Flutter', 'Swift', 'Kotlin',
    'Android SDK', 'iOS SDK'
  ],
  
  // Data Science & ML (for AI/ML positions)
  dataScienceML: [
    'Machine Learning', 'Data Structures and Algorithms', 'Computer Organization',
    'Matrix Algebra', 'System Programming', 'Reinforcement Learning',
    'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Matplotlib',
    'FAISS', 'Computer Science'
  ],
  
  // Testing & Tools (commonly required)
  testing: [
    'Jest', 'Cypress', 'Selenium', 'JUnit',
    'PyTest', 'Mocha', 'Chai'
  ],
  
  // Essential Tools (frequently mentioned)
  tools: [
    'Git', 'GitHub', 'GitLab', 'Jira',
    'Postman', 'VS Code', 'Docker Compose', 'JWT',
    'Jupyter Notebook'
  ],
  
  // Architecture & Patterns (high-value skills)
  architecture: [
    'Microservices', 'Serverless', 'RESTful APIs',
    'WebSocket', 'System Design'
  ]
};

// Convert to flat array for compatibility
export const TECHNICAL_SKILLS_LIST = Object.values(TECHNICAL_SKILLS).flat();

// Soft skills that are valuable in tech roles
export const SOFT_SKILLS = [
  'Leadership', 'Team Leadership', 'Project Management', 'Communication',
  'Problem Solving', 'Critical Thinking', 'Analytical Skills', 'Mentoring',
  'Collaboration', 'Adaptability', 'Time Management', 'Decision Making',
  'Creativity', 'Innovation', 'Strategic Thinking', 'Conflict Resolution',
  'Presentation Skills', 'Technical Writing', 'Code Review', 'Agile', 'Scrum'
];

// Combined skills database
export const SKILLS_DATABASE = [...TECHNICAL_SKILLS_LIST, ...SOFT_SKILLS];

// Skills categorized for better organization
export const SKILLS_CATEGORIES = {
  frontend: [
    'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'HTML', 'CSS',
    'Sass', 'Bootstrap', 'Tailwind CSS', 'Redux', 'Next.js', 'Webpack'
  ],
  backend: [
    'Node.js', 'Express', 'Python', 'Django', 'Flask', 'Java', 'Spring',
    'PHP', 'Laravel', 'Ruby', 'Rails', 'C#', '.NET', 'Go'
  ],
  database: [
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB',
    'Firebase', 'Prisma', 'Sequelize'
  ],
  cloud: [
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions',
    'Terraform', 'Heroku', 'Vercel'
  ],
  mobile: [
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android', 'Xamarin'
  ],
  dataScience: [
    'Python', 'R', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'Scikit-learn',
    'Jupyter', 'Apache Spark'
  ]
};

