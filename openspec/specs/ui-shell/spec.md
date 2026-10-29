# ui-shell Specification

## Purpose
The shared app shell from `@plainconceptsplatform/ui-components`: `AppSidebar` and its subcomponents, the `AppLayout` grid, and the contracts a consuming app must keep (layered global CSS, 16px html root, Tailwind `@source` on the package dist) for the sidebar to render correctly.
## Requirements
### Requirement: Sidebar components are self-sufficient without preflight

Every `app-sidebar` component MUST render correctly in a consumer that compiles only the Tailwind theme and utilities layers, with its global CSS in `layer(base)` and no preflight. Browser default styling for `fieldset`, anchor text decoration, anchor color, and inherited font family must not leak into the rendered sidebar.

#### Scenario: theme toggle fieldset without preflight

- **WHEN** `AppSidebarThemeToggle` renders in a page with no preflight
- **THEN** the `fieldset` shows no groove border and no default margin, because the element carries its own reset utilities

#### Scenario: anchor at rest without preflight

- **WHEN** `AppSidebarNavItem` (with no `as` prop) or `AppSidebarBrand` (with `href`) renders in a page with no preflight and no consumer anchor reset
- **THEN** the anchor shows no underline at rest and every interactive state (color, background, border, focus outline) is an explicit utility on the element

#### Scenario: consumer font family does not leak

- **WHEN** the consumer's `body` sets a font family different from the Platform stack
- **THEN** the sidebar still renders with the Platform font stack, because `AppSidebar` applies `font-sans` at its root

#### Scenario: consumer global anchors are a documented contract

- **WHEN** a consumer writes an unlayered global rule such as `a { color: ... }`
- **THEN** that rule beats `@layer utilities` in the cascade and the package cannot override it from inside the utilities layer, so the README documents that consumer globals must sit in a layer

### Requirement: Composable AppLayout

The package MUST provide `AppLayout`, `AppLayoutSidebar` and `AppLayoutContent` from the sub-path `@plainconceptsplatform/ui-components/app-layout`. `AppLayout` embeds the `AppSidebarProvider`, so collapse persistence and Ctrl+B work without consumer wiring. The layout grid must be `grid-cols-[auto_minmax(0,1fr)]` with `min-h-dvh`, the sidebar sizing its own column, and the content cell must carry `min-w-0` so wide content cannot blow out the `1fr` track. The components must not be re-exported from the package root barrel.

#### Scenario: collapse changes no CSS

- **WHEN** the embedded sidebar collapses or expands
- **THEN** the grid layout relies on the `auto` column following the sidebar's own width, with no width token mirrored in the layout

### Requirement: User card renders initials by default

`AppSidebarUserCard` MUST derive an initials avatar from `name` and render it internally unless an `avatar` prop is passed. The derivation must live in a pure, exported util `getInitials` from `@plainconceptsplatform/ui-components/app-sidebar`. The initials avatar must be decorative (`aria-hidden`), and the card's `title={name}` must continue to cover the collapsed state.

#### Scenario: initials derived from the name

- **WHEN** no `avatar` is passed and `name` is "Jane Doe"
- **THEN** the card renders "JD" in the initials avatar

#### Scenario: avatar prop still wins

- **WHEN** an `avatar` prop is passed
- **THEN** the card renders that avatar instead of the internally derived initials

### Requirement: Sidebar paints above page content

The `AppSidebar` root MUST paint above page content, because a `sticky` root creates a stacking context and the user card dropdown's own `z-index` only counts inside it. The root must set `z-40`, which sits above unpositioned and low-order page content and below the layers consumers use for portals and overlays.

#### Scenario: collapsed dropdown over positioned content

- **WHEN** the sidebar is collapsed, the user card dropdown is open, and the page contains a `position: relative` element that the dropdown overlaps
- **THEN** the dropdown paints over that element, because the sidebar root subtree sits above page content

#### Scenario: overlays keep painting above the sidebar

- **WHEN** a consumer renders a portal or overlay at a z-index above 40
- **THEN** that overlay still paints above the sidebar subtree

### Requirement: User menu item marks the current route

`AppSidebarUserMenuItem` MUST accept an optional `isActive` prop (default `false`) that applies the same active tokens as `AppSidebarNavItem`: `bg-sidebar-accent text-sidebar-primary font-medium`. An active entry in either component must set `aria-current="page"`.

#### Scenario: active user menu entry

- **WHEN** `AppSidebarUserMenuItem` renders with `isActive` true
- **THEN** the entry shows the active background and foreground and sets `aria-current="page"`

#### Scenario: inactive default

- **WHEN** `AppSidebarUserMenuItem` renders without `isActive`
- **THEN** the entry keeps its default muted styling and sets no `aria-current`

#### Scenario: nav item parity

- **WHEN** `AppSidebarNavItem` renders with `isActive` true, through the bare anchor or the `as` component
- **THEN** the item sets `aria-current="page"` in addition to its existing active styling

