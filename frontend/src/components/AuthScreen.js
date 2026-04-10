import React, { useState } from 'react';
import axios from 'axios';

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload  = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };
      const res = await axios.post(endpoint, payload);
      onAuth(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong. Try again.');
    } finally { setLoading(false); }
  };

  const field = (label, type, key, placeholder) => (
    <div className="auth-field">
      <label className="auth-label">{label}</label>
      <input
        className="auth-input" type={type} placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      />
    </div>
  );

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">FlashLearn</div>
          <div className="auth-tagline">AI-powered flashcards that adapt to your learning pace.</div>
        </div>
        <div className="auth-features">
          <div className="auth-feature"><span className="auth-feature-icon">⚡</span> Generate flashcards from any PDF in seconds</div>
          <div className="auth-feature"><span className="auth-feature-icon">🎯</span> 3 difficulty levels — Easy, Medium, Hard</div>
          <div className="auth-feature"><span className="auth-feature-icon">📈</span> Track progress across all sessions</div>
          <div className="auth-feature"><span className="auth-feature-icon">🔁</span> Smart revision for cards you struggled with</div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-logo">FL</div>
          <h2 className="auth-card-title">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p className="auth-card-sub">{mode === 'login' ? 'Sign in to continue learning' : 'Start your learning journey'}</p>

          <div className="auth-tabs">
            <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>Sign In</button>
            <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setError(''); }}>Sign Up</button>
          </div>

          {mode === 'register' && field('Full Name', 'text', 'name', 'Jane Doe')}
          {field('Email', 'email', 'email', 'jane@example.com')}
          {field('Password', 'password', 'password', mode === 'register' ? 'Min. 6 characters' : '••••••••')}

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="auth-spinner" /> : (mode === 'login' ? 'Sign In →' : 'Create Account →')}
          </button>

          <p className="auth-switch">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button className="auth-switch-btn" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
