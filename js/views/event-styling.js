/** Event-based outfit generation view */
import { $, el, render, clearNode } from '../utils/dom.js';
import { store } from '../store.js';
import { OCCASIONS, OCCASION_FORMALITY, OCCASION_ICONS, FORMALITY_LABELS, VIBES } from '../utils/data.js';
import { generateOutfits } from '../engine/stylist.js';
import { outfitCard } from '../components/outfit-card.js';
import { toast } from '../components/toast.js';

export function eventStylingView() {
  const main = $('#main-content');

  if (!store.isPremium()) {
    render(main, premiumGate());
    return;
  }

  const container = el('div', { className: 'view event-view' });
  const header = el('div', { className: 'view-header' }, [
    el('h1', { text: 'Event Styling' }),
    el('p', { className: 'view-subtitle', text: 'Get the perfect outfit for any occasion' })
  ]);

  const eventGrid = el('div', { className: 'event-grid' });
  const refinement = el('div', { className: 'refinement-section hidden' });
  const results = el('div', { className: 'event-results' });

  container.append(header, eventGrid, refinement, results);
  render(main, container);

  let selectedOccasion = null;

  renderEventGrid();

  function renderEventGrid() {
    clearNode(eventGrid);
    for (const occ of OCCASIONS) {
      eventGrid.appendChild(
        el('button', {
          className: 'event-tile',
          onClick: () => selectOccasion(occ)
        }, [
          el('span', { className: 'event-icon', html: OCCASION_ICONS[occ] || '&#128197;' }),
          el('span', { className: 'event-name', text: occ })
        ])
      );
    }
  }

  function selectOccasion(occ) {
    selectedOccasion = occ;
    // Highlight selected
    eventGrid.querySelectorAll('.event-tile').forEach(t => {
      t.classList.toggle('selected', t.querySelector('.event-name').textContent === occ);
    });

    showRefinement(occ);
  }

  function showRefinement(occ) {
    refinement.classList.remove('hidden');
    clearNode(refinement);

    const fRange = OCCASION_FORMALITY[occ] || [1, 5];
    let formality = fRange;
    let vibes = [...(store.getPrefs().styleVibes || [])];

    const formalityDisplay = el('span', {
      text: `${FORMALITY_LABELS[fRange[0] - 1]} to ${FORMALITY_LABELS[fRange[1] - 1]}`
    });

    const vibeChips = el('div', { className: 'chip-group' });
    renderVibeChips();

    const generateBtn = el('button', {
      className: 'btn btn-primary btn-full',
      text: 'Generate Outfits',
      onClick: () => generateResults(occ, formality, vibes)
    });

    refinement.append(
      el('h3', { text: 'Refine Your Look' }),
      el('div', { className: 'form-field' }, [
        el('label', { className: 'form-label', text: 'Formality Range' }),
        formalityDisplay
      ]),
      el('div', { className: 'form-field' }, [
        el('label', { className: 'form-label', text: 'Style Vibes' }),
        vibeChips
      ]),
      generateBtn
    );

    function renderVibeChips() {
      clearNode(vibeChips);
      for (const v of VIBES) {
        vibeChips.appendChild(
          el('button', {
            className: `chip ${vibes.includes(v) ? 'chip-active' : ''}`,
            text: v,
            onClick: () => {
              if (vibes.includes(v)) vibes = vibes.filter(x => x !== v);
              else vibes.push(v);
              renderVibeChips();
            }
          })
        );
      }
    }
  }

  function generateResults(occasion, fRange, vibes) {
    clearNode(results);

    const outfits = generateOutfits({
      occasion,
      formalityRange: fRange,
      vibes,
      count: 3
    });

    if (!outfits.length) {
      results.appendChild(
        el('div', { className: 'empty-state' }, [
          el('div', { className: 'empty-icon', html: '&#129335;' }),
          el('h3', { text: 'No outfits found' }),
          el('p', { text: 'Try adding more items that match this occasion.' })
        ])
      );
      return;
    }

    results.appendChild(el('h2', { className: 'section-title', text: `Outfits for ${occasion}` }));

    for (const outfit of outfits) {
      results.appendChild(
        outfitCard(outfit, {
          onSave: (o) => {
            o.saved = true;
            store.saveOutfit(o);
            toast('Outfit saved!', { type: 'success' });
          },
          onWore: (o) => {
            o.dateWorn = new Date().toISOString().slice(0, 10);
            o.saved = true;
            store.saveOutfit(o);
            o.itemIds.forEach(id => store.markWorn(id));
            toast('Marked as worn!', { type: 'success' });
          }
        })
      );
    }
  }
}

function premiumGate() {
  return el('div', { className: 'view premium-gate' }, [
    el('div', { className: 'premium-gate-content' }, [
      el('div', { className: 'premium-icon', html: '&#10024;' }),
      el('h2', { text: 'Event Styling' }),
      el('p', { text: 'Get AI-curated outfits for any occasion with Premium.' }),
      el('ul', { className: 'premium-features' }, [
        el('li', { text: 'Outfits for 14+ event types' }),
        el('li', { text: 'Formality & vibe refinement' }),
        el('li', { text: 'Multiple outfit suggestions' })
      ]),
      el('a', { className: 'btn btn-premium', href: '#/pricing', text: 'Upgrade to Premium' })
    ])
  ]);
}
