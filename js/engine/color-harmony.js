/** Color matching rules and harmony scoring */
import { NEUTRALS } from '../utils/data.js';

// Complementary / analogous pairs for scoring
const HARMONY_MAP = {
  'Red':       { complement: ['Teal', 'Green', 'Sage'], analogous: ['Orange', 'Pink', 'Coral', 'Burgundy'] },
  'Blue':      { complement: ['Orange', 'Rust', 'Coral'], analogous: ['Navy', 'Teal', 'Light Blue', 'Lavender'] },
  'Green':     { complement: ['Red', 'Pink', 'Coral'], analogous: ['Teal', 'Sage', 'Olive', 'Yellow'] },
  'Yellow':    { complement: ['Purple', 'Lavender'], analogous: ['Gold', 'Mustard', 'Orange', 'Cream'] },
  'Purple':    { complement: ['Yellow', 'Gold', 'Mustard'], analogous: ['Lavender', 'Mauve', 'Pink', 'Navy'] },
  'Orange':    { complement: ['Blue', 'Navy', 'Teal'], analogous: ['Rust', 'Coral', 'Yellow', 'Red'] },
  'Pink':      { complement: ['Green', 'Sage', 'Olive'], analogous: ['Blush', 'Mauve', 'Lavender', 'Coral'] },
  'Teal':      { complement: ['Red', 'Coral', 'Rust'], analogous: ['Green', 'Blue', 'Sage'] },
  'Burgundy':  { complement: ['Sage', 'Teal'], analogous: ['Red', 'Mauve', 'Brown', 'Rust'] },
  'Navy':      { complement: ['Mustard', 'Gold', 'Camel'], analogous: ['Blue', 'Light Blue', 'Denim'] },
  'Olive':     { complement: ['Burgundy', 'Mauve'], analogous: ['Sage', 'Green', 'Khaki', 'Brown'] },
  'Rust':      { complement: ['Teal', 'Blue', 'Navy'], analogous: ['Orange', 'Brown', 'Burgundy', 'Camel'] },
  'Coral':     { complement: ['Teal', 'Navy'], analogous: ['Pink', 'Orange', 'Blush', 'Red'] },
  'Lavender':  { complement: ['Mustard', 'Gold'], analogous: ['Purple', 'Mauve', 'Blush', 'Light Blue'] },
  'Sage':      { complement: ['Burgundy', 'Rust', 'Mauve'], analogous: ['Olive', 'Green', 'Khaki'] },
  'Mustard':   { complement: ['Navy', 'Purple', 'Lavender'], analogous: ['Yellow', 'Gold', 'Khaki', 'Camel'] },
  'Mauve':     { complement: ['Olive', 'Sage'], analogous: ['Pink', 'Lavender', 'Purple', 'Blush'] },
  'Gold':      { complement: ['Navy', 'Purple'], analogous: ['Yellow', 'Mustard', 'Camel', 'Tan'] },
  'Denim':     { complement: ['Rust', 'Coral', 'Orange'], analogous: ['Navy', 'Blue', 'Light Blue'] },
  'Light Blue': { complement: ['Coral', 'Rust'], analogous: ['Blue', 'Denim', 'Navy', 'Lavender'] },
  'Blush':     { complement: ['Sage', 'Olive'], analogous: ['Pink', 'Cream', 'Mauve', 'Coral'] },
  'Silver':    { complement: ['Gold'], analogous: ['Gray', 'Light Gray', 'Black', 'White'] }
};

/**
 * Score color harmony between a set of colors (0 to 1).
 * Higher = better match.
 */
export function colorHarmonyScore(colorNames) {
  if (!colorNames.length) return 0.5;

  const unique = [...new Set(colorNames)];
  const neutralCount = unique.filter(c => NEUTRALS.has(c)).length;
  const boldColors = unique.filter(c => !NEUTRALS.has(c));

  // All neutrals → great
  if (boldColors.length === 0) return 0.9;

  // Mostly neutrals with 1 pop of color → great
  if (boldColors.length === 1 && neutralCount >= 1) return 0.95;

  // Penalty for too many bold colors
  if (boldColors.length >= 4) return 0.3;
  if (boldColors.length >= 3) {
    // Check if they're all analogous
    const allAnalogous = checkAllAnalogous(boldColors);
    return allAnalogous ? 0.6 : 0.35;
  }

  // Two bold colors — check harmony
  if (boldColors.length === 2) {
    const [a, b] = boldColors;
    const mapA = HARMONY_MAP[a];
    const mapB = HARMONY_MAP[b];

    if (mapA?.complement?.includes(b) || mapB?.complement?.includes(a)) return 0.85;
    if (mapA?.analogous?.includes(b) || mapB?.analogous?.includes(a)) return 0.8;
    // Unknown pair
    return 0.5;
  }

  // Single bold + no neutrals
  return 0.7;
}

function checkAllAnalogous(colors) {
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const map = HARMONY_MAP[colors[i]];
      if (!map || !map.analogous.includes(colors[j])) {
        const mapJ = HARMONY_MAP[colors[j]];
        if (!mapJ || !mapJ.analogous.includes(colors[i])) return false;
      }
    }
  }
  return true;
}

/**
 * Given a set of items, get combined color names for harmony checking.
 */
export function getOutfitColors(items) {
  return items.flatMap(i => i.colors || []);
}
