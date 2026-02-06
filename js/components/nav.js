/** Bottom tab navigation */
import { $ } from '../utils/dom.js';

const TABS = [
  { route: '/home', label: 'Home', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l9-9 9 9"/><path d="M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10"/></svg>` },
  { route: '/wardrobe', label: 'Wardrobe', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 9h18"/></svg>` },
  { route: '/event-styling', label: 'Events', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>` },
  { route: '/optimization', label: 'Insights', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>` },
  { route: '/pricing', label: 'Premium', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` }
];

export function renderNav() {
  const nav = $('#bottom-nav');
  if (!nav) return;
  nav.innerHTML = TABS.map(t => `
    <button class="nav-tab" data-route="${t.route}" aria-label="${t.label}">
      <span class="nav-icon">${t.icon}</span>
      <span class="nav-label">${t.label}</span>
    </button>
  `).join('');

  nav.addEventListener('click', (e) => {
    const tab = e.target.closest('.nav-tab');
    if (tab) {
      window.location.hash = '#' + tab.dataset.route;
    }
  });
}
