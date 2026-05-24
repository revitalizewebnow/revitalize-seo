import React, { useState } from 'react';
import { Copy, Check, AlertTriangle, CheckCircle, Image, Link2, ExternalLink, Tag, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PostSummary.css';

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button className={`copy-btn ${copied ? 'copy-btn--copied' : ''}`} onClick={handleCopy}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : label || 'Copy'}
    </button>
  );
}

function IssueAlert({ issues }) {
  if (issues.length === 0) return null;
  return (
    <div className="issue-alert">
      <AlertTriangle size={15} className="issue-icon" />
      <div>
        <div className="issue-title">Incomplete items</div>
        <ul className="issue-list">
          {issues.map(i => <li key={i}>{i}</li>)}
        </ul>
      </div>
    </div>
  );
}

export default function PostSummary({ post, savePost }) {
  const navigate = useNavigate();

  const issues = [];
  if (!post.metaTitle) issues.push('Meta title is missing');
  if (!post.metaDescription) issues.push('Meta description is missing');
  if (post.keywords.length === 0) issues.push('No keywords added');
  if ((post.externalLinks || []).length < 2) issues.push(`Only ${(post.externalLinks || []).length} external link(s) — need at least 2`);
  if ((post.internalLinks || []).length < 2) issues.push(`Only ${(post.internalLinks || []).length} internal link(s) — need at least 2`);
  if (!post.content || post.content === '<p><br></p>') issues.push('Copy is empty');
  if (!(post.content.includes('<h2') || post.content.includes('<h3'))) issues.push('No H2/H3 headings in copy');
  if ((post.photos || []).length === 0) issues.push('No photos added');

  const incompletePhotos = (post.photos || []).filter(p => !p.alt || !p.caption || !p.attribution);
  if (incompletePhotos.length > 0) issues.push(`${incompletePhotos.length} photo(s) missing alt text, caption, or attribution`);

  const isComplete = issues.length === 0;

  const buildDevHandoff = () => {
    const lines = [];
    lines.push('═══════════════════════════════════════════════');
    lines.push(`  REVITALIZE WEB — SEO HANDOFF`);
    lines.push(`  Post: ${post.title || 'Untitled'}`);
    lines.push(`  Generated: ${new Date().toLocaleDateString()}`);
    lines.push('═══════════════════════════════════════════════');
    lines.push('');
    lines.push('── SEO METADATA ────────────────────────────────');
    lines.push(`KEYWORDS: ${post.keywords.join(', ') || '(none)'}`);
    lines.push(`META TITLE: ${post.metaTitle || '(missing)'}`);
    lines.push(`META DESCRIPTION: ${post.metaDescription || '(missing)'}`);
    lines.push('');
    lines.push('── COPY ────────────────────────────────────────');
    lines.push('(Headings marked as H2 or H3 for developer)');
    lines.push('');
    const rawContent = post.content
      .replace(/<h2>(.*?)<\/h2>/gi, '\n[H2] $1\n')
      .replace(/<h3>(.*?)<\/h3>/gi, '\n[H3] $1\n')
      .replace(/<p>(.*?)<\/p>/gi, '\n$1')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
    lines.push(rawContent || '(no content)');
    lines.push('');

    if ((post.externalLinks || []).length > 0) {
      lines.push('── EXTERNAL LINKS ──────────────────────────────');
      post.externalLinks.forEach((l, i) => {
        lines.push(`${i + 1}. Anchor: "${l.anchor}" → ${l.url}`);
        if (l.description) lines.push(`   Note: ${l.description}`);
      });
      lines.push('');
    }

    if ((post.internalLinks || []).length > 0) {
      lines.push('── INTERNAL LINKS ──────────────────────────────');
      post.internalLinks.forEach((l, i) => {
        lines.push(`${i + 1}. Anchor: "${l.anchor}" → ${l.url}`);
        if (l.description) lines.push(`   Note: ${l.description}`);
      });
      lines.push('');
    }

    if ((post.photos || []).length > 0) {
      lines.push('── PHOTOS ──────────────────────────────────────');
      post.photos.forEach((p, i) => {
        lines.push(`Photo ${i + 1}:`);
        lines.push(`  URL: ${p.url || '(missing)'}`);
        lines.push(`  Caption: ${p.caption || '(missing)'}`);
        lines.push(`  Alt Text: ${p.alt || '(missing)'}`);
        lines.push(`  Attribution: ${p.attribution || '(missing)'}`);
        if (p.attributionUrl) lines.push(`  Credit URL: ${p.attributionUrl}`);
        if (p.seoTitle) lines.push(`  SEO Title: ${p.seoTitle}`);
        if (p.keywords) lines.push(`  Image Keywords: ${p.keywords}`);
        if (p.lat && p.lng) lines.push(`  Geo: ${p.lat}, ${p.lng}`);
        if (p.metaDescription) lines.push(`  Image Meta Desc: ${p.metaDescription}`);
        lines.push('');
      });
    }

    lines.push('═══════════════════════════════════════════════');
    return lines.join('\n');
  };

  const markPublished = () => {
    savePost({ ...post, status: 'published', publishedAt: new Date().toISOString() });
  };

  return (
    <div className="post-summary">
      <div className="summary-header">
        <div>
          <div className="page-eyebrow">Step 3 — Final Review</div>
          <h1 className="page-title">{post.title || 'Untitled Post'}</h1>
        </div>
        <div className="summary-actions-top">
          <CopyButton text={buildDevHandoff()} label="Copy Dev Handoff" />
          {isComplete && (
            <button className="btn-publish" onClick={markPublished}>
              {post.status === 'published' ? '✓ Published' : 'Mark as Published'}
            </button>
          )}
        </div>
      </div>

      <IssueAlert issues={issues} />

      {isComplete && (
        <div className="complete-banner">
          <CheckCircle size={16} />
          Post is SEO-complete and ready for handoff!
        </div>
      )}

      {/* SEO Metadata Block */}
      <div className="summary-section">
        <div className="summary-section-header">
          <Tag size={14} />
          <span>SEO Metadata</span>
          <CopyButton
            text={`KEYWORDS: ${post.keywords.join(', ')}\nMETA TITLE: ${post.metaTitle}\nMETA DESCRIPTION: ${post.metaDescription}`}
            label="Copy"
          />
        </div>
        <div className="meta-grid">
          <div className="meta-item">
            <div className="meta-label">Keywords</div>
            <div className="meta-value">
              {post.keywords.length > 0
                ? <div className="tag-row">{post.keywords.map(k => <span key={k} className="tag-chip">{k}</span>)}</div>
                : <span className="meta-missing">Missing</span>}
            </div>
          </div>
          <div className="meta-item">
            <div className="meta-label">Meta Title <span className="meta-char">{post.metaTitle.length}/60</span></div>
            <div className="meta-value">{post.metaTitle || <span className="meta-missing">Missing</span>}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">Meta Description <span className="meta-char">{post.metaDescription.length}/160</span></div>
            <div className="meta-value">{post.metaDescription || <span className="meta-missing">Missing</span>}</div>
          </div>
        </div>
        {/* SERP Preview */}
        {(post.metaTitle || post.metaDescription) && (
          <div className="serp-preview">
            <div className="serp-label">SERP Preview</div>
            <div className="serp-card">
              <div className="serp-url">https://revitalizeweb.com/blog/{post.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'your-post-slug'}</div>
              <div className="serp-title">{post.metaTitle || 'Your Meta Title'}</div>
              <div className="serp-desc">{post.metaDescription || 'Your meta description will appear here in search results.'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Links */}
      <div className="summary-section">
        <div className="summary-section-header">
          <Link2 size={14} />
          <span>Links</span>
        </div>
        <div className="links-grid">
          <div>
            <div className="links-subsection-label">
              <ExternalLink size={12} />
              External Links ({(post.externalLinks || []).length})
              {(post.externalLinks || []).length < 2 && <span className="need-more">need {2 - (post.externalLinks || []).length} more</span>}
            </div>
            {(post.externalLinks || []).map(l => (
              <div key={l.id} className="link-row">
                <span className="link-row-anchor">"{l.anchor}"</span>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="link-row-url">{l.url}</a>
              </div>
            ))}
            {(post.externalLinks || []).length === 0 && <p className="none-msg">None added</p>}
          </div>
          <div>
            <div className="links-subsection-label">
              <Link2 size={12} />
              Internal Links ({(post.internalLinks || []).length})
              {(post.internalLinks || []).length < 2 && <span className="need-more">need {2 - (post.internalLinks || []).length} more</span>}
            </div>
            {(post.internalLinks || []).map(l => (
              <div key={l.id} className="link-row">
                <span className="link-row-anchor">"{l.anchor}"</span>
                <span className="link-row-url">{l.url}</span>
              </div>
            ))}
            {(post.internalLinks || []).length === 0 && <p className="none-msg">None added</p>}
          </div>
        </div>
      </div>

      {/* Photos */}
      {(post.photos || []).length > 0 && (
        <div className="summary-section">
          <div className="summary-section-header">
            <Image size={14} />
            <span>Photos ({(post.photos || []).length})</span>
          </div>
          <div className="photo-summary-grid">
            {(post.photos || []).map((p, i) => (
              <div key={p.id} className={`photo-summary-card ${(!p.alt || !p.caption || !p.attribution) ? 'photo-summary-card--incomplete' : ''}`}>
                {p.url && <img src={p.url} alt={p.alt || ''} className="photo-summary-img" />}
                <div className="photo-summary-meta">
                  <div className="photo-summary-num">Photo {i + 1}</div>
                  <div className="photo-summary-field">
                    <span className="ps-label">Caption</span>
                    <span className="ps-value">{p.caption || <span className="meta-missing">Missing</span>}</span>
                  </div>
                  <div className="photo-summary-field">
                    <span className="ps-label">Alt Text</span>
                    <span className="ps-value">{p.alt || <span className="meta-missing">Missing</span>}</span>
                  </div>
                  <div className="photo-summary-field">
                    <span className="ps-label">Credit</span>
                    <span className="ps-value">
                      {p.attributionUrl
                        ? <a href={p.attributionUrl} target="_blank" rel="noopener noreferrer">{p.attribution || <span className="meta-missing">Missing</span>}</a>
                        : (p.attribution || <span className="meta-missing">Missing</span>)}
                    </span>
                  </div>
                  {(p.lat || p.lng) && (
                    <div className="photo-summary-field">
                      <span className="ps-label">Geo</span>
                      <span className="ps-value ps-mono">{p.lat}, {p.lng}</span>
                    </div>
                  )}
                  {p.seoTitle && (
                    <div className="photo-summary-field">
                      <span className="ps-label">SEO Title</span>
                      <span className="ps-value">{p.seoTitle}</span>
                    </div>
                  )}
                  {p.keywords && (
                    <div className="photo-summary-field">
                      <span className="ps-label">Keywords</span>
                      <span className="ps-value ps-mono">{p.keywords}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Handoff Preview */}
      <div className="summary-section">
        <div className="summary-section-header">
          <FileText size={14} />
          <span>Developer Handoff</span>
          <CopyButton text={buildDevHandoff()} label="Copy All" />
        </div>
        <pre className="handoff-preview">{buildDevHandoff()}</pre>
      </div>

      <div className="page-actions">
        <button className="btn-back" onClick={() => navigate('/photos')}>← Back to Photos</button>
      </div>
    </div>
  );
}
