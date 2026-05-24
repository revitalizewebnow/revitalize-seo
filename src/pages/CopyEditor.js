import React, { useState, useCallback, useRef } from 'react';
import { Link2, ExternalLink, Plus, Trash2, CheckCircle, AlertCircle, Tag, X, ChevronDown, ChevronUp, Sparkles, Building2, Loader2, Copy, Check, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BusinessProfileModal from '../components/BusinessProfileModal';
import ApiKeyModal from '../components/ApiKeyModal';
import { useBusinessProfiles } from '../hooks/useBusinessProfiles';
import { useApiKey } from '../hooks/useApiKey';
import './CopyEditor.css';

// ── SEO Checklist ──────────────────────────────────────────────────────────
function SEOChecklist({ post }) {
  const checks = [
    { id: 'title', label: 'Blog title', pass: (post.title || '').trim().length > 0, hint: post.title ? `${post.title.length} chars` : 'Missing' },
    { id: 'keywords', label: 'Keywords added', pass: post.keywords.length > 0, hint: `${post.keywords.length} keyword${post.keywords.length !== 1 ? 's' : ''}` },
    { id: 'metaTitle', label: 'Meta title', pass: post.metaTitle.length > 0 && post.metaTitle.length <= 60, hint: post.metaTitle.length > 0 ? `${post.metaTitle.length}/60` : 'Missing' },
    { id: 'metaDesc', label: 'Meta description', pass: post.metaDescription.length >= 120 && post.metaDescription.length <= 160, hint: post.metaDescription.length > 0 ? `${post.metaDescription.length}/160` : 'Missing' },
    { id: 'h2', label: 'H2/H3 headings', pass: /\[H[23]\]/.test(post.content), hint: (post.content.match(/\[H[23]\]/g) || []).length + ' found' },
    { id: 'external', label: '2+ external links', pass: (post.externalLinks || []).length >= 2, hint: `${(post.externalLinks || []).length}/2` },
    { id: 'internal', label: '2+ internal links', pass: (post.internalLinks || []).length >= 2, hint: `${(post.internalLinks || []).length}/2` },
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

// ── Main Component ─────────────────────────────────────────────────────────
export default function CopyEditor({ post, savePost }) {
  const navigate = useNavigate();
  const { profiles, activeProfileId, setActiveProfileId } = useBusinessProfiles();
  const { apiKey } = useApiKey();
  const [local, setLocal] = useState({ ...post });
  const [newKw, setNewKw] = useState('');
  const [newExt, setNewExt] = useState({ url: '', anchor: '', description: '' });
  const [newInt, setNewInt] = useState({ url: '', anchor: '', description: '' });
  const [showExt, setShowExt] = useState(true);
  const [showInt, setShowInt] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSection, setAiSection] = useState('');
  const [aiError, setAiError] = useState('');

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

  // ── AI ──────────────────────────────────────────────────────────────────
  const runAI = async (task) => {
    if (!local.content.trim()) { setAiError('Please paste your copy first.'); return; }
    if (!apiKey) { setShowApiKeyModal(true); return; }

    setAiLoading(true);
    setAiSection(task);
    setAiError('');

    const profileCtx = activeProfile ? `Business: ${activeProfile.name}
Description: ${activeProfile.description}
Location: ${activeProfile.location}
Website: ${activeProfile.website}
Target keywords (DO NOT use as external link anchors): ${activeProfile.targetKeywords || 'none'}
Internal pages:
${(activeProfile.internalPages || []).map(p => `  - ${p.label}: ${p.url}`).join('\n') || '  none'}` : 'No business profile provided.';

    const systemPrompts = {
      enhance: `You are an expert SEO content editor. Improve the blog post by:
1. Marking section headings as [H2] Heading text or [H3] Subheading text (place the marker at the start of each heading line)
2. Adding exactly 2 external links inline as [anchor text](https://full-url.com) — choose authoritative sources like industry publications, Wikipedia, or government sites. Do NOT link keywords listed in targetKeywords
3. If the business is local, naturally weave in 1-2 location-specific references
4. Keep the voice, tone and meaning exactly the same — only add structure and links
5. Do NOT add FAQ, Quick Answers, or summary sections
Return ONLY the improved copy with no preamble or explanation.`,

      keywords: `Analyze the blog post and return ONLY this JSON object with no markdown fences, no backticks, no preamble:
{"keywords":["kw1","kw2","kw3","kw4","kw5","kw6"],"metaTitle":"...","metaDescription":"..."}
Rules: keywords = 5-8 specific SEO phrases from the content. metaTitle max 60 chars. metaDescription 130-155 chars, compelling, includes primary keyword.`,

      sections: `You are an expert SEO content strategist for local businesses. Generate these EXACT sections based on the blog post and business profile. Use real, specific information from the content — no placeholders.

## Quick Answers
- [specific answer about the topic]
- [specific answer about the topic]
- [specific answer about the topic]
- [specific answer about the topic]
- [specific answer about the topic]

## Frequently Asked Questions
1. **[Specific question about the topic]?** [Detailed answer]
2. **[Specific question]?** [Detailed answer]
3. **[Specific question]?** [Detailed answer]
4. **[Specific question]?** [Detailed answer]
5. **[Specific question]?** [Detailed answer]

## Key Specifications
- [Specific fact or spec from the content]
- [Specific fact or spec]
- [Specific fact or spec]

## Local Insights
- [Business name] is located in [location] and [local insight]
- [Another local insight relevant to the topic and location]
- [Another local connection]

## Expert Summary
[2-3 paragraphs summarizing the article, mentioning the business name and location naturally, written as an authoritative summary]

Return ONLY these sections. No preamble.`,

      internalLinks: `Based on the blog post and the internal pages listed in the business profile, suggest 3-5 internal link placements. Return ONLY this JSON with no markdown fences:
{"suggestions":[{"anchor":"exact phrase from the copy","url":"/page-path","reason":"brief reason"}]}
Only suggest phrases that actually appear verbatim in the copy text.`,

      photoSuggestions: `Based on the blog post content, suggest 4 specific photo search queries. Return ONLY this JSON with no markdown fences:
{"queries":[{"query":"specific photo search query","caption":"suggested image caption","alt":"descriptive alt text for SEO and accessibility","placement":"where in article this photo would work best"}]}
Make queries specific and visual — they should find real, relevant photos.`
    };

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 4000,
          system: systemPrompts[task],
          messages: [{ role: 'user', content: `BUSINESS PROFILE:\n${profileCtx}\n\nBLOG POST:\n${local.content}` }]
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const text = (data.content?.[0]?.text || '').trim();

      if (task === 'enhance') {
        update('content', text);
      } else if (task === 'keywords') {
        try {
          const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
          if (parsed.keywords) update('keywords', parsed.keywords);
          if (parsed.metaTitle) update('metaTitle', parsed.metaTitle);
          if (parsed.metaDescription) update('metaDescription', parsed.metaDescription);
        } catch { setAiError('Could not parse keyword suggestions — try again.'); }
      } else if (task === 'sections') {
        update('content', local.content.trimEnd() + '\n\n' + text);
      } else if (task === 'internalLinks') {
        try {
          const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
          const newLinks = (parsed.suggestions || []).map(s => ({ ...s, id: Date.now() + Math.random() }));
          update('internalLinks', [...(local.internalLinks || []), ...newLinks]);
        } catch { setAiError('Could not parse internal link suggestions — try again.'); }
      } else if (task === 'photoSuggestions') {
        try {
          const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
          update('aiPhotoSuggestions', parsed.queries || []);
        } catch { setAiError('Could not parse photo suggestions — try again.'); }
      }
    } catch (e) {
      setAiError(`AI error: ${e.message || 'Unknown error. Check your API key.'}`);
    }
    setAiLoading(false);
    setAiSection('');
  };

  const wordCount = (local.content || '').split(/\s+/).filter(Boolean).length;
  const charCount = (local.content || '').length;

  return (
    <div className="copy-editor">
      <div className="editor-main">

        {/* ── Business Profile Bar ── */}
        <div className="profile-bar">
          <Building2 size={14} className="profile-bar-icon" />
          {activeProfile ? (
            <div className="profile-active">
              <span className="profile-name">{activeProfile.name}</span>
              {activeProfile.location && <span className="profile-location">{activeProfile.location}</span>}
            </div>
          ) : (
            <span className="profile-none">No business profile — add one for better AI results</span>
          )}
          <div className="profile-bar-actions">
            <select className="profile-select" value={activeProfileId || ''}
              onChange={e => setActiveProfileId(e.target.value || null)}>
              <option value="">Select profile...</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button className="btn-profile-manage" onClick={() => setShowProfileModal(true)}>Manage</button>
          </div>
        </div>

        {/* ── Blog Title ── */}
        <div className="panel">
          <div className="panel-label"><Tag size={13} />Blog Title</div>
          <input
            className="post-title-input"
            placeholder="Enter the blog post title..."
            value={local.title || ''}
            onChange={e => update('title', e.target.value)}
          />
          {local.title && (
            <div className="title-preview">
              <span className="title-preview-label">Renders as:</span>
              <span className="title-preview-text">{local.title}</span>
            </div>
          )}
        </div>

        {/* ── SEO Metadata ── */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-label"><Tag size={13} />SEO Metadata</div>
            <button className={`ai-btn ${aiLoading && aiSection === 'keywords' ? 'ai-btn--loading' : ''}`}
              onClick={() => runAI('keywords')} disabled={aiLoading}>
              {aiLoading && aiSection === 'keywords' ? <Loader2 size={12} className="spin" /> : <Sparkles size={12} />}
              AI Suggest
            </button>
          </div>

          <div className="field-row">
            <label className="field-label">Keywords</label>
            <div className="keyword-input-row">
              <input className="field-input" placeholder="Add keyword and press Enter..."
                value={newKw} onChange={e => setNewKw(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addKeyword()} />
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
            <label className="field-label">
              Meta Title
              <span className={`char-count ${local.metaTitle.length > 60 ? 'char-count--over' : ''}`}>{local.metaTitle.length}/60</span>
            </label>
            <input className="field-input" placeholder="SEO title (50–60 characters ideal)..."
              value={local.metaTitle} onChange={e => update('metaTitle', e.target.value)} />
          </div>

          <div className="field-row">
            <label className="field-label">
              Meta Description
              <span className={`char-count ${local.metaDescription.length > 160 ? 'char-count--over' : local.metaDescription.length >= 120 ? 'char-count--good' : ''}`}>
                {local.metaDescription.length}/160
              </span>
            </label>
            <textarea className="field-textarea" rows={3}
              placeholder="Brief description for search results (120–160 characters ideal)..."
              value={local.metaDescription} onChange={e => update('metaDescription', e.target.value)} />
          </div>
        </div>

        {/* ── Copy Area ── */}
        <div className="panel">
          <div className="panel-header">
            <div style={{display:'flex', flexDirection:'column', gap:'3px'}}>
              <div className="panel-label">Copy</div>
              <div className="content-stats">
                <span>{wordCount.toLocaleString()} words</span>
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

          {!apiKey && (
            <div className="api-key-nudge">
              <Key size={13} />
              AI features need an API key.
              <button onClick={() => setShowApiKeyModal(true)}>Set API Key →</button>
            </div>
          )}

          <div className="editor-hint">
            <strong>How to use:</strong> Paste your raw copy below. <em>Enhance Copy</em> adds H2/H3 markers, external links, and local insights. <em>Add SEO Sections</em> appends FAQ, Quick Answers, Local Insights, and Expert Summary at the bottom.
            Headings are marked <code>[H2]</code> / <code>[H3]</code> as instructions for your web developer.
          </div>

          {aiError && (
            <div className="ai-error">
              <span>{aiError}</span>
              <button onClick={() => setAiError('')}><X size={12}/></button>
            </div>
          )}

          <textarea className="copy-textarea"
            placeholder="Paste your raw copy here..."
            value={local.content}
            onChange={e => update('content', e.target.value)}
            rows={22}
          />

          {local.content && (
            <details className="copy-preview-toggle">
              <summary>Preview formatted output</summary>
              <div className="copy-preview" dangerouslySetInnerHTML={{__html:
                local.content
                  .replace(/\[H2\] (.+)/g, '<h2>$1</h2>')
                  .replace(/\[H3\] (.+)/g, '<h3>$1</h3>')
                  .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
                  .split('\n').filter(l => l.trim()).map(l => l.startsWith('<h') ? l : `<p>${l}</p>`).join('')
              }} />
            </details>
          )}
        </div>

        {/* ── AI Photo & Link Suggestions ── */}
        <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
          <button className={`ai-btn-large ${aiLoading && aiSection === 'photoSuggestions' ? 'ai-btn--loading' : ''}`}
            onClick={() => runAI('photoSuggestions')} disabled={aiLoading}>
            {aiLoading && aiSection === 'photoSuggestions' ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
            Suggest Photos
          </button>
          <button className={`ai-btn-large ${aiLoading && aiSection === 'internalLinks' ? 'ai-btn--loading' : ''}`}
            onClick={() => runAI('internalLinks')} disabled={aiLoading || !activeProfile}
            title={!activeProfile ? 'Requires a business profile with internal pages' : ''}>
            {aiLoading && aiSection === 'internalLinks' ? <Loader2 size={14} className="spin" /> : <Link2 size={14} />}
            Suggest Internal Links
            {!activeProfile && <span className="btn-requires">needs profile</span>}
          </button>
        </div>

        {/* ── AI Photo Suggestions display ── */}
        {(local.aiPhotoSuggestions || []).length > 0 && (
          <div className="panel">
            <div className="panel-label"><Sparkles size={13} />AI Photo Suggestions</div>
            <div className="photo-suggestions">
              {(local.aiPhotoSuggestions || []).map((s, i) => (
                <div key={i} className="photo-suggestion-card">
                  <div className="ps-query">🔍 {s.query}</div>
                  <div className="ps-caption"><strong>Caption:</strong> {s.caption}</div>
                  <div className="ps-alt"><strong>Alt:</strong> {s.alt}</div>
                  <div className="ps-placement"><strong>Where:</strong> {s.placement}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── External Links ── */}
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
                <button className="btn-add" onClick={() => addLink('external')}><Plus size={14} />Add Link</button>
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

        {/* ── Internal Links ── */}
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
                      onClick={() => setNewInt({ url: p.url, anchor: p.label, description: '' })}>
                      + {p.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="link-form">
                <input className="field-input" placeholder="URL path (e.g. /services/seo)" value={newInt.url} onChange={e => setNewInt(p => ({...p, url: e.target.value}))} />
                <input className="field-input" placeholder="Anchor text" value={newInt.anchor} onChange={e => setNewInt(p => ({...p, anchor: e.target.value}))} />
                <input className="field-input" placeholder="Context / note (optional)" value={newInt.description} onChange={e => setNewInt(p => ({...p, description: e.target.value}))} />
                <button className="btn-add" onClick={() => addLink('internal')}><Plus size={14} />Add Link</button>
              </div>
              <div className="link-list">
                {(local.internalLinks || []).map(link => (
                  <div key={link.id} className="link-item">
                    <Link2 size={12} className="link-item-icon" />
                    <div className="link-item-content">
                      <span className="link-anchor">"{link.anchor}"</span>
                      <span className="link-url">{link.url}</span>
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

      {showProfileModal && <BusinessProfileModal onClose={() => setShowProfileModal(false)} />}
      {showApiKeyModal && <ApiKeyModal onClose={() => setShowApiKeyModal(false)} />}
    </div>
  );
}
