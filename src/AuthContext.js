import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Password is hashed — plaintext: Revitalize2025!
const PASSWORD_HASH = '7a3f9c2e8b1d4f6a0e5c9b7d2f4e8a1c3b6d9f2e5a8c1b4d7f0e3a6c9b2d5f8';

// Simple hash function (not crypto — just obfuscation for a front-end gate)
async function hashPassword(pw) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pw + 'rwseo_salt_2025');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const CORRECT_HASH = (async () => {
  return await hashPassword('Revitalize2025!');
})();

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem('rwseo_auth'));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (password) => {
    setLoading(true);
    setError('');
    try {
      const hash = await hashPassword(password);
      const correct = await CORRECT_HASH;
      if (hash === correct) {
        sessionStorage.setItem('rwseo_auth', '1');
        setAuthed(true);
      } else {
        setError('Incorrect password. Try again.');
      }
    } catch {
      setError('Something went wrong.');
    }
    setLoading(false);
  };

  const logout = () => {
    sessionStorage.removeItem('rwseo_auth');
    setAuthed(false);
  };

  return (
    <AuthContext.Provider value={{ authed, login, logout, error, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
