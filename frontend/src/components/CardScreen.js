import React, { useState, useEffect, useRef } from 'react';

export default function CardScreen({ cards, onBack, onDone }) {
  const [idx, setIdx]         = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [swiped, setSwiped]   = useState(null);
  const [leftSwiped, setLeftSwiped] = useState([]);
  const [flipped, setFlipped] = useState(false);
  const [swipeAnim, setSwipeAnim] = useState(null);
  const touchStartX = useRef(null);

  useEffect(() => { setIdx(0); setRevealed(false); setSwiped(null); setLeftSwiped([]); setFlipped(false); }, [cards]);

  const card   = cards[idx];
  const isLast = idx === cards.length - 1;
  const total  = cards.length;
  const progress = ((idx + 1) / total) * 100;

  const reveal = () => { if (!revealed) { setRevealed(true); setFlipped(true); } };

  const doSwipe = dir => {
    setSwipeAnim(dir);
    setTimeout(() => {
      if (dir === 'left') {
        setSwiped('left');
        setLeftSwiped(prev => prev.find(c => c.q === card.q) ? prev : [...prev, card]);
      } else {
        setSwiped('right');
      }
      setSwipeAnim(null);
    }, 360);
  };

  const handleNext = () => {
    if (isLast) onDone(leftSwiped);
    else { setIdx(i => i + 1); setRevealed(false); setSwiped(null); setFlipped(false); }
  };

  const goTo = n => {
    if (n < 0 || n >= total) return;
    setIdx(n); setRevealed(false); setSwiped(null); setFlipped(false);
  };

  const onTouchStart = e => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = e => {
    if (touchStartX.current === null || !revealed || swiped) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 55) doSwipe(diff < 0 ? 'left' : 'right');
    touchStartX.current = null;
  };

  return (
    <div className="screen card-screen">
      <div className="top-nav">
        <div className="top-nav-brand"><span className="top-nav-logo">FL</span><span className="top-nav-name">FlashLearn</span></div>
        <button className="nav-pill outline" onClick={onBack}>⬅ Back</button>
      </div>

      <div className="card-screen-content">
        {/* Progress */}
        <div className="card-progress-area">
          <div className="card-progress-info">
            <span className="card-progress-label">Card {idx + 1} of {total}</span>
            <span className="card-progress-pct">{Math.round(progress)}%</span>
          </div>
          <div className="card-progress-bar"><div className="card-progress-fill" style={{ width: `${progress}%` }} /></div>
        </div>

        {/* Swipe hints (shown after reveal) */}
        {revealed && !swiped && (
          <div className="swipe-hint-area">
            <div className="swipe-hint-item left">
              <div className="swipe-hint-icon left">✕</div>
              <span>Swipe left — needs work</span>
            </div>
            <div className="swipe-hint-item right">
              <span>Got it — swipe right</span>
              <div className="swipe-hint-icon right">✓</div>
            </div>
          </div>
        )}

        {/* Flashcard */}
        <div
          className={`flashcard-container${swipeAnim === 'left' ? ' swipe-overlay-left' : swipeAnim === 'right' ? ' swipe-overlay-right' : ''}`}
          onClick={!revealed ? reveal : undefined}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className={`flashcard${flipped ? ' flipped' : ''}`}>
            <div className="flashcard-front">
              <div className="flashcard-badge">Question</div>
              <div className="flashcard-text">{card?.q}</div>
              {!revealed && <div className="flashcard-hint">👆 Tap to reveal answer</div>}
            </div>
            <div className="flashcard-back">
              <div className="flashcard-badge answer-badge">Answer</div>
              <div className="flashcard-text">{card?.a}</div>
            </div>
          </div>
        </div>

        {/* Know / Don't know */}
        {revealed && !swiped && (
          <div className="know-area">
            <p className="know-question">Did you know this?</p>
            <div className="know-btns">
              <button className="know-btn no"  onClick={() => doSwipe('left')}><span className="know-icon">✕</span><span>Needs Revision</span></button>
              <button className="know-btn yes" onClick={() => doSwipe('right')}><span className="know-icon">✓</span><span>Got It!</span></button>
            </div>
          </div>
        )}

        {/* After swipe */}
        {swiped && (
          <div className="after-swipe">
            <div className={`swipe-result ${swiped === 'right' ? 'good' : 'bad'}`}>
              {swiped === 'right' ? '🎉 Great, you knew it!' : '📌 Added to revision list'}
            </div>
            <div className="nav-row">
              <button className="nav-arrow-btn" onClick={() => goTo(idx - 1)} disabled={idx === 0}>← Prev</button>
              <button className="next-btn" onClick={handleNext}>{isLast ? '🏁 Finish' : 'Next →'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
