import React from 'react';

export default function ModeScreen({ deck1Done, hasLeftSwiped, onCurated, onRevision, onHome, onDashboard, leftSwipedCount, totalCards }) {
  const revEnabled = deck1Done && hasLeftSwiped;
  const knownCount = totalCards - leftSwipedCount;

  return (
    <div className="screen mode-screen">
      <div className="top-nav">
        <div className="top-nav-brand">
          <span className="top-nav-logo">FL</span>
          <span className="top-nav-name">FlashLearn</span>
        </div>
        <div className="top-nav-right">
          <button className="nav-pill" onClick={onDashboard}>📊 Progress</button>
          <button className="nav-pill outline" onClick={onHome}>⬅ Upload New</button>
        </div>
      </div>
      <div className="mode-content">
        <div className="mode-header">
          <h2 className="mode-title">What would you like to do?</h2>
          {deck1Done && (
            <div className="mode-score-banner">
              <div className="score-stat"><span className="score-num green">{knownCount}</span><span className="score-lbl">Knew it</span></div>
              <div className="score-divider" />
              <div className="score-stat"><span className="score-num red">{leftSwipedCount}</span><span className="score-lbl">Needs work</span></div>
              <div className="score-divider" />
              <div className="score-stat"><span className="score-num">{totalCards}</span><span className="score-lbl">Total</span></div>
            </div>
          )}
        </div>
        <div className="mode-cards-grid">
          <div className="mode-option-card" onClick={onCurated}>
            <div className="mode-option-icon">🃏</div>
            <div className="mode-option-title">Curated Questions</div>
            <div className="mode-option-desc">Go through all {totalCards} flashcards and test your knowledge</div>
            <div className="mode-option-arrow">→</div>
          </div>
          <div className={`mode-option-card ${!revEnabled ? 'disabled' : 'revision-card'}`} onClick={revEnabled ? onRevision : undefined}>
            <div className="mode-option-icon">🔁</div>
            <div className="mode-option-title">Smart Revision</div>
            <div className="mode-option-desc">
              {!deck1Done ? 'Complete a deck first to unlock revision'
                : !hasLeftSwiped ? '🎉 No cards to revise — perfect score!'
                : `Review ${leftSwipedCount} card${leftSwipedCount !== 1 ? 's' : ''} you struggled with`}
            </div>
            {revEnabled ? <div className="mode-option-arrow">→</div> : <div className="mode-locked">🔒</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
