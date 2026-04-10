import React, { useState, useRef, useEffect } from 'react';

const LEVELS = [
  { value: 1, label: 'Easy',   name: 'Level 1', desc: 'Basic recall & definitions',          color: '#3d9e6a', bg: '#f0fdf4', border: '#86efac' },
  { value: 2, label: 'Medium', name: 'Level 2', desc: 'Understanding & application',          color: '#d97c1a', bg: '#fffbeb', border: '#fcd34d' },
  { value: 3, label: 'Hard',   name: 'Level 3', desc: 'Analysis & critical thinking',         color: '#c4504a', bg: '#fef2f2', border: '#fca5a5' },
];

export default function UploadScreen({ onGenerate, error, user, onLogout, onDashboard }) {
  const [file, setFile]           = useState(null);
  const [fileErr, setFileErr]     = useState('');
  const [complexity, setComplexity] = useState(1);
  const [dragging, setDragging]   = useState(false);
  const [showMenu, setShowMenu]   = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (!showMenu) return;
    const close = () => setShowMenu(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showMenu]);

  const handleFile = f => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.pdf')) { setFileErr('Please upload a PDF file.'); setFile(null); return; }
    setFileErr(''); setFile(f);
  };

  return (
    <div className="screen upload-screen">
      <div className="top-nav">
        <div className="top-nav-brand">
          <span className="top-nav-logo">FL</span>
          <span className="top-nav-name">FlashLearn</span>
        </div>
        <div className="top-nav-right">
          <button className="nav-pill" onClick={onDashboard}>📊 My Progress</button>
          <div className="user-chip" onClick={e => { e.stopPropagation(); setShowMenu(m => !m); }}>
            <span className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
            <span className="user-label">{user?.name}</span>
            <span style={{ fontSize: 10, color: 'var(--ink3)', marginLeft: 2 }}>▾</span>
            {showMenu && (
              <div className="user-dropdown" onClick={e => e.stopPropagation()}>
                <div className="user-dropdown-header">
                  <div className="user-dropdown-name">{user?.name}</div>
                  <div className="user-dropdown-email">{user?.email}</div>
                </div>
                <button className="dropdown-btn" onClick={() => { onDashboard(); setShowMenu(false); }}>📊 My Progress</button>
                <div className="dropdown-divider" />
                <button className="dropdown-btn" onClick={onLogout}>🚪 Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="upload-content">
        <div className="upload-hero">
          <h1 className="upload-hero-title">Turn Notes into<br /><span className="gradient-text">Smart Flashcards</span></h1>
          <p className="upload-hero-sub">Upload any PDF and let AI generate personalized flashcards at your preferred difficulty level.</p>
        </div>

        <div className="upload-grid">
          {/* Drop zone */}
          <div className="upload-panel">
            <div className="panel-label">Upload your PDF</div>
            <div
              className={`drop-zone-new ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => inputRef.current.click()}
            >
              <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
              {file ? (
                <div className="file-selected">
                  <div className="file-icon">📄</div>
                  <div className="file-info">
                    <div className="file-name-text">{file.name}</div>
                    <div className="file-size">{(file.size / 1024).toFixed(1)} KB • PDF</div>
                  </div>
                  <button className="file-remove" onClick={e => { e.stopPropagation(); setFile(null); }}>✕</button>
                </div>
              ) : (
                <div className="drop-placeholder">
                  <div className="drop-icon">☁️</div>
                  <div className="drop-text">Drag & drop your PDF here</div>
                  <div className="drop-sub">or click to browse files</div>
                  <div className="drop-format">Supports .pdf files only</div>
                </div>
              )}
            </div>
            {(fileErr || error) && <div className="field-error">{fileErr || error}</div>}
          </div>

          {/* Level selector */}
          <div className="upload-panel">
            <div className="panel-label">Choose difficulty level</div>
            <div className="level-cards">
              {LEVELS.map(lvl => (
                <div
                  key={lvl.value}
                  className={`level-card ${complexity === lvl.value ? 'selected' : ''}`}
                  style={complexity === lvl.value ? { borderColor: lvl.color, background: lvl.bg } : {}}
                  onClick={() => setComplexity(lvl.value)}
                >
                  <div className="level-dot" style={{ background: lvl.color }} />
                  <div className="level-info">
                    <div className="level-title" style={complexity === lvl.value ? { color: lvl.color } : {}}>{lvl.name} — {lvl.label}</div>
                    <div className="level-desc">{lvl.desc}</div>
                  </div>
                  {complexity === lvl.value && <div className="level-check" style={{ color: lvl.color }}>✓</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button className="generate-btn" disabled={!file} onClick={() => onGenerate(file, complexity)}>
          <span>Generate Flashcards</span>
          <span className="generate-arrow">→</span>
        </button>
      </div>
    </div>
  );
}
