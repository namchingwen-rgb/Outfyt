/** localStorage wrapper with pub/sub state management */

const KEYS = {
  items: 'outfyt_items',
  outfits: 'outfyt_outfits',
  preferences: 'outfyt_preferences'
};

const DEFAULT_PREFS = {
  onboardingComplete: false,
  name: '',
  styleVibes: [],
  commonOccasions: [],
  climate: 'temperate',
  currentSeason: detectSeason(),
  subscriptionTier: 'free'
};

function detectSeason() {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return 'Spring';
  if (m >= 5 && m <= 7) return 'Summer';
  if (m >= 8 && m <= 10) return 'Fall';
  return 'Winter';
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Pub/sub
const listeners = new Map();

function emit(event, data) {
  (listeners.get(event) || []).forEach(fn => fn(data));
}

export const store = {
  // Subscribe
  on(event, fn) {
    if (!listeners.has(event)) listeners.set(event, []);
    listeners.get(event).push(fn);
    return () => {
      const arr = listeners.get(event);
      const idx = arr.indexOf(fn);
      if (idx >= 0) arr.splice(idx, 1);
    };
  },

  // Items
  getItems() {
    return load(KEYS.items, []);
  },

  getItem(id) {
    return this.getItems().find(i => i.id === id) || null;
  },

  saveItem(item) {
    const items = this.getItems();
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...item };
    } else {
      items.push(item);
    }
    save(KEYS.items, items);
    emit('items-changed', items);
    return item;
  },

  deleteItem(id) {
    const items = this.getItems().filter(i => i.id !== id);
    save(KEYS.items, items);
    // Also remove from outfits
    const outfits = this.getOutfits().map(o => ({
      ...o,
      itemIds: o.itemIds.filter(iid => iid !== id)
    })).filter(o => o.itemIds.length > 0);
    save(KEYS.outfits, outfits);
    emit('items-changed', items);
    emit('outfits-changed', outfits);
  },

  toggleLaundry(id) {
    const item = this.getItem(id);
    if (item) {
      item.inLaundry = !item.inLaundry;
      this.saveItem(item);
    }
  },

  toggleFavorite(id) {
    const item = this.getItem(id);
    if (item) {
      item.favorite = !item.favorite;
      this.saveItem(item);
    }
  },

  markWorn(id) {
    const item = this.getItem(id);
    if (item) {
      if (!item.wornDates) item.wornDates = [];
      item.wornDates.push(new Date().toISOString().slice(0, 10));
      this.saveItem(item);
    }
  },

  // Outfits
  getOutfits() {
    return load(KEYS.outfits, []);
  },

  getSavedOutfits() {
    return this.getOutfits().filter(o => o.saved);
  },

  saveOutfit(outfit) {
    const outfits = this.getOutfits();
    const idx = outfits.findIndex(o => o.id === outfit.id);
    if (idx >= 0) {
      outfits[idx] = { ...outfits[idx], ...outfit };
    } else {
      outfits.push(outfit);
    }
    save(KEYS.outfits, outfits);
    emit('outfits-changed', outfits);
    return outfit;
  },

  deleteOutfit(id) {
    const outfits = this.getOutfits().filter(o => o.id !== id);
    save(KEYS.outfits, outfits);
    emit('outfits-changed', outfits);
  },

  // Preferences
  getPrefs() {
    return { ...DEFAULT_PREFS, ...load(KEYS.preferences, {}) };
  },

  updatePrefs(partial) {
    const prefs = { ...this.getPrefs(), ...partial };
    save(KEYS.preferences, prefs);
    emit('prefs-changed', prefs);
    return prefs;
  },

  isPremium() {
    return this.getPrefs().subscriptionTier === 'premium';
  },

  // Reset
  reset() {
    localStorage.removeItem(KEYS.items);
    localStorage.removeItem(KEYS.outfits);
    localStorage.removeItem(KEYS.preferences);
    emit('items-changed', []);
    emit('outfits-changed', []);
    emit('prefs-changed', DEFAULT_PREFS);
  }
};
