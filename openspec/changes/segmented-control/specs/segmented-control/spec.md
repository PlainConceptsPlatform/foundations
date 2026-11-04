# segmented-control: shared segmented control

## ADDED Requirements

### Requirement: Controlled single selection from typed options

`SegmentedControl` MUST be exported from `@plainconceptsplatform/ui-components/segmented-control` (not the root barrel, like every other client component with hooks). It MUST be generic over the option values: `options` is an array of `{ value, label, icon? }`, `value` is one of those values, and `onChange` receives that same type. It renders exactly one button per option, and only the button whose value equals `value` shows the selected state. The component MUST be controlled; it holds no state of its own.

#### Scenario: selection

- **WHEN** `SegmentedControl` renders with `options` Before / On date / After and `value` "on-date"
- **THEN** the "On date" button shows the selected surface (`bg-accent text-accent-foreground`) and the other two keep the idle surface

#### Scenario: change

- **WHEN** the user activates the "After" button
- **THEN** `onChange` fires once with "after"

#### Scenario: no options

- **WHEN** `SegmentedControl` renders with an empty `options` array
- **THEN** it renders the fieldset wrapper and no buttons, and throws nothing

### Requirement: Icon or text per option, label as accessible name

Each option MUST render its `icon` when one is passed, and its `label` as visible text otherwise. The `label` MUST be the accessible name in both cases, through `aria-label` on the button, and `title` shows it on hover. The selected button MUST carry `aria-pressed="true"` and every other button `aria-pressed="false"`. All buttons are `type="button"`.

#### Scenario: icon options

- **WHEN** an option carries an icon and no accessible text of its own
- **THEN** the button renders the icon and announces the option through `aria-label` taken from `label`

#### Scenario: text options

- **WHEN** an option carries no icon, as in Capacity's date filter
- **THEN** the button renders the label as its visible text

### Requirement: One style set on the general tokens

The control MUST NOT use `sidebar-*` or other surface-local tokens, so it renders on any themed surface: idle `text-muted-foreground`, hover `hover:bg-muted hover:text-foreground`, selected `bg-accent text-accent-foreground`. Only `color`-family properties transition. The wrapping `fieldset` MUST carry its own reset (`border-none m-0 min-w-0`), so the control renders correctly in a page with no Tailwind preflight.

#### Scenario: theme without sidebar context

- **WHEN** `SegmentedControl` renders on a page with the theme compiled and no sidebar present
- **THEN** the hover and selected states paint with the general tokens, not placeholder or browser default styles

#### Scenario: fieldset without preflight

- **WHEN** `SegmentedControl` renders in a page with no preflight
- **THEN** the fieldset shows no groove border and no default margin, because the element carries its own reset utilities

### Requirement: Sidebar theme toggle stays stable through delegation

`AppSidebarThemeToggle` MUST keep its exported name, its props (`value`, `onChange`, `icons`, `labels`) and its `@plainconceptsplatform/ui-components/app-sidebar` sub-path, and MUST render `SegmentedControl` with the three theme modes built from `icons` and `labels`. Its selected state moves to the shared tokens (`bg-accent text-accent-foreground`, no border tint), so the sidebar gains no private copy of the control.

#### Scenario: adapter props unchanged

- **WHEN** a consumer that passed `value`, `onChange`, `icons` and `labels` to `AppSidebarThemeToggle` upgrades the package
- **THEN** that call site compiles and behaves as before, with no prop or import change

#### Scenario: labels default

- **WHEN** `AppSidebarThemeToggle` renders without `labels`
- **THEN** the three buttons are named Light, Dark and System, announced through `aria-label`
