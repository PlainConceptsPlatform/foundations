---
name: Platform Foundations Design System
description: Design tokens and intent for PlainConcepts Platform apps — a calm, information-dense, professional look for internal line-of-business tools.
framework:
  css: Tailwind CSS v4
  componentLibrary: shadcn/ui (new-york style)
  primitives: Radix UI
  icons: Lucide
  overlayAnimations: tw-animate-css
  iconLibrary: lucide
  darkMode: class-based (html.dark)
modes: [light, dark]

color:
  primitives:
    blue:
      50: "#f5f8ff"
      100: "#ebf0ff"
      200: "#dce6ff"
      400: "#5282ff"
      500: "#2f69ff"
      600: "#0043f0"
      700: "#0032b2"
    neutral:
      0: "#ffffff"
      50: "#fafafc"
      100: "#f2f3f7"
      200: "#e9eaf2"
      300: "#dfe1ec"
      400: "#8e8f95"
      500: "#6a6f74"
      600: "#4a4a4a"
      700: "#383838"
      900: "#0d0e0f"
    error:
      100: "#fde1e6"
      300: "#f99bac"
      500: "#f33859"
      700: "#c72e49"
    warning:
      100: "#feeec6"
      300: "#fddd8c"
      500: "#fbc740"
      700: "#a6842a"
    success:
      100: "#d8f1ef"
      300: "#9cdcd7"
      500: "#3abaaf"
      700: "#257770"
    info:
      100: "#e3f8ff"
      300: "#99e1f9"
      500: "#00b5f1"
      700: "#008ebd"

  semantic:
    light:
      background: "#ffffff"
      foreground: "#0d0e0f"
      card: "#ffffff"
      card-foreground: "#0d0e0f"
      popover: "#ffffff"
      popover-foreground: "#0d0e0f"
      primary: "#2f69ff"
      primary-foreground: "#ffffff"
      secondary: "#f2f3f7"
      secondary-foreground: "#383838"
      muted: "#f2f3f7"
      muted-foreground: "#6a6f74"
      accent: "#ebf0ff"
      accent-foreground: "#0032b2"
      destructive: "#f33859"
      destructive-foreground: "#ffffff"
      border: "#e9eaf2"
      input: "#dfe1ec"
      ring: "#2f69ff"
      success: "#3abaaf"
      success-foreground: "#ffffff"
      warning: "#fbc740"
      warning-foreground: "#0d0e0f"
      info: "#00b5f1"
      info-foreground: "#ffffff"
      sidebar: "#f2f3f7"
      sidebar-foreground: "#0d0e0f"
      sidebar-primary: "#2f69ff"
      sidebar-primary-foreground: "#ffffff"
      sidebar-accent: "#ebf0ff"
      sidebar-accent-foreground: "#0032b2"
      sidebar-border: "#e9eaf2"
      sidebar-ring: "#2f69ff"
      sidebar-hover: "#e9eaf2"
      chart-1: "#2f69ff"
      chart-2: "#a6842a"
      chart-3: "#257770"
      chart-4: "#f33859"
      chart-5: "#008ebd"
    dark:
      background: "#0d0e0f"
      foreground: "#fafafc"
      card: "#17181b"
      card-foreground: "#fafafc"
      popover: "#17181b"
      popover-foreground: "#fafafc"
      primary: "#2f69ff"
      primary-foreground: "#ffffff"
      secondary: "#22242a"
      secondary-foreground: "#fafafc"
      muted: "#22242a"
      muted-foreground: "#8e8f95"
      accent: "#17244a"
      accent-foreground: "#dce6ff"
      destructive: "#f33859"
      destructive-foreground: "#ffffff"
      border: "#2a2c33"
      input: "#2a2c33"
      ring: "#5282ff"
      success: "#3abaaf"
      success-foreground: "#06231f"
      warning: "#fbc740"
      warning-foreground: "#0d0e0f"
      info: "#00b5f1"
      info-foreground: "#04222c"
      sidebar: "#17181b"
      sidebar-foreground: "#fafafc"
      sidebar-primary: "#2f69ff"
      sidebar-primary-foreground: "#ffffff"
      sidebar-accent: "#17244a"
      sidebar-accent-foreground: "#dce6ff"
      sidebar-border: "#2a2c33"
      sidebar-ring: "#5282ff"
      sidebar-hover: "#2a2c33"
      chart-1: "#5282ff"
      chart-2: "#fbc740"
      chart-3: "#3abaaf"
      chart-4: "#f33859"
      chart-5: "#00b5f1"

