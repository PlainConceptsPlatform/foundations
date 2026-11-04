# Tasks

## 1. OpenSpec

- [x] 1.1 Write the OpenSpec change artifacts under `openspec/changes/segmented-control/` (proposal.md, specs, tasks.md), rename the local branch to `feat/segmented-control`, and remove the empty `packages/ui-components/src/theme-mode-toggle/` placeholder folder <!-- agent: fullstack-engineer.build, depends_on: [], touches: [openspec/changes/segmented-control/**] -->

## 2. Package

- [x] 2.1 Create the `segmented-control` slice: generic controlled `SegmentedControl` in `packages/ui-components/src/segmented-control/segmented-control.tsx` (`options` of `{ value, label, icon? }`, `value`, `onChange`, `className`; one button per option; icon when passed else label text; `aria-label` and `title` from label; `aria-pressed` per option; fieldset reset `border-none m-0 min-w-0`; idle `text-muted-foreground`, hover `hover:bg-muted hover:text-foreground`, selected `bg-accent text-accent-foreground`; only color-family transitions) plus the barrel `index.ts` exporting the component and the `SegmentedControlOption` type <!-- agent: fullstack-engineer.build, depends_on: [], touches: [packages/ui-components/src/segmented-control/**] -->
- [x] 2.2 Refactor `AppSidebarThemeToggle` in `packages/ui-components/src/app-sidebar/app-sidebar-user-card.tsx` into an adapter that builds the three theme options from `icons` and `labels` (default Light/Dark/System) and renders `SegmentedControl`; keep the exported name, props and `app-sidebar` sub-path unchanged <!-- agent: fullstack-engineer.build, depends_on: [2.1], touches: [packages/ui-components/src/app-sidebar/app-sidebar-user-card.tsx] -->
- [x] 2.3 Add the `./segmented-control` entry to `exports` in `packages/ui-components/package.json`, bump the version to 1.8.0, hand-write the CHANGELOG entry in the committed format, and add the component to the README "Available components" table <!-- agent: fullstack-engineer.fast, depends_on: [2.1, 2.2], touches: [packages/ui-components/package.json, packages/ui-components/CHANGELOG.md, packages/ui-components/README.md] -->

## 3. Documentation

- [x] 3.1 Create `apps/docs/components/previews/segmented-control-demo.tsx` showing both shapes: text options as in Capacity's date filter (Before / On date / After) and icon options as in the theme modes (Sun / Moon / Monitor) <!-- agent: fullstack-engineer.build, depends_on: [2.1], touches: [apps/docs/components/previews/segmented-control-demo.tsx] -->
- [x] 3.2 Write the handwritten page `apps/docs/content/docs/components/segmented-control.mdx` (When to use, Platform notes, Install, Code), following `app-layout.mdx` <!-- agent: fullstack-engineer.build, depends_on: [3.1], touches: [apps/docs/content/docs/components/segmented-control.mdx] -->
- [x] 3.3 Note in `apps/docs/content/docs/components/app-sidebar.mdx` that `AppSidebarThemeToggle` renders the shared `SegmentedControl` from the `segmented-control` sub-path <!-- agent: fullstack-engineer.fast, depends_on: [2.2], touches: [apps/docs/content/docs/components/app-sidebar.mdx] -->

## 4. Verification

- [ ] 4.1 Run `pnpm verify` (lint, typecheck, build), the docs generator up-to-date check (`pnpm --filter @plainconceptsplatform/docs gen` plus `git diff --exit-code`), and confirm the diff passes `node .opencode/scripts/check-diff.mjs` <!-- agent: fullstack-engineer.fast, depends_on: [1.1, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3], touches: [] -->
