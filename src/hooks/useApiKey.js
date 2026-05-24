import React, { createContext, useContext, useState } from 'react';

const ApiKeyContext = createContext(null);

export function ApiKeyProvider({ children }) {
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem('rwseo_anthropic_key') || '');
  const [unsplashKey, setUnsplashKeyState] = useState(() => localStorage.getItem('rwseo_unsplash_key') || '');

  const setApiKey = (key) => {
    localStorage.setItem('rwseo_anthropic_key', key);
    setApiKeyState(key);
  };

  const setUnsplashKey = (key) => {
    localStorage.setItem('rwseo_unsplash_key', key);
    setUnsplashKeyState(key);
  };

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, unsplashKey, setUnsplashKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  return useContext(ApiKeyContext);
}
