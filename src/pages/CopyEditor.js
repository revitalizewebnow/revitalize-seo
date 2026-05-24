import React, { useState, useCallback, useRef } from 'react';
import { Link2, ExternalLink, Plus, Trash2, CheckCircle, AlertCircle, Tag, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CopyEditor.css';

// Simple rich text editor using contentEditable (no dependency needed)
function RichEditor({ value, onChange }) {
  const ref = useRef(null);

  const execCmd = (cmd, val = null) => {
    ref.current.focus();
    document.execCommand(cmd, false, val);
    onChange(ref.current.innerHTML);
  };

  const handleInput = () => {
    onChange(ref.current.innerHTML);
  };

  return (
    <div className="rich-editor">
      <div className="rich-toolbar">
        <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('formatBlock', 'h2'); }} title="H2 — Section Heading">H2</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('formatBlock', 'h3'); }} title="H3 — Sub Heading">H3</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('formatBlock', 'p'); }} title="Paragraph">P</button>
        <div className="toolbar-sep" />
        <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('bold'); }} title="Bold"><strong>B</strong></button>
        <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('italic'); }} title="Italic"><em>I</em></button>
        <div className="toolbar-sep" />
        <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('insertUnorderedList'); }} title="Bullet List">• List</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('insertOrderedList'); }} title="Numbered List">1. List</button>
      </div>
      <div
        ref={ref}
        className="rich-content"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder="Start writing your copy here. Use H2 for main sections, H3 for sub-sections..."
      />
    </div>
  );
}

function SEOChecklist({ post }) {
  const checks = [
    {
      id: 'keywords', label: 'Keywords added',
      pass: post.keywords.length > 0,
      hint: `${post.keywords.length} keyword${post.keywords.length !== 1 ? 's' : ''}`
    },
    {
      id: 'metaTitle', label: 'Meta title',
      pass: post.metaTitle.length > 0 && post.metaTitle.length <= 60,
      hint: post.metaTitle.length > 0 ? `${post.metaTitle.length}/60 chars` : 'Missing'
    },
    {
      id: 'metaDesc', label: 'Meta description',
      pass: post.metaDescription.length >= 120 && post.metaDescription.length <= 160,
      hint: post.metaDescription.length > 0 ? `${post.metaDescription.length}/160 chars` : 'Missing'
    },
    {
      id: 'h2', label: 'H2/H3 headings in copy',
      pass: post.content.includes('<h2') || post.content.includes('<h3'),
      hint: (post.content.match(/<h[23]/g) || []).length + ' found'
    },
    {
      id: 'external', label: '2+ external links',
      pass: (post.externalLinks || []).length >= 2,
      hint: `${(post.externalLinks || []).length} of 2 required`
    },
    {
      id: 'internal', label: '2+ internal links',
      pass: (post.internalLinks || []).length >= 2,
      hint: `${(post.internalLinks || []).length} of 2 required`
    },
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
          {c.pass
            ? <CheckCircle size={13} className="check-icon check-icon--pass" />
            : <AlertCircle size={13} className="check-icon check-icon--fail" />}
          <span className="check-label">{c.label}</span>
          <span className="check-hint">{c.hint}</span>
        </div>
      ))}
    </div>
  );
}

export default function CopyEditor({ post, savePost }) {
  const navigate = useNavigate();
  const [local, setLocal] = useState({ ...post });
  const [newKw, setNewKw] = useState('');
  const [newExt, setNewExt] = useState({ url: '', anchor: '', description: '' });
  const [newInt, setNewInt] = useState({ url: '', anchor: '', description: '' });
  const [showExt, setShowExt] = useState(true);
  const [showInt, setShowInt] = useState(true);

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

  const removeKeyword = (kw) => update('keywords', local.keywords.filter(k => k !== kw));

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

  return (
    <div className="copy-editor">
      <div className="editor-main">
        {/* Post Title */}
        <div className="field-group">
          <input
            className="post-title-input"
            placeholder="Post title..."
            value={local.title}
            onChange={e => update('title', e.target.value)}
          />
        </div>

        {/* SEO Meta Section */}
        <div className="panel">
          <div className="panel-label">
            <Tag size={13} />
            SEO Metadata
          </div>

          <div className="field-row">
            <label className="field-label">Keywords</label>
            <div className="keyword-input-row">
              <input
                className="field-input"
                placeholder="Add keyword..."
                value={newKw}
                onChange={e => setNewKw(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addKeyword()}
              />
              <button className="btn-sm" onClick={addKeyword}><Plus size={13} /></button>
            </div>
            {local.keywords.length > 0 && (
              <div className="tag-list">
                {local.keywords.map(kw => (
                  <span key={kw} className="tag">
                    {kw}
                    <button className="tag-remove" onClick={() => removeKeyword(kw)}><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="field-row">
            <label className="field-label">
              Meta Title
              <span className={`char-count ${local.metaTitle.length > 60 ? 'char-count--over' : ''}`}>
                {local.metaTitle.length}/60
              </span>
            </label>
            <input
              className="field-input"
              placeholder="SEO title (50–60 characters ideal)..."
              value={local.metaTitle}
              onChange={e => update('metaTitle', e.target.value)}
            />
          </div>

          <div className="field-row">
            <label className="field-label">
              Meta Description
              <span className={`char-count ${local.metaDescription.length > 160 ? 'char-count--over' : local.metaDescription.length >= 120 ? 'char-count--good' : ''}`}>
                {local.metaDescription.length}/160
              </span>
            </label>
            <textarea
              className="field-textarea"
              rows={3}
              placeholder="Brief description for search results (120–160 characters ideal)..."
              value={local.metaDescription}
              onChange={e => update('metaDescription', e.target.value)}
            />
          </div>
        </div>

        {/* Copy Editor */}
        <div className="panel">
          <div className="panel-label">Copy</div>
          <div className="editor-note">
            Mark headings as <code>H2</code> (main sections) or <code>H3</code> (sub-sections) for your web developer.
          </div>
          <RichEditor value={local.content} onChange={v => update('content', v)} />
        </div>

        {/* External Links */}
        <div className="panel">
          <div className="panel-label panel-label--clickable" onClick={() => setShowExt(!showExt)}>
            <ExternalLink size={13} />
            External Links
            <span className={`link-badge ${(local.externalLinks || []).length >= 2 ? 'link-badge--ok' : ''}`}>
              {(local.externalLinks || []).length}/2 min
            </span>
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
                      <span className="link-anchor">{link.anchor || link.url}</span>
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

        {/* Internal Links */}
        <div className="panel">
          <div className="panel-label panel-label--clickable" onClick={() => setShowInt(!showInt)}>
            <Link2 size={13} />
            Internal Links
            <span className={`link-badge ${(local.internalLinks || []).length >= 2 ? 'link-badge--ok' : ''}`}>
              {(local.internalLinks || []).length}/2 min
            </span>
            {showInt ? <ChevronUp size={14} style={{marginLeft:'auto'}} /> : <ChevronDown size={14} style={{marginLeft:'auto'}} />}
          </div>
          {showInt && (
            <>
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
                      <span className="link-anchor">{link.anchor || link.url}</span>
                      <span className="link-url">{link.url}</span>
                      {link.description && <span className="link-note">{link.description}</span>}
                    </div>
                    <button className="link-remove" onClick={() => removeLink('internal', link.id)}><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="editor-actions">
          <button className="btn-next" onClick={() => navigate('/photos')}>
            Next: Photos →
          </button>
        </div>
      </div>

      <aside className="editor-aside">
        <SEOChecklist post={local} />
      </aside>
    </div>
  );
}
