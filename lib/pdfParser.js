// PDF parsing utility - using pdf2json (no test file dependencies)

async function parsePdfBuffer(buffer) {
  return new Promise(async (resolve, reject) => {
    try {
      // Dynamically import pdf2json (CommonJS module)
      const PDFParser = (await import('pdf2json')).default;
      const pdfParser = new PDFParser();
      
      pdfParser.on('pdfParser_dataError', (errData) => {
        console.error('PDF parsing error:', errData.parserError);
        reject(new Error(errData.parserError));
      });
      
      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        try {
          // Extract text from all pages
          let fullText = '';
          
          if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
            pdfData.Pages.forEach(page => {
              if (page.Texts && Array.isArray(page.Texts)) {
                page.Texts.forEach(textItem => {
                  if (textItem.R && Array.isArray(textItem.R)) {
                    textItem.R.forEach(r => {
                      if (r.T) {
                        // Decode URI component (pdf2json encodes text)
                        fullText += decodeURIComponent(r.T) + ' ';
                      }
                    });
                  }
                });
              }
              fullText += '\n';
            });
          }
          
          resolve(fullText.trim());
        } catch (extractError) {
          console.error('Text extraction error:', extractError.message);
          reject(extractError);
        }
      });
      
      // Parse the buffer
      pdfParser.parseBuffer(buffer);
    } catch (error) {
      console.error('PDF parsing setup error:', error.message);
      reject(error);
    }
  });
}

export { parsePdfBuffer };
