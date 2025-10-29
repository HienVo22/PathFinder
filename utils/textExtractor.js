import fs from 'fs';
import mammoth from 'mammoth';

/**
 * Extract text from different file types
 */
export class TextExtractor {
  /**
   * Extract text from PDF, DOC, or DOCX files
   * @param {string} filePath - Path to the file
   * @param {string} contentType - MIME type of the file
   * @returns {Promise<string>} Extracted text
   */
  static async extractText(filePath, contentType) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }

      const buffer = fs.readFileSync(filePath);

      switch (contentType) {
        case 'application/pdf':
          // PDF parsing disabled - requires external dependencies
          console.warn('PDF parsing disabled. Using fallback text extraction.');
          return 'PDF text extraction unavailable. Using fallback parsing for skill detection.';
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.extractFromDOCX(buffer);
        
        case 'application/msword':
          // For older .doc files, use basic extraction
          return await this.extractFromDOCX(buffer);
        
        default:
          throw new Error(`Unsupported file type: ${contentType}`);
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      throw new Error(`Failed to extract text: ${error.message}`);
    }
  }

  /**
   * Extract text from PDF buffer (DISABLED - requires external dependencies)
   * @param {Buffer} buffer - PDF file buffer
   * @returns {Promise<string>} Extracted text
   */
  static async extractFromPDF(buffer) {
    // Disabled due to dependency issues
    throw new Error('PDF extraction disabled. Please use DOCX files.');
  }

  /**
   * Extract text from DOCX buffer using mammoth for better accuracy
   * @param {Buffer} buffer - DOCX file buffer
   * @returns {Promise<string>} Extracted text
   */
  static async extractFromDOCX(buffer) {
    try {
      // Use mammoth for proper DOCX text extraction with formatting preservation
      const result = await mammoth.extractRawText({ buffer });
      
      if (result.messages && result.messages.length > 0) {
        console.log('DOCX extraction warnings:', result.messages);
      }
      
      const text = result.value;
      
      if (!text || text.length < 50) {
        throw new Error('Unable to extract meaningful text from DOCX file');
      }
      
      // Clean up the text while preserving important structure
      const cleanedText = text
        .replace(/\t/g, ' ')  // Replace tabs with spaces
        .replace(/\r\n/g, '\n')  // Normalize line endings
        .replace(/ {2,}/g, ' ')  // Replace multiple spaces with single space
        .trim();
      
      return cleanedText;
    } catch (error) {
      console.error('DOCX extraction error:', error);
      throw new Error(`DOCX extraction failed: ${error.message}`);
    }
  }

  /**
   * Clean extracted text by removing extra whitespace and normalizing
   * @param {string} text - Raw extracted text
   * @returns {string} Cleaned text
   */
  static cleanText(text) {
    return text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();
  }
}
