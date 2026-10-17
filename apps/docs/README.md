# @plainconceptsplatform/docs

The docs and themed showcase for Platform Foundations, built with **Fumadocs** (Next.js). It renders the repo docs and shows the shared theme on real components and screens, including the Plain logo and the full component catalog.

## Run it

```bash
pnpm install          # from the repo root
pnpm --filter @plainconceptsplatform/docs dev
```

## Build (static output)

```bash
pnpm --filter @plainconceptsplatform/docs build   # outputs apps/docs/out
```

The deploy workflow (`.github/workflows/deploy.yml`) publishes the static export to GitHub Pages at `platform.plainconcepts.com` after CI passes on `main`. For local dev, the default config works without environment overrides.

## Structure

```text
apps/docs/
├── content/docs/
│   ├── meta.json              # Sidebar order
│   ├── how-we-work/           # The three phases and the four pillars
│   ├── health/                # Measuring with Health: engineering, delivery, agentic, roadmap
│   ├── adopt.mdx              # The day-one sequence for a new project
│   ├── frontend.mdx, backend.mdx, ai.mdx
│   ├── tokens.mdx             # Color, typography, radius
│   ├── components/            # shadcn/ui + custom component pages (generated)
│   └── reference/             # Synced from ai/ (ARCHITECTURE, DESIGN, ENGINEERING, AGENTS), gitignored
├── components/
│   ├── showcase.tsx           # Token showcase widgets (palette, type scale)
│   ├── themed-screen.tsx      # The home page's screen built from the tokens
│   ├── mermaid.tsx            # Renders mermaid diagrams
│   └── previews/              # Component preview widgets
├── scripts/
│   ├── sync-docs.mjs          # Syncs ai/*.md into content/docs/reference/
│   ├── gen-tokens.mjs         # Generates lib/tokens.generated.ts from the theme
│   └── gen-component-pages.mjs
└── app/                       # Next.js App Router: home page, docs routes, layouts, global.css
```

Pages that move keep their old URL alive with a small static route under `app/docs/` that redirects, because a static export has no server-side redirects. `app/docs/analytics/` is the example.

## Content model

- **Live component pages** (`content/docs/components/*.mdx`): each shows the component themed with our tokens, the usage code, and a link to [ui.shadcn.com](https://ui.shadcn.com) for the full API. Do not re-document shadcn APIs here.
- **Reference docs** (`content/docs/reference/`): generated from `ai/ARCHITECTURE.md`, `ai/DESIGN.md`, `ai/ENGINEERING.md`, and `ai/AGENTS.md` by `scripts/sync-docs.mjs` (runs on predev/prebuild). These are generated copies, gitignored. The source of truth is the `ai/` folder.
- **Tokens page** (`content/docs/tokens.mdx`): shows colors, typography, and radius from the live theme.

## Notes

- This app targets **Fumadocs v15 / Next 15 / Tailwind v4 / React 19**.
- `postinstall` runs `fumadocs-mdx` to generate the `.source` types.
- The `PlainLogo` component ships in `@plainconceptsplatform/ui-components` (`packages/ui-components`). See the [Plain logo docs page](/docs/components/plain-logo) for usage.
- Keep this a demonstration of the theme. Do not re-document shadcn component APIs; link to [ui.shadcn.com](https://ui.shadcn.com) instead.
