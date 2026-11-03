# AGENTS.md

Hub for AI coding agents working in this repo and in PlainConcepts **Platform** apps. It covers the **frontend** stack, **backend/.NET** conventions and the **platform contract** of the app family. Keep this file short, the detail lives in the docs and skills it points to.

This repository owns the theme, the conventions, the docs and the showcase, and defines the family's platform contract ("Platform family" in [`ARCHITECTURE.md`](ARCHITECTURE.md)). It ships no platform code: the family's platform code reaches each app as source from the Kitchen-Sink template (internal: requires access to the PlainConceptsPlatform organisation), never as a new shared package.

## What's here

```text
ai/
├── ARCHITECTURE.md     # stack, repo layout, FSD, DI, backend architecture
├── DESIGN.md           # design tokens, visual intent, working rules
├── ENGINEERING.md      # engineering gates, levels, facets, known CI pitfalls
├── DOCUMENTATION.md    # per-application documentation structure, how it stays current
├── AGENTS.md           # this file: index/hub
skills/
├── platform-new-project/  # a new family app from Kitchen-Sink's BLUEPRINT.md and template
├── platform-onboard/      # an existing app: adopt the template and converge, or migrate domain by domain
└── platform-upstream/     # platform changes go to Kitchen-Sink first, or a dated exception
```

## Stack (summary)

**React + TypeScript (strict)** built by **Next.js as a static export** and routed by **react-router**, served by the API. **Feature-Sliced Design** with the canonical `pages/` layer, checked by **Steiger**. **shadcn/ui** on **Radix** + **Tailwind v4**, themed by **`@plainconceptsplatform/ui-theme`**, shared components from **`@plainconceptsplatform/ui-components`** (Plain logo, app shell, data table, ...), icons from **Lucide** (**Tabler** in family apps). DI via **inversify-hooks** (mandatory). Translations: **react-i18next + i18next** (mandatory, the only translation library — zero magic strings). Package manager: **pnpm**. Lint/format **Biome** (scoped `biome.json` per package, never `biome check .` at monorepo root). Markdown: **markdownlint-cli2**, one rule, no hard-wrapped prose. Full list: [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Read these first

- Architecture & structure: [`ARCHITECTURE.md`](ARCHITECTURE.md)
- Design tokens & UI rules: [`DESIGN.md`](DESIGN.md)
- Backend (.NET): [`ARCHITECTURE.md`](ARCHITECTURE.md) (Backend architecture section)
- Engineering gates and the Project-Health scorecard: [`ENGINEERING.md`](ENGINEERING.md)
- Application documentation structure: [`DOCUMENTATION.md`](DOCUMENTATION.md)
- Theme installation in a consuming app: [`/README.md`](../README.md)

## Rules

1. **Prefer shadcn/ui and the `ARCHITECTURE.md` libraries.** Use components directly.
2. **Do not recreate existing components** or wrap third-party components without a real reason.
3. **Never hardcode design values.** Use semantic theme tokens (`bg-primary`, `text-muted-foreground`, `rounded-lg`), never raw hex/px.
4. **Application-specific components stay in the app** (in the slice that owns them). A component is shared only after the same need appears in **multiple** apps.
5. **Respect the dependency direction and slice public APIs** (see ARCHITECTURE.md).
6. **Use pnpm** for all commands.
7. **Accessibility & all states** (loading/empty/error/success) are required, see DESIGN.md.
8. **A section still in development is behind a section feature flag**, answered 404 (never 403) when off, and **MCP never serves anything that has a flag**. Use `@plainconceptsplatform/ui-components/feature-flags` on the web, see "Section feature flags" in ARCHITECTURE.md.
9. **In a family app, platform paths belong to the template.** A path listed in `.platform/manifest` is changed in Kitchen-Sink first and arrives with `copier update`; until then the app records a dated entry in `.platform/exceptions.yml`. Do not propose a shared package for platform code. See "Platform family" in ARCHITECTURE.md.

## Theme & components setup (consuming apps)

When building a Platform app, read [`/README.md`](../README.md) for the full setup, then install:

- `@plainconceptsplatform/ui-theme` for design tokens (CSS import, Outfit font, shadcn config)
- `@plainconceptsplatform/ui-components` for shared React components (Plain logo, ...)

## Platform skills

- [`platform-new-project`](../skills/platform-new-project/SKILL.md) creates a new Platform app. It reads Kitchen-Sink's `BLUEPRINT.md`, takes the platform code from the template with `copier copy`, and installs the harness, the workflows and the quality gates. Without access to Kitchen-Sink it builds an own design app from the public rules.
- [`platform-onboard`](../skills/platform-onboard/SKILL.md) brings an existing app onto the Platform. Route A joins the family: preflight, adopt with `copier copy --overwrite`, converge one capability at a time, install the quality gates, then keep in sync with `copier update`. Route B keeps an own design and migrates agentic infrastructure, architecture docs, OpenSpec, frontend stack, agentic workflows and .NET guardrails in dependency order.
- [`platform-upstream`](../skills/platform-upstream/SKILL.md) handles a change to a platform path in a family app: Kitchen-Sink first and the template carries it, or a dated exception until it does.

**Workflow**
- `platform-new-project`: create a new family app from the Kitchen-Sink blueprint and template
- `platform-onboard`: bring an existing project onto the Platform (adopt the template and converge, or migrate pnpm, the Next.js static export, shadcn, FSD with Steiger, inversify-hooks, react-i18next, Biome, OpenSpec)
- `platform-upstream`: move a platform change into Kitchen-Sink first, or record a dated exception
- `openspec-propose`: propose a change with design, specs, tasks
- `openspec-explore`: thinking partner for ideas and investigation
- `openspec-apply-change`: implement tasks from an OpenSpec change
- `openspec-archive-change`: finalize and archive a completed change
- `user-story`: user stories with Gherkin acceptance criteria

## Recommended tooling & workflow

- **pnpm** for all package/script commands.
- **Running agents against a repository:** [GitHub Agentic Workflows](https://github.github.io/gh-aw/) with `engine: opencode` against the Forge gateway, on the `agents-arc` runner fleet. This is the Platform default. Event triggers instead of polling, a fresh checkout per run, and a `concurrency` group instead of a hand-rolled mutex. The router (`# Main Work Router`) owns every trigger and workers have none: install and update them with `npx @plainconceptsplatform/workflows` from [`PlainConceptsPlatform/agentic-workflows`](https://github.com/PlainConceptsPlatform/agentic-workflows) (see [`ai/workflows`](./workflows)), and compile with `node scripts/compile-agent-workflows.mjs`. Run-names follow the `Agent:` / `Agentics:` / `Event:` prefix convention so the sidebar stays scannable. Use that repository's self-contained `workflow-author` and `workflow-consumer` skills to change or adopt workflows. Self-hosted runners, the `agents-arc` fleet included, must never be attached to a **public** repository.
- **Platform Harness:** [`PlainConceptsPlatform/agent-harness`](https://github.com/PlainConceptsPlatform/agent-harness) installs the harness this repository runs on, including the `make-architecture` and `make-design` skills.
- **Optimizations (recommended to enable):** RTK check, opencode-quota plugin, Simple English concise mode, codegraph semantic index, agentmemory local memory server, humanizer skill.

## Regenerating the docs

`ARCHITECTURE.md` and `DESIGN.md` follow the Platform Harness skills (`pc-make-architecture`, `pc-make-design`). Regenerate them from the codebase rather than hand-editing large sections; `src/theme.css` remains the source of truth for design tokens.
