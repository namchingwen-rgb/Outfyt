/** App constants and lookup data */

export const CATEGORIES = {
  tops: ['T-Shirt', 'Blouse', 'Shirt', 'Sweater', 'Hoodie', 'Tank Top', 'Crop Top', 'Polo', 'Cardigan', 'Turtleneck'],
  bottoms: ['Jeans', 'Trousers', 'Shorts', 'Skirt', 'Joggers', 'Leggings', 'Chinos', 'Culottes'],
  dresses: ['Casual Dress', 'Cocktail Dress', 'Maxi Dress', 'Midi Dress', 'Mini Dress', 'Sundress', 'Shirt Dress'],
  outerwear: ['Jacket', 'Blazer', 'Coat', 'Denim Jacket', 'Bomber', 'Cardigan', 'Vest', 'Parka', 'Trench Coat'],
  shoes: ['Sneakers', 'Boots', 'Heels', 'Flats', 'Sandals', 'Loafers', 'Oxfords', 'Mules', 'Athletic'],
  accessories: ['Bag', 'Belt', 'Hat', 'Scarf', 'Jewelry', 'Sunglasses', 'Watch', 'Tie']
};

export const CATEGORY_LABELS = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  dresses: 'Dresses',
  outerwear: 'Outerwear',
  shoes: 'Shoes',
  accessories: 'Accessories'
};

export const COLORS = [
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Cream', hex: '#FFFDD0' },
  { name: 'Beige', hex: '#D4C5A9' },
  { name: 'Gray', hex: '#888888' },
  { name: 'Light Gray', hex: '#C8C8C8' },
  { name: 'Navy', hex: '#1B2A4A' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Light Blue', hex: '#93C5FD' },
  { name: 'Denim', hex: '#4A6FA5' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Burgundy', hex: '#722F37' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Blush', hex: '#F5C6C6' },
  { name: 'Orange', hex: '#EA580C' },
  { name: 'Rust', hex: '#A0522D' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Mustard', hex: '#C4972A' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Olive', hex: '#6B7040' },
  { name: 'Sage', hex: '#9CAF88' },
  { name: 'Teal', hex: '#0D9488' },
  { name: 'Purple', hex: '#9333EA' },
  { name: 'Lavender', hex: '#C4B5E0' },
  { name: 'Brown', hex: '#78553A' },
  { name: 'Tan', hex: '#C9A96E' },
  { name: 'Camel', hex: '#C19A6B' },
  { name: 'Gold', hex: '#C4A265' },
  { name: 'Silver', hex: '#ADADAD' },
  { name: 'Coral', hex: '#FF6F61' },
  { name: 'Mauve', hex: '#B784A7' },
  { name: 'Khaki', hex: '#BDB76B' }
];

export const NEUTRALS = new Set([
  'Black', 'White', 'Cream', 'Beige', 'Gray', 'Light Gray', 'Navy', 'Brown', 'Tan', 'Camel', 'Khaki', 'Denim'
]);

export const VIBES = [
  'Casual', 'Smart Casual', 'Formal', 'Business', 'Bohemian',
  'Streetwear', 'Minimalist', 'Preppy', 'Romantic', 'Edgy',
  'Sporty', 'Vintage', 'Classic', 'Artsy', 'Glamorous'
];

export const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];

export const MATERIALS = [
  'Cotton', 'Linen', 'Silk', 'Wool', 'Cashmere', 'Polyester',
  'Denim', 'Leather', 'Suede', 'Satin', 'Velvet', 'Chiffon',
  'Nylon', 'Tweed', 'Jersey', 'Fleece', 'Corduroy', 'Canvas'
];

export const OCCASIONS = [
  'Everyday', 'Work', 'Date Night', 'Party', 'Wedding Guest',
  'Brunch', 'Interview', 'Travel', 'Workout', 'Beach',
  'Concert', 'Dinner Out', 'Casual Friday', 'Outdoor Event'
];

export const FORMALITY_LABELS = ['Very Casual', 'Casual', 'Smart Casual', 'Semi-Formal', 'Formal'];

export const OCCASION_FORMALITY = {
  'Everyday': [1, 2],
  'Work': [3, 4],
  'Date Night': [3, 4],
  'Party': [2, 4],
  'Wedding Guest': [4, 5],
  'Brunch': [2, 3],
  'Interview': [4, 5],
  'Travel': [1, 2],
  'Workout': [1, 1],
  'Beach': [1, 1],
  'Concert': [2, 3],
  'Dinner Out': [3, 4],
  'Casual Friday': [2, 3],
  'Outdoor Event': [1, 3]
};

export const OCCASION_ICONS = {
  'Everyday': '&#9728;&#65039;',
  'Work': '&#128188;',
  'Date Night': '&#10084;&#65039;',
  'Party': '&#127881;',
  'Wedding Guest': '&#128141;',
  'Brunch': '&#127859;',
  'Interview': '&#128084;',
  'Travel': '&#9992;&#65039;',
  'Workout': '&#128170;',
  'Beach': '&#127958;&#65039;',
  'Concert': '&#127925;',
  'Dinner Out': '&#127869;',
  'Casual Friday': '&#128526;',
  'Outdoor Event': '&#127795;'
};

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
