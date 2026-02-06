/** Outfit display card */
import { el } from '../utils/dom.js';
import { store } from '../store.js';
import { createPlaceholder } from '../utils/image.js';
import { CATEGORY_LABELS } from '../utils/data.js';

export function outfitCard(outfit, { showActions = true, onSave, onWore, onRegenerate, onDelete, onRate } = {}) {
  const items = outfit.itemIds.map(id => store.getItem(id)).filter(Boolean);

  const categoryOrder = ['outerwear', 'tops', 'dresses', 'bottoms', 'shoes', 'accessories'];
  items.sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));

  const card = el('div', { className: 'outfit-card', dataset: { id: outfit.id } }, [
    el('div', { className: 'outfit-items-row' },
      items.map(item =>
        el('div', { className: 'outfit-item-thumb', title: `${item.name} (${CATEGORY_LABELS[item.category]})` }, [
          item.imageData
            ? el('img', { src: item.imageData, alt: item.name })
            : el('div', { className: 'outfit-item-placeholder', html: createPlaceholder(item.category) }),
          el('span', { className: 'outfit-item-label', text: item.name })
        ])
      )
    ),
    outfit.occasion ? el('div', { className: 'outfit-occasion', text: `For: ${outfit.occasion}` }) : null,
    outfit.score ? el('div', { className: 'outfit-score' }, [
      el('span', { text: 'Match Score: ' }),
      el('strong', { text: `${Math.round(outfit.score * 100)}%` })
    ]) : null,
    showActions ? el('div', { className: 'outfit-actions' }, [
      !outfit.saved && onSave ? el('button', { className: 'btn btn-small btn-secondary', html: '&#9829; Save', onClick: () => onSave(outfit) }) : null,
      outfit.saved && onDelete ? el('button', { className: 'btn btn-small btn-ghost', html: '&#128465; Remove', onClick: () => onDelete(outfit) }) : null,
      onWore ? el('button', { className: 'btn btn-small btn-primary', html: '&#10003; Wore It', onClick: () => onWore(outfit) }) : null,
      onRegenerate ? el('button', { className: 'btn btn-small btn-ghost', html: '&#8635; New Outfit', onClick: () => onRegenerate() }) : null,
      onRate ? el('div', { className: 'outfit-rating' },
        [1, 2, 3, 4, 5].map(n =>
          el('button', {
            className: `rate-star ${outfit.rating >= n ? 'active' : ''}`,
            html: '&#9733;',
            onClick: () => onRate(outfit, n)
          })
        )
      ) : null
    ]) : null
  ]);

  return card;
}
