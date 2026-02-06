/** Pricing comparison page */
import { $, el, render } from '../utils/dom.js';
import { store } from '../store.js';
import { toast } from '../components/toast.js';

export function pricingView() {
  const main = $('#main-content');
  const isPremium = store.isPremium();

  const container = el('div', { className: 'view pricing-view' });

  container.appendChild(
    el('div', { className: 'view-header pricing-header' }, [
      el('h1', { text: 'Choose Your Plan' }),
      el('p', { className: 'view-subtitle', text: 'Unlock the full power of your wardrobe' })
    ])
  );

  // Plan cards
  const plans = el('div', { className: 'plans-container' });

  // Free plan
  plans.appendChild(
    el('div', { className: `plan-card ${!isPremium ? 'plan-current' : ''}` }, [
      el('div', { className: 'plan-header-card' }, [
        el('h3', { text: 'Free' }),
        el('div', { className: 'plan-price' }, [
          el('span', { className: 'price-amount', text: '$0' }),
          el('span', { className: 'price-period', text: '/forever' })
        ])
      ]),
      el('ul', { className: 'plan-features' }, [
        planFeature('Full wardrobe management', true),
        planFeature('1 daily outfit suggestion', true),
        planFeature('Basic wardrobe stats', true),
        planFeature('Unlimited regenerations', false),
        planFeature('Event styling', false),
        planFeature('Mimic-a-Look', false),
        planFeature('Advanced analytics', false),
        planFeature('Gap analysis & shopping recs', false)
      ]),
      !isPremium
        ? el('div', { className: 'plan-badge', text: 'Current Plan' })
        : el('button', {
            className: 'btn btn-secondary btn-full',
            text: 'Downgrade',
            onClick: () => {
              store.updatePrefs({ subscriptionTier: 'free' });
              toast('Downgraded to Free plan');
              pricingView(); // re-render
            }
          })
    ])
  );

  // Premium plan
  plans.appendChild(
    el('div', { className: `plan-card plan-premium ${isPremium ? 'plan-current' : ''}` }, [
      el('div', { className: 'plan-header-card' }, [
        el('div', { className: 'plan-badge-label', text: 'MOST POPULAR' }),
        el('h3', { text: 'Premium' }),
        el('div', { className: 'plan-price' }, [
          el('span', { className: 'price-amount', text: '$9.99' }),
          el('span', { className: 'price-period', text: '/month' })
        ])
      ]),
      el('ul', { className: 'plan-features' }, [
        planFeature('Everything in Free', true),
        planFeature('Unlimited outfit regenerations', true),
        planFeature('Event-based styling', true),
        planFeature('Mimic-a-Look feature', true),
        planFeature('Advanced wardrobe analytics', true),
        planFeature('Gap analysis & recommendations', true),
        planFeature('Shopping suggestions', true),
        planFeature('Priority style updates', true)
      ]),
      isPremium
        ? el('div', { className: 'plan-badge', text: 'Current Plan' })
        : el('button', {
            className: 'btn btn-premium btn-full',
            text: 'Upgrade to Premium',
            onClick: () => {
              store.updatePrefs({ subscriptionTier: 'premium' });
              toast('Welcome to Premium!', { type: 'success' });
              pricingView(); // re-render
            }
          })
    ])
  );

  container.appendChild(plans);

  // FAQ
  container.appendChild(
    el('div', { className: 'pricing-faq' }, [
      el('h2', { className: 'section-title', text: 'FAQ' }),
      faqItem('Can I cancel anytime?', 'Yes! This is a demo, so upgrading just flips a local flag. In production, you could cancel anytime.'),
      faqItem('Is my data secure?', 'All data is stored locally on your device. Nothing is sent to any server.'),
      faqItem('What happens if I downgrade?', "You keep all your wardrobe items. You'll just lose access to premium features.")
    ])
  );

  render(main, container);
}

function planFeature(text, included) {
  return el('li', { className: `plan-feature ${included ? '' : 'disabled'}` }, [
    el('span', { className: 'feature-check', html: included ? '&#10003;' : '&#10007;' }),
    el('span', { text })
  ]);
}

function faqItem(question, answer) {
  const item = el('div', { className: 'faq-item' });
  const q = el('button', { className: 'faq-question', text: question });
  const a = el('div', { className: 'faq-answer hidden', text: answer });
  q.addEventListener('click', () => a.classList.toggle('hidden'));
  item.append(q, a);
  return item;
}
