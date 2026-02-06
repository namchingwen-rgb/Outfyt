/** Modal/overlay utility */
import { $, el } from '../utils/dom.js';

let activeModal = null;

export function openModal(content, { title = '', className = '', onClose = null } = {}) {
  closeModal();
  const overlay = el('div', { className: 'modal-overlay' });
  const modal = el('div', { className: `modal ${className}` }, [
    el('div', { className: 'modal-header' }, [
      title ? el('h3', { className: 'modal-title', text: title }) : null,
      el('button', {
        className: 'modal-close',
        html: '&times;',
        onClick: () => closeModal()
      })
    ]),
    el('div', { className: 'modal-body' }, [
      typeof content === 'string' ? el('div', { html: content }) : content
    ])
  ]);

  overlay.appendChild(modal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.body.appendChild(overlay);
  activeModal = { overlay, onClose };
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => overlay.classList.add('active'));
}

export function closeModal() {
  if (activeModal) {
    activeModal.overlay.classList.remove('active');
    if (activeModal.onClose) activeModal.onClose();
    setTimeout(() => {
      activeModal?.overlay.remove();
      activeModal = null;
    }, 200);
    document.body.style.overflow = '';
  }
}

export function confirmModal(message, { title = 'Confirm', confirmText = 'Yes', cancelText = 'Cancel' } = {}) {
  return new Promise((resolve) => {
    const body = el('div', { className: 'confirm-body' }, [
      el('p', { text: message }),
      el('div', { className: 'confirm-actions' }, [
        el('button', { className: 'btn btn-secondary', text: cancelText, onClick: () => { closeModal(); resolve(false); } }),
        el('button', { className: 'btn btn-primary', text: confirmText, onClick: () => { closeModal(); resolve(true); } })
      ])
    ]);
    openModal(body, { title });
  });
}
