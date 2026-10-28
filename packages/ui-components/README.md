# @plainconceptsplatform/ui-components

Shared React components for Platform frontend apps. These are **custom** foundation components (not from shadcn) that are useful across multiple apps.

## What it contains

- `PlainLogo`: responsive brand logo that uses CSS container queries (no JavaScript) to show the biggest mark that fits its parent. Text follows `currentColor` (adapts to light/dark); the brand mark stays blue.
- `DataTable`: generic table with click-to-sort, drag-to-group, and column reorder/show-hide. It owns the logic and DOM structure and takes *slots* for every piece of UI that varies between apps (your Button, Table, icons, and translated strings), so it carries no shadcn, i18n, or icon dependency of its own.

## Quick start (consume in your Next.js app)

### 1. Install the package

```bash
pnpm add @plainconceptsplatform/ui-components
```

### 2. Import the theme (required)

These components use Tailwind classes and semantic tokens from the theme. Make sure your app imports the theme:

```css
@import "@plainconceptsplatform/ui-theme";
```

See [`@plainconceptsplatform/ui-theme`](../theme/README.md) for theme setup.

### 3. Use the logo

```tsx
import { PlainLogo } from "@plainconceptsplatform/ui-components";

export function Header() {
  return (
    <div className="h-12 w-48">
      <PlainLogo />
    </div>
  );
}
```

The logo fills its parent and swaps: icon under ~190px, wordmark up to ~460px, full lockup wider. Pass `className` to constrain size.

## Available components

| Component | Import | Description |
|---|---|---|
| `PlainLogo` | `@plainconceptsplatform/ui-components` or `@plainconceptsplatform/ui-components/plain-logo` | Responsive brand logo with CSS container queries |
| `DataTable` | `@plainconceptsplatform/ui-components/data-table` | Sortable, groupable table with column reorder/show-hide |
| `Tour` | `@plainconceptsplatform/ui-components/tour` | One-time guided tour that spotlights `data-tour` anchors, with themed popover, progress and `requestTour(id)` to retake it |

`DataTable` and `Tour` are client components with hooks, so they are available only from their sub-paths — importing them from the package root would break Next.js server components.

## Peer dependencies

- `react` and `react-dom` (v19)
- `tailwindcss` (v4) with `@plainconceptsplatform/ui-theme` tokens loaded
- `clsx` and `tailwind-merge` (bundled as direct dependencies)

## Integrating into an app without Tailwind preflight

From 1.5.0 the sidebar components carry their own resets, so an app that compiles only the theme and utilities layers (no preflight) gets the same rendering a full Tailwind app does. The entry that produces that CSS, verified against Tailwind 4.3.3:

```css
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
@import "@plainconceptsplatform/ui-theme/theme.css";

/* the app's own global CSS, in a layer */
@import "./globals.css" layer(base);

@source "./node_modules/@plainconceptsplatform/ui-components/dist";
```

Four rules make this path work:

- The app's global CSS must sit in a layer, as above. An unlayered rule such as `a { color: ... }` beats `@layer utilities` in the cascade no matter what specificity our utilities use, and that cannot be fixed from inside the package. Keep every global rule in `layer(base)` (or another layer) and nothing leaks over the components.
- `@source` must point at this package's `dist`, or any class used only inside it is never generated: the element carries the class and nothing applies, which fails silently and selectively. One `@source` line covering the dist is enough.
- The html root is expected to be 16px. The spacing utilities are rem-based, so on a 14px root every rem-based utility in the sidebar renders about 12% small. Set the root explicitly if your app uses a smaller base.
- The full package root import `@import "@plainconceptsplatform/ui-theme";` includes preflight through its own `@import "tailwindcss"`. Use the layered imports above when preflight is not wanted. The docs site serves a live sidebar against this no-preflight entry at `/sidebar-without-tailwind`, if you want to compare against your own integration.

## Publishing

Published publicly to npm under the `@plainconceptsplatform` scope. No custom registry configuration is required.
