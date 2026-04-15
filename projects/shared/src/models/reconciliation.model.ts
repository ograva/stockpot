/**
 * ReconciliationDoc — Firestore document shape for `restaurants/{restaurantId}/reconciliations/{dateKey}`.
 *
 * Represents the result of a theoretical deduction run (RCNC module). One document per
 * reconciliation period. The document ID `dateKey` is a formatted date string (YYYY-MM-DD)
 * representing the end of the reconciliation period.
 *
 * The `runTheoreticalDeduction` Cloud Function (RCNC-002) is the sole writer.
 * It traverses all completed kitchen entries, applies recipe ingredient quantities to
 * portion counts, and calculates theoretical consumption vs actual stock reduction.
 *
 * Rules:
 *  - `_schemaVersion` is always written; never stripped by serialize().
 *  - `Reconciliation` is the UI-facing type (no `_schemaVersion`).
 *  - Line items are embedded — one per raw material involved in the period.
 *  - The `variancePct` on each line item drives the waste/loss flagging in the UI.
 */

export const RECONCILIATION_SCHEMA_VERSION = 1;

/** Status of the reconciliation run. */
export type ReconciliationStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETE'
  | 'ERROR';

/** A single raw material line item within a reconciliation report. */
export interface ReconciliationLineItem {
  /** Firestore document ID of the RawMaterialDoc. */
  rawMaterialId: string;
  /** Snapshot of the material name at the time of reconciliation. */
  rawMaterialName: string;
  /** Unit of measure. */
  unit: string;
  /** Theoretical consumption calculated from recipe portions served. */
  theoreticalQty: number;
  /**
   * Actual consumption calculated as: openingStock + received - closingStock.
   * Populated once the manager confirms closing stock.
   */
  actualQty: number;
  /**
   * Variance = actualQty - theoreticalQty.
   * Positive = excess consumption (potential waste/theft).
   * Negative = under-consumption (over-estimation in recipes).
   */
  variance: number;
  /**
   * Variance expressed as a percentage of theoreticalQty.
   * NaN and edge cases (theoreticalQty = 0) are stored as 0.
   */
  variancePct: number;
}

/** Firestore document shape for `restaurants/{restaurantId}/reconciliations/{dateKey}`. */
export interface ReconciliationDoc {
  /** Infrastructure field — drives migration logic; never shown in UI. */
  _schemaVersion: number;
  /** Status of this reconciliation run. */
  status: ReconciliationStatus;
  /** ISO 8601 start timestamp of the reconciliation period. */
  periodStart: string;
  /** ISO 8601 end timestamp of the reconciliation period. */
  periodEnd: string;
  /** Embedded line items — one per raw material. */
  lineItems: ReconciliationLineItem[];
  /** ISO 8601 timestamp when the Cloud Function completed the run. */
  completedAt?: string;
  /** Error message if status is ERROR. */
  errorMessage?: string;
}

/**
 * UI-facing type — `_schemaVersion` stripped.
 * Components and signals use this type exclusively.
 */
export type Reconciliation = Omit<ReconciliationDoc, '_schemaVersion'>;

/** Canonical defaults. */
export const RECONCILIATION_DEFAULTS: Reconciliation = {
  status: 'PENDING',
  periodStart: '',
  periodEnd: '',
  lineItems: [],
};

/**
 * Normalise a raw Firestore snapshot into a fully-typed `Reconciliation`.
 */
export function deserializeReconciliation(raw: unknown): Reconciliation {
  const data = (raw ?? {}) as Partial<ReconciliationDoc>;

  // --- Migration gate (expand as schema evolves) ---

  return {
    status: data.status ?? RECONCILIATION_DEFAULTS.status,
    periodStart: data.periodStart ?? RECONCILIATION_DEFAULTS.periodStart,
    periodEnd: data.periodEnd ?? RECONCILIATION_DEFAULTS.periodEnd,
    lineItems: data.lineItems ?? RECONCILIATION_DEFAULTS.lineItems,
    ...(data.completedAt ? { completedAt: data.completedAt } : {}),
    ...(data.errorMessage ? { errorMessage: data.errorMessage } : {}),
  };
}

/**
 * Produce a null-free Firestore-safe `ReconciliationDoc` from the UI-facing `Reconciliation`.
 */
export function serializeReconciliation(
  rec: Reconciliation,
): ReconciliationDoc {
  return {
    _schemaVersion: RECONCILIATION_SCHEMA_VERSION,
    status: rec.status,
    periodStart: rec.periodStart,
    periodEnd: rec.periodEnd,
    lineItems: rec.lineItems,
    ...(rec.completedAt ? { completedAt: rec.completedAt } : {}),
    ...(rec.errorMessage ? { errorMessage: rec.errorMessage } : {}),
  };
}
