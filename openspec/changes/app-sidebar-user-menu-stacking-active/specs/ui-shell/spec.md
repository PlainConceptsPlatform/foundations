# ui-shell: sidebar stacking and active user menu item

## ADDED Requirements

### Requirement: Sidebar paints above page content

The `AppSidebar` root must carry a stacking order above page content, because a `sticky` root creates a stacking context and the user card dropdown's own `z-index` only counts inside it. The root must set `z-40`, which sits above unpositioned and low-order page content and below the layers consumers use for portals and overlays.

#### Scenario: collapsed dropdown over positioned content

- **WHEN** the sidebar is collapsed, the user card dropdown is open, and the page contains a `position: relative` element that the dropdown overlaps
- **THEN** the dropdown paints over that element, because the sidebar root subtree sits above page content

#### Scenario: overlays keep painting above the sidebar

- **WHEN** a consumer renders a portal or overlay at a z-index above 40
- **THEN** that overlay still paints above the sidebar subtree

### Requirement: User menu item marks the current route

`AppSidebarUserMenuItem` must accept an optional `isActive` prop (default `false`) that applies the same active tokens as `AppSidebarNavItem`: `bg-sidebar-accent text-sidebar-primary font-medium`. An active entry in either component must set `aria-current="page"`.

#### Scenario: active user menu entry

- **WHEN** `AppSidebarUserMenuItem` renders with `isActive` true
- **THEN** the entry shows the active background and foreground and sets `aria-current="page"`

#### Scenario: inactive default

- **WHEN** `AppSidebarUserMenuItem` renders without `isActive`
- **THEN** the entry keeps its default muted styling and sets no `aria-current`

#### Scenario: nav item parity

- **WHEN** `AppSidebarNavItem` renders with `isActive` true, through the bare anchor or the `as` component
- **THEN** the item sets `aria-current="page"` in addition to its existing active styling
