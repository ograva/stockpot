/**
 * Public API for @stockpot/shared
 *
 * Import shared models and interfaces from either app using:
 *   import { Restaurant, deserializeRestaurant } from '@stockpot/shared';
 */

// ─── Platform admin models ────────────────────────────────────────────────────
export * from './models/platform-admin-user.model';
export * from './models/platform-uom.model';
export * from './models/platform-ingredient.model';
export * from './models/platform-vendor.model';
export * from './models/vendor-catalog-item.model';

// ─── Core restaurant platform models ─────────────────────────────────────────
export * from './models/restaurant.model';
export * from './models/app-user.model';
export * from './models/subscription.model';
export * from './models/payment-gateway.interface';

// ─── Restaurant domain models ─────────────────────────────────────────────────
export * from './models/vendor.model';
export * from './models/raw-material.model';
export * from './models/sub-component.model';
export * from './models/recipe.model';
export * from './models/purchase-order.model';
export * from './models/reconciliation.model';
export * from './models/alert-config.model';
export * from './models/notification.model';

// ─── Legacy user / auth models ───────────────────────────────────────────────
export * from './models/user-profile.model';
