import React, { createContext, useContext, useState } from 'react';

const ApiKeyContext = createContext(null);
const STORAGE_KEY = 'rwseo_anthropic_key';

export function ApiKeyProvider({ children }) {
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem(STORAGE_KEY) || '');

  const setApiKey = (key) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKeyState(key);
  };

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  return useContext(ApiKeyContext);
}
