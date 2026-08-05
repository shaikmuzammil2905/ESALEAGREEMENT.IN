import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './admin.css';

const hash = window.location.hash.toLowerCase();
const pathname = window.location.pathname.toLowerCase();

// Strictly mount React ONLY when the user explicitly accesses an admin route
const isAdminRoute = hash === '#admin' || 
                     hash.startsWith('#/admin') || 
                     hash.startsWith('#admin/') || 
                     pathname === '/admin' || 
                     pathname === '/admin/';

const rootElement = document.getElementById('admin-root');

if (rootElement && isAdminRoute) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>
  );
}

// Listen for hashchange to dynamically mount React when #admin is typed
window.addEventListener('hashchange', () => {
  const currentHash = window.location.hash.toLowerCase();
  const currentPath = window.location.pathname.toLowerCase();
  const isNowAdmin = currentHash === '#admin' || 
                     currentHash.startsWith('#/admin') || 
                     currentHash.startsWith('#admin/') || 
                     currentPath === '/admin' || 
                     currentPath === '/admin/';

  if (rootElement && isNowAdmin && !rootElement._reactRoot) {
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
});
