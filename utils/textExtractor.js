import mammoth from 'mammoth';
import fs from 'fs';

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
          // Temporarily disabled PDF parsing due to Next.js compatibility issues
          // Will re-implement with a Next.js-compatible PDF parser
          console.warn('PDF parsing temporarily disabled. Please use DOCX files for now.');
          return 'PDF text extraction temporarily unavailable. Please upload a DOCX file for AI parsing to work properly.';
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.extractFromDOCX(buffer);
        
        case 'application/msword':
          // For older .doc files, we'll try to extract as best we can
          // Note: mammoth works best with .docx, for .doc you might want to use a different library
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
   * Extract text from PDF buffer (DISABLED - Next.js compatibility issues)
   * @param {Buffer} buffer - PDF file buffer
   * @returns {Promise<string>} Extracted text
   */
  static async extractFromPDF(buffer) {
    // Temporarily disabled due to pdf-parse/pdfjs-dist compatibility issues with Next.js
    throw new Error('PDF extraction temporarily disabled. Please use DOCX files.');
  }

  /**
   * Extract text from DOCX buffer
   * @param {Buffer} buffer - DOCX file buffer
   * @returns {Promise<string>} Extracted text
   */
  static async extractFromDOCX(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
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
