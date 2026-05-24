import React, { useState, useCallback } from 'react';
import { X, Plus, Trash2, Building2, MapPin, Globe, Tag, Link2, Palette, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { useBusinessProfiles } from '../hooks/useBusinessProfiles';
import './BusinessProfileModal.css';

const blankProfile = () => ({
  name: '',
  description: '',
  location: '',
  website: '',
  phone: '',
  industry: '',
  targetKeywords: '',
  internalPages: [],
  brandColors: { primary: '#000000', secondary: '#ffffff', accent: '#0066cc' },
  imageSources: ['unsplash'],
  customImageSources: '',
  brandNotes: '',
});

// ── Defined OUTSIDE the modal so it never remounts on re-render ────────────
function Section({ id, label, icon: Icon, openSection, setOpenSection, children }) {
  const isOpen = openSection === id;
  return (
    <div className="form-section">
      <button className="form-section-header" onClick={() => setOpenSection(isOpen ? null : id)}>
        <Icon size={13} />{label}
        {isOpen ? <ChevronUp size={12} style={{marginLeft:'auto'}}/> : <ChevronDown size={12} style={{marginLeft:'auto'}}/>}
      </button>
      {isOpen && <div className="form-section-body">{children}</div>}
    </div>
  );
}

function InternalPageRow({ page, onLabelChange, onUrlChange, onDelete }) {
  return (
    <div className="ip-row">
      <input
        className="field-input"
        placeholder="Label (e.g. Services)"
        value={page.label}
        onChange={e => onLabelChange(e.target.value)}
      />
      <input
        className="field-input"
        placeholder="URL path (e.g. /services)"
        value={page.url}
        onChange={e => onUrlChange(e.target.value)}
      />
      <button className="ip-delete" onClick={onDelete}><Trash2 size={12} /></button>
    </div>
  );
}

// ── Profile Form — its own component so state is isolated ──────────────────
function ProfileForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ ...blankProfile(), ...initial });
  const [openSection, setOpenSection] = useState('basics');
  const [saved, setSaved] = useState(false);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const setColor = (key, value) => setForm(f => ({ ...f, brandColors: { ...f.brandColors, [key]: value } }));
  const toggleSource = (src) => setForm(f => {
    const srcs = f.imageSources || [];
    return { ...f, imageSources: srcs.includes(src) ? srcs.filter(s => s !== src) : [...srcs, src] };
  });
  const addPage = () => setForm(f => ({ ...f, internalPages: [...(f.internalPages || []), { label: '', url: '', id: Date.now() }] }));
  const updatePageLabel = (id, val) => setForm(f => ({ ...f, internalPages: f.internalPages.map(p => p.id === id ? { ...p, label: val } : p) }));
  const updatePageUrl = (id, val) => setForm(f => ({ ...f, internalPages: f.internalPages.map(p => p.id === id ? { ...p, url: val } : p) }));
  const deletePage = (id) => setForm(f => ({ ...f, internalPages: f.internalPages.filter(p => p.id !== id) }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    setSaved(true);
    setTimeout(() => { onSave(form); }, 600);
  };

  const sectionProps = { openSection, setOpenSection };

  return (
    <div className="modal-body">
      <button className="btn-back-list" onClick={onCancel}>← Back to list</button>

      <Section id="basics" label="Basic Info" icon={Building2} {...sectionProps}>
        <div className="form-grid-2">
          <div className="field-row">
            <label className="field-label">Business Name *</label>
            <input className="field-input" placeholder="e.g. Revitalize Web"
              value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
          </div>
          <div className="field-row">
            <label className="field-label">Industry</label>
            <input className="field-input" placeholder="e.g. Automotive, Law, Real Estate"
              value={form.industry} onChange={e => set('industry', e.target.value)} />
          </div>
        </div>
        <div className="field-row">
          <label className="field-label">Business Description</label>
          <textarea className="field-textarea" rows={3}
            placeholder="What does this business do? Who do they serve?"
            value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div className="form-grid-2">
          <div className="field-row">
            <label className="field-label"><MapPin size={11} />Location</label>
            <input className="field-input" placeholder="City, State (e.g. Houston, TX)"
              value={form.location} onChange={e => set('location', e.target.value)} />
          </div>
          <div className="field-row">
            <label className="field-label"><Globe size={11} />Website</label>
            <input className="field-input" placeholder="https://example.com"
              value={form.website} onChange={e => set('website', e.target.value)} />
          </div>
        </div>
        <div className="field-row">
          <label className="field-label">Phone</label>
          <input className="field-input" placeholder="(555) 123-4567"
            value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
      </Section>

      <Section id="seo" label="SEO & Keywords" icon={Tag} {...sectionProps}>
        <div className="field-row">
          <label className="field-label">Target Keywords (AI will NOT use these as external link anchors)</label>
          <textarea className="field-textarea" rows={2}
            placeholder="e.g. Houston web design, SEO company Texas, digital marketing Houston"
            value={form.targetKeywords} onChange={e => set('targetKeywords', e.target.value)} />
        </div>
      </Section>

      <Section id="links" label="Internal Pages" icon={Link2} {...sectionProps}>
        <p className="section-hint">Pages from this website that can be used as internal links in blog posts.</p>
        <div className="ip-list">
          {(form.internalPages || []).map(p => (
            <InternalPageRow
              key={p.id}
              page={p}
              onLabelChange={val => updatePageLabel(p.id, val)}
              onUrlChange={val => updatePageUrl(p.id, val)}
              onDelete={() => deletePage(p.id)}
            />
          ))}
        </div>
        <button className="btn-add-page" onClick={addPage}><Plus size={12} />Add Page</button>
      </Section>

      <Section id="brand" label="Brand & Images" icon={Palette} {...sectionProps}>
        <div className="field-row">
          <label className="field-label">Brand Colors</label>
          <div className="color-row">
            {['primary', 'secondary', 'accent'].map(key => (
              <div key={key} className="color-item">
                <input type="color" className="color-swatch"
                  value={form.brandColors?.[key] || '#000000'}
                  onChange={e => setColor(key, e.target.value)} />
                <span className="color-label">{key}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="field-row">
          <label className="field-label">Preferred Image Sources</label>
          <div className="source-chips">
            {['unsplash', 'pexels', 'pixabay'].map(src => (
              <button key={src}
                className={`source-chip ${(form.imageSources || []).includes(src) ? 'source-chip--on' : ''}`}
                onClick={() => toggleSource(src)}>
                {src}
              </button>
            ))}
          </div>
          <input className="field-input" style={{marginTop:'8px'}}
            placeholder="Custom sources: mbusa.com, istockphoto.com, ..."
            value={form.customImageSources} onChange={e => set('customImageSources', e.target.value)} />
        </div>
        <div className="field-row">
          <label className="field-label">Brand / Style Notes</label>
          <textarea className="field-textarea" rows={3}
            placeholder="e.g. Always use lifestyle photography. Avoid stock-looking images. Prefer warm tones."
            value={form.brandNotes} onChange={e => set('brandNotes', e.target.value)} />
        </div>
      </Section>

      <div className="modal-footer">
        <button className="btn-cancel" onClick={onCancel}>Cancel</button>
        <button className={`btn-save ${saved ? 'btn-save--saved' : ''}`} onClick={handleSave} disabled={!form.name.trim()}>
          <Save size={13} />{saved ? 'Saved!' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────
export default function BusinessProfileModal({ onClose }) {
  const { profiles, activeProfileId, setActiveProfileId, createProfile, updateProfile, deleteProfile } = useBusinessProfiles();
  const [view, setView] = useState('list'); // 'list' | 'new' | profile.id
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleSave = (form) => {
    if (view === 'new') {
      const id = createProfile(form);
      setActiveProfileId(id);
    } else {
      updateProfile(view, form);
    }
    setView('list');
  };

  const handleDelete = (id) => {
    if (confirmDelete === id) {
      deleteProfile(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const editingProfile = view !== 'list' && view !== 'new'
    ? profiles.find(p => p.id === view)
    : null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title"><Building2 size={16} />Business Profiles</div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {view === 'list' ? (
          <div className="modal-body">
            <button className="btn-new-profile" onClick={() => setView('new')}>
              <Plus size={14} />New Profile
            </button>
            {profiles.length === 0 && (
              <div className="profile-empty">No profiles yet. Create one to save business info for reuse across posts.</div>
            )}
            <div className="profile-list">
              {profiles.map(p => (
                <div key={p.id}
                  className={`profile-list-item ${activeProfileId === p.id ? 'profile-list-item--active' : ''}`}>
                  <div className="pli-info" onClick={() => { setActiveProfileId(p.id); onClose(); }}>
                    <div className="pli-name">{p.name}</div>
                    <div className="pli-meta">{[p.location, p.industry].filter(Boolean).join(' · ')}</div>
                  </div>
                  <div className="pli-actions">
                    {activeProfileId === p.id && <span className="active-badge">Active</span>}
                    <button className="pli-edit" onClick={() => setView(p.id)}>Edit</button>
                    <button
                      className={`pli-delete ${confirmDelete === p.id ? 'pli-delete--confirm' : ''}`}
                      onClick={() => handleDelete(p.id)}
                      title={confirmDelete === p.id ? 'Click again to confirm delete' : 'Delete'}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ProfileForm
            key={view} // forces fresh state when switching between profiles
            initial={editingProfile || {}}
            onSave={handleSave}
            onCancel={() => setView('list')}
          />
        )}
      </div>
    </div>
  );
}
