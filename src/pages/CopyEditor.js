import React, { useState, useCallback, useRef } from 'react';
import { Link2, ExternalLink, Plus, Trash2, CheckCircle, AlertCircle, Tag, X, ChevronDown, ChevronUp, Sparkles, Building2, Loader2, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BusinessProfileModal from '../components/BusinessProfileModal';
import { useBusinessProfiles } from '../hooks/useBusinessProfiles';
import './CopyEditor.css';

// ── SEO Checklist ──────────────────────────────────────────────────────────
function SEOChecklist({ post }) {
  const checks = [
    { id: 'keywords', label: 'Keywords added', pass: post.keywords.length > 0, hint: `${post.keywords.length} keyword${post.keywords.length !== 1 ? 's' : ''}` },
    { id: 'metaTitle', label: 'Meta title', pass: post.metaTitle.length > 0 && post.metaTitle.length <= 60, hint: post.metaTitle.length > 0 ? `${post.metaTitle.length}/60 chars` : 'Missing' },
    { id: 'metaDesc', label: 'Meta description', pass: post.metaDescription.length >= 120 && post.metaDescription.length <= 160, hint: post.metaDescription.length > 0 ? `${post.metaDescription.length}/160 chars` : 'Missing' },
    { id: 'h2', label: 'H2/H3 headings', pass: /\[H[23]\]/.test(post.content), hint: (post.content.match(/\[H[23]\]/g) || []).length + ' found' },
    { id: 'external', label: '2+ external links', pass: (post.externalLinks || []).length >= 2, hint: `${(post.externalLinks || []).length} of 2` },
    { id: 'internal', label: '2+ internal links', pass: (post.internalLinks || []).length >= 2, hint: `${(post.internalLinks || []).length} of 2` },
    { id: 'wordCount', label: '800+ words', pass: post.content.split(/\s+/).filter(Boolean).length >= 800, hint: `${post.content.split(/\s+/).filter(Boolean).length} words` },
  ];
  const passed = checks.filter(c => c.pass).length;
  return (
    <div className="seo-checklist">
      <div className="checklist-header">
        <span className="checklist-title">SEO Checklist</span>
        <span className="checklist-score">{passed}/{checks.length}</span>
      </div>
      {checks.map(c => (
        <div key={c.id} className={`check-item ${c.pass ? 'check-item--pass' : 'check-item--fail'}`}>
          {c.pass ? <CheckCircle size={13} className="check-icon check-icon--pass" /> : <AlertCircle size={13} className="check-icon check-icon--fail" />}
          <span className="check-label">{c.label}</span>
          <span className="check-hint">{c.hint}</span>
        </div>
      ))}
    </div>
  );
}

// ── Small copy button ──────────────────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button className="inline-copy-btn" onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function CopyEditor({ post, savePost }) {
  const navigate = useNavigate();
  const { profiles, activeProfileId, setActiveProfileId } = useBusinessProfiles();
  const [local, setLocal] = useState({ ...post });
  const [newKw, setNewKw] = useState('');
  const [newExt, setNewExt] = useState({ url: '', anchor: '', description: '' });
  const [newInt, setNewInt] = useState({ url: '', anchor: '', description: '' });
  const [showExt, setShowExt] = useState(true);
  const [showInt, setShowInt] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSection, setAiSection] = useState('');
  const [aiError, setAiError] = useState('');
  const textareaRef = useRef(null);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  const update = useCallback((field, value) => {
    setLocal(prev => {
      const next = { ...prev, [field]: value };
      savePost(next);
      return next;
    });
  }, [savePost]);

  const addKeyword = () => {
    const kw = newKw.trim();
    if (!kw || local.keywords.includes(kw)) return;
    update('keywords', [...local.keywords, kw]);
    setNewKw('');
  };

  const addLink = (type) => {
    const obj = type === 'external' ? newExt : newInt;
    if (!obj.url.trim()) return;
    const field = type === 'external' ? 'externalLinks' : 'internalLinks';
    update(field, [...(local[field] || []), { ...obj, id: Date.now() }]);
    if (type === 'external') setNewExt({ url: '', anchor: '', description: '' });
    else setNewInt({ url: '', anchor: '', description: '' });
  };

  const removeLink = (type, id) => {
    const field = type === 'external' ? 'externalLinks' : 'internalLinks';
    update(field, (local[field] || []).filter(l => l.id !== id));
  };

  // ── AI: Enhance Copy ────────────────────────────────────────────────────
  const runAI = async (task) => {
    if (!local.content.trim()) { setAiError('Please paste your copy first.'); return; }
    setAiLoading(true);
    setAiSection(task);
    setAiError('');

    const profileCtx = activeProfile ? `
Business: ${activeProfile.name}
Description: ${activeProfile.description}
Location: ${activeProfile.location}
Website: ${activeProfile.website}
Target keywords to rank for (DO NOT link to these): ${activeProfile.targetKeywords || '(none)'}
Internal pages available for linking:
${(activeProfile.internalPages || []).map(p => `  - ${p.label}: ${p.url}`).join('\n')}
` : 'No business profile loaded.';

    const tasks = {
      enhance: `You are an expert SEO content editor. The user will give you a raw blog post. Your job is to return an improved version with:
1. Headings marked as [H2] or [H3] at the start of lines (these signal the web dev to use those tags)
2. 2 external links added inline as markdown [anchor text](url) — do NOT link to keywords in targetKeywords
3. If it's a local business, weave in 1-2 local insights naturally
4. Keep the voice and meaning identical — only add structure and links
5. Do NOT add FAQ/Summary sections here — just the main copy with headings and links
Return ONLY the improved copy, no preamble.`,

      keywords: `Analyze this blog post and return a JSON object (no markdown, no backticks) like:
{"keywords": ["kw1","kw2","kw3","kw4","kw5","kw6"], "metaTitle": "...", "metaDescription": "..."}
Rules: keywords should be SEO-relevant phrases from the content (not brand names if targeting generic). metaTitle max 60 chars. metaDescription 120-160 chars, compelling, includes primary keyword. Return ONLY valid JSON.`,

      sections: `You are an expert SEO content strategist. Based on this blog post and business profile, generate these sections formatted exactly as shown:

## Quick Answers
- [Answer 1]
- [Answer 2]
- [Answer 3]
- [Answer 4]
- [Answer 5]

## Frequently Asked Questions
1. **[Question]?** [Answer]
2. **[Question]?** [Answer]
3. **[Question]?** [Answer]
4. **[Question]?** [Answer]
5. **[Question]?** [Answer]

## Key Specifications
- [Spec/fact 1]
- [Spec/fact 2]
- [Spec/fact 3]

## Local Insights
- [Local insight 1]
- [Local insight 2]
- [Local insight 3]

## Expert Summary
[2-3 paragraph expert summary mentioning the business name and location]

Return ONLY these sections, no preamble.`,

      internalLinks: `Based on this blog post and the business profile's internal pages, suggest 3-5 internal link placements. Return JSON (no markdown):
{"suggestions": [{"anchor": "the exact phrase from the copy to link", "url": "/page-path", "reason": "why this link fits"}]}
Only suggest anchors that actually appear in the copy. Return ONLY valid JSON.`,

      photoSuggestions: `Based on this blog post, suggest 4 specific image search queries that would find great photos for this article. Return JSON (no markdown):
{"queries": [{"query": "search query for photo", "caption": "suggested caption", "alt": "suggested alt text", "placement": "where in the article"}]}
Queries should be specific and visual. Return ONLY valid JSON.`
    };

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          system: tasks[task],
          messages: [{ role: 'user', content: `BUSINESS PROFILE:\n${profileCtx}\n\nBLOG POST:\n${local.content}` }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || '';

      if (task === 'enhance') {
        update('content', text);
      } else if (task === 'keywords') {
        try {
          const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
          if (parsed.keywords) update('keywords', parsed.keywords);
          if (parsed.metaTitle) update('metaTitle', parsed.metaTitle);
          if (parsed.metaDescription) update('metaDescription', parsed.metaDescription);
        } catch { setAiError('Could not parse keyword response. Try again.'); }
      } else if (task === 'sections') {
        update('content', local.content.trimEnd() + '\n\n' + text);
      } else if (task === 'internalLinks') {
        try {
          const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
          const newLinks = (parsed.suggestions || []).map(s => ({ ...s, id: Date.now() + Math.random() }));
          update('internalLinks', [...(local.internalLinks || []), ...newLinks]);
        } catch { setAiError('Could not parse internal link suggestions.'); }
      } else if (task === 'photoSuggestions') {
        try {
          const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
          update('aiPhotoSuggestions', parsed.queries || []);
        } catch { setAiError('Could not parse photo suggestions.'); }
      }
    } catch (e) {
      setAiError('AI request failed. Check your connection.');
    }
    setAiLoading(false);
    setAiSection('');
  };

  const wordCount = local.content.split(/\s+/).filter(Boolean).length;
  const charCount = local.content.length;

  return (
    <div className="copy-editor">
      <div className="editor-main">

        {/* ── Business Profile Bar ─────────────────────────────── */}
        <div className="profile-bar">
          <Building2 size={14} className="profile-bar-icon" />
          {activeProfile ? (
            <div className="profile-active">
              <span className="profile-name">{activeProfile.name}</span>
              <span className="profile-location">{activeProfile.location}</span>
            </div>
          ) : (
            <span className="profile-none">No business profile selected</span>
          )}
          <div className="profile-bar-actions">
            <select
              className="profile-select"
              value={activeProfileId || ''}
              onChange={e => setActiveProfileId(e.target.value || null)}
            >
              <option value="">Select profile...</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button className="btn-profile-manage" onClick={() => setShowProfileModal(true)}>
              Manage Profiles
            </button>
          </div>
        </div>

        {/* ── Post Title ──────────────────────────────────────── */}
        <input
          className="post-title-input"
          placeholder="Post title..."
          value={local.title}
          onChange={e => update('title', e.target.value)}
        />

        {/* ── SEO Metadata ────────────────────────────────────── */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-label"><Tag size={13} />SEO Metadata</div>
            <button
              className={`ai-btn ${aiLoading && aiSection === 'keywords' ? 'ai-btn--loading' : ''}`}
              onClick={() => runAI('keywords')}
              disabled={aiLoading}
            >
              {aiLoading && aiSection === 'keywords' ? <Loader2 size={12} className="spin" /> : <Sparkles size={12} />}
              AI Suggest
            </button>
          </div>

          <div className="field-row">
            <label className="field-label">Keywords</label>
            <div className="keyword-input-row">
              <input className="field-input" placeholder="Add keyword..." value={newKw}
                onChange={e => setNewKw(e.target.value)} onKeyDown={e => e.key === 'Enter' && addKeyword()} />
              <button className="btn-sm" onClick={addKeyword}><Plus size={13} /></button>
            </div>
            {local.keywords.length > 0 && (
              <div className="tag-list">
                {local.keywords.map(kw => (
                  <span key={kw} className="tag">{kw}
                    <button className="tag-remove" onClick={() => update('keywords', local.keywords.filter(k => k !== kw))}><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="field-row">
            <label className="field-label">Meta Title <span className={`char-count ${local.metaTitle.length > 60 ? 'char-count--over' : ''}`}>{local.metaTitle.length}/60</span></label>
            <input className="field-input" placeholder="SEO title (50–60 characters)..." value={local.metaTitle} onChange={e => update('metaTitle', e.target.value)} />
          </div>

          <div className="field-row">
            <label className="field-label">Meta Description <span className={`char-count ${local.metaDescription.length > 160 ? 'char-count--over' : local.metaDescription.length >= 120 ? 'char-count--good' : ''}`}>{local.metaDescription.length}/160</span></label>
            <textarea className="field-textarea" rows={3} placeholder="Brief description for search results (120–160 characters)..." value={local.metaDescription} onChange={e => update('metaDescription', e.target.value)} />
          </div>
        </div>

        {/* ── Copy Paste Area ──────────────────────────────────── */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-label" style={{flexDirection:'column', alignItems:'flex-start', gap:'2px'}}>
              Copy
              <div className="content-stats">
                <span>{wordCount} words</span>
                <span>·</span>
                <span>{charCount.toLocaleString()} chars</span>
                <span>·</span>
                <span>~{Math.ceil(wordCount / 200)} min read</span>
              </div>
            </div>
            <div className="ai-btn-group">
              <button className={`ai-btn ${aiLoading && aiSection === 'enhance' ? 'ai-btn--loading' : ''}`}
                onClick={() => runAI('enhance')} disabled={aiLoading}>
                {aiLoading && aiSection === 'enhance' ? <Loader2 size={12} className="spin" /> : <Sparkles size={12} />}
                Enhance Copy
              </button>
              <button className={`ai-btn ai-btn--secondary ${aiLoading && aiSection === 'sections' ? 'ai-btn--loading' : ''}`}
                onClick={() => runAI('sections')} disabled={aiLoading}>
                {aiLoading && aiSection === 'sections' ? <Loader2 size={12} className="spin" /> : <Sparkles size={12} />}
                Add SEO Sections
              </button>
            </div>
          </div>

          <div className="editor-hint">
            <strong>How it works:</strong> Paste your raw copy below. Click <em>Enhance Copy</em> to auto-add H2/H3 markers, external links, and local insights. Click <em>Add SEO Sections</em> to append FAQ, Quick Answers, Local Insights, and Expert Summary.
            <br/>Headings are labeled <code>[H2]</code> or <code>[H3]</code> as instructions for your web developer.
          </div>

          {aiError && <div className="ai-error">{aiError} <button onClick={() => setAiError('')}><X size={12}/></button></div>}

          <textarea
            ref={textareaRef}
            className="copy-textarea"
            placeholder="Paste your raw copy here..."
            value={local.content}
            onChange={e => update('content', e.target.value)}
            rows={20}
          />

          {local.content && (
            <div className="copy-preview-toggle">
              <details>
                <summary>Preview formatted output</summary>
                <div className="copy-preview" dangerouslySetInnerHTML={{__html:
                  local.content
                    .replace(/\[H2\] (.+)/g, '<h2>$1</h2>')
                    .replace(/\[H3\] (.+)/g, '<h3>$1</h3>')
                    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
                    .split('\n').map(l => l.startsWith('<h') ? l : `<p>${l}</p>`).join('')
                }} />
              </details>
            </div>
          )}
        </div>

        {/* ── AI Photo Suggestions ─────────────────────────────── */}
        {(local.aiPhotoSuggestions || []).length > 0 && (
          <div className="panel">
            <div className="panel-label"><Sparkles size={13} />AI Photo Suggestions</div>
            <div className="photo-suggestions">
              {(local.aiPhotoSuggestions || []).map((s, i) => (
                <div key={i} className="photo-suggestion-card">
                  <div className="ps-query">🔍 {s.query}</div>
                  <div className="ps-caption"><strong>Caption:</strong> {s.caption}</div>
                  <div className="ps-alt"><strong>Alt:</strong> {s.alt}</div>
                  <div className="ps-placement"><strong>Placement:</strong> {s.placement}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{display:'flex', gap:'10px'}}>
          <button className={`ai-btn-large ${aiLoading && aiSection === 'photoSuggestions' ? 'ai-btn--loading' : ''}`}
            onClick={() => runAI('photoSuggestions')} disabled={aiLoading}>
            {aiLoading && aiSection === 'photoSuggestions' ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
            Suggest Photos
          </button>
          <button className={`ai-btn-large ${aiLoading && aiSection === 'internalLinks' ? 'ai-btn--loading' : ''}`}
            onClick={() => runAI('internalLinks')} disabled={aiLoading || !activeProfile}>
            {aiLoading && aiSection === 'internalLinks' ? <Loader2 size={14} className="spin" /> : <Link2 size={14} />}
            Suggest Internal Links
            {!activeProfile && <span style={{fontSize:'10px', marginLeft:'4px'}}>(needs profile)</span>}
          </button>
        </div>

        {/* ── External Links ───────────────────────────────────── */}
        <div className="panel">
          <div className="panel-label panel-label--clickable" onClick={() => setShowExt(!showExt)}>
            <ExternalLink size={13} />External Links
            <span className={`link-badge ${(local.externalLinks || []).length >= 2 ? 'link-badge--ok' : ''}`}>{(local.externalLinks || []).length}/2 min</span>
            {showExt ? <ChevronUp size={14} style={{marginLeft:'auto'}} /> : <ChevronDown size={14} style={{marginLeft:'auto'}} />}
          </div>
          {showExt && (
            <>
              <div className="link-form">
                <input className="field-input" placeholder="URL (https://...)" value={newExt.url} onChange={e => setNewExt(p => ({...p, url: e.target.value}))} />
                <input className="field-input" placeholder="Anchor text" value={newExt.anchor} onChange={e => setNewExt(p => ({...p, anchor: e.target.value}))} />
                <input className="field-input" placeholder="Context / note (optional)" value={newExt.description} onChange={e => setNewExt(p => ({...p, description: e.target.value}))} />
                <button className="btn-add" onClick={() => addLink('external')}><Plus size={14} /> Add Link</button>
              </div>
              <div className="link-list">
                {(local.externalLinks || []).map(link => (
                  <div key={link.id} className="link-item">
                    <ExternalLink size={12} className="link-item-icon" />
                    <div className="link-item-content">
                      <span className="link-anchor">"{link.anchor}"</span>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="link-url">{link.url}</a>
                      {link.description && <span className="link-note">{link.description}</span>}
                    </div>
                    <button className="link-remove" onClick={() => removeLink('external', link.id)}><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Internal Links ───────────────────────────────────── */}
        <div className="panel">
          <div className="panel-label panel-label--clickable" onClick={() => setShowInt(!showInt)}>
            <Link2 size={13} />Internal Links
            <span className={`link-badge ${(local.internalLinks || []).length >= 2 ? 'link-badge--ok' : ''}`}>{(local.internalLinks || []).length}/2 min</span>
            {showInt ? <ChevronUp size={14} style={{marginLeft:'auto'}} /> : <ChevronDown size={14} style={{marginLeft:'auto'}} />}
          </div>
          {showInt && (
            <>
              {activeProfile && (activeProfile.internalPages || []).length > 0 && (
                <div className="quick-links">
                  <div className="quick-links-label">Quick add from profile:</div>
                  {(activeProfile.internalPages || []).map((p, i) => (
                    <button key={i} className="quick-link-btn"
                      onClick={() => { setNewInt({ url: p.url, anchor: p.label, description: '' }); }}>
                      + {p.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="link-form">
                <input className="field-input" placeholder="URL path (e.g. /services/seo)" value={newInt.url} onChange={e => setNewInt(p => ({...p, url: e.target.value}))} />
                <input className="field-input" placeholder="Anchor text" value={newInt.anchor} onChange={e => setNewInt(p => ({...p, anchor: e.target.value}))} />
                <input className="field-input" placeholder="Context / note (optional)" value={newInt.description} onChange={e => setNewInt(p => ({...p, description: e.target.value}))} />
                <button className="btn-add" onClick={() => addLink('internal')}><Plus size={14} /> Add Link</button>
              </div>
              <div className="link-list">
                {(local.internalLinks || []).map(link => (
                  <div key={link.id} className="link-item">
                    <Link2 size={12} className="link-item-icon" />
                    <div className="link-item-content">
                      <span className="link-anchor">"{link.anchor}"</span>
                      <span className="link-url">{link.url}</span>
                      {link.description && <span className="link-note">{link.description}</span>}
                      {link.reason && <span className="link-note ai-note">💡 {link.reason}</span>}
                    </div>
                    <button className="link-remove" onClick={() => removeLink('internal', link.id)}><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="editor-actions">
          <button className="btn-next" onClick={() => navigate('/photos')}>Next: Photos →</button>
        </div>
      </div>

      <aside className="editor-aside">
        <SEOChecklist post={local} />
      </aside>

      {showProfileModal && (
        <BusinessProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
}
