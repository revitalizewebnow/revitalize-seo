import React from 'react';
import { Plus, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard({ posts, createPost, setActivePostId }) {
  const handleCreate = () => createPost();

  const getStats = () => {
    let complete = 0, partial = 0, draft = 0;
    posts.forEach(post => {
      const issues = [
        !post.metaTitle,
        !post.metaDescription,
        post.keywords.length === 0,
        (post.externalLinks || []).length < 2,
        (post.internalLinks || []).length < 2,
        (post.photos || []).length === 0,
      ].filter(Boolean).length;
      if (issues === 0) complete++;
      else if (issues <= 2) partial++;
      else draft++;
    });
    return { complete, partial, draft };
  };

  const stats = getStats();

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <div className="dashboard-eyebrow">SEO Workflow Manager</div>
        <h1 className="dashboard-title">Revitalize Web</h1>
        <p className="dashboard-subtitle">
          Manage your content workflow from copy to publish-ready.<br />
          Track SEO requirements, photos, and metadata in one place.
        </p>
        <button className="dashboard-cta" onClick={handleCreate}>
          <Plus size={16} />
          Create New Post
        </button>
      </div>

      {posts.length > 0 && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <CheckCircle size={18} className="stat-icon stat-icon--complete" />
            <div className="stat-value">{stats.complete}</div>
            <div className="stat-label">Complete</div>
          </div>
          <div className="stat-card">
            <Clock size={18} className="stat-icon stat-icon--partial" />
            <div className="stat-value">{stats.partial}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <AlertCircle size={18} className="stat-icon stat-icon--draft" />
            <div className="stat-value">{stats.draft}</div>
            <div className="stat-label">Draft</div>
          </div>
          <div className="stat-card">
            <TrendingUp size={18} className="stat-icon" style={{color:'var(--accent)'}} />
            <div className="stat-value">{posts.length}</div>
            <div className="stat-label">Total Posts</div>
          </div>
        </div>
      )}

      <div className="workflow-steps">
        <h2 className="section-title">Workflow Overview</h2>
        <div className="steps-grid">
          {[
            { num: '01', title: 'Write & Edit Copy', desc: 'Create your content, mark headings as H2/H3, add external and internal links (minimum 2 each).' },
            { num: '02', title: 'SEO Metadata', desc: 'Add keywords, meta title, and meta description to the top of your post for full search engine coverage.' },
            { num: '03', title: 'Source Photos', desc: 'Find and attribute relevant images. Add captions, alt text, and optional geo/keyword metadata per photo.' },
            { num: '04', title: 'Export Ready', desc: 'Review the publish summary and copy everything your web developer needs to go live.' },
          ].map(step => (
            <div key={step.num} className="step-card">
              <div className="step-card-num">{step.num}</div>
              <div className="step-card-title">{step.title}</div>
              <div className="step-card-desc">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
