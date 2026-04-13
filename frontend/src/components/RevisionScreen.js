import React, { useState } from 'react';

export default function RevisionScreen({ notes, onBack, pdfName, onHome }) {
  const [idx, setIdx] = useState(0);
  const note = notes[idx];
  const isLast = idx === notes.length - 1;
  const progress = ((idx + 1) / notes.length) * 100;

  const displayName = pdfName ? pdfName.replace(/\.pdf$/i, '') : null;

  return (
    <div className="screen card-screen">
      <div className="top-nav">
        <div className="top-nav-brand"><span className="top-nav-logo">FL</span><span className="top-nav-name">FlashLearn</span></div>
        <div className="top-nav-right">
          {displayName && (
            <span style={{
              fontSize: 13, fontWeight: 600, color: 'var(--ink2)',
              background: 'rgba(217,124,26,.10)', border: '1.5px solid rgba(217,124,26,.30)',
              borderRadius: 20, padding: '5px 14px', maxWidth: 200,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>📄 {displayName}</span>
          )}
          <button className="nav-pill" onClick={onHome} style={{ marginLeft: 8 }}>🏠 Home</button>
          <button className="nav-pill outline" onClick={onBack}>⬅ Back</button>
        </div>
      </div>
      <div className="card-screen-content">
        <div className="card-progress-area">
          <div className="card-progress-info">
            <span className="card-progress-label">Revision {idx + 1} of {notes.length}</span>
            <span className="card-progress-pct">{Math.round(progress)}%</span>
          </div>
          <div className="card-progress-bar"><div className="card-progress-fill revision-fill" style={{ width: `${progress}%` }} /></div>
        </div>
        <div className="revision-card-wrap">
          <div className="revision-badge">📖 Revision Note</div>
          <div className="revision-topic">{note?.topic}</div>
          <div className="revision-notes">{note?.notes}</div>
        </div>
        <div className="nav-row">
          {idx > 0 && <button className="nav-arrow-btn" onClick={() => setIdx(i => i - 1)}>← Prev</button>}
          {!isLast
            ? <button className="next-btn" onClick={() => setIdx(i => i + 1)}>Next →</button>
            : <button className="next-btn finish-btn" onClick={onBack}>✓ Done</button>}
        </div>
      </div>
    </div>
  );
}
