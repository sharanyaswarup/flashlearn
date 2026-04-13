import React, { useState, useEffect } from 'react';
import axios from 'axios';

// In production (Render), REACT_APP_API_URL is set to the backend service URL.
// Locally it falls back to the proxy in package.json (empty string = relative path).
axios.defaults.baseURL = process.env.REACT_APP_API_URL || '';
import AuthScreen from './components/AuthScreen';
import UploadScreen from './components/UploadScreen';
import LoadingScreen from './components/LoadingScreen';
import ModeScreen from './components/ModeScreen';
import CardScreen from './components/CardScreen';
import RevisionScreen from './components/RevisionScreen';
import DashboardScreen from './components/DashboardScreen';
import SessionDetailScreen from './components/SessionDetailScreen';
import './App.css';

export const SCREENS = {
  AUTH: 'auth',
  UPLOAD: 'upload',
  LOADING: 'loading',
  MODE: 'mode',
  CARDS: 'cards',
  REV_LOADING: 'rev_loading',
  REVISION: 'revision',
  DASHBOARD: 'dashboard',
  SESSION_DETAIL: 'session_detail',
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.AUTH);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fl_token') || '');
  const [cards, setCards] = useState([]);
  const [leftSwiped, setLeftSwiped] = useState([]);
  const [deck1Done, setDeck1Done] = useState(false);
  const [revNotes, setRevNotes] = useState([]);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [pdfName, setPdfName] = useState('');

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      axios.get('/auth/me').then(res => {
        setUser(res.data);
        setScreen(SCREENS.UPLOAD);
      }).catch(() => {
        localStorage.removeItem('fl_token');
        setToken('');
        setScreen(SCREENS.AUTH);
      });
    }
  }, []);

  const handleAuth = (data) => {
    setToken(data.token);
    localStorage.setItem('fl_token', data.token);
    setUser({ name: data.name, email: data.email });
    setScreen(SCREENS.UPLOAD);
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('fl_token');
    setUser(null);
    setScreen(SCREENS.AUTH);
    setCards([]); setLeftSwiped([]); setDeck1Done(false); setRevNotes([]); setSessionId(null); setPdfName('');
  };

  const handleGenerate = async (file, complexity) => {
    setError('');
    setPdfName(file.name);
    setScreen(SCREENS.LOADING);
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('complexity', complexity);
    try {
      const res = await axios.post('/generate-flashcards', formData);
      setCards(res.data.cards);
      setSessionId(res.data.session_id);
      setLeftSwiped([]); setDeck1Done(false); setRevNotes([]);
      setScreen(SCREENS.MODE);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to generate flashcards. Please try again.');
      setScreen(SCREENS.UPLOAD);
    }
  };

  const handleStartRevision = async () => {
    if (!deck1Done || leftSwiped.length === 0) return;
    setScreen(SCREENS.REV_LOADING);
    try {
      const res = await axios.post('/generate-revision', { leftSwiped });
      setRevNotes(res.data.notes);
      setScreen(SCREENS.REVISION);
    } catch (e) {
      setScreen(SCREENS.MODE);
    }
  };

  const handleDeck1Done = async (swiped) => {
    setLeftSwiped(swiped);
    setDeck1Done(true);
    if (sessionId) {
      try {
        await axios.post(`/session/${sessionId}/complete`, { leftSwiped: swiped, total: cards.length });
      } catch (e) {}
    }
    setScreen(SCREENS.MODE);
  };

  const handleViewSession = (id) => {
    setSelectedSessionId(id);
    setScreen(SCREENS.SESSION_DETAIL);
  };

  return (
    <div className="app-root">
      <div className="bg-decoration">
        <div className="bg-blob bg-blob-1"></div>
        <div className="bg-blob bg-blob-2"></div>
        <div className="bg-blob bg-blob-3"></div>
      </div>

      {screen === SCREENS.AUTH && <AuthScreen onAuth={handleAuth} />}
      {screen === SCREENS.UPLOAD && (
        <UploadScreen onGenerate={handleGenerate} error={error} user={user} onLogout={handleLogout} onDashboard={() => setScreen(SCREENS.DASHBOARD)} />
      )}
      {screen === SCREENS.LOADING && (
        <LoadingScreen message="Generating flashcards from your notes..." sub="This may take up to 30 seconds..." />
      )}
      {screen === SCREENS.MODE && (
        <ModeScreen
          deck1Done={deck1Done} hasLeftSwiped={leftSwiped.length > 0}
          onCurated={() => setScreen(SCREENS.CARDS)} onRevision={handleStartRevision}
          onHome={() => setScreen(SCREENS.UPLOAD)} onDashboard={() => setScreen(SCREENS.DASHBOARD)}
          leftSwipedCount={leftSwiped.length} totalCards={cards.length}
          pdfName={pdfName}
        />
      )}
      {screen === SCREENS.CARDS && (
        <CardScreen cards={cards} onBack={() => setScreen(SCREENS.MODE)} onDone={handleDeck1Done} pdfName={pdfName} onHome={() => setScreen(SCREENS.UPLOAD)} />
      )}
      {screen === SCREENS.REV_LOADING && (
        <LoadingScreen message="Generating your revision notes..." sub="Personalizing based on cards you struggled with..." />
      )}
      {screen === SCREENS.REVISION && (
        <RevisionScreen notes={revNotes} onBack={() => setScreen(SCREENS.MODE)} pdfName={pdfName} onHome={() => setScreen(SCREENS.UPLOAD)} />
      )}
      {screen === SCREENS.DASHBOARD && (
        <DashboardScreen onBack={() => setScreen(SCREENS.UPLOAD)} onViewSession={handleViewSession} user={user} onLogout={handleLogout} />
      )}
      {screen === SCREENS.SESSION_DETAIL && (
        <SessionDetailScreen sessionId={selectedSessionId} onBack={() => setScreen(SCREENS.DASHBOARD)} />
      )}
    </div>
  );
}
