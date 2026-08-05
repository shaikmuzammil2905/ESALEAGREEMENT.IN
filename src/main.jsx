import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './admin.css';

function renderAdminApp() {
  const hash = window.location.hash.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();

  const isAdminRoute = hash === '#admin' || 
                       hash.startsWith('#/admin') || 
                       hash.startsWith('#admin/') || 
                       pathname === '/admin' || 
                       pathname === '/admin/';

  const rootElement = document.getElementById('admin-root');

  if (rootElement && isAdminRoute) {
    if (!rootElement._reactRoot) {
      const root = ReactDOM.createRoot(rootElement);
      rootElement._reactRoot = root;
      root.render(
        <React.StrictMode>
          <HashRouter>
            <App />
          </HashRouter>
        </React.StrictMode>
      );
    }
  }
}

// Initial check
renderAdminApp();

// Dynamic hashchange listener
window.addEventListener('hashchange', renderAdminApp);
