import { useState, useCallback } from 'react';

const STORAGE_KEY = 'rwseo_business_profiles';
const ACTIVE_KEY = 'rwseo_active_profile';

export function useBusinessProfiles() {
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
    saveProfiles([...profiles, profile]);
    return profile.id;
  }, [profiles, saveProfiles]);

  const updateProfile = useCallback((id, data) => {
    saveProfiles(profiles.map(p => p.id === id ? { ...p, ...data } : p));
  }, [profiles, saveProfiles]);

  const deleteProfile = useCallback((id) => {
    saveProfiles(profiles.filter(p => p.id !== id));
    if (activeProfileId === id) setActiveProfileId(null);
  }, [profiles, saveProfiles, activeProfileId, setActiveProfileId]);

  return { profiles, activeProfileId, setActiveProfileId, createProfile, updateProfile, deleteProfile };
}
