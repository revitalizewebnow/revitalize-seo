import React, { createContext, useContext, useState, useCallback } from 'react';

const BusinessProfileContext = createContext(null);

const STORAGE_KEY = 'rwseo_business_profiles';
const ACTIVE_KEY = 'rwseo_active_profile';

export function BusinessProfileProvider({ children }) {
  const [profiles, setProfiles] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [activeProfileId, setActiveProfileIdState] = useState(() =>
    localStorage.getItem(ACTIVE_KEY) || null
  );

  const saveProfiles = useCallback((next) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setProfiles(next);
  }, []);

  const setActiveProfileId = useCallback((id) => {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
    setActiveProfileIdState(id);
  }, []);

  const createProfile = useCallback((data) => {
    const profile = { id: Date.now().toString(), ...data, createdAt: new Date().toISOString() };
    setProfiles(prev => {
      const next = [...prev, profile];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    return profile.id;
  }, []);

  const updateProfile = useCallback((id, data) => {
    setProfiles(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...data } : p);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteProfile = useCallback((id) => {
    setProfiles(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    if (activeProfileId === id) setActiveProfileId(null);
  }, [activeProfileId, setActiveProfileId]);

  return (
    <BusinessProfileContext.Provider value={{
      profiles, activeProfileId, setActiveProfileId,
      createProfile, updateProfile, deleteProfile
    }}>
      {children}
    </BusinessProfileContext.Provider>
  );
}

export function useBusinessProfiles() {
  const ctx = useContext(BusinessProfileContext);
  if (!ctx) throw new Error('useBusinessProfiles must be used within BusinessProfileProvider');
  return ctx;
}
