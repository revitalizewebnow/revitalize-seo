import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CopyEditor from './pages/CopyEditor';
import PhotoManager from './pages/PhotoManager';
import PostSummary from './pages/PostSummary';
import Dashboard from './pages/Dashboard';
import Login from './Login';
import { useAuth } from './AuthContext';
import './App.css';

const defaultPost = () => ({
  id: Date.now(),
  title: '',
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  keywords: [],
  metaTitle: '',
  metaDescription: '',
  content: '',
  externalLinks: [],
  internalLinks: [],
  photos: [],
});

function AppShell() {
  const { logout } = useAuth();
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('rwseo_posts');
    return saved ? JSON.parse(saved) : [];
  });
  const [activePostId, setActivePostId] = useState(null);

  const savePost = useCallback((updated) => {
    setPosts(prev => {
      const idx = prev.findIndex(p => p.id === updated.id);
      const next = idx >= 0
        ? prev.map(p => p.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : p)
        : [...prev, { ...updated, updatedAt: new Date().toISOString() }];
      localStorage.setItem('rwseo_posts', JSON.stringify(next));
      return next;
    });
  }, []);

  const createPost = useCallback(() => {
    const post = defaultPost();
    setPosts(prev => {
      const next = [...prev, post];
      localStorage.setItem('rwseo_posts', JSON.stringify(next));
      return next;
    });
    setActivePostId(post.id);
    return post.id;
  }, []);

  const deletePost = useCallback((id) => {
    setPosts(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem('rwseo_posts', JSON.stringify(next));
      return next;
    });
    if (activePostId === id) setActivePostId(null);
  }, [activePostId]);

  const activePost = posts.find(p => p.id === activePostId) || null;

  return (
    <BrowserRouter basename="/revitalize-seo">
      <div className="app-shell">
        <Sidebar
          posts={posts}
          activePostId={activePostId}
          setActivePostId={setActivePostId}
          createPost={createPost}
          deletePost={deletePost}
          onLogout={logout}
        />
        <main className="app-main">
          {!activePost ? (
            <Dashboard posts={posts} createPost={createPost} setActivePostId={setActivePostId} />
          ) : (
            <Routes>
              <Route path="/" element={<Navigate to="/copy" replace />} />
              <Route path="/copy" element={<CopyEditor post={activePost} savePost={savePost} />} />
              <Route path="/photos" element={<PhotoManager post={activePost} savePost={savePost} />} />
              <Route path="/summary" element={<PostSummary post={activePost} savePost={savePost} />} />
            </Routes>
          )}
        </main>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  const { authed } = useAuth();
  return authed ? <AppShell /> : <Login />;
}
