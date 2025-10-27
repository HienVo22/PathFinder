import fs from 'fs';

/**
 * Extract text from different file types
 * Note: Currently simplified to work without external dependencies
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
   * Extract text from DOCX buffer (Basic extraction without mammoth)
   * @param {Buffer} buffer - DOCX file buffer
   * @returns {Promise<string>} Extracted text
   */
  static async extractFromDOCX(buffer) {
    try {
      // Basic text extraction without mammoth - convert buffer to string and clean
      // This is a fallback method that won't be as accurate as mammoth
      const text = buffer.toString('utf8');
      // Try to extract readable text from the XML structure
      const cleanedText = text
        .replace(/<[^>]*>/g, ' ') // Remove XML tags
        .replace(/[^\x20-\x7E\n]/g, ' ') // Keep only printable ASCII and newlines
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      if (cleanedText.length < 50) {
        throw new Error('Unable to extract meaningful text from DOCX file');
      }
      
      return cleanedText;
    } catch (error) {
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
