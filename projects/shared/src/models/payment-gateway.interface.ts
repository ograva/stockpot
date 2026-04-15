/**
 * PaymentGateway — Pluggable payment gateway interface for StockPot subscriptions.
 *
 * StockPot targets the Philippines market. Supported gateways:
 *  - PayMongo (cards, GCash, Maya, GrabPay via PayMongo API)
 *  - Maya (direct Maya Business API)
 *  - GCash (direct GCash For Business API)
 *  - Manual (cash / bank transfer tracked manually by platform admins)
 *
 * Architecture:
 *  - `PaymentGateway` is the abstract contract all adapters implement.
 *  - `PaymentIntent` and `PaymentResult` are the shared DTOs used across adapters.
 *  - Each concrete adapter is a stub — integration is a future phase.
 *  - The platform-level `SubscriptionService` (admin app) resolves the correct
 *    adapter using `getPaymentGateway(id)` based on `Subscription.paymentGateway`.
 *
 * Note: Stripe is explicitly excluded — not supported in the Philippines.
 */

// ─── Shared DTOs ─────────────────────────────────────────────────────────────

export interface PaymentIntent {
  /** Amount in the smallest currency unit (e.g. centavos for PHP). */
  amountCentavos: number;
  /** ISO 4217 currency code. */
  currency: string;
  /** Human-readable description shown on the gateway's payment page. */
  description: string;
  /** Internal reference used to reconcile the payment (e.g. subscriptionId). */
  referenceId: string;
}

export interface PaymentResult {
  /** Whether the payment was completed successfully. */
  success: boolean;
  /** Gateway-assigned transaction identifier. */
  transactionId?: string;
  /** Gateway-issued checkout URL for redirect-to-pay flows. Optional. */
  checkoutUrl?: string;
  /** Error message when `success` is false. */
  errorMessage?: string;
}

// ─── Abstract contract ────────────────────────────────────────────────────────

export interface PaymentGateway {
  /** Unique identifier matching `PaymentGatewayId` in subscription.model.ts. */
  readonly id: string;
  /** Human-readable gateway name. */
  readonly displayName: string;

  /**
   * Initiate a payment for the given intent.
   * Returns a `PaymentResult` — callers must handle both success and failure paths.
   */
  createPayment(intent: PaymentIntent): Promise<PaymentResult>;

  /**
   * Verify the status of an existing transaction by its gateway-assigned ID.
   * Used for polling or webhook reconciliation.
   */
  verifyPayment(transactionId: string): Promise<PaymentResult>;
}

// ─── Adapter stubs ────────────────────────────────────────────────────────────

/**
 * PayMongo adapter stub.
 * Docs: https://developers.paymongo.com
 * TODO: Implement using PayMongo REST API with secret key from environment.
 */
export class PayMongoGateway implements PaymentGateway {
  readonly id = 'paymongo';
  readonly displayName = 'PayMongo';

  async createPayment(_intent: PaymentIntent): Promise<PaymentResult> {
    throw new Error('PayMongoGateway.createPayment() — not yet implemented.');
  }

  async verifyPayment(_transactionId: string): Promise<PaymentResult> {
    throw new Error('PayMongoGateway.verifyPayment() — not yet implemented.');
  }
}

/**
 * Maya Business adapter stub.
 * Docs: https://developers.maya.ph
 * TODO: Implement using Maya Checkout API with public/secret key from environment.
 */
export class MayaGateway implements PaymentGateway {
  readonly id = 'maya';
  readonly displayName = 'Maya';

  async createPayment(_intent: PaymentIntent): Promise<PaymentResult> {
    throw new Error('MayaGateway.createPayment() — not yet implemented.');
  }

  async verifyPayment(_transactionId: string): Promise<PaymentResult> {
    throw new Error('MayaGateway.verifyPayment() — not yet implemented.');
  }
}

/**
 * GCash For Business adapter stub.
 * Docs: https://developer.gcash.com.ph
 * TODO: Implement using GCash payment API with merchant credentials from environment.
 */
export class GCashGateway implements PaymentGateway {
  readonly id = 'gcash';
  readonly displayName = 'GCash';

  async createPayment(_intent: PaymentIntent): Promise<PaymentResult> {
    throw new Error('GCashGateway.createPayment() — not yet implemented.');
  }

  async verifyPayment(_transactionId: string): Promise<PaymentResult> {
    throw new Error('GCashGateway.verifyPayment() — not yet implemented.');
  }
}

/**
 * Manual payment adapter — for cash or bank transfer tracked by platform admins.
 * Always returns success without calling any external API.
 */
export class ManualGateway implements PaymentGateway {
  readonly id = 'manual';
  readonly displayName = 'Manual (Cash / Bank Transfer)';

  async createPayment(intent: PaymentIntent): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `MANUAL-${intent.referenceId}-${Date.now()}`,
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    return { success: true, transactionId };
  }
}

// ─── Gateway registry ─────────────────────────────────────────────────────────

const GATEWAY_REGISTRY: Record<string, PaymentGateway> = {
  paymongo: new PayMongoGateway(),
  maya: new MayaGateway(),
  gcash: new GCashGateway(),
  manual: new ManualGateway(),
};

/**
 * Resolve a `PaymentGateway` adapter by its identifier.
 * Throws if the gateway ID is not registered.
 */
export function getPaymentGateway(id: string): PaymentGateway {
  const gateway = GATEWAY_REGISTRY[id];
  if (!gateway) {
    throw new Error(`No payment gateway registered for id: "${id}".`);
  }
  return gateway;
}
