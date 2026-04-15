# RCNC-001 — CSV POS Sales Data Upload & Validation

| Field | Value |
| :--- | :--- |
| **Module** | RCNC — Reconciliation & Variance Auditing |
| **Sprint** | 3 |
| **Priority** | High |
| **App** | user-app |
| **Access** | `owner` role only |
| **Open Question** | Column mapping strategy (canonical format vs. flexible mapping UI) is UNRESOLVED. See PRD §8, Open Question #4. For v1 implementation, a canonical format with a configurable item-code-to-recipe mapping is the working assumption. |

## User Statement
As a restaurant owner, I want to upload my daily POS sales export as a CSV so that the system can calculate how much of each raw material ingredient was theoretically consumed today.

## Acceptance Criteria
1. CSV upload dialog at `/reconciliation/upload` accepts `.csv` files up to 5MB.
2. Required CSV columns: `itemName` (or `itemCode`) and `quantitySold`. Additional columns are ignored without error.
3. Uploaded CSV is parsed client-side and displayed in a review table before any processing begins.
4. Items that cannot be matched to a recipe by name or code are listed in a separate "Unmatched Items" section; the owner can manually map these to a recipe or mark them as "No Recipe" (excluded from deduction).
5. The owner must confirm the review screen before the deduction run is triggered.
6. Upload rejects files that are not valid CSV format with a clear error message before the review step.

## data-test-id List
- `rcnc-upload-button` — CSV upload trigger button
- `rcnc-upload-file-input` — hidden file input
- `rcnc-upload-review-table` — parsed CSV review table
- `rcnc-upload-matched-items` — matched items section
- `rcnc-upload-unmatched-items` — unmatched items section
- `rcnc-upload-map-item-{index}` — manual recipe mapping dropdown per unmatched item
- `rcnc-upload-confirm-button` — confirm and trigger deduction run
- `rcnc-upload-format-error` — invalid file format error
