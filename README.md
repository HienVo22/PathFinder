# Pathfinder

## Features

- User authentication (email/password) using JWT
- Optional Google sign-in
- Optional LinkedIn OAuth flow
- Resume upload (PDF, DOC, DOCX) with type/size validation
- Resume storage and retrieval
  - Stored on disk under `uploads/resumes/`
  - Also stored in MongoDB (binary) for serving back to the user
- Resume parsing and background processing
- AI-based skill extraction (Google Gemini API)
- Job search (RapidAPI JSearch)
- User endpoints for skills, preferences, tracked jobs, and profile updates

## Setup and run

### Requirements

- Node.js 18+
- npm
- A MongoDB connection string (local or Atlas)

### 1) Install

```bash
git clone https://github.com/HienVo22/PathFinder.git
cd PathFinder
npm install
```

### 2) Create `.env.local`

Create a file named `.env.local` in the project root.

Required:

- `MONGODB_URI`
- `JWT_SECRET`

Optional (only needed if you use those features):

- `MONGODB_DB_NAME`
- `RAPIDAPI_KEY`
- `RAPIDAPI_HOST` (defaults to `jsearch.p.rapidapi.com`)
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_ID`
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `LINKEDIN_REDIRECT_URI`
- `LINKEDIN_POPUP_REDIRECT_URI`

Example:

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

### 3) Run (development)

```bash
npm run dev
```

Open `http://localhost:3000`.

### Optional convenience scripts

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
