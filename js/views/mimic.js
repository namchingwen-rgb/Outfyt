/** Mimic-a-Look feature */
import { $, el, render, clearNode } from '../utils/dom.js';
import { store } from '../store.js';
import { CATEGORY_LABELS, COLORS, VIBES } from '../utils/data.js';
import { pickImage } from '../utils/image.js';
import { itemCard } from '../components/item-card.js';
import { toast } from '../components/toast.js';
import { navigate } from '../router.js';

export function mimicView() {
  const main = $('#main-content');

  if (!store.isPremium()) {
    render(main, premiumGate());
    return;
  }

  const container = el('div', { className: 'view mimic-view' });
  const header = el('div', { className: 'view-header' }, [
    el('h1', { text: 'Mimic a Look' }),
    el('p', { className: 'view-subtitle', text: 'Upload an inspiration image and recreate it from your wardrobe' })
  ]);

  let inspoImage = null;
  let taggedPieces = []; // { category, colors[], description }
  const matches = [];

  const imageSection = el('div', { className: 'mimic-image-section' });
  const tagSection = el('div', { className: 'mimic-tag-section hidden' });
  const matchSection = el('div', { className: 'mimic-match-section hidden' });

  container.append(header, imageSection, tagSection, matchSection);
  render(main, container);
  renderImageUpload();

  function renderImageUpload() {
    clearNode(imageSection);
    if (inspoImage) {
      imageSection.appendChild(
        el('div', { className: 'inspo-preview' }, [
          el('img', { src: inspoImage, alt: 'Inspiration' }),
          el('button', {
            className: 'btn btn-ghost btn-small',
            text: 'Change Image',
            onClick: uploadImage
          })
        ])
      );
      tagSection.classList.remove('hidden');
      renderTagging();
    } else {
      imageSection.appendChild(
        el('div', { className: 'upload-area', onClick: uploadImage }, [
          el('div', { className: 'upload-icon', html: '&#128247;' }),
          el('p', { text: 'Upload Inspiration Photo' }),
          el('span', { className: 'upload-hint', text: 'Take a screenshot from social media, magazines, etc.' })
        ])
      );
    }
  }

  async function uploadImage() {
    const data = await pickImage();
    if (data) {
      inspoImage = data;
      renderImageUpload();
    }
  }

  function renderTagging() {
    clearNode(tagSection);

    const tagList = el('div', { className: 'tag-list' });
    renderTagList();

    let tCategory = 'tops';
    let tColors = [];
    let tDesc = '';

    const colorChips = el('div', { className: 'color-grid color-grid-small' });
    renderColorChips();

    const addTagBtn = el('button', {
      className: 'btn btn-secondary',
      text: '+ Tag Piece',
      onClick: () => {
        taggedPieces.push({
          category: tCategory,
          colors: [...tColors],
          description: tDesc
        });
        tColors = [];
        tDesc = '';
        descInput.value = '';
        renderColorChips();
        renderTagList();
      }
    });

    const categorySelect = el('select', {
      className: 'form-input',
      onChange: (e) => { tCategory = e.target.value; }
    }, Object.entries(CATEGORY_LABELS).map(([val, label]) =>
      el('option', { value: val, text: label })
    ));

    const descInput = el('input', {
      type: 'text',
      className: 'form-input',
      placeholder: 'Description (e.g., oversized blazer)',
      onInput: (e) => { tDesc = e.target.value; }
    });

    function renderColorChips() {
      clearNode(colorChips);
      for (const c of COLORS.slice(0, 16)) {
        colorChips.appendChild(
          el('button', {
            className: `color-swatch color-swatch-sm ${tColors.includes(c.name) ? 'selected' : ''}`,
            style: { backgroundColor: c.hex },
            title: c.name,
            onClick: () => {
              if (tColors.includes(c.name)) tColors = tColors.filter(x => x !== c.name);
              else tColors.push(c.name);
              renderColorChips();
            }
          })
        );
      }
    }

    tagSection.append(
      el('h3', { text: 'Tag the pieces you see' }),
      el('p', { className: 'step-subtitle', text: 'Identify each clothing item in the photo' }),
      el('div', { className: 'tag-form' }, [categorySelect, descInput, colorChips, addTagBtn]),
      tagList,
      taggedPieces.length ? el('button', {
        className: 'btn btn-primary btn-full',
        text: 'Find Matches in My Wardrobe',
        onClick: findMatches
      }) : null
    );

    function renderTagList() {
      clearNode(tagList);
      for (let i = 0; i < taggedPieces.length; i++) {
        const t = taggedPieces[i];
        tagList.appendChild(
          el('div', { className: 'tagged-piece' }, [
            el('span', { text: `${CATEGORY_LABELS[t.category]}${t.description ? ': ' + t.description : ''}` }),
            t.colors.length ? el('span', { className: 'tag-colors', text: t.colors.join(', ') }) : null,
            el('button', {
              className: 'btn btn-ghost btn-small',
              html: '&times;',
              onClick: () => { taggedPieces.splice(i, 1); renderTagging(); }
            })
          ])
        );
      }
    }
  }

  function findMatches() {
    matchSection.classList.remove('hidden');
    clearNode(matchSection);

    const allItems = store.getItems();

    matchSection.appendChild(el('h2', { className: 'section-title', text: 'Your Matches' }));

    let hasAnyMatch = false;

    for (const tag of taggedPieces) {
      // Find items in same category with color overlap
      const categoryItems = allItems.filter(i => i.category === tag.category);
      const scored = categoryItems.map(item => {
        let score = 0;
        // Color overlap
        const colorOverlap = (item.colors || []).filter(c => tag.colors.includes(c)).length;
        score += colorOverlap * 30;
        // Same category bonus
        score += 20;
        // Description keyword match
        if (tag.description) {
          const words = tag.description.toLowerCase().split(/\s+/);
          const nameWords = item.name.toLowerCase();
          const subcat = (item.subcategory || '').toLowerCase();
          for (const w of words) {
            if (nameWords.includes(w) || subcat.includes(w)) score += 15;
          }
        }
        return { item, score };
      }).filter(s => s.score > 10).sort((a, b) => b.score - a.score);

      const section = el('div', { className: 'match-category' });
      section.appendChild(
        el('h3', { text: `${CATEGORY_LABELS[tag.category]}${tag.description ? ' — ' + tag.description : ''}` })
      );

      if (scored.length) {
        hasAnyMatch = true;
        const matchGrid = el('div', { className: 'wardrobe-grid' });
        for (const { item } of scored.slice(0, 4)) {
          matchGrid.appendChild(itemCard(item, {
            onClick: (i) => navigate(`/wardrobe/edit?id=${i.id}`)
          }));
        }
        section.appendChild(matchGrid);
      } else {
        section.appendChild(
          el('div', { className: 'no-match' }, [
            el('p', { text: 'No matching items found' }),
            el('a', {
              className: 'btn btn-small btn-secondary',
              href: `https://www.google.com/search?q=${encodeURIComponent(tag.description || CATEGORY_LABELS[tag.category])}+clothing&tbm=shop`,
              target: '_blank',
              rel: 'noopener',
              text: 'Shop for this piece'
            })
          ])
        );
      }

      matchSection.appendChild(section);
    }

    if (!hasAnyMatch) {
      matchSection.appendChild(
        el('div', { className: 'empty-state' }, [
          el('p', { text: 'No matches found in your wardrobe. Time to shop!' })
        ])
      );
    }
  }
}

function premiumGate() {
  return el('div', { className: 'view premium-gate' }, [
    el('div', { className: 'premium-gate-content' }, [
      el('div', { className: 'premium-icon', html: '&#127912;' }),
      el('h2', { text: 'Mimic a Look' }),
      el('p', { text: 'Recreate any outfit from your existing wardrobe with Premium.' }),
      el('ul', { className: 'premium-features' }, [
        el('li', { text: 'Upload inspiration photos' }),
        el('li', { text: 'Smart wardrobe matching' }),
        el('li', { text: 'Shopping links for missing pieces' })
      ]),
      el('a', { className: 'btn btn-premium', href: '#/pricing', text: 'Upgrade to Premium' })
    ])
  ]);
}
