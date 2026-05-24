import React, { useState, useRef } from 'react';
import { Plus, Trash2, Image, MapPin, ChevronDown, ChevronUp, ExternalLink, Search, Loader2, Check, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBusinessProfiles } from '../hooks/useBusinessProfiles';
import './PhotoManager.css';

// ── Unsplash Search ─────────────────────────────────────────────────────────
// Uses Unsplash Source (free, no API key needed) for demo images
// For production, replace with proper Unsplash API key
async function searchUnsplash(query) {
  // Use Unsplash Source URL pattern for free access
  const results = [];
  for (let i = 1; i <= 8; i++) {
    const seed = encodeURIComponent(query + i);
    results.push({
      id: `unsplash-${i}-${seed}`,
      url: `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}&sig=${i}`,
      thumb: `https://source.unsplash.com/400x300/?${encodeURIComponent(query)}&sig=${i}`,
      photographer: 'Unsplash',
      photographerUrl: 'https://unsplash.com',
      source: 'Unsplash',
    });
  }
  return results;
}

// ── Image Search Panel ──────────────────────────────────────────────────────
function ImageSearchPanel({ onSelect, defaultQuery, aiSuggestions }) {
  const [query, setQuery] = useState(defaultQuery || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activeSource, setActiveSource] = useState('unsplash');

  const doSearch = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setResults([]);
    try {
      const imgs = await searchUnsplash(q || query);
      setResults(imgs);
    } catch { /* silent */ }
    setLoading(false);
  };

  const handleSelect = (img) => {
    setSelected(img.id);
    onSelect({
      url: img.url,
      attribution: `Photo by ${img.photographer} on ${img.source}`,
      attributionUrl: img.photographerUrl,
    });
  };

  return (
    <div className="image-search-panel">
      <div className="isp-header">Search for Images</div>

      {aiSuggestions && aiSuggestions.length > 0 && (
        <div className="ai-query-chips">
          <span className="ai-chips-label"><Sparkles size={11} />AI suggestions:</span>
          {aiSuggestions.map((s, i) => (
            <button key={i} className="ai-chip" onClick={() => { setQuery(s.query); doSearch(s.query); }}>
              {s.query}
            </button>
          ))}
        </div>
      )}

      <div className="isp-search-row">
        <input
          className="isp-input"
          placeholder="Search photos... (e.g. luxury car interior, Houston skyline)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch(query)}
        />
        <button className="isp-search-btn" onClick={() => doSearch(query)} disabled={loading}>
          {loading ? <Loader2 size={14} className="spin" /> : <Search size={14} />}
        </button>
      </div>

      <div className="source-note">
        <span>Source: Unsplash (free, no API key needed) · </span>
        <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Browse Unsplash directly</a>
        <span> · </span>
        <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">Pexels</a>
        <span> · </span>
        <a href="https://www.istockphoto.com" target="_blank" rel="noopener noreferrer">iStock</a>
      </div>

      {results.length > 0 && (
        <div className="isp-grid">
          {results.map(img => (
            <div
              key={img.id}
              className={`isp-thumb ${selected === img.id ? 'isp-thumb--selected' : ''}`}
              onClick={() => handleSelect(img)}
            >
              <img src={img.thumb} alt={query} loading="lazy" />
              {selected === img.id && <div className="isp-selected-overlay"><Check size={18} /></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Photo Card ──────────────────────────────────────────────────────────────
function PhotoCard({ photo, index, onChange, onDelete, aiSuggestion }) {
  const [expanded, setExpanded] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="photo-card">
      <div className="photo-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="photo-preview-row">
          {photo.url ? (
            <img src={photo.url} alt={photo.alt || ''} className="photo-thumb" onError={e => e.target.style.display='none'} />
          ) : (
            <div className="photo-thumb photo-thumb--empty"><Image size={16} /></div>
          )}
          <div className="photo-header-meta">
            <span className="photo-num">Photo {index + 1}</span>
            <span className="photo-caption-preview">{photo.caption || (aiSuggestion ? `💡 ${aiSuggestion.caption}` : 'No caption yet')}</span>
          </div>
        </div>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </div>

      {expanded && (
        <div className="photo-fields">
          {/* Image Source */}
          <div className="field-row">
            <div className="field-label-row">
              <label className="field-label">Image URL</label>
              <button className="btn-search-toggle" onClick={() => setShowSearch(!showSearch)}>
                <Search size={11} />{showSearch ? 'Hide Search' : 'Search Photos'}
              </button>
            </div>
            <div className="url-row">
              <input className="field-input" placeholder="https://source.url/image.jpg" value={photo.url}
                onChange={e => onChange({ ...photo, url: e.target.value })} />
              {photo.url && <a href={photo.url} target="_blank" rel="noopener noreferrer" className="url-preview-btn"><ExternalLink size={13} /></a>}
            </div>
          </div>

          {showSearch && (
            <ImageSearchPanel
              defaultQuery={aiSuggestion?.query || ''}
              aiSuggestions={null}
              onSelect={({ url, attribution, attributionUrl }) => {
                onChange({ ...photo, url, attribution, attributionUrl });
                setShowSearch(false);
              }}
            />
          )}

          {/* Caption */}
          <div className="field-row">
            <label className="field-label">
              Caption
              {aiSuggestion?.caption && !photo.caption && (
                <button className="ai-fill-btn" onClick={() => onChange({ ...photo, caption: aiSuggestion.caption })}>
                  <Sparkles size={10} />Use AI suggestion
                </button>
              )}
            </label>
            <textarea className="field-textarea" rows={2}
              placeholder={aiSuggestion?.caption ? `Suggested: "${aiSuggestion.caption}"` : "Descriptive caption for readers..."}
              value={photo.caption} onChange={e => onChange({ ...photo, caption: e.target.value })} />
          </div>

          {/* Alt Text */}
          <div className="field-row">
            <label className="field-label">
              Alt Text
              <span className="field-hint">Accessibility & SEO</span>
              {aiSuggestion?.alt && !photo.alt && (
                <button className="ai-fill-btn" onClick={() => onChange({ ...photo, alt: aiSuggestion.alt })}>
                  <Sparkles size={10} />Use AI suggestion
                </button>
              )}
            </label>
            <input className="field-input"
              placeholder={aiSuggestion?.alt ? `Suggested: "${aiSuggestion.alt}"` : "Describe the image for screen readers and search engines"}
              value={photo.alt} onChange={e => onChange({ ...photo, alt: e.target.value })} />
          </div>

          {/* Attribution */}
          <div className="form-grid-2">
            <div className="field-row">
              <label className="field-label">Attribution / Credit</label>
              <input className="field-input" placeholder="Photo by Jane Smith on Unsplash"
                value={photo.attribution} onChange={e => onChange({ ...photo, attribution: e.target.value })} />
            </div>
            <div className="field-row">
              <label className="field-label">Attribution URL</label>
              <input className="field-input" placeholder="https://unsplash.com/photos/..."
                value={photo.attributionUrl} onChange={e => onChange({ ...photo, attributionUrl: e.target.value })} />
            </div>
          </div>

          {/* SEO & Geo */}
          <div className="photo-seo-section">
            <div className="photo-seo-label"><MapPin size={12} />Photo SEO & Geo Data <span className="optional-badge">optional</span></div>
            <div className="form-grid-2">
              <div className="field-row">
                <label className="field-label">Image Title (SEO)</label>
                <input className="field-input" placeholder="SEO-friendly title"
                  value={photo.seoTitle} onChange={e => onChange({ ...photo, seoTitle: e.target.value })} />
              </div>
              <div className="field-row">
                <label className="field-label">Image Keywords</label>
                <input className="field-input" placeholder="comma, separated"
                  value={photo.keywords} onChange={e => onChange({ ...photo, keywords: e.target.value })} />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="field-row">
                <label className="field-label">Latitude</label>
                <input className="field-input" placeholder="e.g. 29.7604" type="number" step="any"
                  value={photo.lat} onChange={e => onChange({ ...photo, lat: e.target.value })} />
              </div>
              <div className="field-row">
                <label className="field-label">Longitude</label>
                <input className="field-input" placeholder="e.g. -95.3698" type="number" step="any"
                  value={photo.lng} onChange={e => onChange({ ...photo, lng: e.target.value })} />
              </div>
            </div>
            <div className="field-row">
              <label className="field-label">Image Meta Description</label>
              <textarea className="field-textarea" rows={2} placeholder="Brief description for search engines..."
                value={photo.metaDescription} onChange={e => onChange({ ...photo, metaDescription: e.target.value })} />
            </div>
          </div>

          <div className="photo-card-actions">
            <button className="btn-delete" onClick={onDelete}><Trash2 size={13} />Remove Photo</button>
          </div>
        </div>
      )}
    </div>
  );
}

const blankPhoto = () => ({
  id: Date.now() + Math.random(),
  url: '', caption: '', alt: '', attribution: '', attributionUrl: '',
  seoTitle: '', keywords: '', lat: '', lng: '', metaDescription: '',
});

// ── Main Component ───────────────────────────────────────────────────────────
export default function PhotoManager({ post, savePost }) {
  const navigate = useNavigate();
  const { profiles, activeProfileId } = useBusinessProfiles();
  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;
  const [photos, setPhotos] = useState(post.photos || []);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  const updatePhotos = (next) => { setPhotos(next); savePost({ ...post, photos: next }); };
  const addPhoto = () => updatePhotos([...photos, blankPhoto()]);
  const updatePhoto = (id, updated) => updatePhotos(photos.map(p => p.id === id ? updated : p));
  const deletePhoto = (id) => updatePhotos(photos.filter(p => p.id !== id));

  const aiSuggestions = post.aiPhotoSuggestions || [];
  const completionCount = photos.filter(p => p.url && p.caption && p.alt && p.attribution).length;

  return (
    <div className="photo-manager">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Step 2</div>
          <h1 className="page-title">Photos</h1>
          <p className="page-subtitle">Source and attribute all images. Add captions, alt text, and optional geo/SEO data per photo.</p>
        </div>
        <div className="header-meta">
          <div className="photo-count">
            <span className="photo-count-num">{completionCount}/{photos.length}</span>
            <span className="photo-count-label">complete</span>
          </div>
        </div>
      </div>

      {activeProfile?.brandNotes && (
        <div className="brand-note-bar">
          <Sparkles size={12} />
          <strong>Brand style:</strong> {activeProfile.brandNotes}
        </div>
      )}

      {/* Global image search */}
      <div className="global-search-section">
        <button className="btn-global-search" onClick={() => setShowGlobalSearch(!showGlobalSearch)}>
          <Search size={14} />{showGlobalSearch ? 'Hide' : 'Search'} Images for This Post
        </button>
        {showGlobalSearch && (
          <ImageSearchPanel
            defaultQuery={post.title || ''}
            aiSuggestions={aiSuggestions}
            onSelect={({ url, attribution, attributionUrl }) => {
              const photo = { ...blankPhoto(), url, attribution, attributionUrl };
              updatePhotos([...photos, photo]);
              setShowGlobalSearch(false);
            }}
          />
        )}
      </div>

      {photos.length === 0 && (
        <div className="empty-state">
          <Image size={32} className="empty-icon" />
          <div className="empty-title">No photos yet</div>
          <div className="empty-desc">Search for images above, or add photos manually below.</div>
          {aiSuggestions.length > 0 && (
            <div className="ai-suggestions-hint">
              💡 AI suggested {aiSuggestions.length} photo ideas from the Copy step
            </div>
          )}
        </div>
      )}

      <div className="photo-list">
        {photos.map((photo, i) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            index={i}
            aiSuggestion={aiSuggestions[i] || null}
            onChange={updated => updatePhoto(photo.id, updated)}
            onDelete={() => deletePhoto(photo.id)}
          />
        ))}
      </div>

      <button className="btn-add-photo" onClick={addPhoto}><Plus size={15} />Add Photo Manually</button>

      <div className="page-actions">
        <button className="btn-back" onClick={() => navigate('/copy')}>← Back to Copy</button>
        <button className="btn-next" onClick={() => navigate('/summary')}>Next: Post Summary →</button>
      </div>
    </div>
  );
}
