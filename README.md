# Platform Foundations

**Platform Foundations** is the shared foundation for PlainConcepts **Platform** apps. It keeps many independent apps consistent and easy for developers *and* AI agents to work in, without becoming a heavy in-house framework.

It covers the **frontend** (a shared theme, conventions, docs, and a themed showcase), **backend/.NET** conventions (recommended skills and a reference architecture in [`ai/ARCHITECTURE.md`](ai/ARCHITECTURE.md)), and the **platform contract** of the Platform app family: the capabilities, paths and ownership rules that Numa, Odyssey, Hermes and Kitchen-Sink share.

It is **not** a component library, an app framework, or a design system to be maintained by hand.

## What's here

```text
ai/               ARCHITECTURE (incl. Stack) + DESIGN + AGENTS
skills/           platform-new-project, platform-onboard and platform-upstream agent skills
apps/docs         Fumadocs (Next.js), docs + live themed component previews
packages/theme    @plainconceptsplatform/ui-theme, design tokens (CSS only)
packages/ui-components  @plainconceptsplatform/ui-components, shared React components (Plain logo, ...)
```

## Core principles

1. Prefer established open-source libraries over custom code.
2. Use **shadcn/ui** components directly; don't wrap them or build a proprietary library.
3. App-specific components live in the app. Share a component only after the same need appears in **multiple** apps.
4. The foundation owns the **theme, conventions, docs, and showcase**, and **defines the family platform contract**. It ships no platform code.
5. Keep the scope small. Add a directory/package only when it has a clear job today. The family's platform code is distributed as source by the [Kitchen-Sink](https://github.com/PlainConceptsPlatform/Kitchen-Sink) (internal: requires access to the PlainConceptsPlatform organisation) template with Copier, not by new shared packages.

## Stack

React + TypeScript built by Next.js as a static export and routed by react-router, Feature-Sliced Design checked by Steiger, shadcn/ui on Radix + Tailwind v4, themed by `@plainconceptsplatform/ui-theme`. DI via inversify-hooks (mandatory), react-i18next. Biome, markdownlint-cli2, Vitest + Playwright, pnpm. On .NET: a modular monolith with services behind Application ports, Aspire locally and Azure Container Apps in the environments. See [`ai/ARCHITECTURE.md`](ai/ARCHITECTURE.md).

## Getting started (this repo)

```bash
pnpm install
pnpm dev          # run the docs/showcase site (Fumadocs)
pnpm lint         # Biome + Markdown
pnpm verify       # lint + typecheck + build, what CI runs
```

## Using Platform packages in your app

The Platform theme and shared components are public npm packages. No registry configuration or token is required.

### 1. Install everything

```bash
pnpm add @plainconceptsplatform/ui-theme @plainconceptsplatform/ui-components tailwindcss
```

### 2. Initialize

```bash
npx @plainconceptsplatform/ui-theme@latest init
```

This copies `components.json`, adds the theme import to your global stylesheet, and shows you how to wire the Outfit font in your root layout.

### 3. Add shadcn components

```bash
npx shadcn@latest add button card dialog ...
```

Full details in [`packages/theme/README.md`](packages/theme/README.md).

## For AI agents

Start with [`AGENTS.md`](AGENTS.md). It points to the [`ai/`](ai/) folder, which has conventions, architecture, design rules, and agent definitions. Three skills cover the app lifecycle:

- [`platform-new-project`](skills/platform-new-project/SKILL.md) creates a new family app from Kitchen-Sink's `BLUEPRINT.md` and the Kitchen-Sink template, or an own design app from the public rules when Kitchen-Sink is not accessible.
- [`platform-onboard`](skills/platform-onboard/SKILL.md) brings an existing app in: for a family app it adopts the template with Copier and converges each capability onto it; for an own design app it migrates six domains in dependency order (agentic infrastructure, architecture docs, OpenSpec, frontend stack, agentic workflows, .NET guardrails).
- [`platform-upstream`](skills/platform-upstream/SKILL.md) moves a change made in an app's platform code into Kitchen-Sink first, or records a dated exception.

Install one with the skills CLI, always naming it with `--skill`, since the repository also vendors the harness skills:

```bash
npx skills add PlainConceptsPlatform/Foundations --skill platform-new-project
```

The three read the platform contract, `.platform/contract.yml`, rather than a fixed list of paths. Kitchen-Sink is private (internal: requires access to the PlainConceptsPlatform organisation).

### Agentic Workflow migration

Reusable GitHub Agentic Workflow skills and copyable loops now live in [`PlainConceptsPlatform/agentic-workflows`](https://github.com/PlainConceptsPlatform/agentic-workflows). Install them in a repository with `npx @plainconceptsplatform/workflows`, and use its self-contained `workflow-author` and `workflow-consumer` skills when changing or adopting workflows. The router is named `# Main Work Router` for sidebar sort order; run-names follow the `Agent:` / `Agentics:` / `Event:` prefix convention documented in the `workflow-author` skill. Interactive diagrams of every workflow are at [workflows.platform.plainconcepts.dev](https://workflows.platform.plainconcepts.dev).

## Documentation

- [`ai/ARCHITECTURE.md`](ai/ARCHITECTURE.md): reference architecture + stack (frontend and backend/.NET)
- [`ai/DESIGN.md`](ai/DESIGN.md): design tokens & UI rules
- [`ai/ENGINEERING.md`](ai/ENGINEERING.md): the engineering gates every Platform repository runs, and how Project Health scores them
- [`ai/DOCUMENTATION.md`](ai/DOCUMENTATION.md): the documentation structure every Platform application keeps, and how it stays current
- [`skills/platform-new-project/SKILL.md`](skills/platform-new-project/SKILL.md): a new Platform app, from the family template
- [`skills/platform-onboard/SKILL.md`](skills/platform-onboard/SKILL.md): an existing app onto the Platform, joining the family or as an own design app
- [`skills/platform-upstream/SKILL.md`](skills/platform-upstream/SKILL.md): platform changes go to Kitchen-Sink first
- [`packages/theme/README.md`](packages/theme/README.md): theme package setup and conventions
- [`packages/ui-components/README.md`](packages/ui-components/README.md): shared components (Plain logo)
- [`apps/docs/README.md`](apps/docs/README.md): docs/showcase site structure
- [platform.plainconcepts.dev](https://platform.plainconcepts.dev): this repository's docs site
- [harness.platform.plainconcepts.dev](https://harness.platform.plainconcepts.dev): the Platform Harness site
- [workflows.platform.plainconcepts.dev](https://workflows.platform.plainconcepts.dev): interactive diagrams of every workflow loop
- [health.platform.plainconcepts.dev](https://health.platform.plainconcepts.dev): the Project-Health dashboard and Engineering scorecard
