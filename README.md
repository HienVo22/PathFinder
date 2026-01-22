# Pathfinder

Pathfinder is a full-stack job discovery and resume-based matching project built with Next.js (App Router) and MongoDB. It supports authentication, resume upload, resume parsing, skill extraction, and job search.

## Key features

- Email/password authentication using JWT
- Optional Google sign-in
- Optional LinkedIn OAuth flow (start and callback routes)
- Resume upload (PDF, DOC, DOCX) with validation and storage
  - Saves a copy on disk under `uploads/resumes/`
  - Also stores the resume binary in MongoDB for retrieval
- Background resume processing (resume parsing + AI skill extraction)
- Job search via RapidAPI (JSearch endpoint)
  - Includes development fallback behavior when rate-limited
- User endpoints for skills, preferences, tracked jobs, and profile updates

## Tech stack

- Frontend: Next.js 14, React 18, Tailwind CSS, MUI (Material UI), Emotion
- Backend: Next.js Route Handlers (API routes), JWT, bcryptjs
- Database: MongoDB with Mongoose
- File upload: Multer + local filesystem
- Optional integrations:
  - Google Sign-In: `google-auth-library`
  - LinkedIn OAuth
  - AI skill extraction: Google Gemini API
  - Local AI runtime: Ollama (if installed)

## Requirements

- Node.js 18+ (recommended: latest LTS)
- npm
- A MongoDB instance (Atlas or local) reachable via a connection string

## Setup and run

### 1) Install dependencies

```bash
git clone https://github.com/HienVo22/PathFinder.git
cd PathFinder
npm install
```

### 2) Create `.env.local`

Create a file named `.env.local` in the project root.

Required:

- `MONGODB_URI`: MongoDB connection string (Atlas or local)
- `JWT_SECRET`: secret used to sign and verify JWTs

Optional (only needed if you use these features):

- `MONGODB_DB_NAME`: override database name (otherwise it defaults based on `NODE_ENV`)
- `RAPIDAPI_KEY`: required to enable job search
- `RAPIDAPI_HOST`: defaults to `jsearch.p.rapidapi.com`
- `GEMINI_API_KEY`: required for AI-based skill extraction
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google client ID used by the browser login page
- `GOOGLE_CLIENT_ID`: Google client ID used by the server to verify ID tokens (often the same value)
- `LINKEDIN_CLIENT_ID`: LinkedIn app client ID
- `LINKEDIN_CLIENT_SECRET`: LinkedIn app client secret
- `LINKEDIN_REDIRECT_URI`: callback URL for standard redirects
- `LINKEDIN_POPUP_REDIRECT_URI`: callback URL for popup-based linking

Example (do not copy secrets into git):

```bash
MONGODB_URI="mongodb+srv://USER:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority"
JWT_SECRET="replace-with-a-long-random-string"

# Optional
RAPIDAPI_KEY="your-rapidapi-key"
RAPIDAPI_HOST="jsearch.p.rapidapi.com"
GEMINI_API_KEY="your-gemini-api-key"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_ID="your-google-client-id"
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
LINKEDIN_REDIRECT_URI="http://localhost:3000/api/auth/linkedin/callback"
LINKEDIN_POPUP_REDIRECT_URI="http://localhost:3000/api/auth/linkedin/popup-callback"
```

### 3) Start the app (development)

```bash
npm run dev
```

Then open `http://localhost:3000`.

### Convenience scripts (optional)

These scripts are for starting and stopping the app and optional local services.

macOS / Linux:

```bash
./start-all.sh
./stop-all.sh
```

Windows (PowerShell):

```powershell
.\start-all.ps1
.\stop-all.ps1
```

Notes:

- `start-all.sh` does not start MongoDB for you. Make sure `MONGODB_URI` points to a running MongoDB instance.
- Ollama is optional. If it is not installed, the app can still run, but any features that depend on it may not work.

## Scripts

- `npm run dev`: start the dev server
- `npm run build`: build for production
- `npm run start`: start the production server
- `npm run lint`: run ESLint

## Project structure (high level)

```
app/           Next.js routes, pages, and API route handlers
components/    Shared UI components
contexts/      React contexts (auth, etc.)
lib/           MongoDB connection and PDF parsing utilities
models/        Mongoose models
services/      Background processing services
utils/         Shared helpers
public/        Static assets
uploads/       Local upload storage (created at runtime)
```

## Troubleshooting

- Job search returns "API credentials not configured"
  - Add `RAPIDAPI_KEY` to `.env.local`.
- Google sign-in fails
  - Ensure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (client-side) and `GOOGLE_CLIENT_ID` (server-side) are set correctly.
