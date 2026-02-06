/** Toast notification system */

const container = () => {
  let c = document.getElementById('toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toast-container';
    document.body.appendChild(c);
  }
  return c;
};

export function toast(message, { type = 'info', duration = 2500 } = {}) {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = message;
  container().appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, duration);
}
