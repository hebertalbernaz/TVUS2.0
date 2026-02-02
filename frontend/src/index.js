import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// MOCK ELECTRON APIS FOR WEB ENVIRONMENT (must run BEFORE React mounts)
import './mockElectron';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 🔴 CORREÇÃO DE CACHE: Remove qualquer Service Worker antigo
// Isso resolve o problema de ter que dar Shift+F5 nas janelas novas
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}