# @plainconceptsplatform/ui-components

## 1.5.0

### Minor Changes

- The sidebar renders correctly in apps that do not ship Tailwind preflight. The theme toggle's `<fieldset>` carries its own reset (`border-none m-0 min-w-0`) instead of showing the browser default groove border, the nav item and brand anchors no longer rely on consumer styles for text decoration or a focus outline, and the sidebar root applies `font-sans`, so it uses the Platform font stack rather than the consuming app's family. The README documents the no-preflight recipe, including the contract that unlayered global rules such as `a { color }` beat `@layer utilities` in the cascade no matter what specificity the package's utilities use, and the expectation of a 16px html root because the spacing utilities are rem-based.

- New composable app shell, from the `@plainconceptsplatform/ui-components/app-layout` sub-path: `AppLayout`, `AppLayoutSidebar` and `AppLayoutContent`. The provider is embedded in `AppLayout`, so collapse persistence and Ctrl+B work with no consumer wiring. The grid is `auto minmax(0,1fr)` with `min-w-0` on the content cell, so the sidebar sizes its own column (no width token mirrored in two places) and wide tables cannot blow out the content track. Desktop only in this version; a shared header stays the app's responsibility for now. It is exported through its sub-path only, not the root barrel, like every other client component with hooks.

- `AppSidebarUserCard` now renders an initials avatar derived from `name` when no `avatar` is passed, so apps without a photo URL from the identity provider get a populated circle instead of a gap. The `avatar` prop still overrides it, and the derivation is exported as the pure util `getInitials` from `@plainconceptsplatform/ui-components/app-sidebar`. Migration notes: if you relied on the sidebar inheriting your app font, pin your own styles now that it applies `font-sans`; if you were passing no `avatar`, you get initials with nothing to do.

- The peer dependency on `@plainconceptsplatform/ui-theme` is a real semver range (`^1.4.0`) again instead of `workspace:*`, which npm cannot resolve outside a pnpm workspace. Installing the published package no longer needs a consumer `overrides` entry.

## 1.4.0

### Minor Changes

- New `Tour` component, exported from the `@plainconceptsplatform/ui-components/tour` sub-path (not the root barrel, like every other client component with hooks). A declarative product tour on top of driver.js, which becomes a dependency (pinned 1.9.0). Steps attach to the page by spreading `tourAnchor("main-nav")` onto any element; a step whose anchor is not on the page is skipped instead of erroring, so one tour serves several screens. Whether a tour was already seen is remembered by its `id` in `localStorage` and storage failures are ignored, in which case the tour starts at most once per page load; version the id (`welcome-v2`) when a tour should show again, and export `hasSeenTour` / `markTourSeen` / `forgetTour` to build a "replay the tour" control. Automatic start is gated by `enabled` and can wait for a late-rendered anchor (`waitFor` plus `waitTimeoutMs`, default 4 s). `onEnd` receives why it ended (`finished` or `dismissed`) and focus returns to `returnFocusTo` (default `#main-content`). All button and progress strings come from a `texts` prop, and the popover styles are injected at runtime, so the consumer imports no stylesheet.

## 1.3.1

### Patch Changes

- `DataTable` columns can be resized by dragging the handle on the right edge of each header. A user-set width wins over the column's static `width`; string widths are parsed and anything unresolved falls back to 160 px, with a floor of 60 px. Widths persist per table (`dt:<tableId>:widths` in `localStorage`) across reloads, drag-to-reorder is suspended while a column is being resized, and the focused column's width can be nudged with the arrow keys. The handle's accessible name and tooltip default to "Drag to resize column" and can be overridden with the new optional `texts.resizeColumn`.

## 1.3.0

### Minor Changes

- `AppSidebar` now matches the Atlas shell it was modelled on: header actions beside the brand, an avatar element in the user card, a dropdown carrying the theme toggle and sign-out, and corrected collapsed-state styling.

- `AppSidebarNavItem` takes a new optional **`iconClassName`**. The icon wrapper forced `text-muted-foreground` when inactive and the accent colour when active, which is right for an icon that only identifies a destination and wrong for one whose colour carries meaning — the violet that marks every AI feature, for instance. Passing `iconClassName` keeps that colour in both states. Default behaviour is unchanged.

Two notes for anyone consuming this package, because both failed silently rather than erroring:

- The nav item prop is **`isActive`**, not `active`. With the wrong name no item is ever highlighted and nothing reports a problem.
- **`AppSidebarProvider` renders no element of its own**, so it accepts no `className`. Wrap it in your own layout element.

Also worth knowing if the components look almost-but-not-quite right in your app: Tailwind must be told to scan this package, or any class used only inside it is never generated. The element carries the class and nothing applies.

```css
@source "../node_modules/@plainconceptsplatform/ui-components/dist/**/*.js";
```

## 1.0.0

### Minor Changes

- 8cd0d65: Fix a hydration mismatch in `DataTable`, add the missing sidebar and chart token groups, and make "no shadows" true by construction.

  **ui-components**

  - `usePersistedState` no longer reads `localStorage` inside the `useState` initializer. The server had no storage and fell back to the default while the client's first render returned the stored value, so React hydrated a tree that did not match the server HTML. It now starts from the default and applies storage in an effect, gated so the write-back cannot overwrite the value before it is read.
  - The grouped-column drag handle is a `span` rather than a `button`. It wrapped the remove `Button`, and a button inside a button is invalid HTML that leaves the inner control unreachable for assistive tech.
  - Sortable headers now expose `aria-sort`. Fixed columns deliberately omit it rather than reporting `none`, which would advertise them as sortable.

  **ui-theme**

  - Adds the eight `--sidebar-*` tokens. The shadcn Sidebar consumes them and none existed, so the component rendered unstyled.
  - Adds a categorical `--chart-1` through `--chart-5` ramp. Every entry clears 3:1 against `--background` in both modes, and the two blue-family hues sit at opposite ends so adjacent series stay distinguishable.
  - Overrides the whole Tailwind shadow scale to a transparent value, so `shadow-*` classes on vendored shadcn components compile and paint nothing. Upstream component source can now be copied in unmodified. Focus rings are unaffected.
  - Honours `prefers-reduced-motion` globally in `base.css`.

  Visual change for consuming apps: shadows disappear on anything that relied on a `shadow-*` utility, and the sidebar picks up real surface colours. Both are the intended Platform look.

### Patch Changes

- Updated dependencies [8cd0d65]
  - @plainconceptsplatform/ui-theme@0.2.0
