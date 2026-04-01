import React, { useState, useRef } from 'react';

export default function UploadScreen({ onGenerate, error }) {
  const [file, setFile] = useState(null);
  const [fileErr, setFileErr] = useState('');
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setFileErr('Please upload a PDF file.');
      setFile(null);
      return;
    }
    setFileErr('');
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="screen">
      <div className="logo">FlashLearn</div>
      <div className="tagline">Smart flashcard curator</div>

      <div className="hero-box">
        <div className="hero-title">Turn your notes into smart flashcards instantly!</div>
        <div className="hero-desc">
          FlashLearn uses AI to analyze your study notes and automatically generate interactive flashcards.
          <br /><br />
          Swipe right if you know the answer, swipe left to review later, and revise only what you struggle with!
        </div>
      </div>

      <div className="upload-label">Upload your notes here to generate curated flashcards within seconds!</div>

      <label
        className="drop-zone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        Browse files
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </label>

      <div className="format-hint">Supported format: .pdf</div>

      {file && <div className="file-name">✓ {file.name}</div>}
      {(fileErr || error) && <div className="error-box">{fileErr || error}</div>}

      <button
        className="btn"
        style={{ marginTop: 16 }}
        disabled={!file}
        onClick={() => onGenerate(file)}
      >
        Generate Flashcards
      </button>
    </div>
  );
}
