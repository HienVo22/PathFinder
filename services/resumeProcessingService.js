import User from '../models/User.js';
import connectDB from '../lib/mongodb.js';
import { TextExtractor } from '../utils/textExtractor.js';
import { ResumeParser } from '../utils/resumeParser.js';

/**
 * Service for processing resumes with AI
 */
export class ResumeProcessingService {
  /**
   * Process resume with AI (extract text and parse skills)
   * @param {string} userId - User ID
   * @param {string} filePath - Path to resume file
   * @param {string} contentType - MIME type of the file
   */
  static async processResumeWithAI(userId, filePath, contentType) {
    try {
      console.log(`Starting AI processing for user ${userId}, file: ${filePath}`);
      
      // Extract text from resume
      const extractedText = await TextExtractor.extractText(filePath, contentType);
      const cleanedText = TextExtractor.cleanText(extractedText);
      
      console.log(`Text extracted (${cleanedText.length} characters) for user ${userId}`);
      
      // Parse resume with AI
      const resumeParser = new ResumeParser();
      const parsedData = await resumeParser.parseResumeWithFallback(cleanedText);
      
      console.log(`Resume parsed for user ${userId}:`, {
        skillsFound: parsedData.extractedSkills.length,
        experience: parsedData.experience?.substring(0, 100) + '...',
        yearsOfExperience: parsedData.yearsOfExperience
      });
      
      // Update user with parsed data
      await connectDB();
      const user = await User.findById(userId);
      if (user) {
        // Update the skills array with AI-extracted skills
        user.skills = [...new Set([...user.skills, ...parsedData.extractedSkills])]; // Merge and dedupe
        
        // Store full parsed data
        user.parsedResumeData = {
          ...parsedData,
          parsedAt: new Date(),
          parsingMethod: parsedData.extractedSkills.length > 0 ? 'ollama' : 'fallback'
        };
        
        await user.save();
        console.log(`User ${userId} updated with AI-parsed resume data`);
        
        return {
          success: true,
          skillsExtracted: parsedData.extractedSkills.length,
          method: parsedData.extractedSkills.length > 0 ? 'ollama' : 'fallback'
        };
      }
      
      throw new Error('User not found');
      
    } catch (error) {
      console.error(`Resume AI processing failed for user ${userId}:`, error);
      
      // Check if this is an AI not available error
      const isAINotAvailable = error.message && error.message.includes('AI_NOT_AVAILABLE');
      
      // Mark parsing as failed with appropriate error message
      try {
        await connectDB();
        const user = await User.findById(userId);
        if (user) {
          user.parsedResumeData = {
            extractedSkills: [],
            experience: '',
            education: '',
            jobTitles: [],
            companies: [],
            yearsOfExperience: 0,
            parsedAt: new Date(),
            parsingMethod: 'failed',
            errorMessage: isAINotAvailable 
              ? 'AI service not available. Please start Ollama to enable skill extraction.'
              : 'Resume parsing failed. Please try again.'
          };
          await user.save();
        }
        
        return {
          success: false,
          error: isAINotAvailable 
            ? 'AI_NOT_AVAILABLE' 
            : error.message,
          userFriendlyMessage: isAINotAvailable
            ? 'AI service is not running. Please start Ollama with "ollama serve" to enable skill extraction.'
            : 'Resume parsing failed. Please try again.',
          method: 'failed'
        };
      } catch (dbError) {
        console.error(`Failed to mark processing as failed for user ${userId}:`, dbError);
        throw dbError;
      }
    }
  }

  /**
   * Get resume parsing status for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Parsing status and data
   */
  static async getParsingStatus(userId) {
    try {
      await connectDB();
      
      const user = await User.findById(userId).select(
        'resumePath resumeOriginalName resumeUploadedAt skills parsedResumeData'
      );

      if (!user) {
        throw new Error('User not found');
      }

      // Check if user has uploaded a resume
      if (!user.resumePath) {
        return {
          hasResume: false,
          message: 'No resume uploaded'
        };
      }

      // Check parsing status
      const hasBeenParsed = user.parsedResumeData && user.parsedResumeData.parsedAt;
      const parsingFailed = user.parsedResumeData && user.parsedResumeData.parsingMethod === 'failed';

      return {
        hasResume: true,
        resumeInfo: {
          originalName: user.resumeOriginalName,
          uploadedAt: user.resumeUploadedAt,
        },
        parsing: {
          completed: hasBeenParsed,
          failed: parsingFailed,
          parsedAt: user.parsedResumeData?.parsedAt,
          method: user.parsedResumeData?.parsingMethod,
          errorMessage: user.parsedResumeData?.errorMessage || null
        },
        extractedData: hasBeenParsed ? {
          skills: user.parsedResumeData.extractedSkills || [],
          experience: user.parsedResumeData.experience || '',
          education: user.parsedResumeData.education || '',
          jobTitles: user.parsedResumeData.jobTitles || [],
          companies: user.parsedResumeData.companies || [],
          yearsOfExperience: user.parsedResumeData.yearsOfExperience || 0
        } : null,
        userSkills: user.skills || [] // Combined skills (manual + AI extracted)
      };
    } catch (error) {
      console.error('Get parsing status error:', error);
      throw error;
    }
  }
}
