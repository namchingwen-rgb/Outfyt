/** Hash-based SPA router */

const routes = new Map();
let currentCleanup = null;

export function registerRoute(path, handler) {
  routes.set(path, handler);
}

export function navigate(path) {
  window.location.hash = path;
}

export function currentRoute() {
  return window.location.hash.slice(1) || '/home';
}

function resolve() {
  const hash = currentRoute();
  const path = hash.split('?')[0];
  const params = {};
  const query = hash.split('?')[1];
  if (query) {
    query.split('&').forEach(p => {
      const [k, v] = p.split('=');
      params[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
  }

  // Clean up previous view
  if (currentCleanup && typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  // Find matching route
  const handler = routes.get(path);
  if (handler) {
    const result = handler(params);
    if (typeof result === 'function') {
      currentCleanup = result;
    }
  } else {
    // Default to home
    navigate('/home');
  }

  // Update active nav
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.route === path);
  });
}

export function initRouter() {
  window.addEventListener('hashchange', resolve);
  // Initial route
  if (!window.location.hash) {
    window.location.hash = '#/home';
  } else {
    resolve();
  }
}
