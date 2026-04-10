import React, { useState } from 'react';

export default function RevisionScreen({ notes, onBack }) {
  const [idx, setIdx] = useState(0);
  const note = notes[idx];
  const isLast = idx === notes.length - 1;
  const progress = ((idx + 1) / notes.length) * 100;

  return (
    <div className="screen card-screen">
      <div className="top-nav">
        <div className="top-nav-brand"><span className="top-nav-logo">FL</span><span className="top-nav-name">FlashLearn</span></div>
        <button className="nav-pill outline" onClick={onBack}>⬅ Back</button>
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
