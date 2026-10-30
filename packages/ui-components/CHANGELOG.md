# @plainconceptsplatform/ui-components

## 1.7.0

### Minor Changes

- New section feature flag pieces, from the `@plainconceptsplatform/ui-components/feature-flags` sub-path (not the root barrel, like every other client component with hooks). A flag in a Platform app is a menu section that is not finished yet; the API decides what is on for the signed-in person (`GET /me/features`) and these pieces only show it. There is no data fetching, no i18n library and no router dependency: the app owns its API client, its DI and its strings. See "Section feature flags" in `ai/ARCHITECTURE.md` for the convention.

  `FeatureProvider` takes `features` (the keys that are on, `undefined` while loading) and `children`, and is context only. `useFeature(key)` returns a boolean and `useFeatures()` returns `{ features, isLoading, has(key) }`. All of it fails closed: while the list is loading, for an unknown key, or with no provider, a feature is off, never on. `FeatureGate` (`feature`, `fallback?`, `children`) renders its children only when the feature is on, for menu items and buttons. `FeatureGuard` (`feature`, `notFound`, `loading?`, `children`) wraps a route and renders the not-found page you pass when the feature is off, never a "no access" message, because a section that is off must look like it does not exist.

  `FeatureFlagsAdmin` is the administration table. It takes `flags` (key, name, description, `state` of `off`, `on` or `selected`, `roles`, `people`, row `version`, and optionally `updatedAt`, `updatedBy`, `removeBy`, `forcedOff` and `hasMcpTools`), the available `roles`, and `onSave(key, { state, roles, people, version })`, which returns a promise. A state selector, role chips shown for `selected`, and a plain editable list of people (or your own picker through `renderPeoplePicker`); a confirmation step that names the roles and people losing access; a "forced off by configuration" badge that locks the row; an overdue indicator once `removeBy` has passed; a warning on a section with MCP tools; row-level saving, saved and error states (throw `FeatureFlagConflictError` from `onSave` for a 409); and loading, empty and load-error states through `isLoading`, `loadError` and `onRetry`. Every string comes from the required `texts` prop. It uses native elements and the theme tokens, so it adds no dependency.

  Migration notes: none. Nothing existing changed, and the new sub-path is only loaded when imported. Tailwind must scan the package as for any other component (`@source` pointing at the package `dist`), or the table renders unstyled.

## 1.6.0

### Minor Changes

- The sidebar root is `sticky`, which creates a stacking context, and it had no `z-index`. The user card's dropdown is `position: fixed` with `z-index: 200` when the sidebar is collapsed, but that value only counted inside the sidebar's own stacking context, so a positioned element later in the DOM (a `position: relative` card in the page) painted over the open dropdown wherever the two overlapped. Consumers could only see it with the sidebar collapsed, because the expanded dropdown stays inside the sidebar column and overlaps nothing. The root now carries `z-40`, which lifts the whole sidebar subtree above page content while staying below the layers consumers use for portals and overlays (shadcn's popover/dialog ranges and above).

- `AppSidebarUserMenuItem` takes **`isActive`**, mirroring `AppSidebarNavItem`. Pass it on the entry that points at the open route (My profile, Settings) and it reads as selected while that route is active, with the same tokens an active nav item uses (`bg-sidebar-accent text-sidebar-primary font-medium`). Both components now also set `aria-current="page"` when active, so screen readers announce the selected destination. Wrong-name note as with the nav item: the prop is `isActive`, not `active`; with the wrong name nothing is highlighted and nothing reports a problem.

## 1.5.0

### Minor Changes

- The sidebar renders correctly in apps that do not ship Tailwind preflight. The theme toggle's `<fieldset>` carries its own reset (`border-none m-0 min-w-0`) instead of showing the browser default groove border, the nav item and brand anchors no longer rely on consumer styles for text decoration or a focus outline, and the sidebar root applies `font-sans`, so it uses the Platform font stack rather than the consuming app's family. The README documents the no-preflight recipe, including the contract that unlayered global rules such as `a { color }` beat `@layer utilities` in the cascade no matter what specificity the package's utilities use, and the expectation of a 16px html root because the spacing utilities are rem-based.

- New composable app shell, from the `@plainconceptsplatform/ui-components/app-layout` sub-path: `AppLayout`, `AppLayoutSidebar` and `AppLayoutContent`. The provider is embedded in `AppLayout`, so collapse persistence and Ctrl+B work with no consumer wiring. The grid is `auto minmax(0,1fr)` with `min-w-0` on the content cell, so the sidebar sizes its own column (no width token mirrored in two places) and wide tables cannot blow out the content track. Desktop only in this version; a shared header stays the app's responsibility for now. It is exported through its sub-path only, not the root barrel, like every other client component with hooks.

- `AppSidebarUserCard` now renders an initials avatar derived from `name` when no `avatar` is passed, so apps without a photo URL from the identity provider get a populated circle instead of a gap. The `avatar` prop still overrides it, and the derivation is exported as the pure util `getInitials` from `@plainconceptsplatform/ui-components/app-sidebar`. Migration notes: if you relied on the sidebar inheriting your app font, pin your own styles now that it applies `font-sans`; if you were passing no `avatar`, you get initials with nothing to do.

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
