/**
 * Shared model interfaces for Firebase Cloud Functions.
 *
 * These are interface-only definitions — no serialize/deserialize helpers.
 * The Admin SDK receives raw Firestore data directly via DocumentSnapshot.data()
 * and writes via admin.firestore.FieldValue / Timestamp, so client-side
 * transform functions do not apply here.
 *
 * Keep these interfaces in sync with the client-side models in:
 *   projects/shared/src/models/
 */

export * from './restaurant.model';
export * from './app-user.model';
export * from './subscription.model';
export * from './vendor.model';
export * from './raw-material.model';
export * from './sub-component.model';
export * from './recipe.model';
