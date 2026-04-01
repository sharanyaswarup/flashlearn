import React, { useState } from 'react';
import axios from 'axios';
import UploadScreen from './components/UploadScreen';
import LoadingScreen from './components/LoadingScreen';
import ModeScreen from './components/ModeScreen';
import CardScreen from './components/CardScreen';
import RevisionScreen from './components/RevisionScreen';
import './App.css';

export const SCREENS = {
  UPLOAD: 'upload',
  LOADING: 'loading',
  MODE: 'mode',
  CARDS: 'cards',
  REV_LOADING: 'rev_loading',
  REVISION: 'revision',
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.UPLOAD);
  const [cards, setCards] = useState([]);
  const [leftSwiped, setLeftSwiped] = useState([]);
  const [deck1Done, setDeck1Done] = useState(false);
  const [revNotes, setRevNotes] = useState([]);
  const [error, setError] = useState('');

  // ── Upload & generate flashcards ──────────────────────────────
  const handleGenerate = async (file) => {
    setError('');
    setScreen(SCREENS.LOADING);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await axios.post('/generate-flashcards', formData);
      setCards(res.data.cards);
      setLeftSwiped([]);
      setDeck1Done(false);
      setRevNotes([]);
      setScreen(SCREENS.MODE);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to generate flashcards. Please try again.');
      setScreen(SCREENS.UPLOAD);
    }
  };

  // ── Start revision (generate notes for left-swiped cards) ─────
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

  // ── Deck 1 finished ───────────────────────────────────────────
  const handleDeck1Done = (swiped) => {
    setLeftSwiped(swiped);
    setDeck1Done(true);
    setScreen(SCREENS.MODE);
  };

  return (
    <div className="app-root">
      <div className="bg-q-mark">?</div>

      {screen === SCREENS.UPLOAD && (
        <UploadScreen onGenerate={handleGenerate} error={error} />
      )}
      {screen === SCREENS.LOADING && (
        <LoadingScreen message="Generating flashcards from your notes...." sub="This may take up to 30 seconds.." />
      )}
      {screen === SCREENS.MODE && (
        <ModeScreen
          deck1Done={deck1Done}
          hasLeftSwiped={leftSwiped.length > 0}
          onCurated={() => setScreen(SCREENS.CARDS)}
          onRevision={handleStartRevision}
          onHome={() => setScreen(SCREENS.UPLOAD)}
        />
      )}
      {screen === SCREENS.CARDS && (
        <CardScreen
          cards={cards}
          onBack={() => setScreen(SCREENS.MODE)}
          onDone={handleDeck1Done}
        />
      )}
      {screen === SCREENS.REV_LOADING && (
        <LoadingScreen message="Generating your revision notes...." sub="Personalizing based on cards you struggled with.." />
      )}
      {screen === SCREENS.REVISION && (
        <RevisionScreen
          notes={revNotes}
          onBack={() => setScreen(SCREENS.MODE)}
        />
      )}
    </div>
  );
}
