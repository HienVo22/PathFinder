# Sprint 2 Reflection

**Name:** Hien Vo  
**NetID:** hvo5  
**GitHub ID:** HienVo22  
**Group Name:** PathFinder Team

## What you planned to do

- Integrate Llama AI model (Ollama) for intelligent resume parsing
- Redesign the job matching page with LinkedIn-style preferences modal
- Refine job matching algorithm to utilize AI-extracted skills
- Implement background resume processing and skills extraction

## What you did not do

- Did not implement full PDF text extraction (temporarily disabled due to Next.js compatibility issues)
- Did not add job title matching in the job matching algorithm
- Did not implement real-time Ollama model switching interface

## What problems you encountered

- Next.js client-side compatibility issues with server-side modules (fs, pdf-parse)
- Mongoose schema validation errors when saving preferences with undefined nested objects
- Ollama service connectivity requiring fallback to keyword-based parsing when AI is unavailable
- Complex preference filtering logic requiring normalization of multiple filter types

## Issues you worked on

- Utilized Llama as the AI model to parse resume
- Refined job matching algorithm with AI integration
- Redesigned the job matching page with LinkedIn-style preferences

## Files you worked on

- /Users/hienvo/PathFinder/components/JobPreferencesModal.js
- /Users/hienvo/PathFinder/utils/resumeParser.js
- /Users/hienvo/PathFinder/services/resumeProcessingService.js
- /Users/hienvo/PathFinder/app/api/user/preferences/route.js
- /Users/hienvo/PathFinder/app/api/user/resume-parsing-status/route.js
- /Users/hienvo/PathFinder/components/ParsedResumeViewer.js
- /Users/hienvo/PathFinder/utils/textExtractor.js
- /Users/hienvo/PathFinder/components/JobMatching.js
- /Users/hienvo/PathFinder/utils/jobMatcher.js
- /Users/hienvo/PathFinder/models/User.js

## Use of AI and/or 3rd party software

Used Ollama library to integrate Llama 3.2 AI model for intelligent resume parsing with natural language processing capabilities. Used mammoth library for DOCX file text extraction. Used GitHub Copilot for code completion and debugging assistance. Implemented fallback parsing using keyword matching algorithms when AI services are unavailable.

## What you accomplished

I successfully integrated the Llama 3.2 AI model through Ollama for intelligent resume parsing that extracts technical skills, job titles, companies, years of experience, and educational background from uploaded resumes. The system includes a robust fallback mechanism using enhanced keyword matching when the AI service is unavailable.

I created a comprehensive LinkedIn-style job preferences modal that allows users to set job titles, location types (On-site, Hybrid, Remote), specific locations, employment types (Full-time, Part-time, Contract, Internship, Temporary), and desired pay. The modal includes dynamic chip-based UI for adding and removing preferences with proper validation and error handling.

I redesigned the job matching page by replacing the basic filters with an integrated preferences system that shows a summary of current selections and provides a single "Edit Preferences" button. The job matcher was enhanced to support multiple location types, employment types, and salary parsing from the desired pay field.

I implemented background resume processing using a dedicated service that extracts text from DOCX files, sends it to the AI parser, and stores the structured results in MongoDB. The system includes real-time parsing status tracking and a viewer component that displays AI-extracted skills without showing education and company information as requested.

The enhanced job matching algorithm now uses AI-extracted skills from resumes to provide personalized job recommendations with detailed skill gap analysis and match percentages. All components include proper error handling, loading states, and responsive design following modern React patterns.
