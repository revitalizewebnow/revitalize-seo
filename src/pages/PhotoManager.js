import React, { useState, useRef } from 'react';
import { Plus, Trash2, Image, MapPin, ChevronDown, ChevronUp, ExternalLink, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PhotoManager.css';

const UNSPLASH_ACCESS_KEY = ''; // Optional: user can add their own

function PhotoCard({ photo, index, onChange, onDelete }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="photo-card">
      <div className="photo-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="photo-preview-row">
          {photo.url ? (
            <img src={photo.url} alt={photo.alt || ''} className="photo-thumb" />
          ) : (
            <div className="photo-thumb photo-thumb--empty"><Image size={16} /></div>
          )}
          <div className="photo-header-meta">
            <span className="photo-num">Photo {index + 1}</span>
            <span className="photo-caption-preview">{photo.caption || 'No caption yet'}</span>
          </div>
        </div>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </div>

      {expanded && (
        <div className="photo-fields">
          <div className="field-row">
            <label className="field-label">Image URL</label>
            <div className="url-row">
              <input
                className="field-input"
                placeholder="https://source.url/image.jpg"
                value={photo.url}
                onChange={e => onChange({ ...photo, url: e.target.value })}
              />
              {photo.url && (
                <a href={photo.url} target="_blank" rel="noopener noreferrer" className="url-preview-btn">
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>

          <div className="field-row">
            <label className="field-label">
              Caption
              <span className="field-hint">Displayed below the image on the page</span>
            </label>
            <textarea
              className="field-textarea"
              rows={2}
              placeholder="Descriptive caption for readers..."
              value={photo.caption}
              onChange={e => onChange({ ...photo, caption: e.target.value })}
            />
          </div>

          <div className="field-row">
            <label className="field-label">
              Alt Text
              <span className="field-hint">For accessibility & SEO — describe the image</span>
            </label>
            <input
              className="field-input"
              placeholder="e.g. A team of web developers collaborating at a desk in Houston"
              value={photo.alt}
              onChange={e => onChange({ ...photo, alt: e.target.value })}
            />
          </div>

          <div className="field-row">
            <label className="field-label">
              Attribution / Credit
              <span className="field-hint">Photographer, source, license</span>
            </label>
            <input
              className="field-input"
              placeholder="e.g. Photo by Jane Smith on Unsplash"
              value={photo.attribution}
              onChange={e => onChange({ ...photo, attribution: e.target.value })}
            />
          </div>

          <div className="field-row">
            <label className="field-label">Attribution URL</label>
            <input
              className="field-input"
              placeholder="https://unsplash.com/photos/..."
              value={photo.attributionUrl}
              onChange={e => onChange({ ...photo, attributionUrl: e.target.value })}
            />
          </div>

          {/* Photo SEO */}
          <div className="photo-seo-section">
            <div className="photo-seo-label">
              <MapPin size={12} />
              Photo SEO & Geo Data
              <span className="optional-badge">optional</span>
            </div>

            <div className="fields-2col">
              <div className="field-row">
                <label className="field-label">Image Title (SEO)</label>
                <input
                  className="field-input"
                  placeholder="SEO-friendly image title"
                  value={photo.seoTitle}
                  onChange={e => onChange({ ...photo, seoTitle: e.target.value })}
                />
              </div>
              <div className="field-row">
                <label className="field-label">Image Keywords</label>
                <input
                  className="field-input"
                  placeholder="comma, separated, keywords"
                  value={photo.keywords}
                  onChange={e => onChange({ ...photo, keywords: e.target.value })}
                />
              </div>
            </div>

            <div className="fields-2col">
              <div className="field-row">
                <label className="field-label">Latitude</label>
                <input
                  className="field-input"
                  placeholder="e.g. 29.7604"
                  value={photo.lat}
                  onChange={e => onChange({ ...photo, lat: e.target.value })}
                  type="number"
                  step="any"
                />
              </div>
              <div className="field-row">
                <label className="field-label">Longitude</label>
                <input
                  className="field-input"
                  placeholder="e.g. -95.3698"
                  value={photo.lng}
                  onChange={e => onChange({ ...photo, lng: e.target.value })}
                  type="number"
                  step="any"
                />
              </div>
            </div>

            <div className="field-row">
              <label className="field-label">Image Meta Description</label>
              <textarea
                className="field-textarea"
                rows={2}
                placeholder="Brief description of the image for search engines..."
                value={photo.metaDescription}
                onChange={e => onChange({ ...photo, metaDescription: e.target.value })}
              />
            </div>
          </div>

          <div className="photo-card-actions">
            <button className="btn-delete" onClick={onDelete}>
              <Trash2 size={13} />
              Remove Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const blankPhoto = () => ({
  id: Date.now() + Math.random(),
  url: '',
  caption: '',
  alt: '',
  attribution: '',
  attributionUrl: '',
  seoTitle: '',
  keywords: '',
  lat: '',
  lng: '',
  metaDescription: '',
});

export default function PhotoManager({ post, savePost }) {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState(post.photos || []);

  const updatePhotos = (next) => {
    setPhotos(next);
    savePost({ ...post, photos: next });
  };

  const addPhoto = () => updatePhotos([...photos, blankPhoto()]);

  const updatePhoto = (id, updated) => updatePhotos(photos.map(p => p.id === id ? updated : p));

  const deletePhoto = (id) => updatePhotos(photos.filter(p => p.id !== id));

  const completionCount = photos.filter(p => p.url && p.caption && p.alt && p.attribution).length;

  return (
    <div className="photo-manager">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Step 2</div>
          <h1 className="page-title">Photos</h1>
          <p className="page-subtitle">
            Source and attribute all images. Provide captions, alt text, and optional geo/SEO metadata for each photo.
          </p>
        </div>
        <div className="header-meta">
          <div className="photo-count">
            <span className="photo-count-num">{completionCount}/{photos.length}</span>
            <span className="photo-count-label">complete</span>
          </div>
        </div>
      </div>

      {photos.length === 0 && (
        <div className="empty-state">
          <Image size={32} className="empty-icon" />
          <div className="empty-title">No photos yet</div>
          <div className="empty-desc">Add at least one relevant image with full attribution.</div>
        </div>
      )}

      <div className="photo-list">
        {photos.map((photo, i) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            index={i}
            onChange={updated => updatePhoto(photo.id, updated)}
            onDelete={() => deletePhoto(photo.id)}
          />
        ))}
      </div>

      <button className="btn-add-photo" onClick={addPhoto}>
        <Plus size={15} />
        Add Photo
      </button>

      <div className="page-actions">
        <button className="btn-back" onClick={() => navigate('/copy')}>← Back to Copy</button>
        <button className="btn-next" onClick={() => navigate('/summary')}>Next: Post Summary →</button>
      </div>
    </div>
  );
}
