import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PenLine, Image, FileText, LayoutDashboard, Plus, Trash2, ChevronRight, Leaf } from 'lucide-react';
import './Sidebar.css';

const steps = [
  { path: '/copy', label: 'Copy & SEO', icon: PenLine, step: 1 },
  { path: '/photos', label: 'Photos', icon: Image, step: 2 },
  { path: '/summary', label: 'Post Summary', icon: FileText, step: 3 },
];

export default function Sidebar({ posts, activePostId, setActivePostId, createPost, deletePost }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleCreate = () => {
    createPost();
    navigate('/copy');
  };

  const handleSelectPost = (id) => {
    setActivePostId(id);
    navigate('/copy');
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirmDelete === id) {
      deletePost(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const getPostStatus = (post) => {
    const issues = [];
    if (!post.metaTitle) issues.push('meta');
    if (!post.metaDescription) issues.push('desc');
    if (post.keywords.length === 0) issues.push('kw');
    if (post.externalLinks.length < 2) issues.push('ext');
    if (post.internalLinks.length < 2) issues.push('int');
    if (post.photos.length === 0) issues.push('photos');
    return issues.length === 0 ? 'complete' : issues.length <= 2 ? 'partial' : 'draft';
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-brand">
            <Leaf size={18} className="brand-icon" />
            <span className="brand-name">Revitalize</span>
            <span className="brand-sub">SEO</span>
          </div>
        )}
        <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
          <ChevronRight size={14} style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
        </button>
      </div>

      {!collapsed && activePostId && (
        <nav className="sidebar-steps">
          {steps.map(({ path, label, icon: Icon, step }) => (
            <button
              key={path}
              className={`step-btn ${location.pathname === path ? 'step-btn--active' : ''}`}
              onClick={() => navigate(path)}
            >
              <span className="step-num">{step}</span>
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      )}

      {!collapsed && (
        <>
          <div className="sidebar-section-label">Posts</div>
          <button className="new-post-btn" onClick={handleCreate}>
            <Plus size={14} />
            <span>New Post</span>
          </button>

          <div className="post-list">
            {posts.length === 0 && (
              <p className="post-list-empty">No posts yet. Create your first one.</p>
            )}
            {posts.map(post => {
              const status = getPostStatus(post);
              return (
                <div
                  key={post.id}
                  className={`post-item ${post.id === activePostId ? 'post-item--active' : ''}`}
                  onClick={() => handleSelectPost(post.id)}
                >
                  <div className="post-item-inner">
                    <span className={`status-dot status-dot--${status}`} title={status} />
                    <span className="post-item-title">
                      {post.title || 'Untitled Post'}
                    </span>
                  </div>
                  <button
                    className={`delete-btn ${confirmDelete === post.id ? 'delete-btn--confirm' : ''}`}
                    onClick={(e) => handleDelete(e, post.id)}
                    title={confirmDelete === post.id ? 'Click again to confirm' : 'Delete'}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {collapsed && (
        <div className="sidebar-icons">
          <button className="icon-btn" onClick={handleCreate} title="New Post"><Plus size={16} /></button>
          {activePostId && steps.map(({ path, icon: Icon, label }) => (
            <button key={path} className={`icon-btn ${location.pathname === path ? 'icon-btn--active' : ''}`} onClick={() => navigate(path)} title={label}>
              <Icon size={16} />
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
