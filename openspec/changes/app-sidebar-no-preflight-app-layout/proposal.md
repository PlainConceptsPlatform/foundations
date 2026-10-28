# Proposal: app-sidebar without preflight, composable AppLayout, built-in initials

## Why

Capacity (branch `feature/us-198873-platform-foundations-sidebar`) integrated the shared app-sidebar. Capacity is not a Tailwind app the way the docs app is. It compiles the theme and utilities layers at build time, without preflight, and its hand-written global CSS sits in `layer(base)`. That integration surfaced real gaps in `packages/ui-components`, and Numa and Capacity each hand-roll the same app shell grid with the same bugs solved twice. This change fixes both at the source, adds the initials avatar both apps need, and repairs the published peer range that forced Capacity to add a bun `overrides` entry just to install the package.

## What Changes

### 1. The sidebar becomes self-sufficient without preflight

- `AppSidebarThemeToggle` renders a bare `<fieldset>`, which without preflight shows the browser default 2px groove border and margins. The reset moves onto the element itself: `border-none m-0 min-w-0`.
- `AppSidebarNavItem`'s fallback `<a>` and `AppSidebarBrand`'s `<a>` carry `hover:no-underline` only, so at rest they rely on consumer styles for text decoration. Each anchor gets `no-underline` on its base class list, and the nav item also gets the same `focus-visible` outline utilities its button siblings carry. Every interactive state (color, background, border, focus) is an explicit utility on the element.
- The sidebar inherits the consumer's font family and root size. In Capacity that is Inter at a 14px html root, so every rem-based utility in the sidebar renders about 12 percent smaller than the docs preview. `font-sans` goes on the `AppSidebar` root so the sidebar uses the Platform font stack.
- One thing we cannot fix from inside the package: an unlayered global `a { color }` rule in the consumer beats `@layer utilities` in the cascade no matter what specificity the utilities use. The README states this as a contract: consumer globals must sit in a layer.

### 2. Documentation and a durable regression net

- The README gets an "Integrating into an app without Tailwind preflight" section with the recipe verified against this repo's Tailwind 4.3.3: theme and utilities layers only, `@plainconceptsplatform/ui-theme/theme.css` for tokens, consumer globals in `layer(base)`, and `@source` pointed at the ui-components dist. It also states that the html root must be 16px because the spacing utilities are rem-based, and that the package root import `@import "@plainconceptsplatform/ui-theme"` includes preflight.
- The docs app builds with the full Tailwind entry, so the no-preflight path is never exercised today. It gets a second stylesheet entry and a page that renders the sidebar against it. To keep that page free of the app's global stylesheet, the docs app root layout splits: `app/layout.tsx` keeps only `html`, `body` and fonts, and a new `app/(site)/layout.tsx` imports `global.css` plus the Fumadocs providers. `(home)`, `docs`, `error.tsx` and `not-found.tsx` move under `(site)`. The page at `/sidebar-without-tailwind` then renders through the root layout with only the no-preflight entry. Its consumer globals deliberately set `body` to Georgia serif, so the sidebar must still render Outfit for the `font-sans` fix to hold.

### 3. Composable AppLayout

A new `packages/ui-components/src/app-layout/app-layout.tsx` with `AppLayout`, `AppLayoutSidebar` and `AppLayoutContent`, exported through the sub-path `@plainconceptsplatform/ui-components/app-layout`, mirroring how `./app-sidebar` is exported. No root barrel re-export: `src/index.ts` deliberately keeps hook-carrying client components out of the barrel because re-exporting them breaks Next.js server components, and `AppLayout` embeds `AppSidebarProvider`.

The grid is `grid-cols-[auto_minmax(0,1fr)]` with `min-h-dvh`. The sidebar sizes its own column, so collapse changes nothing in CSS and no width token is mirrored in two places. `min-w-0` on the content cell stops wide tables from blowing out the `1fr` track; this bug shipped in Capacity until the grid was fixed. The provider embeds inside `AppLayout`, so collapse persistence and Ctrl+B work without consumer wiring. Desktop only in this version; `AppLayoutSidebar` exists as a cell component so mobile fixed positioning can be added there later. No header component: the header stays the consumer's responsibility for now.

A demo page with generated catalog entry goes next to the sidebar's, per the standard "adding a component to the catalog" flow in CONTRIBUTING.md.

### 4. Built-in initials in the user card

`getInitials(text)` is extracted as a pure, exported util in the app-sidebar folder, with the exact behaviour Capacity shipped locally, and exported from `./app-sidebar` so it can be unit tested later. `AppSidebarUserCard` renders an initials avatar derived from `name` when no `avatar` is passed, styled `flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium uppercase text-muted-foreground` with `aria-hidden`. The existing `title={name}` on the card covers the collapsed state, where only the initials remain visible. The `avatar` prop stays as an optional override, so this is additive and releases as 1.5.0. There is no test runner in this repo and the decision was to add none; the util stays pure and exported for the day one exists.

## Release plan

Per the established practice in release commit `e436d0e` (and against what CONTRIBUTING.md claims about changesets, which no `.changeset` directory backs up), the version bump goes directly into `package.json` (1.3.2 to 1.5.0, since npm already serves 1.4.0 and this branch already matches those sources) and the `CHANGELOG.md` entry is hand-written in the existing committed format. npm already serves 1.4.0 off sources that match this branch, so nothing here regresses that. Publishing itself stays outside this PR.

## Impact

- Consumers that rely on the sidebar inheriting their font will see the sidebar in the Platform font stack. That is the intended fix.
- Consumers that passed `avatar` keep working; those that did not now get initials.
- Capacity can drop its local `Initials` component on upgrade; the bun `overrides` entry stays (see out of scope).
- The docs app route restructure moves files but changes no URLs. One known regression was accepted after review: unknown URLs outside `/docs` get Next's default 404 on the static site, because Next.js static export drops the theme stylesheet from the exported 404.html and repairing it needs a postbuild patch. Every `/docs/*` slug and anything inside `(site)` keeps the themed 404 and error boundary.

## Out of scope

- Mobile behaviour for `AppLayout`.
- A shared header component.
- Removing preflight from the theme package root entry, or touching the release/publish pipeline.
- A test runner for the repo.
- Replacing `workspace:*` with a real semver range in `peerDependencies` (out of scope for this PR; tracked separately).
