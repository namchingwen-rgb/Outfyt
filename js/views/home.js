/** Home / Daily Styling view */
import { $, el, render, clearNode } from '../utils/dom.js';
import { store } from '../store.js';
import { generateDailyOutfit, generateOutfits } from '../engine/stylist.js';
import { outfitCard } from '../components/outfit-card.js';
import { toast } from '../components/toast.js';
import { uid } from '../utils/data.js';

export function homeView() {
  const main = $('#main-content');
  const prefs = store.getPrefs();
  const name = prefs.name || 'there';
  const greeting = getGreeting();

  let dailyOutfit = null;
  let regenCount = 0;
  const maxFreeRegens = 1;

  const container = el('div', { className: 'view home-view' });

  const header = el('div', { className: 'home-header' }, [
    el('h1', { className: 'home-greeting', text: `${greeting}, ${name}` }),
    el('p', { className: 'home-subtitle', text: "Here's your styled look for today" })
  ]);

  const outfitSection = el('div', { className: 'home-outfit-section' });
  const savedSection = el('div', { className: 'home-saved-section' });

  container.append(header, outfitSection, savedSection);
  render(main, container);

  // Generate daily outfit
  generateDaily();
  renderSaved();

  function generateDaily() {
    const items = store.getItems();
    if (items.length < 2) {
      render(outfitSection,
        el('div', { className: 'empty-state' }, [
          el('div', { className: 'empty-icon', html: '&#128090;' }),
          el('h3', { text: 'Add items to your wardrobe' }),
          el('p', { text: 'You need at least 2 items to generate outfits.' }),
          el('a', { className: 'btn btn-primary', href: '#/wardrobe', text: 'Go to Wardrobe' })
        ])
      );
      return;
    }

    dailyOutfit = generateDailyOutfit({
      occasion: prefs.commonOccasions?.[0] || 'Everyday'
    });

    if (!dailyOutfit) {
      render(outfitSection,
        el('div', { className: 'empty-state' }, [
          el('div', { className: 'empty-icon', html: '&#129335;' }),
          el('h3', { text: "Couldn't create an outfit" }),
          el('p', { text: 'Try adding more variety to your wardrobe.' })
        ])
      );
      return;
    }

    renderOutfit();
  }

  function renderOutfit() {
    clearNode(outfitSection);
    outfitSection.appendChild(
      el('h2', { className: 'section-title', text: "Today's Look" })
    );
    outfitSection.appendChild(
      outfitCard(dailyOutfit, {
        onSave: handleSave,
        onWore: handleWore,
        onRegenerate: handleRegenerate,
        onRate: handleRate
      })
    );
  }

  function handleSave(outfit) {
    outfit.saved = true;
    store.saveOutfit(outfit);
    toast('Outfit saved!', { type: 'success' });
    renderOutfit();
    renderSaved();
  }

  function handleWore(outfit) {
    outfit.dateWorn = new Date().toISOString().slice(0, 10);
    outfit.saved = true;
    store.saveOutfit(outfit);
    // Mark each item as worn
    outfit.itemIds.forEach(id => store.markWorn(id));
    toast('Marked as worn! Your stats are updated.', { type: 'success' });
    renderOutfit();
    renderSaved();
  }

  function handleRegenerate() {
    if (!store.isPremium()) {
      regenCount++;
      if (regenCount > maxFreeRegens) {
        toast('Upgrade to Premium for unlimited regenerations', { type: 'info' });
        window.location.hash = '#/pricing';
        return;
      }
    }
    generateDaily();
  }

  function handleRate(outfit, rating) {
    outfit.rating = rating;
    store.saveOutfit(outfit);
    toast(`Rated ${rating} star${rating > 1 ? 's' : ''}`, { type: 'success' });
    renderOutfit();
  }

  function renderSaved() {
    const saved = store.getSavedOutfits().slice(-6).reverse();
    clearNode(savedSection);
    if (!saved.length) return;

    savedSection.appendChild(
      el('h2', { className: 'section-title', text: 'Saved Outfits' })
    );
    const grid = el('div', { className: 'saved-outfits-grid' });
    for (const o of saved) {
      grid.appendChild(outfitCard(o, {
        showActions: true,
        onWore: handleWore,
        onDelete: (outfit) => {
          store.deleteOutfit(outfit.id);
          toast('Outfit removed');
          renderSaved();
        },
        onRate: handleRate
      }));
    }
    savedSection.appendChild(grid);
  }

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }
}
