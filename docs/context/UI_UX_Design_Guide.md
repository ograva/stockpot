# StockPot - UI & UX Design Guide

## Version History
| Version | Date | Author | Summary of Changes |
|---------|------|--------|--------------------|
| v1.0 | April 15, 2026 | Eunice (UI/UX) | Initial moodboard and visual direction established. |

## Moodboard

### 1. Emotional Direction
1. **Focus & Practicality** - No unnecessary cognitive load. Aligns with the Kitchen Manager persona who is busy, mobile, and has their hands dirty.
2. **Trust & Precision** - The Owner needs to trust the theoretical food cost calculations. Interfaces must be sharp and numerical data legible.
3. **Accessibility & Clarity** - For Kitchen Staff, large tap targets and very distinct statuses (Offline, Running). High contrast is a must for loud, potentially dim kitchen environments.

### 2. Color System
Following Material Design color roles mixed with Tailwind variables.

- **Primary:** Forest Green (Represents freshness, healthy stock levels, trust).
  - HEX: `#155e30` (Tailwind `green-800`)
  - `--color-primary: #155e30;`
  - `--color-on-primary: #ffffff;`
- **Secondary:** Slate (Practical, unobtrusive utility elements).
  - HEX: `#475569` (Tailwind `slate-600`)
  - `--color-secondary: #475569;`
  - `--color-on-secondary: #ffffff;`
- **Accent:** Amber (Warning, action needed, offline sync state).
  - HEX: `#d97706` (Tailwind `amber-600`)
  - `--color-accent: #d97706;`
  - `--color-on-accent: #ffffff;`
- **Surface / Background:** Soft Gray/White (High contrast text background).
  - HEX: `#f8fafc` (Tailwind `slate-50`)
  - `--color-background: #f8fafc;`
- **Error:** Rose (Critical alerts, stockouts).
  - HEX: `#e11d48` (Tailwind `rose-600`)
  - `--color-error: #e11d48;`
  - `--color-on-error: #ffffff;`

### 3. Typography Scale
Font Family: **Inter** (Clean, highly legible sans-serif for numbers and data tables).

- **H1 (Page Title):** Inter Semi-Bold, 30px (`text-3xl font-semibold`)
- **H2 (Section Header):** Inter Medium, 24px (`text-2xl font-medium`)
- **H3 (Card Title):** Inter Medium, 20px (`text-xl font-medium`)
- **H4 (Sub-heading):** Inter Medium, 16px (`text-base font-medium`)
- **Body Large (Big touch inputs):** Inter Regular, 18px (`text-lg`)
- **Body Base (Default text):** Inter Regular, 16px (`text-base`)
- **Body Small (Labels, table headers):** Inter Medium, 14px (`text-sm`)

### 4. Iconography & Imagery Style
- **Icons:** [Tabler Icons](https://tabler-icons.io/) (Included per architecture constraints). Icons must be bold (`stroke-width: 2`) and clear for touch interfaces. 
- **Usage Rule:** Every primary action and status MUST have an accompanying icon. E.g., Offline mode isn't just text, it's an amber `icon-cloud-off`.
- **Imagery:** Minimal photography. Primarily data-focused with clean illustrations or empty-state vectors to reduce distraction.

### 5. Spacing & Layout Grid
- **Base Unit:** 4px (Tailwind standard scale: 1 = 4px, 2 = 8px, 4 = 16px).
- **Minimum Tap Target:** **44px** (48px preferred for Kitchen tablet interactions).
- **Mobile Grid (Kitchen Staff):** 4-column fluid layout with 16px (`p-4`) outer margins. Vertical scrolling heavily prioritized.
- **Desktop Grid (Owner/Admin):** 12-column grid, max-width 1280px (`max-w-7xl`). Data-heavy views utilize the full width with side navigation.

## Theme Tokens

### 1. Tailwind Custom Properties (CSS Variables)
This block is designed to be injected directly into the application's global `styles.scss` under Tailwind v4's `@theme` directive, establishing the base tokens for the UI.

```css
@theme {
  /* Colors */
  --color-primary: #155e30;
  --color-on-primary: #ffffff;
  --color-secondary: #475569;
  --color-on-secondary: #ffffff;
  --color-accent: #d97706;
  --color-on-accent: #ffffff;
  --color-background: #f8fafc;
  --color-error: #e11d48;
  --color-on-error: #ffffff;

  /* Typography */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```

### 2. Token Summary & Usage

| Token Name | Value | Usage Example |
| :--- | :--- | :--- |
| `--color-primary` | `#155e30` | Main call-to-actions, active navigation markers (`bg-primary`, `text-primary`) |
| `--color-secondary` | `#475569` | Secondary buttons, minor typography, muted borders (`text-secondary`) |
| `--color-accent` | `#d97706` | Offline sync banners (`bg-accent`), pending statuses, warning badges |
| `--color-background` | `#f8fafc` | Application root body background (`bg-background`) |
| `--color-error` | `#e11d48` | Destructive actions, stockout alerts, form validation errors (`text-error`) |
| `--font-sans` | `"Inter", ...` | Default font family throughout the entire application layout (`font-sans`) |

## Wireframes
The UI structure and navigation flow for individual screens are documented in detailed wireframe artifacts. They translate these design tokens into actual component structures with `data-test-id` definitions mapped for QA.

### Phase 1: Foundation & Master Data (Sprints 1-3)
1. **AUTH module (First Run):** [Auth Setup Wizard](designs/Wireframe_Auth_Setup_Wizard.md)
2. **ADMN module (Platform Operator):** [Admin Platform Catalog](designs/Wireframe_Admin_Platform_Catalog.md)
3. **MSTR module (Owner config):** [Master Raw Materials](designs/Wireframe_Master_Raw_Materials.md)
4. **MSTR module (Builder):** [Master Recipes](designs/Wireframe_Master_Recipes.md)

### Phase 2 & 3: Execution & Review (Core Flows)
5. **KTCH module (Tablet/Offline):** [Kitchen Receiving](designs/Wireframe_Kitchen_Receiving.md)
6. **REPO module (Manager):** [Auto-PO Generation](designs/Wireframe_Auto_PO.md)
7. **RCNC module (Owner):** [Variance Audit & Reconciliation](designs/Wireframe_Variance_Audit.md)
8. **VNDR module (Supplier):** [Vendor Catalog Management](designs/Wireframe_Vendor_Catalog.md)

## UX Flows
In addition to structural static wireframes, every module has a UX flow document detailing screen routing, state progression, error paths, and happy paths utilizing Mermaid diagrams.

### Phase 1: Foundation & Master Data (Sprints 1-3)
1. **AUTH module:** [Auth Setup Wizard Flow](designs/Flow_Auth_Setup_Wizard.md)
2. **ADMN module:** [Platform Catalog Flow](designs/Flow_Platform_Catalog.md)
3. **MSTR module:** [Master Raw Materials Flow](designs/Flow_Master_Raw_Materials.md)
4. **MSTR module:** [Master Recipes Flow](designs/Flow_Master_Recipes.md)
