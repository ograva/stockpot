/**
 * Subscription — Firestore document shape for `subscriptions/{subscriptionId}`.
 * Interface only. See projects/shared/src/models/subscription.model.ts for
 * client-side serialize/deserialize helpers.
 */

export const SUBSCRIPTION_SCHEMA_VERSION = 1;

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'cancelled';
export type BillingCycle = 'monthly' | 'annual';
export type PaymentGatewayId = 'paymongo' | 'maya' | 'gcash' | 'manual';

export interface SubscriptionDoc {
  _schemaVersion: number;
  restaurantId: string;
  status: SubscriptionStatus;
  planTier: 'starter' | 'growth' | 'enterprise';
  billingCycle: BillingCycle;
  /** ISO 8601 — start of the current billing period. */
  currentPeriodStart: string;
  /** ISO 8601 — end of the current billing period. */
  currentPeriodEnd: string;
  paymentGateway?: PaymentGatewayId;
  gatewaySubscriptionId?: string;
}
