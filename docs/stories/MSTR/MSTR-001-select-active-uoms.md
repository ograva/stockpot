# MSTR-001 — Select Active UoMs from Platform Library

| Field | Value |
| :--- | :--- |
| **Module** | MSTR — Restaurant Master Data Setup |
| **Sprint** | 1 |
| **Priority** | High |
| **App** | user-app |
| **Depends On** | ADMN-005 (platform UoM library must exist) |

## User Statement
As a restaurant owner, I want to choose which units of measure from the platform's library are active for my restaurant so that my team only works with measurements relevant to our kitchen.

## Acceptance Criteria
1. UoM selection UI at `/settings/master-data/uom` shows the full platform library from `platform/catalog/uom`.
2. Restaurant writes selected UoM IDs to `restaurants/{restaurantId}/settings/uom` as an array of references.
3. Restaurants can add custom UoMs not in the platform library; custom entries are stored within the restaurant's own Firestore scope and flagged with a "Custom" badge in the UI.
4. At least one UoM must remain active at all times; the UI blocks deactivating the last active UoM.
5. Platform UoMs and custom UoMs display in separate sections in the selection UI.

## data-test-id List
- `mstr-uom-selection-list` — full UoM list container
- `mstr-uom-platform-section` — platform UoMs section
- `mstr-uom-custom-section` — custom UoMs section
- `mstr-uom-toggle-{uomId}` — toggle per UoM
- `mstr-uom-add-custom-button` — add custom UoM button
- `mstr-uom-custom-badge-{uomId}` — custom badge label
