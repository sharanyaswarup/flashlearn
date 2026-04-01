import React from 'react';

export default function ModeScreen({ deck1Done, hasLeftSwiped, onCurated, onRevision, onHome }) {
  const revEnabled = deck1Done && hasLeftSwiped;
  const revBadge = !deck1Done
    ? 'Complete Deck 1 first'
    : !hasLeftSwiped
    ? 'No cards to revise!'
    : null;

  return (
    <div className="screen">
      <button className="back-btn" onClick={onHome}>←</button>
      <div className="logo">FlashLearn</div>
      <div className="tagline">Smart flashcard curator</div>

      <p className="mode-question">What would you like to choose?</p>

      <div className="mode-cards">
        {/* Curated Questions */}
        <div className="mode-card" onClick={onCurated}>
          <div className="mode-card-inner">Curated<br />Questions</div>
        </div>

        {/* Revision */}
        <div
          className={`mode-card${revEnabled ? '' : ' disabled'}`}
          onClick={revEnabled ? onRevision : undefined}
        >
          <div className="mode-card-inner" style={{ color: revEnabled ? '#1a1a2e' : '#999' }}>
            Revision
          </div>
          {revBadge && <div className="mode-badge">{revBadge}</div>}
        </div>
      </div>

      {deck1Done && <div className="success-msg">PDF is successfully uploaded!</div>}

      {deck1Done && (
        <div className="bottom-btns">
          <button className="btn green" onClick={onHome}>HOME</button>
          <button className="btn red" onClick={() => window.close()}>QUIT</button>
        </div>
      )}
    </div>
  );
}
