/** Entry point — router init, route registration, boot logic */
import { initRouter, registerRoute, navigate, currentRoute } from './router.js';
import { store } from './store.js';
import { renderNav } from './components/nav.js';

// Views
import { homeView } from './views/home.js';
import { wardrobeView } from './views/wardrobe.js';
import { wardrobeFormView } from './views/wardrobe-form.js';
import { eventStylingView } from './views/event-styling.js';
import { onboardingView } from './views/onboarding.js';
import { optimizationView } from './views/optimization.js';
import { mimicView } from './views/mimic.js';
import { pricingView } from './views/pricing.js';

// Register routes
registerRoute('/home', () => homeView());
registerRoute('/wardrobe', () => wardrobeView());
registerRoute('/wardrobe/add', () => wardrobeFormView({}));
registerRoute('/wardrobe/edit', (params) => wardrobeFormView(params));
registerRoute('/event-styling', () => eventStylingView());
registerRoute('/onboarding', () => onboardingView());
registerRoute('/optimization', () => optimizationView());
registerRoute('/mimic', () => mimicView());
registerRoute('/pricing', () => pricingView());

// Boot
document.addEventListener('DOMContentLoaded', () => {
  renderNav();

  const prefs = store.getPrefs();

  // Redirect new users to onboarding
  if (!prefs.onboardingComplete) {
    navigate('/onboarding');
  }

  initRouter();
});
