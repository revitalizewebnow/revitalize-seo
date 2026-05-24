import React, { useState } from 'react';
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

function InternalPageRow({ page, onChange, onDelete }) {
  return (
    <div className="ip-row">
      <input className="field-input" placeholder="Label (e.g. Services)" value={page.label} onChange={e => onChange({ ...page, label: e.target.value })} />
      <input className="field-input" placeholder="URL path (e.g. /services)" value={page.url} onChange={e => onChange({ ...page, url: e.target.value })} />
      <button className="ip-delete" onClick={onDelete}><Trash2 size={12} /></button>
    </div>
  );
}

export default function BusinessProfileModal({ onClose }) {
  const { profiles, activeProfileId, setActiveProfileId, createProfile, updateProfile, deleteProfile } = useBusinessProfiles();
  const [editing, setEditing] = useState(null); // null = list, 'new' = new, id = editing
  const [form, setForm] = useState(blankProfile());
  const [saved, setSaved] = useState(false);
  const [openSection, setOpenSection] = useState('basics');

  const startNew = () => { setForm(blankProfile()); setEditing('new'); setOpenSection('basics'); };
  const startEdit = (profile) => { setForm({ ...blankProfile(), ...profile }); setEditing(profile.id); setOpenSection('basics'); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing === 'new') {
      const id = createProfile(form);
      setActiveProfileId(id);
    } else {
      updateProfile(editing, form);
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); setEditing(null); }, 800);
  };

  const addPage = () => setForm(f => ({ ...f, internalPages: [...(f.internalPages || []), { label: '', url: '', id: Date.now() }] }));
  const updatePage = (id, updated) => setForm(f => ({ ...f, internalPages: f.internalPages.map(p => p.id === id ? updated : p) }));
  const deletePage = (id) => setForm(f => ({ ...f, internalPages: f.internalPages.filter(p => p.id !== id) }));

  const toggleImageSource = (src) => {
    const srcs = form.imageSources || [];
    setForm(f => ({ ...f, imageSources: srcs.includes(src) ? srcs.filter(s => s !== src) : [...srcs, src] }));
  };

  const Section = ({ id, label, icon: Icon, children }) => (
    <div className="form-section">
      <button className="form-section-header" onClick={() => setOpenSection(openSection === id ? null : id)}>
        <Icon size={13} />{label}
        {openSection === id ? <ChevronUp size={12} style={{marginLeft:'auto'}}/> : <ChevronDown size={12} style={{marginLeft:'auto'}}/>}
      </button>
      {openSection === id && <div className="form-section-body">{children}</div>}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title"><Building2 size={16} />Business Profiles</div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {editing === null ? (
          // ── Profile List ──────────────────────────────────
          <div className="modal-body">
            <button className="btn-new-profile" onClick={startNew}><Plus size={14} />New Profile</button>
            {profiles.length === 0 && (
              <div className="profile-empty">No profiles yet. Create one to save business info for reuse.</div>
            )}
            <div className="profile-list">
              {profiles.map(p => (
                <div key={p.id} className={`profile-list-item ${activeProfileId === p.id ? 'profile-list-item--active' : ''}`}>
                  <div className="pli-info" onClick={() => { setActiveProfileId(p.id); onClose(); }}>
                    <div className="pli-name">{p.name}</div>
                    <div className="pli-meta">{p.location} {p.industry && `· ${p.industry}`}</div>
                  </div>
                  <div className="pli-actions">
                    {activeProfileId === p.id && <span className="active-badge">Active</span>}
                    <button className="pli-edit" onClick={() => startEdit(p)}>Edit</button>
                    <button className="pli-delete" onClick={() => deleteProfile(p.id)}><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // ── Profile Form ──────────────────────────────────
          <div className="modal-body">
            <button className="btn-back-list" onClick={() => setEditing(null)}>← Back to list</button>

            <Section id="basics" label="Basic Info" icon={Building2}>
              <div className="form-grid-2">
                <div className="field-row">
                  <label className="field-label">Business Name *</label>
                  <input className="field-input" placeholder="e.g. Revitalize Web" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                </div>
                <div className="field-row">
                  <label className="field-label">Industry</label>
                  <input className="field-input" placeholder="e.g. Automotive, Law, Real Estate" value={form.industry} onChange={e => setForm(f => ({...f, industry: e.target.value}))} />
                </div>
              </div>
              <div className="field-row">
                <label className="field-label">Business Description</label>
                <textarea className="field-textarea" rows={3} placeholder="What does this business do? Who do they serve?" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
              </div>
              <div className="form-grid-2">
                <div className="field-row">
                  <label className="field-label"><MapPin size={11} />Location</label>
                  <input className="field-input" placeholder="City, State (e.g. Houston, TX)" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} />
                </div>
                <div className="field-row">
                  <label className="field-label"><Globe size={11} />Website</label>
                  <input className="field-input" placeholder="https://example.com" value={form.website} onChange={e => setForm(f => ({...f, website: e.target.value}))} />
                </div>
              </div>
              <div className="field-row">
                <label className="field-label">Phone</label>
                <input className="field-input" placeholder="(555) 123-4567" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
              </div>
            </Section>

            <Section id="seo" label="SEO & Keywords" icon={Tag}>
              <div className="field-row">
                <label className="field-label">Target Keywords (DO NOT link to these)</label>
                <textarea className="field-textarea" rows={2} placeholder="Comma-separated keywords you want to rank for, e.g. Houston web design, SEO company Texas" value={form.targetKeywords} onChange={e => setForm(f => ({...f, targetKeywords: e.target.value}))} />
              </div>
            </Section>

            <Section id="links" label="Internal Pages" icon={Link2}>
              <p className="section-hint">Add pages from the client's website that can be used as internal links in blog posts.</p>
              <div className="ip-list">
                {(form.internalPages || []).map(p => (
                  <InternalPageRow key={p.id} page={p} onChange={updated => updatePage(p.id, updated)} onDelete={() => deletePage(p.id)} />
                ))}
              </div>
              <button className="btn-add-page" onClick={addPage}><Plus size={12} />Add Internal Page</button>
            </Section>

            <Section id="brand" label="Brand & Images" icon={Palette}>
              <div className="field-row">
                <label className="field-label">Brand Colors</label>
                <div className="color-row">
                  {['primary', 'secondary', 'accent'].map(key => (
                    <div key={key} className="color-item">
                      <input type="color" className="color-swatch" value={form.brandColors?.[key] || '#000000'} onChange={e => setForm(f => ({...f, brandColors: {...f.brandColors, [key]: e.target.value}}))} />
                      <span className="color-label">{key}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="field-row">
                <label className="field-label">Preferred Image Sources</label>
                <div className="source-chips">
                  {['unsplash', 'pexels', 'pixabay'].map(src => (
                    <button key={src} className={`source-chip ${(form.imageSources||[]).includes(src) ? 'source-chip--on' : ''}`} onClick={() => toggleImageSource(src)}>
                      {src}
                    </button>
                  ))}
                </div>
                <input className="field-input" style={{marginTop:'8px'}} placeholder="Custom sources: mbusa.com, istockphoto.com, ..." value={form.customImageSources} onChange={e => setForm(f => ({...f, customImageSources: e.target.value}))} />
              </div>
              <div className="field-row">
                <label className="field-label">Brand / Style Notes</label>
                <textarea className="field-textarea" rows={3} placeholder="e.g. Always use lifestyle photography. Avoid stock-looking images. Prefer warm tones. Photos should show real people." value={form.brandNotes} onChange={e => setForm(f => ({...f, brandNotes: e.target.value}))} />
              </div>
            </Section>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setEditing(null)}>Cancel</button>
              <button className={`btn-save ${saved ? 'btn-save--saved' : ''}`} onClick={handleSave}>
                <Save size={13} />{saved ? 'Saved!' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
