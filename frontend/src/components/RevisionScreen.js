import React, { useState } from 'react';

export default function RevisionScreen({ notes, onBack }) {
  const [idx, setIdx] = useState(0);
  const note = notes[idx];
  const isLast = idx === notes.length - 1;

  return (
    <div className="screen">
      <button className="back-btn" onClick={onBack}>←</button>
      <div className="logo faded">FlashLearn</div>
      <div className="tagline" style={{ opacity: 0.5 }}>Smart flashcard curator</div>

      <div className="card-wrap">
        <div className="card-header centered">
          <div className="progress-badge">{idx + 1}/{notes.length}</div>
        </div>
        <div className="rev-body">
          <div className="rev-topic">{note?.topic}</div>
          <div>{note?.notes}</div>
        </div>
      </div>

      <div className="rev-btns">
        {!isLast && (
          <button className="nf-btn" onClick={() => setIdx(i => i + 1)}>NEXT</button>
        )}
        <button className="nf-btn red" onClick={onBack}>FINISH</button>
      </div>
    </div>
  );
}
