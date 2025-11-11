# Sprint 3 Reflection

**Name:** Hien Vo  
**NetID:** hvo5  
**GitHub ID:** HienVo22  
**Group Name:** PathFinder Team

## What you planned to do

- Integrate JSearch API for real job listings
- Implement LinkedIn style job matching interface
- Add comprehensive dark mode support across all components
- Create personal profile system for users
- Improve AI skill extraction accuracy
- Build external job application functionality

## What you did not do

- Did not implement job application tracking system
- Did not add advanced job filtering by salary ranges
- Did not implement job bookmarking persistence

## What problems you encountered

- JSearch API rate limiting required implementing mock data fallback system
- Cross-platform compatibility issues with process detection commands
- AI model memory constraints on 8GB RAM systems
- Merge conflicts when integrating with main branch updates
- Complex skill matching algorithm for percentage-based scoring

## Issues you worked on

Based on GitHub project assignments, the following issues were worked on:
- **Apply Externally**: Implemented external job application functionality with JSearch API integration
- **Job Filtering**: Enhanced job filtering capabilities with LinkedIn-style preferences
- **Visual and Styling Details**: Comprehensive dark mode support and UI improvements
- **Resume Matching to Jobs**: Advanced skill matching algorithm with percentage-based scoring
- **Integrate JSearch API to Pull Job Listings**: Complete JSearch API integration with mock data fallback

## Files you worked on

- /Users/hienvo/PathFinder/app/api/jobs/search/route.js
- /Users/hienvo/PathFinder/components/JobCard.js
- /Users/hienvo/PathFinder/components/JobDetail.js
- /Users/hienvo/PathFinder/components/SkillsInsightModal.js
- /Users/hienvo/PathFinder/components/JobMatching.js
- /Users/hienvo/PathFinder/utils/jobMatcher.js
- /Users/hienvo/PathFinder/app/profile/page.js
- /Users/hienvo/PathFinder/components/UserDropdown.js
- /Users/hienvo/PathFinder/public/pathfinder-logo.svg
- /Users/hienvo/PathFinder/app/dashboard/page.js
- /Users/hienvo/PathFinder/utils/resumeParser.js
- /Users/hienvo/PathFinder/data/skills.js
- /Users/hienvo/PathFinder/start-all.sh

## Use of AI and/or 3rd party software

Used Cursor for code completion and suggestions while writing utility functions. 

## What you accomplished

I integrated the JSearch API to fetch real job listings from major job boards and implemented a comprehensive mock data fallback system for development when rate limits are exceeded. The system includes proper error handling, environment variable validation, and detailed logging for debugging API interactions.

I built a LinkedIn-style job matching interface with a split-pane layout featuring job cards on the left and detailed job views on the right. The interface includes professional job cards displaying company logos, match percentages, and skill previews. I created a detailed job view component with full descriptions, salary information, qualifications, and apply/save functionality.

I implemented comprehensive dark mode support across all job matching components with proper color transitions and hover effects. The system includes visual indicators when using demo data and maintains consistent theming throughout the application.

I created a personal profile system with a dedicated profile page that displays parsed resume data including skills, work experience, education, and projects. I built a user dropdown menu component for navigation and integrated it with the existing authentication system.

I enhanced the AI skill extraction system by fixing the prompt to return individual skills instead of grouped categories and improved skill validation with case-insensitive matching. I added comprehensive logging for debugging AI responses and expanded the skills database with additional tools.

I designed and integrated a custom PathFinder logo across the application and cleaned up the user interface by removing unnecessary LinkedIn buttons and Quick Actions. I implemented expandable skills lists with show/hide functionality and improved button styling throughout the application.

I fixed cross-platform compatibility issues by replacing system-specific commands with portable alternatives that work across different operating systems. The startup scripts now use standard process detection methods that function reliably on all team members' systems.
