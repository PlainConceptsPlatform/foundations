# Proposal: sidebar stacking context, active user menu item

## Why

Capacity integrated the shared sidebar (their `#198873`) and QA found two defects in apps that place positioned content in the page.

The user card dropdown rendered behind page content. `AppSidebar`'s root `<aside>` is `sticky` with no `z-index`, and a sticky element creates a stacking context: the dropdown's `z-index: 200` only counts inside the sidebar subtree. In a consumer whose page content carries `position: relative` (Capacity's cards), any overlapping element paints over the open dropdown. The overlap only exists with the sidebar collapsed, because the collapsed dropdown is `position: fixed` at `left: calc(64px + 6px)`, reaching into the content column; the expanded dropdown stays inside the sidebar column.

The user menu could not mark its current-route entry as selected. `AppSidebarNavItem` has `isActive`; `AppSidebarUserMenuItem` has nothing, so apps that navigate from the user card (My profile, Settings) cannot show which route is open the way nav items do, and the only workaround copies the active tokens into each consumer's `className` override.

## What Changes

### 1. Sidebar root joins the stacking order

`AppSidebar` root class list gains `z-40`, so the whole sidebar subtree paints above page content at `z-index: auto` or below 40, and below the ranges consumers use for portals and overlays (shadcn popover and dialog sit at 50 and above in their own layer; Capacity's portals sit at 1000+). This mirrors the shadcn sidebar's own `sticky top-0 z-40`.

### 2. Active user menu item

`AppSidebarUserMenuItem` gains an optional `isActive` (default `false`) applying the same tokens an active `AppSidebarNavItem` uses: `bg-sidebar-accent text-sidebar-primary font-medium`. The active style stays owned by the package, not copied into consumer `className` overrides.

### 3. aria-current on active entries

Both `AppSidebarUserMenuItem` and `AppSidebarNavItem` set `aria-current="page"` when active. Screen readers announce the selected destination; the nav item gains it without a behaviour change, since its active state already exists.

### 4. Docs

The demo in `apps/docs/components/previews/app-sidebar-demo.tsx` renders a Profile user menu item with `isActive`, the handwritten `app-sidebar.mdx` documents the prop. Version bumped to 1.6.0 with a hand-written CHANGELOG entry, following the 1.5.0 release pattern.

## Impact

- Packages: `@plainconceptsplatform/ui-components` (minor: new optional prop plus a stacking fix).
- Apps: Capacity wires `isActive` on its My profile entry when it bumps to 1.6.0. No breaking change; `className` consumers additive.
