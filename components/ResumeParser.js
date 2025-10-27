import React, { useRef, useState } from 'react';

function getPdfLib() {
  try {
    const pdfjsLib = require('pdfjs-dist');
    return pdfjsLib;
  } catch (e) {
    // fallback to global pdfjs bundle
    if (typeof window !== 'undefined' && window.pdfjsLib) {
      return window.pdfjsLib;
    }
    return null;
  }
}

export default function ResumeParser() {
  const canvasRef = useRef(null);
  const [text, setText] = useState('');
  const [error, setError] = useState(null);

  async function handleFile(file) {
    setError(null);
    setText('');

    const pdfjsLib = getPdfLib();
    if (!pdfjsLib) {
      setError('pdfjs not found. Install `pdfjs-dist` or include a PDF.js bundle on the page as window.pdfjsLib');
      return;
    }
    // pdfjs-dist exposes getDocument differently depending on bundle shape
    // Try default entry points
    let getDocument = pdfjsLib.getDocument || (pdfjsLib.PDFJS && pdfjsLib.PDFJS.getDocument);
    if (!getDocument) {
      setError('Could not find getDocument on pdfjs');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      // Render first page to canvas
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport,
      };
      await page.render(renderContext).promise;

      // Extract text content
      const content = await page.getTextContent();
      const extracted = content.items.map((it) => it.str).join(' ');
      setText(extracted);
    } catch (err) {
      console.error('PDF parse/render error', err);
      setError(String(err));
    }
  }

  function onFileChange(e) {
    const f = e.target.files && e.target.files[0];
    if (f) handleFile(f);
  }

  return (
    <div className="resume-parser">
      <label htmlFor="resume-file" className="block mb-2 font-medium">Select PDF resume</label>
      <input id="resume-file" type="file" accept="application/pdf" onChange={onFileChange} />

      <div className="mt-4">
        <canvas ref={canvasRef} style={{ border: '1px solid #ddd', maxWidth: '100%' }} />
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">Extracted text (first page)</h3>
        {error ? (
          <pre className="text-red-600">{error}</pre>
        ) : (
          <textarea value={text} readOnly rows={8} className="w-full p-2 border" />
        )}
      </div>
    </div>
  );
}
