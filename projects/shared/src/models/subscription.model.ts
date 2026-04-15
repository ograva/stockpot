/**
 * SubscriptionDoc — Firestore document shape for `subscriptions/{subscriptionId}`.
 *
 * Platform-level collection managed exclusively by the admin app.
 * Links a restaurant tenant to a plan tier, billing cycle, and payment gateway.
 *
 * Rules:
 *  - `_schemaVersion` is always written; never stripped by serialize().
 *  - `Subscription` is the UI-facing type (no `_schemaVersion`).
 *  - `paymentGateway` is a string identifier referencing a `PaymentGateway` adapter
 *    (see payment-gateway.interface.ts). It is optional until a payment method is attached.
 *  - Cancelled subscriptions set `status` to 'cancelled'; the restaurant retains
 *    read-only access until `currentPeriodEnd` passes.
 */

export const SUBSCRIPTION_SCHEMA_VERSION = 1;

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'cancelled';
export type BillingCycle = 'monthly' | 'annual';
export type PaymentGatewayId = 'paymongo' | 'maya' | 'gcash' | 'manual';

/** Firestore document shape. */
export interface SubscriptionDoc {
  /** Infrastructure field — drives migration logic; never shown in UI. */
  _schemaVersion: number;
  /** Reference to the restaurant tenant. */
  restaurantId: string;
  /** Current subscription status. */
  status: SubscriptionStatus;
  /** The plan the restaurant is subscribed to. */
  planTier: 'starter' | 'growth' | 'enterprise';
  /** Billing cycle chosen by the subscriber. */
  billingCycle: BillingCycle;
  /** ISO 8601 — start of the current billing period. */
  currentPeriodStart: string;
  /** ISO 8601 — end of the current billing period. Access expires after this. */
  currentPeriodEnd: string;
  /** Identifier of the payment gateway adapter in use. Optional until payment is attached. */
  paymentGateway?: PaymentGatewayId;
  /** External subscription / transaction reference from the gateway. Optional. */
  gatewaySubscriptionId?: string;
}

/**
 * UI-facing type — `_schemaVersion` stripped.
 * Components and signals use this type exclusively.
 */
export type Subscription = Omit<SubscriptionDoc, '_schemaVersion'>;

/** Canonical defaults. */
export const SUBSCRIPTION_DEFAULTS: Subscription = {
  restaurantId: '',
  status: 'trialing',
  planTier: 'starter',
  billingCycle: 'monthly',
  currentPeriodStart: '',
  currentPeriodEnd: '',
};

/**
 * Normalise a raw Firestore snapshot into a fully-typed `Subscription`.
 */
export function deserializeSubscription(raw: unknown): Subscription {
  const data = (raw ?? {}) as Partial<SubscriptionDoc>;
  const version = data._schemaVersion ?? 0;

  // --- Migration gate (expand as schema evolves) ---
  if (version < SUBSCRIPTION_SCHEMA_VERSION) {
    // v0 → v1: no structural changes needed yet.
  }

  return {
    restaurantId: data.restaurantId ?? SUBSCRIPTION_DEFAULTS.restaurantId,
    status: data.status ?? SUBSCRIPTION_DEFAULTS.status,
    planTier: data.planTier ?? SUBSCRIPTION_DEFAULTS.planTier,
    billingCycle: data.billingCycle ?? SUBSCRIPTION_DEFAULTS.billingCycle,
    currentPeriodStart:
      data.currentPeriodStart ?? SUBSCRIPTION_DEFAULTS.currentPeriodStart,
    currentPeriodEnd:
      data.currentPeriodEnd ?? SUBSCRIPTION_DEFAULTS.currentPeriodEnd,
    ...(data.paymentGateway ? { paymentGateway: data.paymentGateway } : {}),
    ...(data.gatewaySubscriptionId
      ? { gatewaySubscriptionId: data.gatewaySubscriptionId }
      : {}),
  };
}

/**
 * Produce a null-free Firestore-safe `SubscriptionDoc` from the UI-facing `Subscription`.
 */
export function serializeSubscription(sub: Subscription): SubscriptionDoc {
  return {
    _schemaVersion: SUBSCRIPTION_SCHEMA_VERSION,
    restaurantId: sub.restaurantId,
    status: sub.status,
    planTier: sub.planTier,
    billingCycle: sub.billingCycle,
    currentPeriodStart: sub.currentPeriodStart,
    currentPeriodEnd: sub.currentPeriodEnd,
    ...(sub.paymentGateway ? { paymentGateway: sub.paymentGateway } : {}),
    ...(sub.gatewaySubscriptionId
      ? { gatewaySubscriptionId: sub.gatewaySubscriptionId }
      : {}),
  };
}
