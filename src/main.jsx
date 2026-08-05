import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './admin.css';

function checkAndToggleAdminMode() {
  const hash = window.location.hash.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();

  const isAdminRoute = hash === '#admin' || 
                       hash.startsWith('#/admin') || 
                       hash.startsWith('#admin/') || 
                       pathname === '/admin' || 
                       pathname === '/admin/';

  if (hash === '#admin') {
    window.location.hash = '#/admin/dashboard';
    return;
  }

  const header = document.querySelector('.site-header');
  const main = document.querySelector('main');
  const footer = document.querySelector('footer');
  const pageLoader = document.querySelector('.page-loader');
  const adminRoot = document.getElementById('admin-root');

  if (isAdminRoute) {
    document.body.classList.add('admin-mode');
    if (header) header.style.setProperty('display', 'none', 'important');
    if (main) main.style.setProperty('display', 'none', 'important');
    if (footer) footer.style.setProperty('display', 'none', 'important');
    if (pageLoader) pageLoader.style.setProperty('display', 'none', 'important');

    if (adminRoot) {
      adminRoot.style.setProperty('display', 'block', 'important');
      adminRoot.style.setProperty('opacity', '1', 'important');
      adminRoot.style.setProperty('visibility', 'visible', 'important');
      adminRoot.style.setProperty('position', 'fixed', 'important');
      adminRoot.style.setProperty('inset', '0', 'important');
      adminRoot.style.setProperty('z-index', '999999', 'important');
      adminRoot.style.setProperty('background-color', '#0f172a', 'important');
      adminRoot.style.setProperty('overflow-y', 'auto', 'important');

      if (!adminRoot._reactRoot) {
        const root = ReactDOM.createRoot(adminRoot);
        adminRoot._reactRoot = root;
        root.render(
          <React.StrictMode>
            <HashRouter>
              <App />
            </HashRouter>
          </React.StrictMode>
        );
      }
    }
  } else {
    document.body.classList.remove('admin-mode');
    if (header) header.style.display = '';
    if (main) main.style.display = '';
    if (footer) footer.style.display = '';
    if (adminRoot) {
      adminRoot.style.setProperty('display', 'none', 'important');
      adminRoot.style.setProperty('opacity', '0', 'important');
      adminRoot.style.setProperty('visibility', 'hidden', 'important');
    }
  }
}

// Execute immediately
checkAndToggleAdminMode();

// Execute on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndToggleAdminMode);
} else {
  checkAndToggleAdminMode();
}

// Listen for dynamic hashchange and popstate events
window.addEventListener('hashchange', checkAndToggleAdminMode);
window.addEventListener('popstate', checkAndToggleAdminMode);
