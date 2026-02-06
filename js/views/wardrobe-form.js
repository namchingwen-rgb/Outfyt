/** Add/Edit wardrobe item form */
import { $, el, render, clearNode } from '../utils/dom.js';
import { store } from '../store.js';
import { CATEGORIES, CATEGORY_LABELS, COLORS, VIBES, SEASONS, MATERIALS, FORMALITY_LABELS } from '../utils/data.js';
import { uid } from '../utils/data.js';
import { pickImage, createPlaceholder } from '../utils/image.js';
import { toast } from '../components/toast.js';
import { confirmModal } from '../components/modal.js';
import { navigate } from '../router.js';

export function wardrobeFormView(params) {
  const main = $('#main-content');
  const editId = params.id;
  const existing = editId ? store.getItem(editId) : null;
  const isEdit = !!existing;

  // Form state
  const item = existing ? { ...existing } : {
    id: uid(),
    name: '',
    category: 'tops',
    subcategory: '',
    size: '',
    colors: [],
    material: '',
    seasons: [],
    vibes: [],
    formality: 3,
    imageData: null,
    notes: '',
    dateAdded: new Date().toISOString(),
    wornDates: [],
    inLaundry: false,
    favorite: false
  };

  const container = el('div', { className: 'view form-view' });

  // Header
  const header = el('div', { className: 'form-header' }, [
    el('button', { className: 'btn-back', html: '&larr;', onClick: () => navigate('/wardrobe') }),
    el('h1', { text: isEdit ? 'Edit Item' : 'Add Item' }),
    isEdit ? el('button', {
      className: 'btn btn-ghost btn-danger',
      text: 'Delete',
      onClick: async () => {
        if (await confirmModal('Delete this item from your wardrobe?', { title: 'Delete Item', confirmText: 'Delete' })) {
          store.deleteItem(item.id);
          toast('Item deleted');
          navigate('/wardrobe');
        }
      }
    }) : null
  ]);

  // Image section
  const imagePreview = el('div', { className: 'image-preview' });
  updateImagePreview();

  const imageSection = el('div', { className: 'form-image-section', onClick: handleImageUpload }, [
    imagePreview,
    el('span', { className: 'image-hint', text: 'Tap to upload photo' })
  ]);

  // Name
  const nameInput = el('input', {
    type: 'text',
    className: 'form-input',
    placeholder: 'Item name',
    value: item.name,
    onInput: (e) => { item.name = e.target.value; }
  });

  // Category
  const categorySelect = el('select', {
    className: 'form-input',
    onChange: (e) => {
      item.category = e.target.value;
      item.subcategory = '';
      renderSubcategories();
    }
  }, Object.entries(CATEGORY_LABELS).map(([val, label]) =>
    el('option', { value: val, text: label, ...(item.category === val ? { selected: 'selected' } : {}) })
  ));

  // Subcategory
  const subcategoryContainer = el('div', { className: 'subcategory-container' });

  // Size
  const sizeInput = el('input', {
    type: 'text',
    className: 'form-input form-input-small',
    placeholder: 'Size (e.g., M, 10, 32)',
    value: item.size || '',
    onInput: (e) => { item.size = e.target.value; }
  });

  // Material
  const materialSelect = el('select', {
    className: 'form-input',
    onChange: (e) => { item.material = e.target.value; }
  }, [
    el('option', { value: '', text: 'Select material...' }),
    ...MATERIALS.map(m =>
      el('option', { value: m, text: m, ...(item.material === m ? { selected: 'selected' } : {}) })
    )
  ]);

  // Colors (grid)
  const colorsGrid = el('div', { className: 'color-grid' });
  renderColors();

  // Seasons (chips)
  const seasonsChips = el('div', { className: 'chip-group' });
  renderSeasons();

  // Vibes (chips)
  const vibesChips = el('div', { className: 'chip-group' });
  renderVibes();

  // Formality slider
  const formalityLabel = el('span', { className: 'formality-label', text: FORMALITY_LABELS[item.formality - 1] });
  const formalitySlider = el('input', {
    type: 'range',
    className: 'formality-slider',
    min: '1',
    max: '5',
    value: String(item.formality),
    onInput: (e) => {
      item.formality = parseInt(e.target.value);
      formalityLabel.textContent = FORMALITY_LABELS[item.formality - 1];
    }
  });

  // Notes
  const notesInput = el('textarea', {
    className: 'form-input form-textarea',
    placeholder: 'Notes (optional)',
    rows: '3',
    onInput: (e) => { item.notes = e.target.value; }
  });
  notesInput.value = item.notes || '';

  // Quick toggles for edit mode
  const toggles = isEdit ? el('div', { className: 'form-toggles' }, [
    el('label', { className: 'toggle-row' }, [
      el('span', { text: 'In Laundry' }),
      (() => {
        const cb = el('input', {
          type: 'checkbox',
          className: 'toggle-input',
          onChange: (e) => { item.inLaundry = e.target.checked; }
        });
        cb.checked = item.inLaundry;
        return cb;
      })()
    ]),
    el('label', { className: 'toggle-row' }, [
      el('span', { text: 'Favorite' }),
      (() => {
        const cb = el('input', {
          type: 'checkbox',
          className: 'toggle-input',
          onChange: (e) => { item.favorite = e.target.checked; }
        });
        cb.checked = item.favorite;
        return cb;
      })()
    ])
  ]) : null;

  // Save button
  const saveBtn = el('button', {
    className: 'btn btn-primary btn-full',
    text: isEdit ? 'Save Changes' : 'Add to Wardrobe',
    onClick: handleSave
  });

  // Build form
  container.append(
    header,
    imageSection,
    el('div', { className: 'form-body' }, [
      formField('Name', nameInput),
      formField('Category', categorySelect),
      subcategoryContainer,
      el('div', { className: 'form-row' }, [
        formField('Size', sizeInput),
        formField('Material', materialSelect)
      ]),
      formField('Colors', colorsGrid),
      formField('Seasons', seasonsChips),
      formField('Style Vibes', vibesChips),
      formField('Formality', el('div', { className: 'formality-control' }, [formalitySlider, formalityLabel])),
      formField('Notes', notesInput),
      toggles,
      saveBtn
    ])
  );

  render(main, container);
  renderSubcategories();

  function formField(label, content) {
    return el('div', { className: 'form-field' }, [
      el('label', { className: 'form-label', text: label }),
      content
    ]);
  }

  function updateImagePreview() {
    clearNode(imagePreview);
    if (item.imageData) {
      imagePreview.appendChild(el('img', { src: item.imageData, alt: 'Item photo' }));
    } else {
      imagePreview.appendChild(el('div', { className: 'image-placeholder-large', html: createPlaceholder(item.category) }));
    }
  }

  async function handleImageUpload() {
    const data = await pickImage();
    if (data) {
      item.imageData = data;
      updateImagePreview();
    }
  }

  function renderSubcategories() {
    clearNode(subcategoryContainer);
    const subs = CATEGORIES[item.category] || [];
    if (!subs.length) return;
    subcategoryContainer.appendChild(
      formField('Type', el('div', { className: 'chip-group' },
        subs.map(s => el('button', {
          className: `chip ${item.subcategory === s ? 'chip-active' : ''}`,
          text: s,
          onClick: () => { item.subcategory = s; renderSubcategories(); }
        }))
      ))
    );
  }

  function renderColors() {
    clearNode(colorsGrid);
    for (const color of COLORS) {
      const isSelected = item.colors.includes(color.name);
      colorsGrid.appendChild(
        el('button', {
          className: `color-swatch ${isSelected ? 'selected' : ''}`,
          style: { backgroundColor: color.hex },
          title: color.name,
          onClick: () => {
            if (isSelected) {
              item.colors = item.colors.filter(c => c !== color.name);
            } else {
              item.colors.push(color.name);
            }
            renderColors();
          }
        }, [
          isSelected ? el('span', { className: 'color-check', html: '&#10003;' }) : null
        ])
      );
    }
  }

  function renderSeasons() {
    clearNode(seasonsChips);
    for (const s of SEASONS) {
      seasonsChips.appendChild(
        el('button', {
          className: `chip ${item.seasons.includes(s) ? 'chip-active' : ''}`,
          text: s,
          onClick: () => {
            if (item.seasons.includes(s)) {
              item.seasons = item.seasons.filter(x => x !== s);
            } else {
              item.seasons.push(s);
            }
            renderSeasons();
          }
        })
      );
    }
  }

  function renderVibes() {
    clearNode(vibesChips);
    for (const v of VIBES) {
      vibesChips.appendChild(
        el('button', {
          className: `chip ${item.vibes.includes(v) ? 'chip-active' : ''}`,
          text: v,
          onClick: () => {
            if (item.vibes.includes(v)) {
              item.vibes = item.vibes.filter(x => x !== v);
            } else {
              item.vibes.push(v);
            }
            renderVibes();
          }
        })
      );
    }
  }

  function handleSave() {
    if (!item.name.trim()) {
      toast('Please enter a name', { type: 'error' });
      nameInput.focus();
      return;
    }
    store.saveItem(item);
    toast(isEdit ? 'Item updated!' : 'Item added to wardrobe!', { type: 'success' });
    navigate('/wardrobe');
  }
}
