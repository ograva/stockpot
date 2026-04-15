# Design System: StockPot

## Version History
| Version | Date | Author | Summary of Changes |
|---------|------|--------|--------------------|
| v1.0 | April 15, 2026 | Eunice (UI/UX) | Initial base Design System created from moodboard and theme tokens. |

## 1. Tailwind Config Snippet (Tailwind v4)
In Tailwind Extra (v4), configuration is driven directly from the root `styles.scss` file rather than a Javascript config. Drop this `@theme` block into the top of the global stylesheet to populate the utility classes.

```css
@theme {
  /* Brand Colors */
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
  
  /* Tap Targets (Kitchen persona) */
  --spacing-touch: 44px;
  --spacing-touch-lg: 56px;
}
```

## 2. Angular Material Theme Config
StockPot uses Angular Material 21. We lean on Material for complex interactive behaviors and apply our custom Forest Green, Slate, and Rose palettes. Place this beneath the Tailwind theme block in `styles.scss`.

```scss
@use '@angular/material' as mat;

$stockpot-primary: mat.define-palette(mat.$green-palette, 800, 700, 900);
$stockpot-accent: mat.define-palette(mat.$amber-palette, 600, A200, A700);
$stockpot-warn: mat.define-palette(mat.$red-palette, 600);

$stockpot-theme: mat.define-light-theme((
  color: (
    primary: $stockpot-primary,
    accent: $stockpot-accent,
    warn: $stockpot-warn,
  ),
  typography: mat.define-typography-config(
    $font-family: 'Inter, sans-serif'
  )
));

// Include theme styles for core and each component used in your app.
@include mat.all-component-themes($stockpot-theme);

// Global background override
body {
  background-color: var(--color-background);
  font-family: var(--font-sans);
}
```

## 3. Component Variants

### Buttons (Angular Material + Tailwind Structuring)
- **Primary Call to Action (Save, Submit, Generate PO):**
  - Component: `<button mat-flat-button color="primary">`
  - Notes: Full width on mobile forms (`w-full`), minimum height of `min-h-[44px]`.
- **Secondary Action (Cancel, Back):**
  - Component: `<button mat-stroked-button>`
  - Notes: Used alongside primary actions to signify safe defaults.
- **Destructive Action (Delete, Void PO):**
  - Component: `<button mat-flat-button color="warn">`
- **Kitchen Increment/Decrement (Touch UI):**
  - Component: `<button mat-icon-button class="h-touch w-touch bg-secondary rounded-full">`
  - Notes: specifically styled for 44x44px touch areas wrapping Tabler math icons (`icon-minus`, `icon-plus`).

### Inputs & Forms (Angular Material)
- **Text Inputs & Selects:**
  - Component: `<mat-form-field appearance="outline" class="w-full">`
  - Usage: Outline appearance only. Do not use `fill` or `standard`.
- **Read-only Data Display:**
  - Standard Tailwind text blocks: `<div class="text-sm text-secondary font-medium uppercase tracking-wider">`

### Cards & Layouts
- **Data Card (Items, Suppliers):**
  - Component: `<mat-card class="mb-4">` padded internally via tailwind (`p-4`).
- **Kitchen Touch Surface (Receiving Items):**
  - Component: `<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 min-h-[56px] flex items-center justify-between">`
  - Usage: Replaces dense `<table>` listings for staff working on tablets. Focus on horizontal flow (Name -> Quantity Adjuster -> Checkbox).

### Indicators & Badges (Tailwind)
- **Status Badges (Draft, Running, Complete):**
  - Utility: `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">`
  - Variants:
    - Success/Complete: `bg-green-100 text-primary`
    - Pending/Running: `bg-amber-100 text-accent`
    - Error/Canceled: `bg-rose-100 text-error`
    - Draft/Offline: `bg-slate-100 text-secondary`

## 4. Do / Don't Rules (Strict UI Governance)

1. **DON'T** use `mat-raised-button` or `mat-flat-button` for secondary actions like "Cancel" or "Go Back".
   - **DO** use `mat-stroked-button` for these to maintain visual hierarchy.
2. **DON'T** rely on keyboard-focused numerical entry (`<input type="number">`) for quantity adjustments in Kitchen App screens.
   - **DO** utilize `+` and `-` touch buttons with 44px+ minimum tap targets (`button.h-touch.w-touch`) next to a read-only number display.
3. **DON'T** use generic HTML `<table>` elements for responsive Kitchen execution views (`KTCH`). They scale poorly on tablets.
   - **DO** use stacked `<mat-card>` or flex-box list rows (`flex flex-row items-center justify-between`) to ensure touch accessibility.
4. **DON'T** display blocking empty states or generic loading spinners without context.
   - **DO** use contextual empty states (e.g., an illustration of an empty box with "No purchase orders generated today") and skeleton loaders mirroring the expected element dimensions.
5. **DON'T** apply structural spacing overrides natively inside Material components (e.g., trying to pad a `mat-form-field` internally).
   - **DO** use Tailwind utility classes on wrapping generic `<div>` containers to space the Material components apart (`gap-4`, `mb-6`, `p-4`).