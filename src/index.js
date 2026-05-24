import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './AuthContext';
import { BusinessProfileProvider } from './hooks/useBusinessProfiles';
import { ApiKeyProvider } from './hooks/useApiKey';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <ApiKeyProvider>
        <BusinessProfileProvider>
          <App />
        </BusinessProfileProvider>
      </ApiKeyProvider>
    </AuthProvider>
  </React.StrictMode>
);
