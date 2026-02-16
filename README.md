# Pathfinder

## Features

- User authentication (email/password) using JWT
- Optional Google sign-in
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


Example:

```bash
MONGODB_URI="mongodb+srv://USER:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority"
JWT_SECRET="replace-with-a-long-random-string"

```

### 3) Run (development)

```bash
npm run dev
```


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
