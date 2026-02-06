/** Core outfit generation algorithm */
import { store } from '../store.js';
import { colorHarmonyScore, getOutfitColors } from './color-harmony.js';
import { OUTFIT_TEMPLATES, formalityScore, vibeOverlap, seasonMatch, varietyScore, avgFormality } from './rules.js';
import { uid } from '../utils/data.js';

/**
 * Generate outfit suggestions.
 * @param {Object} opts
 * @param {string} opts.occasion - Target occasion
 * @param {number[]} opts.formalityRange - [min, max] formality (1-5)
 * @param {string[]} opts.vibes - Target vibes
 * @param {string} opts.season - Target season
 * @param {number} opts.count - Number of outfits to return (default 3)
 * @returns {Object[]} Array of outfit objects with itemIds and score
 */
export function generateOutfits(opts = {}) {
  const prefs = store.getPrefs();
  const allItems = store.getItems();

  const season = opts.season || prefs.currentSeason;
  const vibes = opts.vibes?.length ? opts.vibes : prefs.styleVibes;
  const formalityRange = opts.formalityRange || [1, 5];
  const occasion = opts.occasion || 'Everyday';
  const count = opts.count || 3;

  // 1. Filter available items
  const available = allItems.filter(item => {
    if (item.inLaundry) return false;
    if (seasonMatch(item.seasons, season) < 0.3) return false;
    const f = item.formality || 3;
    if (f < formalityRange[0] - 1 || f > formalityRange[1] + 1) return false;
    return true;
  });

  if (available.length < 2) return [];

  // Group by category
  const byCategory = {};
  for (const item of available) {
    if (!byCategory[item.category]) byCategory[item.category] = [];
    byCategory[item.category].push(item);
  }

  // 2. Try each template, generate candidate outfits
  const candidates = [];

  for (const template of OUTFIT_TEMPLATES) {
    // Check we have items for all required categories
    const canUse = template.required.every(cat => byCategory[cat]?.length > 0);
    if (!canUse) continue;

    // Generate multiple combinations
    const combos = buildCombinations(template, byCategory, count * 5);

    for (const combo of combos) {
      const score = scoreOutfit(combo, { vibes, formalityRange, season });
      candidates.push({
        id: uid(),
        itemIds: combo.map(i => i.id),
        occasion,
        dateSuggested: new Date().toISOString(),
        dateWorn: null,
        saved: false,
        rating: 0,
        score
      });
    }
  }

  // 3. Sort by score, deduplicate, return top N
  candidates.sort((a, b) => b.score - a.score);

  const seen = new Set();
  const results = [];
  for (const c of candidates) {
    const key = [...c.itemIds].sort().join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(c);
    if (results.length >= count) break;
  }

  return results;
}

function buildCombinations(template, byCategory, maxCombos) {
  const results = [];
  const requiredSlots = template.required;
  const optionalSlots = template.optional || [];

  // Weighted random selection
  for (let attempt = 0; attempt < maxCombos * 2 && results.length < maxCombos; attempt++) {
    const combo = [];
    let valid = true;

    for (const cat of requiredSlots) {
      const pool = byCategory[cat];
      if (!pool?.length) { valid = false; break; }
      combo.push(weightedPick(pool));
    }
    if (!valid) continue;

    // Optionally add outerwear/accessories
    for (const cat of optionalSlots) {
      const pool = byCategory[cat];
      if (pool?.length && Math.random() < 0.4) {
        combo.push(weightedPick(pool));
      }
    }

    results.push(combo);
  }

  return results;
}

function weightedPick(items) {
  // Weight by variety (prefer less recently worn)
  const weights = items.map(i => varietyScore(i) + 0.1);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * Score an outfit combination (0-1)
 */
function scoreOutfit(items, { vibes, formalityRange, season }) {
  const targetFormality = (formalityRange[0] + formalityRange[1]) / 2;

  // Color harmony (30%)
  const colors = getOutfitColors(items);
  const colorScore = colorHarmonyScore(colors);

  // Vibe coherence (25%)
  const vibeScores = items.map(i => vibeOverlap(i.vibes || [], vibes));
  const avgVibe = vibeScores.length ? vibeScores.reduce((a, b) => a + b, 0) / vibeScores.length : 0.5;

  // Formality match (30%)
  const af = avgFormality(items);
  const fScore = formalityScore(af, targetFormality);

  // Variety (15%)
  const vScores = items.map(i => varietyScore(i));
  const avgVariety = vScores.reduce((a, b) => a + b, 0) / vScores.length;

  return colorScore * 0.30 + avgVibe * 0.25 + fScore * 0.30 + avgVariety * 0.15;
}

/**
 * Generate a single daily outfit
 */
export function generateDailyOutfit(opts = {}) {
  const results = generateOutfits({ ...opts, count: 1 });
  return results[0] || null;
}
