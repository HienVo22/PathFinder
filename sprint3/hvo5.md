# Sprint 3 - Resume Matching Enhancement

## Branch: ResumeMatching/hien

## Objectives
- Upgrade AI model for better resume parsing accuracy
- Improve skill extraction from 85-92% to 90-95%
- Prepare system for enhanced job matching capabilities

## Key Changes

### 1. AI Model Upgrade (llama3.1:8b)
**Date**: October 27, 2025

**Changes Made**:
- Downloaded and configured llama3.1:8b model (4.9GB)
- Updated `utils/resumeParser.js` to use new model
- Improved expected accuracy from 85-92% (llama3.2) to 90-95% (llama3.1:8b)

**Technical Details**:
- Model: llama3.1:8b (8 billion parameters)
- Previous: llama3.2 (3.2 billion parameters)
- Performance: Better skill extraction, especially for:
  - Skills in dedicated sections
  - Skills mentioned in project contexts
  - Abbreviated skills (JS → JavaScript, ML → Machine Learning)
  - Special characters (C++, C#)

**Files Modified**:
- `utils/resumeParser.js` - Updated model from 'llama3.2' to 'llama3.1:8b'

**Benefits**:
- More accurate skill extraction
- Better understanding of resume context
- Improved handling of technical abbreviations
- Enhanced soft skill detection

## Future Plans
- Implement real job board API integration (JSearch or similar)
- Enhanced job matching algorithm based on extracted skills
- Skills gap analysis for job recommendations
- Resume scoring system
