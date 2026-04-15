# RCNC-003 — Expected vs. Actual Count Sheet

| Field | Value |
| :--- | :--- |
| **Module** | RCNC — Reconciliation & Variance Auditing |
| **Sprint** | 3 |
| **Priority** | High |
| **App** | user-app |
| **Depends On** | RCNC-002 (theoretical deduction must be complete for the date) |

## User Statement
As a restaurant owner, I want to see a count sheet comparing the expected stock (after theoretical deductions) to the physical count entered by my staff so that I can identify and quantify variances clearly.

## Acceptance Criteria
1. Count sheet at `/reconciliation/{date}` shows a table with columns: ingredient name, opening stock, theoretical consumption (from deduction run), expected closing stock, actual physical count (staff entry), and variance.
2. Physical count is entered by staff in a dedicated entry column — tappable inline inputs for kitchen-friendly entry.
3. Variance column is auto-calculated (`expected closing stock` minus `actual physical count`) and color-coded:
   - Green: variance within ±2% of par minimum
   - Amber: variance between 2–5%
   - Red: variance >5%
4. Color coding is always paired with a text label ("On Target", "Minor Variance", "Review Required") for accessibility.
5. Count sheet is exportable as PDF and XLSX from the page header.
6. Last physical count date is recorded per ingredient so the owner can see when each was last verified.

## data-test-id List
- `rcnc-count-sheet-table` — count sheet table
- `rcnc-count-row-{ingredientId}` — per-ingredient row
- `rcnc-count-actual-input-{ingredientId}` — physical count entry input
- `rcnc-count-variance-{ingredientId}` — variance cell
- `rcnc-count-status-label-{ingredientId}` — variance status text label
- `rcnc-count-export-pdf-button` — export as PDF button
- `rcnc-count-export-xlsx-button` — export as XLSX button
