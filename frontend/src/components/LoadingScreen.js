import React from 'react';

export default function LoadingScreen({ message, sub }) {
  return (
    <div className="screen" style={{ justifyContent: 'center', gap: 0 }}>
      <div className="logo faded">FlashLearn</div>
      <div className="tagline" style={{ opacity: 0.4 }}>Smart flashcard curator</div>
      <p style={{ fontSize: 20, color: '#3a4a6a', fontWeight: 600, marginTop: 36 }}>{message}</p>
      <div className="spinner" />
      <p style={{ fontSize: 13, color: '#8a9aba', marginTop: 10 }}>{sub}</p>
    </div>
  );
}
