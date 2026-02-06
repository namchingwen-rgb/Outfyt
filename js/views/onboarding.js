/** 3-step onboarding flow */
import { $, el, render, clearNode } from '../utils/dom.js';
import { store } from '../store.js';
import { VIBES, OCCASIONS, uid, CATEGORIES, CATEGORY_LABELS, COLORS, SEASONS } from '../utils/data.js';
import { pickImage, createPlaceholder } from '../utils/image.js';
import { toast } from '../components/toast.js';
import { navigate } from '../router.js';

export function onboardingView() {
  const main = $('#main-content');
  const nav = $('#bottom-nav');
  if (nav) nav.classList.add('hidden');

  let step = 0;
  const state = {
    name: '',
    styleVibes: [],
    commonOccasions: [],
    quickItems: []
  };

  const container = el('div', { className: 'view onboarding-view' });
  render(main, container);
  renderStep();

  function renderStep() {
    clearNode(container);
    const steps = [renderWelcome, renderQuickAdd, renderPreferences];
    steps[step]();
  }

  function renderWelcome() {
    container.appendChild(
      el('div', { className: 'onboarding-step onboarding-welcome' }, [
        el('div', { className: 'onboarding-logo', html: '&#10024;' }),
        el('h1', { className: 'brand-title', text: 'Outfyt' }),
        el('p', { className: 'onboarding-tagline', text: 'Your AI-powered wardrobe stylist' }),
        el('div', { className: 'onboarding-features' }, [
          el('div', { className: 'feature-item' }, [
            el('span', { className: 'feature-icon', html: '&#128090;' }),
            el('span', { text: 'Organize your wardrobe digitally' })
          ]),
          el('div', { className: 'feature-item' }, [
            el('span', { className: 'feature-icon', html: '&#127912;' }),
            el('span', { text: 'Get styled daily with AI' })
          ]),
          el('div', { className: 'feature-item' }, [
            el('span', { className: 'feature-icon', html: '&#128200;' }),
            el('span', { text: 'Maximize your existing pieces' })
          ])
        ]),
        el('div', { className: 'form-field' }, [
          el('label', { className: 'form-label', text: "What's your name?" }),
          el('input', {
            type: 'text',
            className: 'form-input onboarding-name',
            placeholder: 'Enter your name',
            value: state.name,
            onInput: (e) => { state.name = e.target.value; }
          })
        ]),
        el('button', {
          className: 'btn btn-primary btn-full',
          text: 'Get Started',
          onClick: () => {
            if (!state.name.trim()) {
              toast('Please enter your name', { type: 'error' });
              return;
            }
            step = 1;
            renderStep();
          }
        }),
        renderProgress(0)
      ])
    );
  }

  function renderQuickAdd() {
    const itemsList = el('div', { className: 'quick-add-list' });

    const renderItems = () => {
      clearNode(itemsList);
      for (const item of state.quickItems) {
        itemsList.appendChild(
          el('div', { className: 'quick-add-item' }, [
            item.imageData
              ? el('img', { src: item.imageData, className: 'quick-add-thumb' })
              : el('div', { className: 'quick-add-placeholder', html: createPlaceholder(item.category) }),
            el('span', { text: `${item.name} (${CATEGORY_LABELS[item.category]})` }),
            el('button', {
              className: 'btn btn-ghost btn-small',
              html: '&times;',
              onClick: () => {
                state.quickItems = state.quickItems.filter(i => i.id !== item.id);
                renderItems();
              }
            })
          ])
        );
      }
    };

    let qCategory = 'tops';
    let qName = '';

    const categorySelect = el('select', {
      className: 'form-input',
      onChange: (e) => { qCategory = e.target.value; }
    }, Object.entries(CATEGORY_LABELS).map(([val, label]) =>
      el('option', { value: val, text: label })
    ));

    const nameInput = el('input', {
      type: 'text',
      className: 'form-input',
      placeholder: 'Item name (e.g., Blue Jeans)',
      onInput: (e) => { qName = e.target.value; }
    });

    const addBtn = el('button', {
      className: 'btn btn-secondary',
      text: '+ Add Item',
      onClick: () => {
        if (!qName.trim()) {
          toast('Enter item name', { type: 'error' });
          return;
        }
        state.quickItems.push({
          id: uid(),
          name: qName.trim(),
          category: qCategory,
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
        });
        qName = '';
        nameInput.value = '';
        renderItems();
      }
    });

    container.appendChild(
      el('div', { className: 'onboarding-step' }, [
        el('h2', { text: 'Quick-Add Items' }),
        el('p', { className: 'step-subtitle', text: "Add a few items to get started. You can add more details later." }),
        el('div', { className: 'quick-add-form' }, [
          categorySelect,
          nameInput,
          addBtn
        ]),
        itemsList,
        el('div', { className: 'onboarding-nav' }, [
          el('button', { className: 'btn btn-ghost', text: 'Back', onClick: () => { step = 0; renderStep(); } }),
          el('button', {
            className: 'btn btn-primary',
            text: state.quickItems.length ? 'Next' : 'Skip for Now',
            onClick: () => { step = 2; renderStep(); }
          })
        ]),
        renderProgress(1)
      ])
    );
    renderItems();
  }

  function renderPreferences() {
    const vibeChips = el('div', { className: 'chip-group' });
    const occChips = el('div', { className: 'chip-group' });

    const renderVibes = () => {
      clearNode(vibeChips);
      for (const v of VIBES) {
        vibeChips.appendChild(
          el('button', {
            className: `chip ${state.styleVibes.includes(v) ? 'chip-active' : ''}`,
            text: v,
            onClick: () => {
              if (state.styleVibes.includes(v)) state.styleVibes = state.styleVibes.filter(x => x !== v);
              else state.styleVibes.push(v);
              renderVibes();
            }
          })
        );
      }
    };

    const renderOccasions = () => {
      clearNode(occChips);
      for (const o of OCCASIONS) {
        occChips.appendChild(
          el('button', {
            className: `chip ${state.commonOccasions.includes(o) ? 'chip-active' : ''}`,
            text: o,
            onClick: () => {
              if (state.commonOccasions.includes(o)) state.commonOccasions = state.commonOccasions.filter(x => x !== o);
              else state.commonOccasions.push(o);
              renderOccasions();
            }
          })
        );
      }
    };

    container.appendChild(
      el('div', { className: 'onboarding-step' }, [
        el('h2', { text: 'Your Style Preferences' }),
        el('p', { className: 'step-subtitle', text: 'Help us personalize your experience.' }),
        el('div', { className: 'form-field' }, [
          el('label', { className: 'form-label', text: 'Your style vibes (pick a few)' }),
          vibeChips
        ]),
        el('div', { className: 'form-field' }, [
          el('label', { className: 'form-label', text: 'Your typical occasions' }),
          occChips
        ]),
        el('div', { className: 'onboarding-nav' }, [
          el('button', { className: 'btn btn-ghost', text: 'Back', onClick: () => { step = 1; renderStep(); } }),
          el('button', {
            className: 'btn btn-primary',
            text: 'Finish Setup',
            onClick: completeOnboarding
          })
        ]),
        renderProgress(2)
      ])
    );
    renderVibes();
    renderOccasions();
  }

  function renderProgress(current) {
    return el('div', { className: 'progress-dots' },
      [0, 1, 2].map(i =>
        el('span', { className: `dot ${i === current ? 'dot-active' : i < current ? 'dot-done' : ''}` })
      )
    );
  }

  function completeOnboarding() {
    // Save items
    for (const item of state.quickItems) {
      store.saveItem(item);
    }
    // Save preferences
    store.updatePrefs({
      onboardingComplete: true,
      name: state.name.trim(),
      styleVibes: state.styleVibes,
      commonOccasions: state.commonOccasions
    });

    toast('Welcome to Outfyt!', { type: 'success' });
    if (nav) nav.classList.remove('hidden');
    navigate('/home');
  }

  return () => {
    if (nav) nav.classList.remove('hidden');
  };
}
