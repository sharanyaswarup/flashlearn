import React, { useEffect, useState } from 'react';
import axios from 'axios';

const levelColors = { 1: '#3d9e6a', 2: '#d97c1a', 3: '#c4504a' };
const levelNames  = { 1: 'Easy',    2: 'Medium',  3: 'Hard'    };

function ScoreRing({ score }) {
  if (score === null || score === undefined) return <div className="score-ring pending">–</div>;
  const color = score >= 70 ? '#3d9e6a' : score >= 40 ? '#d97c1a' : '#c4504a';
  return <div className="score-ring" style={{ '--score-color': color }}><span style={{ color }}>{score}%</span></div>;
}

/* ─── Profile Modal ─────────────────────────────────────── */
function ProfileModal({ user, sessions, onClose, onLogout, onAccountDeleted }) {
  const [tab, setTab]         = useState('info');
  const [pw, setPw]           = useState({ current:'', next:'', confirm:'' });
  const [pwErr, setPwErr]     = useState('');
  const [pwOk, setPwOk]       = useState('');
  const [pwLoad, setPwLoad]   = useState(false);
  const [delLoad, setDelLoad] = useState(false);
  const [delErr, setDelErr]   = useState('');

  const joined = user?.joined
    ? new Date(user.joined).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })
    : '—';

  const changePassword = async () => {
    setPwErr(''); setPwOk('');
    if (!pw.current || !pw.next || !pw.confirm) { setPwErr('All fields are required.'); return; }
    if (pw.next.length < 6) { setPwErr('New password must be at least 6 characters.'); return; }
    if (pw.next !== pw.confirm) { setPwErr('New passwords do not match.'); return; }
    setPwLoad(true);
    try {
      await axios.post('/auth/change-password', { currentPassword: pw.current, newPassword: pw.next });
      setPwOk('✅ Password changed successfully!');
      setPw({ current:'', next:'', confirm:'' });
    } catch(e) { setPwErr(e.response?.data?.error || 'Failed. Try again.'); }
    finally { setPwLoad(false); }
  };

  const deleteAccount = async () => {
    setDelErr(''); setDelLoad(true);
    try { await axios.delete('/auth/account'); onAccountDeleted(); }
    catch(e) { setDelErr(e.response?.data?.error || 'Failed. Try again.'); setDelLoad(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box profile-modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="profile-modal-header">
          <div className="profile-avatar-lg">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          <div>
            <div className="profile-modal-name">{user?.name}</div>
            <div className="profile-modal-email">{user?.email}</div>
          </div>
        </div>

        <div className="profile-tabs">
          <button className={`profile-tab ${tab==='info'     ?'active':''}`} onClick={() => setTab('info')}>👤 Profile</button>
          <button className={`profile-tab ${tab==='password' ?'active':''}`} onClick={() => setTab('password')}>🔑 Password</button>
          <button className={`profile-tab danger-tab ${tab==='delete'?'active':''}`} onClick={() => setTab('delete')}>🗑️ Delete</button>
        </div>

        {/* INFO */}
        {tab === 'info' && (
          <div className="profile-tab-content">
            <div className="profile-info-grid">
              <div><div className="profile-info-label">Full Name</div><div className="profile-info-value">{user?.name}</div></div>
              <div><div className="profile-info-label">Email</div><div className="profile-info-value">{user?.email}</div></div>
              <div><div className="profile-info-label">Member Since</div><div className="profile-info-value">{joined}</div></div>
            </div>
            <div className="profile-stats-row">
              <div className="profile-stat"><div className="profile-stat-num">{sessions.length}</div><div className="profile-stat-lbl">Sessions</div></div>
              <div className="profile-stat"><div className="profile-stat-num">{sessions.reduce((a,s)=>a+(s.total||0),0)}</div><div className="profile-stat-lbl">Cards</div></div>
              <div className="profile-stat"><div className="profile-stat-num">{sessions.filter(s=>s.completed).length}</div><div className="profile-stat-lbl">Done</div></div>
            </div>
            <button className="modal-btn secondary" onClick={onLogout}>🚪 Sign Out</button>
          </div>
        )}

        {/* PASSWORD */}
        {tab === 'password' && (
          <div className="profile-tab-content">
            {[['Current Password','current','Enter current password'],['New Password','next','Min. 6 characters'],['Confirm New Password','confirm','Repeat new password']].map(([lbl,key,ph]) => (
              <div className="auth-field" key={key}>
                <label className="auth-label">{lbl}</label>
                <input className="auth-input" type="password" placeholder={ph} value={pw[key]} onChange={e=>setPw(f=>({...f,[key]:e.target.value}))} />
              </div>
            ))}
            {pwErr && <div className="auth-error">{pwErr}</div>}
            {pwOk  && <div className="pw-success">{pwOk}</div>}
            <button className="modal-btn primary" onClick={changePassword} disabled={pwLoad}>
              {pwLoad ? <span className="auth-spinner"/> : '🔑 Change Password'}
            </button>
          </div>
        )}

        {/* DELETE */}
        {tab === 'delete' && (
          <div className="profile-tab-content">
            <div className="delete-warning">⚠️ <strong>This cannot be undone.</strong> All your sessions, flashcards, and progress will be permanently deleted.</div>
            <div className="delete-checklist">
              <div className="delete-check-item">✕ All {sessions.length} sessions erased</div>
              <div className="delete-check-item">✕ All flashcard data removed</div>
              <div className="delete-check-item">✕ Account permanently closed</div>
            </div>
            {delErr && <div className="auth-error">{delErr}</div>}
            <button className="modal-btn confirm-danger" onClick={deleteAccount} disabled={delLoad}>
              {delLoad ? <span className="auth-spinner"/> : '🗑️ Yes, Delete My Account'}
            </button>
            <button className="modal-btn secondary" onClick={() => setTab('info')}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Dashboard ─────────────────────────────────────────── */
export default function DashboardScreen({ onBack, onViewSession, user, onLogout }) {
  const [sessions,    setSessions]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [deletingId,  setDeletingId]  = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu,    setShowMenu]    = useState(false);
  const [fullUser,    setFullUser]    = useState(user);

  useEffect(() => {
    axios.get('/auth/me').then(r => setFullUser(r.data)).catch(() => {});
    setLoading(true);
    axios.get('/progress').then(r => setSessions(r.data.sessions || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!showMenu) return;
    const close = () => setShowMenu(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showMenu]);

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this session? This cannot be undone.')) return;
    setDeletingId(id);
    try { await axios.delete(`/session/${id}`); setSessions(p => p.filter(s => s.id !== id)); }
    catch { alert('Failed to delete. Please try again.'); }
    finally { setDeletingId(null); }
  };

  const avgScore = (() => {
    const done = sessions.filter(s => s.score !== null);
    return done.length ? Math.round(done.reduce((a,s) => a+s.score, 0) / done.length) : null;
  })();

  const fmtDate = str => str ? new Date(str).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '';

  return (
    <div className="screen dashboard-screen">
      <div className="top-nav">
        <div className="top-nav-brand">
          <span className="top-nav-logo">FL</span>
          <span className="top-nav-name">FlashLearn</span>
        </div>
        <div className="top-nav-right">
          <div className="user-chip" onClick={e => { e.stopPropagation(); setShowMenu(m => !m); }}>
            <span className="user-avatar">{fullUser?.name?.[0]?.toUpperCase() || 'U'}</span>
            <span className="user-label">{fullUser?.name}</span>
            <span style={{ fontSize:10, color:'var(--ink3)', marginLeft:2 }}>▾</span>

            {showMenu && (
              <div className="user-dropdown" onClick={e => e.stopPropagation()}>
                <div className="user-dropdown-header">
                  <div className="user-dropdown-name">{fullUser?.name}</div>
                  <div className="user-dropdown-email">{fullUser?.email}</div>
                </div>
                <button className="dropdown-btn" onClick={() => { setShowProfile(true); setShowMenu(false); }}>👤 View Profile</button>
                <button className="dropdown-btn" onClick={() => { setShowProfile(true); setShowMenu(false); }}>🔑 Change Password</button>
                <div className="dropdown-divider"/>
                <button className="dropdown-btn danger" onClick={() => { setShowProfile(true); setShowMenu(false); }}>🗑️ Delete Account</button>
                <div className="dropdown-divider"/>
                <button className="dropdown-btn" onClick={onLogout}>🚪 Sign Out</button>
              </div>
            )}
          </div>
          <button className="nav-pill outline" onClick={onBack}>⬅ Back</button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h2 className="dashboard-title">My Progress</h2>
            <p className="dashboard-sub">Track your learning journey across all sessions</p>
          </div>
        </div>

        <div className="stats-row">
          {[
            [sessions.length, 'Sessions'],
            [sessions.reduce((a,s) => a+(s.total||0),0), 'Cards Studied'],
            [avgScore !== null ? `${avgScore}%` : '–', 'Avg Score', avgScore !== null ? (avgScore>=70?'#3d9e6a':avgScore>=40?'#d97c1a':'#c4504a') : undefined],
            [sessions.filter(s=>s.completed).length, 'Completed'],
          ].map(([val,lbl,col],i) => (
            <div className="stat-card" key={i}>
              <div className="stat-num" style={col?{color:col}:{}}>{val}</div>
              <div className="stat-lbl">{lbl}</div>
            </div>
          ))}
        </div>

        <div className="sessions-section">
          <h3 className="sessions-title">Session History</h3>
          {loading && <div className="sessions-loading"><div className="loading-dots small"><span/><span/><span/></div></div>}
          {!loading && sessions.length === 0 && (
            <div className="sessions-empty">
              <div className="sessions-empty-icon">📚</div>
              <div className="sessions-empty-title">No sessions yet</div>
              <div className="sessions-empty-sub">Upload a PDF to generate your first flashcard set</div>
            </div>
          )}
          {!loading && sessions.map(s => (
            <div className="session-row" key={s.id} onClick={() => onViewSession(s.id)}>
              <div className="session-row-left">
                <div className="session-pdf-icon">📄</div>
                <div className="session-info">
                  <div className="session-pdf-name">{s.pdf_name}</div>
                  <div className="session-meta">
                    <span className="session-level-chip" style={{ background:levelColors[s.complexity]+'22', color:levelColors[s.complexity], borderColor:levelColors[s.complexity]+'44' }}>{levelNames[s.complexity]}</span>
                    <span className="session-date">{fmtDate(s.created_at)}</span>
                    <span className="session-cards">{s.total} cards</span>
                    {s.completed && <span className="session-status-chip">✓ Done</span>}
                  </div>
                </div>
              </div>
              <div className="session-row-right">
                <ScoreRing score={s.score} />
                <button className="session-delete-btn" onClick={e => deleteSession(e, s.id)} disabled={deletingId===s.id} title="Delete session">
                  {deletingId===s.id ? '…' : '🗑'}
                </button>
                <div className="session-view-arrow">›</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showProfile && (
        <ProfileModal user={fullUser} sessions={sessions} onClose={() => setShowProfile(false)} onLogout={onLogout} onAccountDeleted={onLogout} />
      )}
    </div>
  );
}
