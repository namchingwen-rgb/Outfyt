/** Wardrobe grid view with filters and search */
import { $, el, render, clearNode } from '../utils/dom.js';
import { store } from '../store.js';
import { CATEGORY_LABELS } from '../utils/data.js';
import { itemCard } from '../components/item-card.js';
import { navigate } from '../router.js';

export function wardrobeView() {
  const main = $('#main-content');
  let activeFilter = 'all';
  let searchQuery = '';
  let sortBy = 'dateAdded';

  const container = el('div', { className: 'view wardrobe-view' });

  // Header
  const header = el('div', { className: 'wardrobe-header' }, [
    el('h1', { text: 'My Wardrobe' }),
    el('span', { className: 'item-count', text: '' })
  ]);

  // Search
  const searchInput = el('input', {
    type: 'search',
    className: 'search-input',
    placeholder: 'Search items...',
    onInput: (e) => { searchQuery = e.target.value.toLowerCase(); renderGrid(); }
  });

  // Filter chips
  const filterBar = el('div', { className: 'filter-bar' });

  // Sort
  const sortSelect = el('select', {
    className: 'sort-select',
    onChange: (e) => { sortBy = e.target.value; renderGrid(); }
  }, [
    el('option', { value: 'dateAdded', text: 'Newest' }),
    el('option', { value: 'name', text: 'Name' }),
    el('option', { value: 'category', text: 'Category' }),
    el('option', { value: 'formality', text: 'Formality' }),
    el('option', { value: 'wornCount', text: 'Most Worn' })
  ]);

  const controls = el('div', { className: 'wardrobe-controls' }, [
    searchInput,
    el('div', { className: 'filter-sort-row' }, [filterBar, sortSelect])
  ]);

  // Grid
  const grid = el('div', { className: 'wardrobe-grid' });

  // FAB
  const fab = el('button', {
    className: 'fab',
    html: '+',
    title: 'Add Item',
    onClick: () => navigate('/wardrobe/add')
  });

  container.append(header, controls, grid, fab);
  render(main, container);

  renderFilters();
  renderGrid();

  // Listen for changes
  const unsub = store.on('items-changed', () => {
    renderGrid();
  });

  function renderFilters() {
    clearNode(filterBar);
    const categories = ['all', ...Object.keys(CATEGORY_LABELS), 'favorites', 'laundry'];
    const labels = { all: 'All', favorites: 'Favorites', laundry: 'In Laundry', ...CATEGORY_LABELS };

    for (const cat of categories) {
      filterBar.appendChild(
        el('button', {
          className: `chip ${activeFilter === cat ? 'chip-active' : ''}`,
          text: labels[cat] || cat,
          onClick: () => { activeFilter = cat; renderFilters(); renderGrid(); }
        })
      );
    }
  }

  function renderGrid() {
    clearNode(grid);
    let items = store.getItems();

    // Update count
    const countEl = header.querySelector('.item-count');
    if (countEl) countEl.textContent = `${items.length} items`;

    // Filter
    if (activeFilter === 'favorites') {
      items = items.filter(i => i.favorite);
    } else if (activeFilter === 'laundry') {
      items = items.filter(i => i.inLaundry);
    } else if (activeFilter !== 'all') {
      items = items.filter(i => i.category === activeFilter);
    }

    // Search
    if (searchQuery) {
      items = items.filter(i =>
        i.name.toLowerCase().includes(searchQuery) ||
        (i.colors || []).some(c => c.toLowerCase().includes(searchQuery)) ||
        (i.vibes || []).some(v => v.toLowerCase().includes(searchQuery))
      );
    }

    // Sort
    items.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'category': return a.category.localeCompare(b.category);
        case 'formality': return (b.formality || 3) - (a.formality || 3);
        case 'wornCount': return (b.wornDates?.length || 0) - (a.wornDates?.length || 0);
        default: return new Date(b.dateAdded) - new Date(a.dateAdded);
      }
    });

    if (!items.length) {
      grid.appendChild(
        el('div', { className: 'empty-state' }, [
          el('div', { className: 'empty-icon', html: '&#128090;' }),
          el('h3', { text: searchQuery ? 'No items match your search' : 'Your wardrobe is empty' }),
          el('p', { text: searchQuery ? 'Try different keywords.' : 'Tap + to add your first item.' })
        ])
      );
      return;
    }

    for (const item of items) {
      grid.appendChild(itemCard(item, {
        onClick: (i) => navigate(`/wardrobe/edit?id=${i.id}`)
      }));
    }
  }

  return () => unsub();
}
