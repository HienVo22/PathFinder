// Comprehensive skills database for job matching
export const SKILLS_DATABASE = [
  // Frontend Technologies
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Svelte',
  'HTML', 'CSS', 'Sass', 'SCSS', 'Less', 'Bootstrap', 'Tailwind CSS',
  'Material-UI', 'Styled Components', 'jQuery', 'Redux', 'MobX', 'Vuex',
  'Next.js', 'Nuxt.js', 'Gatsby', 'Webpack', 'Vite', 'Parcel',
  
  // Backend Technologies
  'Node.js', 'Express', 'Koa', 'Fastify', 'Python', 'Django', 'Flask',
  'FastAPI', 'Java', 'Spring', 'Spring Boot', 'PHP', 'Laravel', 'Symfony',
  'Ruby', 'Ruby on Rails', 'C#', '.NET', 'ASP.NET', 'Go', 'Gin', 'Rust',
  'Actix', 'Scala', 'Play Framework',
  
  // Databases
  'MySQL', 'PostgreSQL', 'SQLite', 'Oracle', 'SQL Server', 'MongoDB',
  'Redis', 'Elasticsearch', 'Cassandra', 'DynamoDB', 'Firebase',
  'Supabase', 'PlanetScale', 'Prisma', 'Sequelize', 'TypeORM',
  
  // Cloud & DevOps
  'AWS', 'Azure', 'Google Cloud Platform', 'GCP', 'Heroku', 'Vercel',
  'Netlify', 'DigitalOcean', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI',
  'GitHub Actions', 'CircleCI', 'Travis CI', 'Terraform', 'Ansible',
  'Chef', 'Puppet', 'Vagrant',
  
  // Mobile Development
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'Java', 'Objective-C',
  'Xamarin', 'Ionic', 'Cordova', 'PhoneGap',
  
  // Data Science & AI
  'Python', 'R', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Scikit-learn',
  'TensorFlow', 'PyTorch', 'Keras', 'OpenCV', 'NLTK', 'spaCy', 'Jupyter',
  'Apache Spark', 'Hadoop', 'Kafka', 'Airflow',
  
  // Version Control & Tools
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN', 'Mercurial',
  'Jira', 'Confluence', 'Slack', 'Discord', 'Figma', 'Adobe XD',
  'Sketch', 'InVision', 'Postman', 'Insomnia',
  
  // Testing
  'Jest', 'Mocha', 'Chai', 'Cypress', 'Selenium', 'Playwright', 'Puppeteer',
  'JUnit', 'TestNG', 'PyTest', 'RSpec', 'PHPUnit',
  
  // Other Technologies
  'GraphQL', 'REST API', 'SOAP', 'WebSocket', 'Socket.io', 'RabbitMQ',
  'Apache', 'Nginx', 'Linux', 'Ubuntu', 'CentOS', 'Windows Server',
  'Microservices', 'Serverless', 'Lambda', 'API Gateway',
  
  // Soft Skills
  'Team Leadership', 'Project Management', 'Agile', 'Scrum', 'Kanban',
  'Problem Solving', 'Communication', 'Mentoring', 'Code Review',
  'Technical Writing', 'Public Speaking'
];

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
