# Proposal: shared SegmentedControl, sidebar theme toggle on top of it

## Why

The sidebar theme selector is a segmented control the rest of an app cannot reuse. `AppSidebarThemeToggle` lives in the `app-sidebar` slice, is exported only from the `@plainconceptsplatform/ui-components/app-sidebar` sub-path, and its option buttons hard-code the three theme modes with `sidebar-*` tokens (`hover:bg-sidebar-hover`, `bg-sidebar-accent text-sidebar-primary`). Capacity needs the same shape for controls that are not the theme at all. Its date filter (Before / On date / After, rendered as text) has to rebuild the styles locally today. The same need now exists in two consumers, which is the bar a component must clear before it joins this package.

## What Changes

### 1. A generic `SegmentedControl`

A new slice `packages/ui-components/src/segmented-control/`, exported from the `@plainconceptsplatform/ui-components/segmented-control` sub-path only, like every other client component. Generic over the option values, so a consumer gets its own union back from `onChange`:

```tsx
type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

<SegmentedControl
  options={[
    { value: "before", label: "Before" },
    { value: "on-date", label: "On date" },
    { value: "after", label: "After" },
  ]}
  value={value}
  onChange={setValue}
/>
```

No variant, no sizing props. One style set on the general tokens: idle `text-muted-foreground`, hover `hover:bg-muted hover:text-foreground`, selected `bg-accent text-accent-foreground`. An option renders its `icon` when one is passed, else the `label` text; `label` is the accessible name in both cases (`aria-label` on the button covers the icon-only case). The selected option carries `aria-pressed`, the buttons are `type="button"`, and the wrapping `fieldset` keeps the no-preflight reset the sidebar toggle already carries (`border-none m-0 min-w-0`).

### 2. `AppSidebarThemeToggle` becomes an adapter

Same name, same props (`value`, `onChange`, `icons`, `labels`), same sub-path, so nothing breaks and no sidebar consumer changes. Inside, it builds the three theme options and renders `SegmentedControl`. Two visual shifts follow from the shared classes, both toward general tokens: hover is `bg-muted` rather than `bg-sidebar-hover` (one step lighter), and the selected segment is `text-accent-foreground` with no border tint. The surface itself does not move, because `--accent` and `--sidebar-accent` carry the same values. The `ui-shell` no-preflight scenario stays true, since the fieldset reset now lives in the shared control.

### 3. Release 1.8.0

The `./segmented-control` entry joins `exports` in `packages/ui-components/package.json`, the version bumps to 1.8.0 with a hand-written CHANGELOG entry in the committed format, and the README "Available components" table gains the row.

### 4. Docs

A preview demo (`apps/docs/components/previews/segmented-control-demo.tsx`) shows both shapes the component serves: text options, as in Capacity's date filter (Before / On date / After), and icon options, as in the theme modes (Sun / Moon / Monitor). A handwritten `segmented-control.mdx` page documents the API, and `app-sidebar.mdx` notes that the theme toggle renders the shared control.

## Impact

- Packages: `@plainconceptsplatform/ui-components` (minor 1.8.0: new sub-path export, no breaking change).
- Apps: Capacity replaces its locally rebuilt segmented controls with the shared component at 1.8.0. Sidebar consumers change nothing; the theme toggle keeps its props and import path.
- Specs: new `segmented-control` capability. `ui-shell` needs no edit; its theme-toggle scenarios (no-preflight fieldset) remain true through the adapter.
