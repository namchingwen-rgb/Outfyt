/** Wardrobe analytics & optimization view */
import { $, el, render, clearNode } from '../utils/dom.js';
import { store } from '../store.js';
import { CATEGORY_LABELS, VIBES, COLORS, NEUTRALS } from '../utils/data.js';
import { itemCard } from '../components/item-card.js';
import { navigate } from '../router.js';

export function optimizationView() {
  const main = $('#main-content');
  const items = store.getItems();
  const outfits = store.getOutfits();
  const isPremium = store.isPremium();

  const container = el('div', { className: 'view optimization-view' });
  const header = el('div', { className: 'view-header' }, [
    el('h1', { text: 'Wardrobe Insights' }),
    el('p', { className: 'view-subtitle', text: 'Understand and optimize your wardrobe' })
  ]);

  container.appendChild(header);

  if (!items.length) {
    container.appendChild(
      el('div', { className: 'empty-state' }, [
        el('div', { className: 'empty-icon', html: '&#128200;' }),
        el('h3', { text: 'No data yet' }),
        el('p', { text: 'Add items to your wardrobe to see insights.' }),
        el('a', { className: 'btn btn-primary', href: '#/wardrobe', text: 'Go to Wardrobe' })
      ])
    );
    render(main, container);
    return;
  }

  // Stats cards
  const totalItems = items.length;
  const totalOutfits = outfits.length;
  const totalWears = items.reduce((s, i) => s + (i.wornDates?.length || 0), 0);
  const avgWears = totalItems ? (totalWears / totalItems).toFixed(1) : 0;
  const favCount = items.filter(i => i.favorite).length;
  const laundryCount = items.filter(i => i.inLaundry).length;

  container.appendChild(
    el('div', { className: 'stats-grid' }, [
      statCard('Total Items', totalItems, '&#128090;'),
      statCard('Outfits Created', totalOutfits, '&#128087;'),
      statCard('Total Wears', totalWears, '&#128260;'),
      statCard('Avg Wears/Item', avgWears, '&#128202;'),
      statCard('Favorites', favCount, '&#9829;'),
      statCard('In Laundry', laundryCount, '&#129531;')
    ])
  );

  // Category breakdown
  const catCounts = {};
  for (const item of items) {
    catCounts[item.category] = (catCounts[item.category] || 0) + 1;
  }
  container.appendChild(
    el('div', { className: 'insight-section' }, [
      el('h2', { className: 'section-title', text: 'Category Breakdown' }),
      el('div', { className: 'category-bars' },
        Object.entries(catCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([cat, count]) => {
            const pct = Math.round(count / totalItems * 100);
            return el('div', { className: 'category-bar-row' }, [
              el('span', { className: 'cat-label', text: CATEGORY_LABELS[cat] || cat }),
              el('div', { className: 'bar-track' }, [
                el('div', { className: 'bar-fill', style: { width: pct + '%' } })
              ]),
              el('span', { className: 'cat-count', text: `${count} (${pct}%)` })
            ]);
          })
      )
    ])
  );

  // Underused items (free: top 3, premium: all)
  const underused = items
    .filter(i => !i.inLaundry)
    .sort((a, b) => (a.wornDates?.length || 0) - (b.wornDates?.length || 0))
    .slice(0, isPremium ? 10 : 3);

  if (underused.length) {
    container.appendChild(
      el('div', { className: 'insight-section' }, [
        el('h2', { className: 'section-title', text: 'Underused Items' }),
        el('p', { className: 'insight-desc', text: 'These pieces deserve more love' }),
        el('div', { className: 'wardrobe-grid' },
          underused.map(item => itemCard(item, { onClick: (i) => navigate(`/wardrobe/edit?id=${i.id}`) }))
        ),
        !isPremium && items.length > 3 ? el('div', { className: 'premium-tease' }, [
          el('p', { text: `+ ${items.length - 3} more items` }),
          el('a', { className: 'btn btn-small btn-premium', href: '#/pricing', text: 'See All with Premium' })
        ]) : null
      ])
    );
  }

  // Color palette overview
  const colorCounts = {};
  for (const item of items) {
    for (const c of (item.colors || [])) {
      colorCounts[c] = (colorCounts[c] || 0) + 1;
    }
  }
  const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);

  container.appendChild(
    el('div', { className: 'insight-section' }, [
      el('h2', { className: 'section-title', text: 'Your Color Palette' }),
      el('div', { className: 'palette-grid' },
        sortedColors.slice(0, 12).map(([name, count]) => {
          const colorObj = COLORS.find(c => c.name === name);
          return el('div', { className: 'palette-item' }, [
            el('div', {
              className: 'palette-swatch',
              style: { backgroundColor: colorObj?.hex || '#ccc' }
            }),
            el('span', { className: 'palette-name', text: name }),
            el('span', { className: 'palette-count', text: `${count}` })
          ]);
        })
      )
    ])
  );

  // Gap analysis (premium)
  if (isPremium) {
    const gaps = analyzeGaps(items, catCounts);
    if (gaps.length) {
      container.appendChild(
        el('div', { className: 'insight-section' }, [
          el('h2', { className: 'section-title', text: 'Wardrobe Gaps' }),
          el('p', { className: 'insight-desc', text: 'Suggested additions to round out your wardrobe' }),
          el('ul', { className: 'gap-list' },
            gaps.map(g => el('li', { className: 'gap-item' }, [
              el('span', { className: 'gap-icon', html: '&#128161;' }),
              el('span', { text: g })
            ]))
          )
        ])
      );
    }
  } else {
    container.appendChild(
      el('div', { className: 'premium-gate-inline' }, [
        el('h3', { text: 'Unlock Full Insights' }),
        el('p', { text: 'Get gap analysis, shopping recommendations, and advanced analytics with Premium.' }),
        el('a', { className: 'btn btn-premium', href: '#/pricing', text: 'Upgrade to Premium' })
      ])
    );
  }

  render(main, container);
}

function statCard(label, value, icon) {
  return el('div', { className: 'stat-card' }, [
    el('div', { className: 'stat-icon', html: icon }),
    el('div', { className: 'stat-value', text: String(value) }),
    el('div', { className: 'stat-label', text: label })
  ]);
}

function analyzeGaps(items, catCounts) {
  const gaps = [];
  const cats = Object.keys(CATEGORY_LABELS);

  // Missing categories
  for (const cat of cats) {
    if (!catCounts[cat]) {
      gaps.push(`You have no ${CATEGORY_LABELS[cat].toLowerCase()}. Consider adding a versatile piece.`);
    }
  }

  // Low shoe count
  if ((catCounts.shoes || 0) < 2) {
    gaps.push('A second pair of shoes in a different style would add versatility.');
  }

  // All dark / no neutrals check
  const colorList = items.flatMap(i => i.colors || []);
  const neutralCount = colorList.filter(c => NEUTRALS.has(c)).length;
  const total = colorList.length || 1;
  if (neutralCount / total < 0.3) {
    gaps.push('Consider adding more neutral pieces for easier mixing and matching.');
  }
  if (neutralCount / total > 0.85) {
    gaps.push('Your wardrobe is very neutral. A pop of color could add personality.');
  }

  // Formality gaps
  const formalities = items.map(i => i.formality || 3);
  const hasFormal = formalities.some(f => f >= 4);
  const hasCasual = formalities.some(f => f <= 2);
  if (!hasFormal) gaps.push('You lack formal pieces. A blazer or dress shoes would fill this gap.');
  if (!hasCasual) gaps.push('Consider some casual basics for everyday comfort.');

  return gaps.slice(0, 6);
}
