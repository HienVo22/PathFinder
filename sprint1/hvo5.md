# Sprint 1 Reflection

**Name:** Hien Vo  
**NetID:** hvo5  
**GitHub ID:** HienVo22  
**Group Name:** PathFinder Team

## What you planned to do

- Create skills database for job matching system
- Implement skills extraction utilities for processing resumes
- Build basic job matching functionality

## What you did not do

- Did not implement actual PDF resume parsing
- Did not connect to external job APIs
- Did not create user authentication integration

## What problems you encountered

- Handling different skill naming variations and patterns
- Balancing scoring weights between required and preferred skills
- Ensuring efficient performance with large skill datasets

## Issues you worked on

No specific GitHub issues were tracked for this work.

## Files you worked on

- /Users/hienvo/PathFinder/data/skills.js
- /Users/hienvo/PathFinder/utils/skillsExtractor.js

## Use of AI and/or 3rd party software

Used GitHub Copilot for code completion and suggestions while writing utility functions. Used standard JavaScript ES6 features and no external libraries beyond the existing Next.js framework.

## What you accomplished

I created a comprehensive skills database containing over 150 technical and soft skills organized into categories including Frontend, Backend, Database, Cloud, Mobile, and Data Science technologies. The database is structured as exportable JavaScript arrays for easy integration across the application.

I implemented skills extraction utilities that can process resume text and identify relevant skills using keyword matching algorithms. The system includes basic extraction with simple matching and advanced extraction with confidence scoring. I created mock user profiles representing different developer types like Full Stack, Frontend, Backend, Python, Mobile, Data Science, and DevOps developers for testing purposes.

The utilities include skills validation functions to clean and verify user-entered skills against the database, removing duplicates and normalizing formats. I also implemented a suggestion system for autocomplete functionality that can recommend skills based on partial input matching.

The skills extraction system handles various skill naming patterns and variations, allowing flexible matching for common technology names. The code includes proper error handling for edge cases and is documented with JSDoc comments for maintainability.
