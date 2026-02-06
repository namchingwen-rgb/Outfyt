/** Category combination rules and formality/vibe matching */

/**
 * Valid outfit structures. Each is an array of required categories,
 * with optionals in a sub-array.
 */
export const OUTFIT_TEMPLATES = [
  { name: 'top-bottom', required: ['tops', 'bottoms', 'shoes'], optional: ['outerwear', 'accessories'] },
  { name: 'dress', required: ['dresses', 'shoes'], optional: ['outerwear', 'accessories'] }
];

/**
 * Formality match score (0-1). Closer formalities score higher.
 */
export function formalityScore(itemFormality, targetFormality) {
  const diff = Math.abs(itemFormality - targetFormality);
  if (diff === 0) return 1.0;
  if (diff === 1) return 0.7;
  if (diff === 2) return 0.3;
  return 0.1;
}

/**
 * Vibe coherence: what fraction of target vibes overlap with item vibes
 */
export function vibeOverlap(itemVibes, targetVibes) {
  if (!targetVibes.length || !itemVibes.length) return 0.5;
  const matched = targetVibes.filter(v => itemVibes.includes(v)).length;
  return matched / targetVibes.length;
}

/**
 * Season match: does the item fit the target season?
 */
export function seasonMatch(itemSeasons, targetSeason) {
  if (!itemSeasons || !itemSeasons.length) return 0.7; // unspecified = flexible
  return itemSeasons.includes(targetSeason) ? 1.0 : 0.15;
}

/**
 * Variety score: prefer items not worn recently.
 * Returns 0-1 where 1 = not worn recently.
 */
export function varietyScore(item) {
  if (!item.wornDates || !item.wornDates.length) return 1.0;
  const lastWorn = new Date(item.wornDates[item.wornDates.length - 1]);
  const daysSince = (Date.now() - lastWorn.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince > 14) return 1.0;
  if (daysSince > 7) return 0.8;
  if (daysSince > 3) return 0.6;
  if (daysSince > 1) return 0.4;
  return 0.15;
}

/**
 * Average formality of a set of items.
 */
export function avgFormality(items) {
  if (!items.length) return 3;
  return items.reduce((s, i) => s + (i.formality || 3), 0) / items.length;
}
