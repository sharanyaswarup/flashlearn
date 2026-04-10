import React, { useEffect, useState } from 'react';
import axios from 'axios';

const levelColors = { 1: '#3d9e6a', 2: '#d97c1a', 3: '#c4504a' };
const levelNames  = { 1: 'Easy',    2: 'Medium',  3: 'Hard'    };

export default function SessionDetailScreen({ sessionId, onBack }) {
  const [session,  setSession]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    axios.get(`/progress/${sessionId}`).then(r => setSession(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [sessionId]);

  const fmtDate = str => str ? new Date(str).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '';
  const scoreColor = s => s >= 70 ? '#3d9e6a' : s >= 40 ? '#d97c1a' : '#c4504a';

  const Nav = () => (
    <div className="top-nav">
      <div className="top-nav-brand"><span className="top-nav-logo">FL</span><span className="top-nav-name">FlashLearn</span></div>
      <button className="nav-pill outline" onClick={onBack}>⬅ Back</button>
    </div>
  );

  if (loading) return (
    <div className="screen dashboard-screen"><Nav />
      <div style={{ display:'flex', justifyContent:'center', marginTop:80 }}>
        <div className="loading-dots"><span/><span/><span/></div>
      </div>
    </div>
  );

  if (!session) return (
    <div className="screen dashboard-screen"><Nav />
      <div style={{ textAlign:'center', marginTop:80, color:'var(--ink3)' }}>Session not found.</div>
    </div>
  );

  const knownCount = session.total - session.left_swiped_count;

  return (
    <div className="screen dashboard-screen">
      <Nav />
      <div className="dashboard-content">
        {/* Header */}
        <div className="detail-header">
          <div className="detail-pdf-row">
            <span className="detail-pdf-icon">📄</span>
            <div>
              <div className="detail-pdf-name">{session.pdf_name}</div>
              <div className="detail-pdf-date">{fmtDate(session.created_at)}</div>
            </div>
            <span className="session-level-chip" style={{ marginLeft:'auto', background: levelColors[session.complexity]+'22', color: levelColors[session.complexity], borderColor: levelColors[session.complexity]+'44' }}>
              {levelNames[session.complexity]} — Level {session.complexity}
            </span>
          </div>
        </div>

        {/* Score */}
        {session.completed && session.score !== null ? (
          <div className="detail-score-card" style={{ '--score-color': scoreColor(session.score) }}>
            <div className="detail-score-big" style={{ color: scoreColor(session.score) }}>{session.score}%</div>
            <div className="detail-score-label">Session Score</div>
            <div className="detail-score-breakdown">
              <div className="dsb-item"><div className="dsb-num green">{knownCount}</div><div className="dsb-lbl">Knew It</div></div>
              <div className="dsb-sep" />
              <div className="dsb-item"><div className="dsb-num red">{session.left_swiped_count}</div><div className="dsb-lbl">Needs Work</div></div>
              <div className="dsb-sep" />
              <div className="dsb-item"><div className="dsb-num">{session.total}</div><div className="dsb-lbl">Total</div></div>
            </div>
            <div className="detail-score-bar-wrap">
              <div className="detail-score-bar">
                <div className="detail-score-bar-fill" style={{ width:`${session.score}%`, background: scoreColor(session.score) }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="detail-score-card incomplete">
            <div className="detail-score-big" style={{ color:'var(--ink3)' }}>–</div>
            <div className="detail-score-label">Session not completed yet</div>
          </div>
        )}

        {/* Cards list */}
        <div className="sessions-section">
          <h3 className="sessions-title">All Flashcards ({session.cards?.length || 0})</h3>
          {session.cards?.map((card, i) => (
            <div className="qa-row" key={i} onClick={() => setExpanded(expanded === i ? null : i)}>
              <div className="qa-row-top">
                <span className="qa-num">Q{i + 1}</span>
                <span className="qa-question">{card.q}</span>
                <span className="qa-toggle">{expanded === i ? '▲' : '▼'}</span>
              </div>
              {expanded === i && (
                <div className="qa-answer">
                  <span className="qa-answer-label">Answer:</span>
                  <span className="qa-answer-text">{card.a}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
