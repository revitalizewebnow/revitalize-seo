import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Leaf, Eye, EyeOff, Lock } from 'lucide-react';
import './Login.css';

export default function Login() {
  const { login, error, loading } = useAuth();
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pw.trim()) login(pw);
  };

  return (
    <div className="login-screen">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-logo">
          <Leaf size={22} className="login-leaf" />
          <span className="login-brand">Revitalize</span>
          <span className="login-badge">SEO</span>
        </div>

        <div className="login-title">Welcome back</div>
        <div className="login-subtitle">Enter your password to access the SEO workflow.</div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <Lock size={14} className="login-field-icon" />
            <input
              className="login-input"
              type={show ? 'text' : 'password'}
              placeholder="Password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              autoFocus
            />
            <button type="button" className="toggle-show" onClick={() => setShow(!show)}>
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button className="login-btn" type="submit" disabled={loading || !pw.trim()}>
            {loading ? 'Checking...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
