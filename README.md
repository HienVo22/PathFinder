# Pathfinder - Job Recommendation Platform

A full-stack web application that uses AI to match users with their perfect job opportunities.

## Features

- 🔐 User authentication (login/register)
- 📄 Resume upload with drag-and-drop support
- 🧭 Clean, modern UI with Pathfinder branding
- 📊 Dashboard for job management
- 🤖 AI-powered job matching (coming soon)
- ⚡ One-click job applications (coming soon)

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

#### Step 6: Start Development Server
```bash
npm run dev
```

#### Step 7: View the Application
- Open your browser
- Go to: **http://localhost:3000** (or http://localhost:3001 if 3000 is busy)
- You should see the Pathfinder login page!

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

For team members who want to get started quickly:

```bash
# 1. Clone and navigate
git clone https://github.com/HienVo22/PathFinder.git
cd PathFinder

# 2. Set up Node.js (if using NVM)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use default

# 3. Install and run
npm install
npm run dev

# 4. Open http://localhost:3000 in your browser
```

## Project Structure

```
pathfinder/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── auth/          # Authentication endpoints
│   ├── dashboard/         # Dashboard page
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Home page
├── contexts/              # React contexts
│   └── AuthContext.js     # Authentication context
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

### ✅ **Current Features**
- User registration and login
- JWT token-based authentication
- Protected routes and form validation
- Responsive, modern UI design
- Pathfinder branding with compass logo
- Clean, centered landing page
- User dashboard with profile display

### 🚧 **Next Sprint Features**
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
