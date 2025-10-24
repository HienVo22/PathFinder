# Sprint 2 Reflection

**Name:** Anjaney Sharma  
**NetID:** asharm39  
**GitHub ID:** anjaneys  
**Group Name:** PathFinder 

## What you planned to do

- Integrate LinkedIn OAuth for user authentication and profile linking
- Store resumes both on disk and in MongoDB for user access and download
- Add LinkedIn-style job preferences and matching features
- Enable users to link and mock-link LinkedIn accounts for testing

## What you did not do

- Did not implement full LinkedIn profile enrichment (only basic fields linked)
- Did not add advanced resume parsing or AI-based skill extraction
- Did not complete real-time LinkedIn data sync

## What problems you encountered

- Handling OAuth callback and token exchange with LinkedIn API
- Managing file uploads and storing binary data in MongoDB
- Ensuring JWT authentication works across all endpoints
- Debugging Mongoose schema issues with new LinkedIn and resume fields

## Issues you worked on

- LinkedIn OAuth integration and callback handling
- Resume upload and download endpoints (disk and DB storage)
- User schema updates for LinkedIn and resume fields
- Mock LinkedIn linking for local development and testing

## Files you worked on

- /Users/anjan/PathFinder/app/api/auth/linkedin/callback/route.js
- /Users/anjan/PathFinder/app/api/auth/linkedin/link/route.js
- /Users/anjan/PathFinder/app/api/auth/linkedin/mock/link/route.js
- /Users/anjan/PathFinder/app/api/upload/resume/route.js
- /Users/anjan/PathFinder/models/User.js
- /Users/anjan/PathFinder/components/LinkedInLinkPopup.js
- /Users/anjan/PathFinder/components/LinkedInMockLink.js

## Use of AI and/or 3rd party software

Used LinkedIn OAuth API for authentication and profile access. Used GitHub Copilot for code completion and debugging assistance.

## What you accomplished

I successfully integrated LinkedIn OAuth authentication, allowing users to sign in and link their LinkedIn profiles. The system can store resumes both on disk and in MongoDB, supporting secure upload and download. I added LinkedIn-style job preferences and enabled users to link or mock-link LinkedIn accounts for development. The user schema was updated to support new fields for LinkedIn and resume data, and endpoints were created for handling these features. This sprint improved the authentication flow, user data management, and developer testing capabilities.