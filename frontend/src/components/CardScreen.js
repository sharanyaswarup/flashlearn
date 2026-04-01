import React, { useState, useEffect } from 'react';

export default function CardScreen({ cards, onBack, onDone }) {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [swiped, setSwiped] = useState(null); // 'left' | 'right' | null
  const [leftSwiped, setLeftSwiped] = useState([]);

  // Reset when cards change
  useEffect(() => { setIdx(0); setRevealed(false); setSwiped(null); setLeftSwiped([]); }, [cards]);

  const card = cards[idx];
  const isLast = idx === cards.length - 1;
  const total = cards.length;

  const revealAns = () => {
    if (!revealed) setRevealed(true);
  };

  const handleLeft = () => {
    setSwiped('left');
    setLeftSwiped(prev => prev.find(c => c.q === card.q) ? prev : [...prev, card]);
  };

  const handleRight = () => {
    setSwiped('right');
  };

  const handleNext = () => {
    if (isLast) {
      onDone(leftSwiped);
    } else {
      setIdx(i => i + 1);
      setRevealed(false);
      setSwiped(null);
    }
  };

  return (
    <div className="screen">
      <button className="back-btn" onClick={onBack}>←</button>
      <div className="logo faded">FlashLearn</div>
      <div className="tagline" style={{ opacity: 0.5 }}>Smart flashcard curator</div>

      <div className="card-wrap">
        <div className="card-header">
          <button className="nav-btn prev" onClick={() => { if (idx > 0) { setIdx(i=>i-1); setRevealed(false); setSwiped(null); } }}>←</button>
          <div className="progress-badge">{idx + 1}/{total}</div>
          <button className="nav-btn next" onClick={() => { if (idx < total-1) { setIdx(i=>i+1); setRevealed(false); setSwiped(null); } }}>→</button>
        </div>
        <div className="card-body" onClick={revealAns}>
          {card?.q}
        </div>
      </div>

      {!revealed && <div className="tap-hint">Tap the card to reveal the answer</div>}

      {/* Answer box */}
      {revealed && (
        <div className={`answer-box ${swiped === 'left' ? 'salmon' : 'green'}`}>
          <div className="answer-label">
            {swiped === 'left' ? 'Correct answer:' : 'Check your answer:'}
          </div>
          {card?.a}
        </div>
      )}

      {/* Swipe buttons — shown after reveal, before swiping */}
      {revealed && !swiped && (
        <div className="swipe-area">
          <div className="swipe-hint">Did you know the answer?</div>
          <div className="swipe-btns">
            <button className="swipe-btn left" onClick={handleLeft}>← No, mark for revision</button>
            <button className="swipe-btn right" onClick={handleRight}>Yes, I knew it ✓</button>
          </div>
        </div>
      )}

      {/* Next / Finish button — shown after swiping */}
      {swiped && (
        <button className={`nf-btn${isLast ? ' red' : ''}`} onClick={handleNext}>
          {isLast ? 'FINISH' : 'NEXT'}
        </button>
      )}
    </div>
  );
}
