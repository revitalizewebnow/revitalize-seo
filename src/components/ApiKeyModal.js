import React, { useState } from 'react';
import { X, Key, Eye, EyeOff, ExternalLink, Check } from 'lucide-react';
import { useApiKey } from '../hooks/useApiKey';
import './ApiKeyModal.css';

export default function ApiKeyModal({ onClose }) {
  const { apiKey, setApiKey } = useApiKey();
  const [draft, setDraft] = useState(apiKey);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKey(draft.trim());
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 700);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <div className="modal-title"><Key size={16} />Anthropic API Key</div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ gap: 16 }}>
          <p className="akm-desc">
            The AI features (copy enhancement, keyword suggestions, SEO sections) require an Anthropic API key.
            Your key is stored locally in your browser only — never sent anywhere except directly to Anthropic.
          </p>
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="akm-link"
          >
            <ExternalLink size={12} />
            Get your API key from console.anthropic.com
          </a>
          <div className="field-row">
            <label className="field-label"><Key size={11} />API Key</label>
            <div className="login-field">
              <input
                className="login-input"
                type={show ? 'text' : 'password'}
                placeholder="sk-ant-api..."
                value={draft}
                onChange={e => setDraft(e.target.value)}
                autoFocus
              />
              <button type="button" className="toggle-show" onClick={() => setShow(!show)}>
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <p className="akm-note">
            Key is saved in your browser's localStorage. Clear browser data to remove it.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className={`btn-save ${saved ? 'btn-save--saved' : ''}`} onClick={handleSave} disabled={!draft.trim()}>
            {saved ? <><Check size={13} />Saved!</> : <><Key size={13} />Save Key</>}
          </button>
        </div>
      </div>
    </div>
  );
}