- Resume upload fails
  - Check that the app can write to `uploads/resumes/`.
  - Confirm the file is PDF/DOC/DOCX and under 10 MB.
- MongoDB connection error at startup
  - Verify `MONGODB_URI` and make sure your database allows connections from your IP.

## License

MIT
# Pathfinder - Job Recommendation Platform

A full-stack web application that uses AI to match users with their perfect job opportunities.

## Features

- User authentication (login/register)
- Resume upload with drag-and-drop support
- Clean, modern UI with Pathfinder branding
- Dashboard for job management
- AI-powered job matching (coming soon)
- One-click job applications (coming soon)

## Tech Stack

- **Frontend**: Next.js 14, React, JavaScript, Tailwind CSS
- **Backend**: Next.js API Routes, JWT Authentication, Multer (file uploads)
- **Database**: MongoDB with Mongoose ODM
- **Storage**: Local file system (with AWS S3 planned)
- **Styling**: Tailwind CSS with custom components

## Team Setup Guide

### Required Tools & Software

#### 1. **Code Editor**
- **VS Code** (Recommended): [Download here](https://code.visualstudio.com/)

#### 2. **Version Control**
- **Git**: [Download here](https://git-scm.com/downloads)
- **GitHub Account**: [Sign up here](https://github.com/)

#### 3. **Node.js & npm**
- **Option A - Using NVM (Recommended for macOS/Linux):**
  ```bash
  # Install NVM
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  
  # Restart terminal or run:
  source ~/.bashrc  # or ~/.zshrc for zsh
  
  # Install latest Node.js
  nvm install --lts
  nvm use --lts
  nvm alias default 'lts/*'
  ```

- **Option B - Direct Download:**
  - Download Node.js (v18+): [https://nodejs.org/](https://nodejs.org/)
  - This includes npm automatically

### Getting Started

#### Step 1: Clone the Repository
```bash
# Clone the project
git clone https://github.com/HienVo22/PathFinder.git
cd PathFinder
```

#### Step 2: Set Up Node.js (if using NVM)
```bash
# Load NVM in current session
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Use the default Node.js version
nvm use default

# Verify installation
node -v  # Should show v22.x.x or similar
npm -v   # Should show v10.x.x or similar
```

#### Step 3: Set Up MongoDB
```bash
# Option A: Install MongoDB locally via Homebrew (macOS)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community

# Option B: Use MongoDB Atlas (Cloud - Recommended)
# 1. Sign up at https://www.mongodb.com/atlas
# 2. Create a free cluster
# 3. Get your connection string
```

#### Step 3.1: Install MongoDB Compass (Optional but Recommended)
```bash
# Install MongoDB Compass for database management
brew install --cask mongodb-compass

# Launch MongoDB Compass
open -a "MongoDB Compass"
```
**Note**: Connect to `mongodb://localhost:27017` in Compass to view your local database.

#### Step 4: Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your settings:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: A secure random string
```

#### Step 5: Install Dependencies
```bash
npm install
```

#### Step 6: Start All Services

**Option 1 - Using the start script (Recommended):**
```bash
# Make sure you're in the PathFinder directory
./start-all.sh
```

**Option 2 - Manual start (portable commands for any computer):**
```bash
# Navigate to your PathFinder directory first
cd /path/to/PathFinder

# Start MongoDB (uses relative path)
mongod --dbpath data/db_new --port 27017 > /dev/null 2>&1 &

# Start Ollama
ollama serve > /dev/null 2>&1 &

# Start Next.js
npm run dev
```

#### Step 7: View the Application
- Open your browser
- Go to: **http://localhost:3000** (or http://localhost:3001 if 3000 is busy)
- You should see the Pathfinder login page!

#### Step 8: Stop All Services
```bash
./stop-all.sh
```

### Testing the Application

#### Create a New Account
1. Go to the homepage
2. Click "Create Account" 
3. Fill in your details and register
4. You'll be redirected to the dashboard

#### Resume Upload Feature
1. Once logged in, you'll see a resume upload area on the dashboard
2. **Drag and drop** a PDF, DOC, or DOCX file onto the upload area
3. **Or click "Choose File"** to browse and select your resume
4. Watch the progress bar as your file uploads
5. Your resume will be stored and associated with your account

#### Testing with MongoDB Compass
1. Open MongoDB Compass and connect to `mongodb://localhost:27017`
2. Navigate to the `pathfinder` database
3. View the `users` collection to see registered accounts
4. Check the `uploads/resumes/` folder in your project directory for uploaded files
5. Verify that user documents contain resume file references

### Troubleshooting

#### "npm: command not found"
```bash
# Run these commands in your terminal:
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use default
```

#### Port Already in Use
- The app will automatically try port 3001 if 3000 is busy
- Or manually specify a port: `PORT=3002 npm run dev`

#### Permission Errors (macOS/Linux)
```bash
# If you get permission errors, fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc  # or ~/.zshrc
source ~/.bashrc  # or ~/.zshrc
```

### Quick Setup Commands (Copy & Paste)

```bash
# 1. Clone and navigate
git clone https://github.com/HienVo22/PathFinder.git
cd PathFinder

# 2. Set up Node.js (if using NVM)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use default

# 3. Install dependencies
npm install

# 4. Start all services (MongoDB, Ollama, Next.js)
./start-all.sh

# 5. Open http://localhost:3000 in your browser
```

**Note:** The MongoDB command uses relative paths (`data/db_new`) so it works from any PathFinder folder location.

## Project Structure

```
pathfinder/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── upload/        # File upload endpoints
│   ├── dashboard/         # Dashboard page
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Home page
├── components/            # React components
│   └── ResumeUpload.js    # Resume upload component
├── contexts/              # React contexts
│   └── AuthContext.js     # Authentication context
├── lib/                   # Utility libraries
│   └── mongodb.js         # MongoDB connection
├── models/                # Database models
│   └── User.js            # User schema
├── uploads/               # File storage
│   └── resumes/           # Resume files
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
└── jsconfig.json          # JavaScript configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Team Workflow

### Development Process
1. **Pull latest changes**: `git pull origin main`
2. **Create feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**
4. **Test locally**: `npm run dev`
5. **Commit changes**: `git add . && git commit -m "Add: your feature description"`
6. **Push branch**: `git push origin feature/your-feature-name`
7. **Create Pull Request** on GitHub

### Team Roles & Responsibilities

#### **Frontend Developer**
- **Focus**: React components, UI/UX, styling
- **Files to work on**: `app/page.js`, `app/dashboard/page.js`, `app/globals.css`
- **Skills needed**: React, JavaScript, HTML/CSS, Tailwind CSS

#### **Backend Developer**
- **Focus**: API development, database integration
- **Files to work on**: `app/api/`, `contexts/AuthContext.js`
- **Skills needed**: Node.js, Express, JavaScript, MongoDB

#### **ML Developer**
- **Focus**: Job matching algorithms, resume parsing
- **Files to work on**: Create new `ml-service/` directory
- **Skills needed**: Python, scikit-learn, FastAPI

## Features Implemented

### **Current Features**
- User registration and login
- JWT token-based authentication
- Protected routes and form validation
- **Resume upload with drag-and-drop support**
- **MongoDB database integration for user storage**
- **File upload handling with Multer**
- Responsive, modern UI design
- Pathfinder branding with compass logo
- Clean, centered landing page
- User dashboard with profile display

### **Next Sprint Features**
1. **Database Integration**: Replace in-memory storage with MongoDB
2. **Resume Upload**: Add file upload functionality
3. **Job Listings**: Integrate with job APIs (Indeed, LinkedIn)
4. **ML Matching**: Implement job recommendation algorithm
5. **Auto-Apply**: Add one-click job application feature

### Feature Branch Commands (copy/paste)

Create a new feature branch, work, push, open PR, and clean up.

```bash
# make sure you're up to date
git checkout main
git pull origin main

# create a short-lived feature branch
git checkout -b feature/short-description

# do your work, then stage and commit
git add -p
git commit -m "feat: short description of change"

# push the branch to GitHub
git push -u origin feature/short-description

# after PR is reviewed and merged (on GitHub), delete local & remote branches
git checkout main
git pull origin main
git branch -d feature/short-description
git push origin --delete feature/short-description
```

Tips
- Keep PRs small and focused; prefer "Squash and merge" to keep history clean.
- Use Conventional Commit prefixes: feat:, fix:, chore:, docs:, refactor:, test:.
- Rebase to update your branch if main moves:
```bash
git fetch origin
git rebase origin/main
# resolve any conflicts, then
git push --force-with-lease
```

## License

This project is licensed under the MIT License.

### MongoDB Setup and Resume Upload

#### Starting MongoDB

To start MongoDB, you can use one of the following methods:

- **Local Installation (macOS)**:
  ```bash
  brew services start mongodb/brew/mongodb-community
  ```

- **MongoDB Atlas (Cloud)**:
  1. Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
  2. Create a free cluster
  3. Get your connection string and update the `.env.local` file

#### Resume File Upload

To upload a resume:

1. Navigate to the dashboard after logging in.
2. Use the drag-and-drop feature or click "Choose File" to select your resume.
3. Supported formats: PDF, DOC, DOCX.
4. The resume will be uploaded and associated with your account.
