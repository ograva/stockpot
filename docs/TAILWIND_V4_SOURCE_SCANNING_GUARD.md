# Tailwind v4 Source Scanning Guard (Monorepo Safety)

## Why this exists

In this repo, `user-app` uses Tailwind v4 through:

- `@import "tailwindcss"` in `projects/user-app/src/styles.scss`
- `@tailwindcss/postcss` in `postcss.config.json`

Tailwind v4 source scanning can pick up class-like tokens from files outside app source (for example Markdown docs with CSS snippets). In our case, docs included sample text with `url(...)`, and build tooling generated CSS that later failed in Angular/esbuild with:

- `Could not resolve "..." [plugin angular-css-resource]`
- `background-image: url(...);`

## Symptom pattern

You may see all of these at the same time:

1. No `url(...)` in your app SCSS files.
2. Build error points to a high line number in `styles.scss` (preprocessed output), not your original file.
3. Error appears during CSS resource resolution step (`angular-css-resource`).

## Guardrail we applied

Add explicit Tailwind source exclusions near the Tailwind import in your app stylesheet.

Current implementation in `projects/user-app/src/styles.scss`:

```scss
/* Tailwind CSS v4 */
@import "tailwindcss";
@source not "../../../docs";
@source not "../../../e2e";
@source not "../../../scripts";
```

This keeps Tailwind focused on real app source and prevents docs/tests/scripts from injecting accidental utilities.

## Template repo recommendation

Use this as a default pattern in template repos, then adjust paths per workspace layout.

```scss
@import "tailwindcss";

/* Exclude non-runtime sources from Tailwind scanning */
@source not "../../../docs";
@source not "../../../e2e";
@source not "../../../scripts";
@source not "../../../test-results";
@source not "../../../emulator-data";
```

## Validation checklist

1. Run `ng build user-app` (or your app target).
2. Confirm no `Could not resolve "..."` CSS resource errors.
3. Keep only expected warnings (for example Sass `@import` deprecation warning).
4. If issue returns, search docs/test files for CSS-like snippets (for example `url(...)`, arbitrary value classes).

## Notes

- This is a build hygiene rule, not a feature rule.
- Keep exclusions tight and intentional; do not exclude app source folders.
- If you split apps, place guards in each app-level stylesheet.
