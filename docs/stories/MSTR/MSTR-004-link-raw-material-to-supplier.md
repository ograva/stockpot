# MSTR-004 — Link Raw Material to Supplier

| Field | Value |
| :--- | :--- |
| **Module** | MSTR — Restaurant Master Data Setup |
| **Sprint** | 1 |
| **Priority** | High |
| **App** | user-app |
| **Depends On** | MSTR-002 or MSTR-003 (ingredient must exist), ADMN-007 (platform suppliers must exist) |

## User Statement
As a restaurant owner, I want to link each raw material to one or more suppliers — from the platform's verified supplier network or my own custom suppliers — so that PO generation knows where to route reorder requests.

## Acceptance Criteria
1. On the ingredient detail page, a "Suppliers" section allows linking one or more suppliers to the ingredient.
2. The supplier search shows two sections: "Platform Suppliers" (from `vendors/{vendorId}` where `isPlatformManaged: true`) and "My Suppliers" (restaurant-created custom suppliers).
3. For platform-managed suppliers, the current listed price from the Vendor Portal is shown alongside the supplier name (e.g., "Metro Fresh — ₱280/kg").
4. For custom suppliers, the owner manually enters and maintains the price.
5. One supplier can be designated as the "primary" supplier per ingredient; this is the supplier used by the Auto-PO engine (REPO-002) by default.
6. Restaurant-created custom suppliers are stored at `restaurants/{restaurantId}/suppliers/{supplierId}` with `isPlatformManaged: false`.

## data-test-id List
- `mstr-ingredient-supplier-section` — supplier linking section
- `mstr-ingredient-supplier-search` — supplier search input
- `mstr-ingredient-platform-suppliers-section` — platform suppliers group
- `mstr-ingredient-custom-suppliers-section` — custom suppliers group
- `mstr-ingredient-supplier-price-badge-{supplierId}` — live price badge
- `mstr-ingredient-primary-supplier-toggle-{supplierId}` — set as primary supplier
- `mstr-ingredient-add-custom-supplier-button` — add new custom supplier
