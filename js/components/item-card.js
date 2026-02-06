/** Wardrobe item thumbnail card */
import { el } from '../utils/dom.js';
import { createPlaceholder } from '../utils/image.js';
import { CATEGORY_LABELS } from '../utils/data.js';

export function itemCard(item, { onClick, compact = false } = {}) {
  const card = el('div', {
    className: `item-card ${compact ? 'item-card-compact' : ''} ${item.inLaundry ? 'in-laundry' : ''} ${item.favorite ? 'is-favorite' : ''}`,
    dataset: { id: item.id },
    onClick: onClick ? () => onClick(item) : undefined
  }, [
    el('div', { className: 'item-card-image' }, [
      item.imageData
        ? el('img', { src: item.imageData, alt: item.name, loading: 'lazy' })
        : el('div', { className: 'item-card-placeholder', html: createPlaceholder(item.category) })
    ]),
    !compact ? el('div', { className: 'item-card-info' }, [
      el('span', { className: 'item-card-name', text: item.name }),
      el('span', { className: 'item-card-category', text: CATEGORY_LABELS[item.category] || item.category })
    ]) : null,
    item.inLaundry ? el('span', { className: 'item-badge laundry-badge', text: 'In Laundry' }) : null,
    item.favorite ? el('span', { className: 'item-badge fav-badge', html: '&#9829;' }) : null
  ]);

  return card;
}
