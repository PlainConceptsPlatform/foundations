# Tasks

## 1. Package changes

- [x] 1.1 Add `z-40` to the `AppSidebar` root class list in `packages/ui-components/src/app-sidebar/app-sidebar.tsx` <!-- agent: fullstack-engineer.build, depends_on: [], touches: [packages/ui-components/src/app-sidebar/app-sidebar.tsx] -->
- [x] 1.2 Add `isActive` to `AppSidebarUserMenuItemProps` (default `false`), applying `bg-sidebar-accent text-sidebar-primary font-medium` when active, plus `aria-current="page"`; destructure it in the component and document the prop with a doc comment mirroring `iconClassName`'s <!-- agent: fullstack-engineer.build, depends_on: [], touches: [packages/ui-components/src/app-sidebar/app-sidebar-user-card.tsx] -->
- [x] 1.3 Add `aria-current={isActive ? "page" : undefined}` to both render paths of `AppSidebarNavItem` (bare anchor and `as` component) and widen the `as` prop type with `"aria-current"?: "page"` <!-- agent: fullstack-engineer.build, depends_on: [], touches: [packages/ui-components/src/app-sidebar/app-sidebar-nav.tsx] -->
- [x] 1.4 Bump `packages/ui-components/package.json` to 1.6.0 and hand-write the CHANGELOG entry in the committed format <!-- agent: fullstack-engineer.build, depends_on: [1.1, 1.2, 1.3], touches: [packages/ui-components/package.json, packages/ui-components/CHANGELOG.md] -->

## 2. Documentation

- [x] 2.1 Show an active user menu item in `apps/docs/components/previews/app-sidebar-demo.tsx` (Profile entry with `isActive`) <!-- agent: fullstack-engineer.build, depends_on: [1.2], touches: [apps/docs/components/previews/app-sidebar-demo.tsx] -->
- [x] 2.2 Document `isActive` on the user menu item and the new `aria-current` behaviour in the handwritten `apps/docs/content/docs/components/app-sidebar.mdx` <!-- agent: fullstack-engineer.build, depends_on: [1.2, 1.3], touches: [apps/docs/content/docs/components/app-sidebar.mdx] -->
- [x] 2.3 Write the OpenSpec change artifacts under `openspec/changes/app-sidebar-user-menu-stacking-active/` <!-- agent: fullstack-engineer.build, depends_on: [], touches: [openspec/changes/app-sidebar-user-menu-stacking-active/**] -->

## 3. Verification

- [x] 3.1 Run `pnpm verify` (lint, typecheck, build) and the docs generator up-to-date check (`pnpm --filter @plainconceptsplatform/docs gen` plus `git diff --exit-code`), and confirm the diff passes `node .opencode/scripts/check-diff.mjs` <!-- agent: fullstack-engineer.build, depends_on: [1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3], touches: [] -->