typography:
  fontFamily: '"Outfit", ui-sans-serif, system-ui, sans-serif'
  smoothing: antialiased
  rendering: optimizeLegibility
  scale:
    h1:
      weight: 700
      size: "1.25rem"
      sizePx: 20
      lineHeight: "1.5625rem"
      lineHeightPx: 25
    paragraph-l:
      weight: 400
      size: "1rem"
      sizePx: 16
      lineHeight: "1.5rem"
      lineHeightPx: 24
    paragraph-m:
      weight: 400
      size: "0.875rem"
      sizePx: 14
      lineHeight: "1.5rem"
      lineHeightPx: 24
    paragraph-s:
      weight: 400
      size: "0.75rem"
      sizePx: 12
      lineHeight: "0.9375rem"
      lineHeightPx: 15

spacing:
  system: Tailwind default 4px scale (0.25rem step)

radii:
  base: "0.375rem"
  sm: "calc(0.375rem - 4px)"
  md: "calc(0.375rem - 2px)"
  lg: "0.375rem"
  xl: "calc(0.375rem + 4px)"
  note: Foundation-chosen; measured from Figma buttons/cards.

breakpoints:
  sm: 640
  md: 768
  lg: 1024
  xl: 1280
  2xl: 1536

elevation:
  philosophy: "Elevation is a border plus a surface, not a shadow."
  implementation: >
    All Tailwind shadow, inset-shadow, drop-shadow, and text-shadow utilities
    are overridden to a fully transparent value (0 0 #0000). The utilities
    compile and are valid CSS, but paint nothing, so upstream shadcn/ui
    component source can be copied in unmodified and still look correct.
    Focus rings are unaffected because they use a transparent shadow value
    composed into the same box-shadow declaration.
  shadows:
    2xs: "0 0 #0000"
    xs: "0 0 #0000"
    sm: "0 0 #0000"
    md: "0 0 #0000"
    lg: "0 0 #0000"
    xl: "0 0 #0000"
    2xl: "0 0 #0000"
  insetShadows:
    2xs: "0 0 #0000"
    xs: "0 0 #0000"
    sm: "0 0 #0000"
  dropShadows:
    xs: "0 0 #0000"
    sm: "0 0 #0000"
    md: "0 0 #0000"
    lg: "0 0 #0000"
    xl: "0 0 #0000"
    2xl: "0 0 #0000"
  textShadows:
    2xs: "0 0 #0000"
    xs: "0 0 #0000"
    sm: "0 0 #0000"
    md: "0 0 #0000"
    lg: "0 0 #0000"

motion:
  duration: 150ms
  easing: ease-out
  properties: [color, background-color, border-color, opacity, transform]
  forbiddenProperties: [width, height, top, left, box-shadow]
  triggers: [hover, focus, state-change]
  rules:
    - "Transition color, background-color, border-color, opacity and transform only."
    - "Never transition width, height, top/left, or box-shadow — they force layout or paint work on every frame."
    - "150ms ease-out for anything triggered by hover, focus or a state change."
    - "Radix overlays keep their own enter/exit animations; do not add a second transition on top."
    - "Motion follows a state change. If nothing changed, nothing moves."
    - "No scroll-triggered reveals, parallax, auto-rotating carousels, count-up numbers, or typewriter text."
  reducedMotion:
    animationDuration: 1ms
    animationIterationCount: 1
    transitionDuration: 1ms
    scrollBehavior: auto

dataVisualization:
  categoricalRamp:
    light: ["#2f69ff", "#a6842a", "#257770", "#f33859", "#008ebd"]
    dark: ["#5282ff", "#fbc740", "#3abaaf", "#f33859", "#00b5f1"]
  contrastRule: "Every entry clears 3:1 against the background in both modes, so thin lines and small legend swatches stay visible."
  orderingRule: "The two blue-family hues sit at opposite ends of the ramp so adjacent series never collide."
  seriesColorRule: "Never use accent or other tint tokens as a series colour; they are hover surfaces and disappear against a card."
  domainPalettes: "Special Days, Unit, Area, Teams palettes are app-specific data-viz sets. They live in the consuming app, not in the shared theme."
---

# Design

## Visual intent

A calm, information-dense, professional look for internal line-of-business tools. **Outfit** is the single typeface — geometric, friendly, highly legible at small sizes, which suits data-heavy screens. A confident **royal blue (`#2f69ff`)** carries brand and primary actions; everything else is a restrained cool-neutral ramp so data and status colors stand out rather than the chrome.

Status is communicated through the **functional palette**: red for destructive/error, amber for warning, teal for success, cyan for info. Each has a light background tint, a solid base, and a dark variant for text-on-tint.

## Working rules

- **Check the library first.** Before building a component, look for it in shadcn/ui and the companion libraries in ARCHITECTURE.md. Do not recreate what exists.
- **Use semantic tokens, never hardcoded values.** `bg-primary`, `text-muted-foreground`, `border`, `rounded-lg` — not raw hex or pixel values.
- **Accessibility is a baseline, not a feature.** Meet WCAG 2.2 AA contrast; every interactive element is keyboard reachable with a visible focus ring; label all inputs; respect `prefers-reduced-motion`.
- **Design every state.** Loading (skeletons), empty, success, and error states are required, not optional. Validate forms inline with clear messages.
- **Responsive by default.** Mobile-first; use the Tailwind breakpoints; verify at sm/md/lg.
- **Consistency over cleverness.** Prefer the theme's tokens and shadcn patterns to bespoke styling.

## Motion and elevation

A single contract, so nothing needs a bespoke hover and the whole surface feels deliberate rather than assembled.

- **Transition `color`, `background-color`, `border-color`, `opacity` and `transform` only.** Never `width`, `height`, `top`/`left`, or `box-shadow`; they force layout or paint work on every frame.
- **150ms, ease-out**, for anything triggered by hover, focus or a state change. Radix overlays keep their own enter/exit animations; do not add a second transition on top.
- **Motion follows a state change.** If nothing changed, nothing moves: no scroll-triggered reveals, parallax, auto-rotating carousels, count-up numbers, or typewriter text.
- **Always honour `prefers-reduced-motion: reduce`** by dropping to no transition.
- **Elevation is a border plus a surface**, `border-border` with `bg-card`, not a shadow. This is enforced by the theme, not by discipline: the shadow scale is overridden to a transparent value, so `shadow-*` classes on vendored components compile but paint nothing, and upstream component source can be copied in unmodified. Focus rings are unaffected.

## Data visualization

Use the shared categorical ramp (chart-1 through chart-5) for series colour. Every entry clears 3:1 against the background in both modes, so thin lines and small legend swatches stay visible, and the two blue-family hues sit at opposite ends so adjacent series never collide. Do not use `--accent` or other tint tokens as a series colour; they are hover surfaces and disappear against a card. Domain-specific palettes (Special Days, Unit, Area, Teams) stay in the app that owns them.

## Application-specific vs shared

App-specific components stay in the app (in the slice that owns them). A component becomes a candidate for sharing **only** after the same real requirement appears in **multiple** apps, and even then it's reviewed before promotion. The shared layer owns tokens and conventions, not a component catalog.

<!-- Last updated: 2026-10-14T00:00:00Z -->
