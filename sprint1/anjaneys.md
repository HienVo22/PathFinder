# Sprint 1
Anjaney Sharma – anjaneys – [PathFinder]

## What you planned to do
- Implement MongoDB Atlas cluster connection
- Allow server saving of PDF resumes

## What you did not do
- NA

## What problems you encountered
- Local MongoDB instance refused connections before switching to Atlas (ECONNREFUSED 127.0.0.1:27017)
- Missing dependencies (ng not recognized, mongosh not recognized)
- Merge conflicts when pushing schema changes from teammates
- Adjusting to Next.js API routes with MongoDB
- File handling issues when testing PDF resume saving

## Issues you worked on
- [#3 Set up Next.js project and MongoDB connection](https://github.com/HienVo22/PathFinder/issues/3)
- [#12 Resume server-side upload and saving](https://github.com/HienVo22/PathFinder/issues/12)

## Files you worked on
- `/PathFinder/lib/mongodb.js`
- `/PathFinder/models/User.js`
- `/PathFinder/pages/api/upload.js`

## Use of AI and/or 3rd party software
- Used GitHub Copilot for schema boilerplate and file upload utilities
- Used MongoDB Compass to test the cluster
- Relied on Mongoose and Next.js for backend integration

## What you accomplished
- Successfully connected the app to a MongoDB Atlas cluster
- Wrote the backend logic to handle server-side saving of PDF resumes
- Added error handling for large file uploads and format validation
- Helped teammates with GitHub workflows and reviewed PRs related to database integration
- Contributed to setting up a stable backend foundation with file persistence features for Sprint 1
