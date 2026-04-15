/**
 * Public API for @stockpot/shared
 *
 * Import shared models and interfaces from either app using:
 *   import { Restaurant, deserializeRestaurant } from '@stockpot/shared';
 */

// ─── Core platform models ─────────────────────────────────────────────────────
export * from './models/restaurant.model';
export * from './models/app-user.model';
export * from './models/subscription.model';
export * from './models/payment-gateway.interface';

// ─── Restaurant domain models ─────────────────────────────────────────────────
export * from './models/vendor.model';
export * from './models/raw-material.model';
export * from './models/sub-component.model';
export * from './models/recipe.model';

// ─── Legacy user / auth models ───────────────────────────────────────────────
export * from './models/user-profile.model';
