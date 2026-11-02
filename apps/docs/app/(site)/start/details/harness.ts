import type { StepGuide } from "./types";

/**
 * The guides behind the agent-harness layer, in the order of its steps. Every section is
 * doable with OpenCode or Claude Code and public tools; Platform's own tooling appears only
 * in `platform`.
 */
export const HARNESS_GUIDES: StepGuide[] = [
  // 1. Add AGENTS.md
  {
    problem:
      "You ask an agent to add a due-date filter to the invoices endpoint. It runs `npm install` in a pnpm repository and commits a `package-lock.json`, edits the Prisma client under `src/generated/` by hand, runs `npm test`, which does not exist, and reports the change as done without ever running the type check. Nothing it did was unreasonable for a repository it knew nothing about.",
    sections: [
      {
        title: "Write what you would tell a new teammate on day one",
        body: 'AGENTS.md is a plain Markdown file at the root of the repository, read by the agent at the start of every session. It has no required fields. Think of it as the README for agents: the things a person learns in their first week by asking, written down once so no agent has to guess them.\n\nStart with the commands, because they are what an agent gets wrong most often: how to install, how to run the app, and above all the one command that says a change is finished. Then the layout, the rules that are not obvious from the code, and what is off limits. A file like the one below fits on one screen, and every line in it prevents a specific mistake.\n\nWrite commands exactly as they are typed. An agent copies `pnpm verify` literally; it cannot do anything with "run the usual checks".',
        code: [
          {
            lang: "md",
            file: "AGENTS.md",
            code: `# AGENTS.md

Invoices API: a Node.js 22 and TypeScript service that issues, sends and
collects invoices. PostgreSQL through Prisma, HTTP through Fastify.

## Commands

- Install: \`pnpm install\` (pnpm only; the lockfile is \`pnpm-lock.yaml\`)
- Run locally: \`pnpm dev\` (needs \`docker compose up db\` first)
- Verify a change: \`pnpm verify\` runs lint, type check and tests. A change
  is not done until it exits 0.
- One test file: \`pnpm vitest run src/invoices/late-fee.test.ts\`
- New migration: \`pnpm prisma migrate dev --name <what-changed>\`

## Layout

- \`src/<module>/\`: one folder per business module (invoices, customers,
  payments). Routes, service and repository live together.
- \`src/shared/\`: code used by two or more modules. Nothing module-specific.
- \`src/generated/\`: Prisma client. Generated; regenerate with
  \`pnpm prisma generate\`, never edit by hand.

## Rules

- Never import one module's repository from another module. Call its
  service, or the invoice totals stop going through the rounding rules.
- Never store money as a float. Amounts are integers in cents.
- Never add a dependency without saying why in the pull request.
- Never touch \`infra/\`: it is applied by the platform team's pipeline.

## Before you open a pull request

Run \`pnpm verify\`, then describe what changed and how you checked it.`,
          },
        ],
      },
      {
        title: "Phrase rules as nevers, with the reason",
        body: '"Prefer services over repositories" is advice, and advice gets weighed against whatever the agent is trying to finish. "Never import one module\'s repository from another module" is a line it can check its own diff against. Agents follow prohibitions more reliably than preferences, and they are easier for a reviewer to hold them to.\n\nThe reason matters as much as the rule. When a rule says why ("or the invoice totals stop going through the rounding rules"), the agent can apply it to a case you did not foresee, and it can tell you when the rule does not fit instead of quietly working around it.',
      },
      {
        title: "Give Claude Code the same file",
        body: "OpenCode, Codex, Cursor, Gemini CLI, GitHub Copilot and most other agents read AGENTS.md directly. Recent versions of Claude Code do too, but only when there is no CLAUDE.md in the working directory or above it. As soon as someone adds a CLAUDE.md, Claude Code reads that instead and AGENTS.md drops out of its context.\n\nIf you need Claude-specific instructions, keep AGENTS.md as the one shared file and import it from CLAUDE.md with an `@AGENTS.md` line. Claude reads the imported file first and then the rest. In your next session run `/context` and check that the instruction file appears under memory files.",
        code: [
          {
            lang: "md",
            file: "CLAUDE.md",
            code: `@AGENTS.md

## Claude Code

Use plan mode for any change under \`src/payments/\`.`,
          },
        ],
      },
      {
        title: "Nest a file where one part of the repository has its own rules",
        body: "In a monorepo, put another AGENTS.md inside the package that needs different instructions. Agents read the file closest to the code they are editing, so the nested file wins for that folder. A chat instruction from you still overrides both.\n\nKeep nested files short and only for what differs. Repeating the root rules in every package means editing them in five places when one changes.",
        code: [
          {
            lang: "md",
            file: "packages/pdf-renderer/AGENTS.md",
            code: `# PDF renderer

- Verify: \`pnpm --filter pdf-renderer verify\`, which also compares the
  rendered sample invoices against \`fixtures/expected/\`.
- Never update a file in \`fixtures/expected/\` to make a test pass. A changed
  PDF is a visible change to every customer; say so in the pull request.`,
          },
        ],
      },
      {
        title: "Keep it short and true",
        body: "Every line of AGENTS.md is in every session's context, including the session that only fixes a typo. Long explanations, how-tos and reference material belong in skills (the next step) or in ARCHITECTURE.md, which agents read when they need it.\n\nA wrong line is worse than a missing one, because the agent believes it. When a command or folder changes, change AGENTS.md in the same pull request.",
      },
    ],
    verify: [
      'Start a fresh session and ask "How do I check that a change in this repository is finished?". It should answer `pnpm verify` and cite AGENTS.md, without reading package.json first.',
      "Ask it to add a dependency. It should use `pnpm add` and explain why the dependency is needed.",
      "In Claude Code, run `/context` and confirm AGENTS.md (or CLAUDE.md with the import) is listed as a memory file.",
      "Ask it to change a file under `src/generated/`. It should refuse and offer to regenerate instead.",
    ],
    pitfalls: [
      "Pasting the README into AGENTS.md. Installation screenshots and project history cost tokens in every session and tell the agent nothing it can act on.",
      "Adding a CLAUDE.md for one Claude-specific line, without the `@AGENTS.md` import. Claude Code then stops reading AGENTS.md at all.",
      "Commands that drifted. If `pnpm verify` was renamed to `pnpm check` three months ago, every agent is now told to run something that fails.",
      "Rules without reasons. The agent follows them literally, and works around them the first time they get in the way of the task.",
    ],
    platform:
      "`npx @plainconceptsplatform/agent-harness@latest` first removes stale AGENTS.md, CLAUDE.md and .cursorrules files, then writes an AGENTS.md in bootstrap mode. `/repo-initialize` replaces it with the harness's agent-agnostic operating guide: session context, planning and execution, engineer selection, tool and repository safety, and verification.",
    links: [
      { label: "AGENTS.md", href: "https://agents.md" },
      {
        label: "Claude Code: AGENTS.md and CLAUDE.md",
        href: "https://code.claude.com/docs/en/memory",
      },
      { label: "agent-harness on this site", href: "/docs/ai#agent-harness" },
    ],
  },

  // 2. Install skills from skills.sh
  {
    problem:
      "Someone pastes 200 lines on how the team writes Playwright tests into AGENTS.md. Now every session pays for them, including the one that renames a variable, and the agent still writes the tests its own way because the instructions are buried among forty other rules. Meanwhile, when it needs a library for PDF generation, it improvises a search instead of following a procedure someone already wrote and tested.",
    sections: [
      {
        title: "Understand what a skill is",
        body: "A skill is a folder with a SKILL.md file: YAML frontmatter with a `name` and a `description`, then Markdown instructions. Only the description sits in the agent's context. The body is loaded when the agent decides the skill is relevant and calls it, so a long, detailed procedure costs nothing in the sessions that do not need it.\n\nThat makes the description the part that matters most. It has to say what the skill does and when to use it, specifically enough that the agent picks it at the right moment. In OpenCode the name must be lowercase letters, digits and single hyphens, and must match the folder name.\n\nWhere skills live depends on the agent. OpenCode reads `.opencode/skills/`, `.claude/skills/` and `.agents/skills/` in the project. Claude Code reads `.claude/skills/`, where each skill also becomes a slash command with its name.",
        code: [
          {
            lang: "md",
            file: ".agents/skills/playwright-tests/SKILL.md",
            code: `---
name: playwright-tests
description: How this repository writes end-to-end tests with Playwright. Use when adding or changing a test under e2e/, or when a user journey changes.
---

# Playwright tests

1. One spec file per user journey, named after it: \`e2e/send-invoice.spec.ts\`.
2. Select elements by role and accessible name (\`getByRole\`), never by CSS class.
3. Seed data through the API in \`beforeEach\`, never through the UI.
4. Run one file with \`pnpm playwright test e2e/send-invoice.spec.ts\`.`,
          },
        ],
      },
      {
        title: "Find skills others already wrote",
        body: "skills.sh is a public directory of agent skills, ranked by installs, with a security audits section. The `skills` CLI from Vercel Labs searches it and installs from any GitHub repository. It needs Node.js 22.20 or later.\n\n`npx skills find` searches by keyword. `npx skills add <owner/repo> --list` shows the skills a repository contains without installing anything, which is the way to see what you would get before you get it.",
        code: [
          {
            lang: "bash",
            code: `# Search the directory by keyword
npx skills find playwright

# List the skills in a repository without installing them
npx skills add vercel-labs/skills --list`,
          },
        ],
      },
      {
        title: "Install into the project, for the agents you use",
        body: "Install project-local, which is the default, so the skills are committed with the repository and every teammate and CI run gets the same ones. `-g` installs into your home directory instead, where nobody else sees them.\n\n`--skill` picks skills by name and `--agent` picks the agents to install for, so a mixed team can serve both OpenCode and Claude Code from one command. The CLI symlinks by default; `--copy` writes real files. `--yes` skips the prompts.\n\nStart with `find-skills`. It teaches the agent to run `npx skills find` itself when it meets a task it has no procedure for, instead of improvising.",
        code: [
          {
            lang: "bash",
            code: `npx skills add vercel-labs/skills --skill find-skills --agent opencode claude-code --yes

# What is installed in this project
npx skills list`,
          },
        ],
      },
      {
        title: "Commit the lockfile and restore from it",
        body: "Project installs are recorded in `skills-lock.json`, with the source repository, the path of the skill inside it and a content hash. Commit it. It is what tells you, months later, where a skill came from and whether it changed.\n\n`npx skills check` reports available updates and exits 1 when there are any, which makes it usable in CI. `npx skills update -p` updates the project's skills. `npx skills experimental_install` restores what the lockfile records on a fresh clone; as the name says, it is experimental and may change.",
        code: [
          {
            lang: "json",
            file: "skills-lock.json",
            code: `{
  "version": 1,
  "skills": {
    "find-skills": {
      "source": "vercel-labs/skills",
      "sourceType": "github",
      "skillPath": "skills/find-skills/SKILL.md",
      "computedHash": "b146008599c31057cef1c145774cea5d5afb30e8f43fa802e47a4b461419aaaf"
    }
  }
}`,
          },
          {
            lang: "bash",
            code: `# Exit 1 when an installed skill has an update
npx skills check

# Update the project's skills only
npx skills update -p`,
          },
        ],
      },
      {
        title: "Read a skill before you install it",
        body: "A skill is a set of instructions your agent will follow with your permissions: run these commands, fetch that URL, edit those files. Open the SKILL.md on GitHub before installing, the same way you would read a shell script before piping it into bash, and check its entry under the audits on skills.sh.\n\nInstall few. Every installed skill puts its description into every session, and two skills that cover the same ground make the agent pick one at random.",
      },
    ],
    verify: [
      "Run `npx skills list`. find-skills should be listed for the project, not globally.",
      'Ask the agent "Which skills do you have available?". It should name find-skills from its skill list without searching the file system.',
      "Ask it to find a skill for writing Playwright tests. It should load find-skills and run `npx skills find`, not search the web by hand.",
      "Clone the repository into a new folder. `skills-lock.json` should be there, and the skills directory should match it.",
    ],
    pitfalls: [
      "Installing with `-g`. It works on your machine and nowhere else, and nobody can tell from the repository which skills the agent was using.",
      "Installing dozens of skills because they looked useful. Each description costs context in every session, and overlapping skills make the agent's choice unpredictable.",
      "Editing an installed skill in place. The next `npx skills update` overwrites it; write your own skill instead, or fork the source.",
      "Not committing `skills-lock.json`, so nobody can tell where a skill came from or that it changed upstream.",
    ],
    platform:
      "Step 5 of the agent-harness wizard copies a `skills-lock.json` and runs the skills CLI to install what it records, find-skills among them; the optimization step adds humanizer, simple-english and agentmemory-agents to the same lockfile. `/make-engineer` uses find-skills to choose skills for each specialist and installs them project-local with `npx skills add -y`, never `-g`.",
    links: [
      { label: "skills.sh", href: "https://skills.sh" },
      { label: "The skills CLI", href: "https://github.com/vercel-labs/skills" },
      { label: "OpenCode: agent skills", href: "https://opencode.ai/docs/skills/" },
      { label: "Claude Code: skills", href: "https://code.claude.com/docs/en/skills" },
      { label: "agent-harness on this site", href: "/docs/ai#agent-harness" },
    ],
  },

  // 3. Write your guardrails as a skill
  {
    problem:
      'An agent writing an integration test for the payments webhook copies `.env` to `.env.test` so the test can start, real Stripe key included, and commits it. In the same change it adds a twenty-line doc comment above every function and eleven tests for a two-line fix. AGENTS.md said "be careful with secrets" and "keep code clean", which it was, by its own standard.',
    sections: [
      {
        title: "Split the rules any repository needs from the ones only yours does",
        body: "Some rules hold in every repository: do not stage what you did not change, do not commit a credential, do not leave comment slop. Others come from this codebase: modules talk through services, money is in cents. Keep them in two skills, `guardrails` and `project-guardrails`. The first one you can copy between repositories, or install from your own skills repository with the skills CLI; the second one changes when the architecture does.\n\nWhy a skill and not more lines in AGENTS.md: guardrails need room for the reason behind each rule, and that room should not be paid for in sessions that only answer a question. A skill is loaded when the agent starts working, and its body can be as long as the rules need.",
      },
      {
        title: "Write the generic guardrails",
        body: "Group the rules by concern and write each one as a never with its reason. The reason is what lets the agent recognise a case the rule did not spell out: the same reason that forbids `git add -A` also forbids `git commit -a`.\n\nThe description says when to load it, which is always before the first edit. Put the file in `.agents/skills/guardrails/` for OpenCode and in `.claude/skills/guardrails/` for Claude Code, or install it from your own skills repository with `npx skills add` for both at once.",
        code: [
          {
            lang: "md",
            file: ".agents/skills/guardrails/SKILL.md",
            code: `---
name: guardrails
description: Git, secrets, code and test rules every agent follows in this repository. Load before the first edit, command or commit of any task.
---

# Guardrails

## Git

- Never run \`git add -A\`, \`git add .\` or \`git commit -a\`. The tree may hold a
  person's or another agent's unfinished work, and it would ship under your
  message. Stage the paths you changed: \`git add src/invoices/late-fee.ts\`.
- Never push the default branch or force-push. Work goes on a branch and
  reaches \`main\` through a pull request somebody reviewed.
- Never rewrite history you did not create (\`reset --hard\`, \`rebase\` of a
  shared branch). It destroys work that is not committed anywhere else.

## Secrets

- Never read or copy \`.env\` files. Tests and scripts read configuration from
  the environment; \`.env.example\` documents the names with fake values.
- Never put a key, token or connection string in code, a log line, a test
  fixture or a commit message. If you find one, stop and report it.

## Code

- No comments by default. Write one only for what the code cannot say: a
  vendor bug, an external contract, a legal requirement.
- Never add a file that collects unrelated things (\`utils.ts\`, \`helpers.ts\`,
  \`constants.ts\`). Put the code in the module that owns it.

## Tests

- A bug fix gets one regression test. A new function gets tests of its
  public contract, not of every internal branch.
- Never skip, focus or snapshot a test to make a run pass, and never write a
  test without an assertion. A green run that was arranged hides the bug.`,
          },
        ],
      },
      {
        title: "Write the project guardrails from what the repository enforces",
        body: "Project guardrails come from evidence: ARCHITECTURE.md, the lint and formatter configuration, the CI workflows, past incidents. Never write a rule nobody agreed to, because the agent will follow it anyway and nobody will know where it came from.\n\nLeave out what a tool already enforces. If the linter fails on unused imports, a guardrail about unused imports is noise. The valuable rules are the ones no tool checks: a cross-module import that compiles fine and breaks the rounding rules.",
        code: [
          {
            lang: "md",
            file: ".agents/skills/project-guardrails/SKILL.md",
            code: `---
name: project-guardrails
description: Architecture, data and dependency rules specific to the Invoices API, from ARCHITECTURE.md and the CI config. Load after guardrails, before changing code under src/.
---

# Project guardrails

## Architecture

- Never import \`src/<module>/repository.ts\` from another module. Call that
  module's service, or totals skip the rounding and tax rules it applies.
  Nothing in the linter catches this.
- Never put module-specific code in \`src/shared/\`. Shared code is what two or
  more modules already use; anything else grows into a second domain layer.

## Data

- Never store or compute money as a float. Amounts are integer cents
  (\`amountCents\`), and rounding happens once, in \`invoices/totals.ts\`.
- Never write a migration that drops or renames a column in the same release
  that stops using it. The previous version is still running during deploy.

## Dependencies

- Never use npm or yarn. The lockfile and CI are pnpm; another manager
  produces a lockfile CI ignores.

<!-- Last updated: 2026-11-02 -->`,
          },
        ],
      },
      {
        title: "Make loading it part of every task",
        body: "A skill is only read when the agent decides to load it, so say plainly when that is. Put a line in AGENTS.md, and in Claude Code you can preload skills into a subagent with the `skills` field, so they are in its context from the first turn.\n\nThis is still a request. For the handful of rules that must never be broken, step 7 turns them into hooks that deny the call, and the skill keeps the reason the hook points back to.",
        code: [
          {
            tab: "OpenCode",
            lang: "md",
            file: "AGENTS.md",
            code: `## Skills

Before the first edit, command or commit of any task, load the \`guardrails\`
skill and then \`project-guardrails\`. They are not optional reading.`,
          },
          {
            tab: "Claude Code",
            lang: "md",
            file: ".claude/agents/backend-engineer.md",
            code: `---
name: backend-engineer
description: Implements API, service and data changes in src/. Use for backend tasks from an approved plan.
skills:
  - guardrails
  - project-guardrails
---

You implement backend changes in the Invoices API. Edit only the files the
task names, run \`pnpm verify\`, and report what changed and how you checked it.`,
          },
        ],
      },
    ],
    verify: [
      'Ask the agent "Commit what you just changed". It should stage named paths, never `git add -A`, and say why if you ask it to use `-A`.',
      "Ask it to make a failing webhook test pass that needs a Stripe key. It should ask for the key to be provided through the environment, not read `.env`.",
      "Ask it to fix a one-line bug. It should add one regression test and no doc comments.",
      'Ask "Which rules apply to calling the payments repository from invoices?". It should quote the project guardrail and its reason.',
    ],
    pitfalls: [
      "Writing rules without reasons. The agent cannot tell which ones bend, and either breaks them or freezes on edge cases.",
      'Copying generic best practice into project guardrails ("write clean code"). Rules nobody can check against a diff change nothing.',
      "Restating what the linter enforces. It doubles the length and hides the rules no tool checks.",
      "Treating the skill as enforcement. It is read and usually followed; the rules that must hold every time need a hook.",
    ],
    platform:
      "The harness installs `pc-guardrails-generic` (secrets, code, temporary files, tests and the engineer workflow, plus marker blocks it fills for RTK, codegraph and agentmemory) and an empty `pc-guardrails-project`. `/make-guardrails` generates the project skill from ARCHITECTURE.md and the config and CI files, then wires it into every engineer's `## Abilities`; the `pc-system-reminders` plugin blocks editing, shell and spawning until those skills are loaded.",
    links: [
      { label: "OpenCode: agent skills", href: "https://opencode.ai/docs/skills/" },
      { label: "Claude Code: skills", href: "https://code.claude.com/docs/en/skills" },
      {
        label: "Claude Code: subagent frontmatter",
        href: "https://code.claude.com/docs/en/sub-agents",
      },
      { label: "The skills CLI", href: "https://github.com/vercel-labs/skills" },
      { label: "agent-harness on this site", href: "/docs/ai#agent-harness" },
    ],
  },

  // 4. Write ARCHITECTURE.md and DESIGN.md
  {
    problem:
      "You ask for payment reminders. The agent writes an `EmailService` in `src/shared/utils.ts` that queries the invoices table directly, so reminders skip the status rules in the invoices service and go out for invoices already paid. On the screen side, it styles the reminder banner with `#3b82f6` and a drop shadow, in an app whose theme has neither.",
    sections: [
      {
        title: "Write ARCHITECTURE.md from the code, not from memory",
        body: 'ARCHITECTURE.md tells an agent what the system is made of, where each kind of code goes, and which boundaries hold. It is read before a non-trivial change, not on every turn, so it can be longer than AGENTS.md.\n\nWrite it from what the repository contains: the folders, the routes, the data model, the CI workflows. A useful order is overview, structure, components, data flow, data stores, integrations, development workflow, decisions and constraints. Mark anything you cannot find as "not evident from the repository" instead of describing what you remember.\n\nThe test for every section is whether it says what breaks when its constraint is violated. "The invoices module owns totals" describes; "anything that computes a total outside it skips tax rounding" is a constraint an agent can respect.',
        code: [
          {
            lang: "md",
            file: "ARCHITECTURE.md",
            code: `# Architecture

The Invoices API issues invoices, sends them to customers and records
payments. A modular monolith: one deployable, one PostgreSQL database, with
modules that talk to each other only through their services.

## Structure

\`\`\`
src/
  invoices/     issue, total and send invoices; owns rounding and tax
  customers/    customer records and billing contacts
  payments/     Stripe webhooks; marks invoices paid
  reminders/    scheduled reminders for overdue invoices
  shared/       http, logging and config used by every module
  generated/    Prisma client (generated)
\`\`\`

## Data flow

\`\`\`mermaid
flowchart LR
  Stripe -->|webhook| payments
  payments -->|markPaid| invoices
  reminders -->|listOverdue| invoices
  invoices --> db[(PostgreSQL)]
\`\`\`

## Constraints

- Modules call each other through \`<module>/service.ts\`. A direct repository
  import compiles, but skips the status and rounding rules the service
  applies: a reminder for a paid invoice is the usual symptom.
- Money is integer cents end to end. A float anywhere produces totals that
  differ by a cent from the PDF.
- Stripe webhooks are idempotent on \`event.id\`. Processing one twice
  without that check records a payment twice.

## Decisions

- Modular monolith over services (2025): one team, one deploy, and the
  module boundaries are kept so a module can be split out later.

## Development workflow

\`pnpm install\`, \`docker compose up db\`, \`pnpm dev\`. \`pnpm verify\` is what CI
runs on every pull request.

<!-- Last updated: 2026-11-02 -->`,
          },
        ],
      },
      {
        title: "Write DESIGN.md in a format design tools can read",
        body: "DESIGN.md describes how the product looks: the tokens (colours, type, spacing, radii) and the intent the tokens cannot carry. Google's design.md format puts the tokens in YAML frontmatter and the intent in Markdown sections: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, and Do's and Don'ts.\n\nKeep it standalone. It is handed to design tools and agents that cannot see the repository, so it never refers to a file path or a CSS variable name; it states the values.",
        code: [
          {
            lang: "md",
            file: "DESIGN.md",
            code: `---
name: Invoices
colors:
  primary: "#1F4ED8"
  surface: "#FFFFFF"
  text: "#111827"
  muted: "#6B7280"
  danger: "#B91C1C"
typography:
  body:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  heading:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: 600
rounded:
  sm: 4px
  md: 8px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
---

## Overview

A back-office tool used all day by finance teams. Dense, calm, and
predictable: tables first, colour only where it carries meaning.

## Colors

Primary is for the one main action on a screen. Danger is only for overdue
amounts and destructive actions, never for decoration.

## Elevation & Depth

Flat. Separate surfaces with a 1px border, not shadows.

## Do's and Don'ts

- Do show amounts right-aligned with tabular figures.
- Don't introduce a colour that is not listed above.`,
          },
        ],
      },
      {
        title: "Lint DESIGN.md",
        body: "The design.md project ships a linter that checks the frontmatter against the token schema and the section headings against the spec. It exits 1 on errors, so it can run in CI next to your other checks. On Windows PowerShell use the second form.",
        code: [
          {
            lang: "bash",
            code: `npx @google/design.md lint DESIGN.md

# Windows PowerShell
npx -p @google/design.md designmd lint DESIGN.md`,
          },
        ],
      },
      {
        title: "Point AGENTS.md at both, and keep them true",
        body: "Agents read these files when AGENTS.md tells them to. Say when: before a change that touches structure, before UI work. Then add the rule that keeps them alive: a change that makes either file wrong updates it in the same pull request.\n\nA `<!-- Last updated: -->` footer makes regenerating cheap. The next time you ask an agent to refresh the file, it can run `git log --since=<date>` over the source folders and rewrite only the sections that moved, leaving what a person wrote by hand alone.",
        code: [
          {
            lang: "md",
            file: "AGENTS.md",
            code: `## Context

- Before a change that adds a module, a route or a table, read
  \`ARCHITECTURE.md\`.
- Before any UI change, read \`DESIGN.md\` and use only its tokens.
- Never leave \`ARCHITECTURE.md\` or \`DESIGN.md\` saying something your change
  made false. Update the section and its \`Last updated\` footer in the same
  pull request.`,
          },
        ],
      },
    ],
    verify: [
      'Ask "Where would payment reminders go, and how would they find overdue invoices?". The agent should answer `src/reminders/` calling the invoices service, citing ARCHITECTURE.md.',
      "Ask it to add a warning banner. It should use the danger colour and a border from DESIGN.md, not a new hex value or a shadow.",
      "Run `npx @google/design.md lint DESIGN.md`. It should exit 0.",
      "Rename a module, then ask the agent to update ARCHITECTURE.md. It should change the structure and data-flow sections and the footer, and nothing else.",
    ],
    pitfalls: [
      "Writing the architecture you intend instead of the one you have. The agent follows the document and produces code that fits neither.",
      'Describing without constraining. A folder tree with no "what breaks if" gives the agent a map and no rules.',
      "Referring to file paths or CSS variable names in DESIGN.md. Tools that receive the file cannot resolve them.",
      "Generating both files once and never again. Six months later they are confidently wrong, which is worse than missing.",
    ],
    platform:
      "The harness writes placeholder ARCHITECTURE.md and DESIGN.md files. On a brownfield repository `/repo-initialize` generates both from the codebase; `/make-architecture` and `/make-design` regenerate them later, updating only the sections that moved since the `Last updated` footer, with DESIGN.md in Google's design.md format.",
    links: [
      {
        label: "design.md format and linter",
        href: "https://github.com/google-labs-code/design.md",
      },
      { label: "AGENTS.md", href: "https://agents.md" },
      { label: "agent-harness on this site", href: "/docs/ai#agent-harness" },
    ],
  },

  // 5. Create your first agents
  {
    problem:
      'You ask "How would you split the PDF renderer out of the invoices module?" and the agent starts moving files while it is still answering. Twelve files later you have a half-done refactor you did not ask for. Telling it "only plan, do not edit" works until a long session compacts that sentence away.',
    sections: [
      {
        title: "Make the planner read-only by configuration",
        body: "A plan agent should be unable to edit, not asked not to. Both OpenCode and Claude Code let you take tools away in configuration, and a tool an agent does not have cannot be called however the conversation goes.\n\nOpenCode ships two primary agents, `build` and `plan`, and you can tighten `plan` in `opencode.json`: deny edits, allow only inspection commands in the shell (the last matching pattern wins, so the catch-all goes first), and deny spawning subagents, because a planner that can call a build subagent can have it make the change for it. Claude Code has plan mode built in; to make your own planner, write a subagent whose tool list has no Edit or Write.",
        code: [
          {
            tab: "OpenCode",
            lang: "json",
            file: "opencode.json",
            code: `{
  "$schema": "https://opencode.ai/config.json",
  "agent": {
    "plan": {
      "permission": {
        "edit": "deny",
        "task": "deny",
        "bash": {
          "*": "deny",
          "git status*": "allow",
          "git diff*": "allow",
          "git log*": "allow",
          "grep *": "allow"
        }
      }
    }
  }
}`,
          },
          {
            tab: "Claude Code",
            lang: "md",
            file: ".claude/agents/planner.md",
            code: `---
name: planner
description: Read-only planner. Use before any change that touches more than one module, to produce a step-by-step plan without editing anything.
tools: Read, Glob, Grep
disallowedTools: Edit, Write
model: inherit
---

You plan changes to the Invoices API. Read ARCHITECTURE.md and the code the
change touches, then return: the files to change, the order to change them
in, the tests that prove it, and the risks. You never edit files.`,
          },
        ],
      },
      {
        title: "Write a build specialist",
        body: 'A specialist is a subagent with a narrow job: backend, frontend, migrations. In OpenCode it is a Markdown file in `.opencode/agents/` with `mode: subagent`, named after the file. In Claude Code it is a Markdown file in `.claude/agents/` with a `name` and a `description`.\n\nThe description is how the primary agent decides to delegate, so write it as "use when". Keep the body to a short identity and a contract for what it returns. The knowledge (how this repository does things) belongs in skills, which you list or preload, so it stays in one place when you add a second specialist.',
        code: [
          {
            tab: "OpenCode",
            lang: "md",
            file: ".opencode/agents/backend-engineer.md",
            code: `---
description: Implements API, service and data changes under src/. Use for backend tasks from an approved plan.
mode: subagent
temperature: 0.1
permission:
  edit: allow
  bash:
    "*": ask
    "pnpm *": allow
    "git status*": allow
    "git diff*": allow
---

You implement backend changes in the Invoices API. Load the guardrails and
project-guardrails skills first. Edit only the files your task names, run
\`pnpm verify\`, and return the files changed, the verification result and
any decision you had to make.`,
          },
          {
            tab: "Claude Code",
            lang: "md",
            file: ".claude/agents/backend-engineer.md",
            code: `---
name: backend-engineer
description: Implements API, service and data changes under src/. Use for backend tasks from an approved plan.
tools: Read, Glob, Grep, Edit, Write, Bash
model: inherit
skills:
  - guardrails
  - project-guardrails
---

You implement backend changes in the Invoices API. Edit only the files your
task names, run \`pnpm verify\`, and return the files changed, the
verification result and any decision you had to make.`,
          },
        ],
      },
      {
        title: "Add a reviewer that cannot change what it reviews",
        body: "A reviewer that can edit will fix what it finds, and then nobody reviewed the fix. Give it read access and, in OpenCode, the shell commands that show the change and nothing else.\n\nIn Claude Code, a subagent's tools are an allowlist. Leaving Bash out removes the shell entirely, so the reviewer reads the changed files the caller names instead of running `git diff` itself.",
        code: [
          {
            tab: "OpenCode",
            lang: "md",
            file: ".opencode/agents/reviewer.md",
            code: `---
description: Reviews the current branch's diff for bugs, missing tests and rule violations. Use after a build task, before a pull request.
mode: subagent
temperature: 0.1
permission:
  edit: deny
  bash:
    "*": deny
    "git diff*": allow
    "git log*": allow
---

Review the diff against main. Report each problem with file, line, why it is
wrong and what would fix it. Check it against the guardrails skills and
ARCHITECTURE.md. You never change files.`,
          },
          {
            tab: "Claude Code",
            lang: "md",
            file: ".claude/agents/reviewer.md",
            code: `---
name: reviewer
description: Reviews changed files for bugs, missing tests and rule violations. Use after a build task, before a pull request.
tools: Read, Glob, Grep
model: inherit
---

Review the files the caller names. Report each problem with file, line, why
it is wrong and what would fix it. Check them against the guardrails skills
and ARCHITECTURE.md. You never change files.`,
          },
        ],
      },
      {
        title: "Call them",
        body: "Primary agents delegate on their own when a task matches a subagent's description. You can also name one: type `@` and the agent's name in either tool, or in Claude Code ask \"use the reviewer subagent on my changes\". `claude --agent planner` starts a whole Claude Code session as that agent.\n\nIn OpenCode, `permission.task` controls which subagents an agent may spawn, with the same pattern rules as the shell. That is how the planner above is kept from handing work to a builder.",
        code: [
          {
            lang: "bash",
            code: `# Claude Code: run the whole session as the planner
claude --agent planner`,
          },
        ],
      },
    ],
    verify: [
      "In the plan agent or planner, ask it to rename a function. It should explain that it cannot edit and give the plan instead; the edit tool call should never appear.",
      "Ask the plan agent in OpenCode to run `pnpm prisma migrate dev`. The shell call should be denied.",
      "Give the primary agent a backend task. It should delegate to backend-engineer by its description, and the subagent's report should list files changed and the `pnpm verify` result.",
      "Ask the reviewer to fix a problem it found. It should report the fix and not apply it.",
    ],
    pitfalls: [
      "A read-only agent that can spawn subagents. It cannot edit, but it can ask a build subagent to, which makes it read-only by convention only.",
      "Putting project knowledge in agent bodies. Two specialists drift apart; skills keep it in one place.",
      'Vague descriptions ("helps with code"). The primary agent delegates on the description, so a vague one is delegated to at random or never.',
      'A catch-all shell pattern placed last. In OpenCode the last matching rule wins, so `"*": "allow"` at the end undoes every deny above it.',
    ],
    platform:
      "The harness overrides OpenCode's `build` and `plan` and regenerates both on every startup from `fullstack-engineer.md` (`pc-subagent-tiers`); `plan` differs by `edit: deny` and `task: deny`, and `pc-system-reminders` holds its shell to inspection commands. `/make-engineer` creates `*-engineer.md` specialists whose `## Abilities` list the skills they must load, each on a plan, build or fast model tier.",
    links: [
      { label: "OpenCode: agents", href: "https://opencode.ai/docs/agents/" },
      { label: "OpenCode: permissions", href: "https://opencode.ai/docs/permissions/" },
      { label: "Claude Code: subagents", href: "https://code.claude.com/docs/en/sub-agents" },
      { label: "agent-harness on this site", href: "/docs/ai#agent-harness" },
    ],
  },

  // 6. Work from specs with OpenSpec
  {
    problem:
      'Three weeks after a change, someone asks why late fees are calculated per invoice line instead of on the total. The commit says "fix late fees", the pull request says "see commit", and the session that made the decision is gone. The next agent asked to touch late fees reads the code, decides it is a bug, and "fixes" it back.',
    sections: [
      {
        title: "Install the CLI and initialise the repository",
        body: "OpenSpec keeps two things in the repository: `openspec/specs/`, what the system does today, and `openspec/changes/`, one folder per change in flight. The CLI needs Node.js 22.12 or later.\n\n`openspec init` creates the folders and `openspec/config.yaml`, and installs skills and slash commands for the tools you name with `--tools`. For Claude Code that is `.claude/skills/openspec-*/` and `.claude/commands/opsx/`; for OpenCode, `.opencode/skills/openspec-*/` and `.opencode/commands/opsx-*.md`. `openspec update` refreshes those files after you upgrade the CLI.",
        code: [
          {
            lang: "bash",
            code: `npm install -g @fission-ai/openspec@latest

# From the repository root
openspec init --tools opencode,claude`,
          },
        ],
      },
      {
        title: "Propose a change before writing code",
        body: "Ask for the change through the propose command: `/opsx:propose` in Claude Code, `/opsx-propose` in OpenCode. The agent writes a change folder with a proposal (why, and what changes), a design when there are decisions to record, tasks, and spec deltas: the requirements this change adds, modifies or removes.\n\nThis is the step that keeps the late-fee decision. The proposal says per line was chosen, and why; the spec delta states it as a requirement with scenarios. You review this folder before any code exists, which is much cheaper than reviewing the code.",
        code: [
          {
            lang: "md",
            file: "openspec/changes/add-late-fee/proposal.md",
            code: `# Proposal: late fees on overdue invoices

## Why

Finance adds late fees by hand in a spreadsheet, so reminders go out with
amounts that do not match the invoice, and customers dispute them.

## What changes

- An invoice overdue by more than 30 days gets a late fee of 1.5% per line.
- The fee is computed per line, not on the total, because tax-exempt lines
  are exempt from the fee by contract.
- The reminder email shows the fee as its own line.

## Impact

\`src/invoices/totals.ts\`, \`src/reminders/\`, one migration adding
\`invoice_lines.late_fee_cents\`.`,
          },
          {
            lang: "md",
            file: "openspec/changes/add-late-fee/specs/invoices/spec.md",
            code: `## ADDED Requirements

### Requirement: Late fee per line

The system SHALL add a late fee of 1.5% to each taxable line of an invoice
that is more than 30 days overdue, rounded to the cent per line.

#### Scenario: overdue invoice with a tax-exempt line

- **WHEN** an invoice with one taxable and one tax-exempt line is 31 days overdue
- **THEN** only the taxable line gets a late fee

#### Scenario: invoice paid on day 30

- **WHEN** an invoice is paid 30 days after its due date
- **THEN** no late fee is added`,
          },
        ],
      },
      {
        title: "Check the change with the CLI",
        body: "The CLI reads the same files the agents write, so you can check them without an agent. `openspec list --changes` shows what is in flight, `openspec show` prints a change (with `--deltas-only`, just its spec deltas), `openspec validate` checks the change's files against OpenSpec's format (`--strict` for the stricter check), and `openspec status --change` reports where the change stands.\n\nRun `validate` in CI over every change, so a broken spec fails the pull request rather than the archive.",
        code: [
          {
            lang: "bash",
            code: `openspec list --changes
openspec show add-late-fee --deltas-only
openspec validate add-late-fee --strict
openspec status --change add-late-fee

# In CI: every change and spec
openspec validate --all --strict`,
          },
        ],
      },
      {
        title: "Apply the tasks, then archive",
        body: "`/opsx:apply` (`/opsx-apply` in OpenCode) works through tasks.md and checks items off as they are done, so a session that stops halfway leaves an exact record of where it stopped.\n\nWhen the change is merged, archive it. `openspec archive` merges the spec deltas into `openspec/specs/` and moves the folder to `openspec/changes/archive/` with the date in front. The specs now say what the system does, and the archive says why it came to do it.",
        code: [
          {
            lang: "bash",
            code: `# Merges the deltas into openspec/specs/ and moves the change to
# openspec/changes/archive/<date>-add-late-fee/
openspec archive add-late-fee --yes`,
          },
        ],
      },
      {
        title: "Make it the default in AGENTS.md",
        body: "Agents use OpenSpec when the repository says to. Tell them when a change needs a proposal and when it does not, or every typo fix becomes a proposal and people stop using it.",
        code: [
          {
            lang: "md",
            file: "AGENTS.md",
            code: `## Changes

- A change to behaviour (a new rule, endpoint, field or screen) starts with
  an OpenSpec proposal. Wait for it to be approved before writing code.
- Bug fixes that restore specified behaviour, refactors and dependency bumps
  do not need one.
- Before changing an area, read its spec in \`openspec/specs/\`. If the code
  disagrees with the spec, ask which one is right.`,
          },
        ],
      },
    ],
    verify: [
      "Run `openspec list --changes` after a proposal. The change should be listed, and `openspec validate <change> --strict` should pass.",
      'Ask the agent "Why are late fees per line?" in a new session. It should find the answer in the spec or the archived proposal, not guess from the code.',
      "Stop a session halfway through apply. tasks.md should show exactly which tasks are checked.",
      "After archiving, `openspec/specs/invoices/spec.md` should contain the late-fee requirement and the change folder should be under `openspec/changes/archive/`.",
    ],
    pitfalls: [
      "Proposals for everything. A one-line fix with a proposal, design and specs teaches the team to skip the step for the changes that need it.",
      "Never archiving. Changes pile up in `openspec/changes/`, the specs never absorb them, and `openspec/specs/` stops describing the system.",
      "Approving the proposal without reading the spec deltas. The scenarios are what the code will be held to; the prose is not.",
      'Editing code and spec separately. When behaviour changes, the spec changes in the same pull request, or the next agent "fixes" one to match the other.',
    ],
    platform:
      "Step 6 of the agent-harness wizard runs `npx @fission-ai/openspec init`. The harness's `/plan-propose`, `/plan-apply`, `/plan-archive` and `/plan-goal` wrap the OpenSpec flow in `pc-plan-*` skills, turning a work item URL into a change and applying its tasks in parallel subagent waves; `/repo-initialize` archives a brownfield repository's history into OpenSpec.",
    links: [
      { label: "OpenSpec", href: "https://github.com/Fission-AI/OpenSpec" },
      {
        label: "OpenSpec CLI reference",
        href: "https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md",
      },
      {
        label: "OpenSpec supported tools",
        href: "https://github.com/Fission-AI/OpenSpec/blob/main/docs/supported-tools.md",
      },
      { label: "agent-harness on this site", href: "/docs/ai#agent-harness" },
    ],
  },

  // 7. Turn the nevers into hooks
  {
    problem:
      'AGENTS.md and the guardrails skill both say never `git add -A`. Forty turns into a long session, after the context has been compacted, the agent runs `git add -A && git commit -m "wip"`. That stages `.env.local` and a colleague\'s half-written migration, and the next command is `git push origin main`. Every rule was written down; none of them was in the way.',
    sections: [
      {
        title: "Pick the nevers a check on the command can express",
        body: 'A hook runs before a tool call and can refuse it. It cannot judge whether code is good, but it can recognise a command: `git add -A`, `git add .`, `git commit -a`, a push that names the default branch, `--force` without `--force-with-lease`, `git reset --hard`, anything that reads a `.env` file. If a rule can be written as a predicate over the tool\'s arguments, it belongs in a hook.\n\nEvery denial should carry the rule and the fix: "stage the paths you changed: git add <path>". The agent gets that text back as the tool result and keeps its turn, so it adapts instead of stalling or retrying the same command.\n\nA guard should fail open on its own bugs. If your hook throws on an unexpected input, it should let the call through and log, because a guard that breaks every session is worse than the rule it enforces.',
      },
      {
        title: "Start with permission rules",
        body: "Both tools have declarative permissions, and they are the cheapest place to start. In OpenCode, `permission.bash` takes command patterns where the last match wins, and `permission.read` takes path patterns; by default OpenCode already asks before reading `.env` files, and denying them makes it a rule. In Claude Code, `permissions.deny` in `.claude/settings.json` takes rules like `Bash(git push origin main)` and `Read(./.env)`, and deny rules apply without the workspace trust step.\n\nPatterns match the command text, and that is their limit. They cannot carry the reason or the fix, they do not know which branch you are on when you run a bare `git push`, and a chain like `git add -A && git commit` needs every segment checked. That is what the hook in the next section adds.",
        code: [
          {
            tab: "OpenCode",
            lang: "json",
            file: "opencode.json",
            code: `{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "bash": {
      "*": "allow",
      "git add -A*": "deny",
      "git add .": "deny",
      "git push --force *": "deny",
      "git push origin main*": "deny",
      "git reset --hard*": "deny"
    },
    "read": {
      "*": "allow",
      "*.env": "deny",
      "*.env.*": "deny",
      "*.env.example": "allow"
    }
  }
}`,
          },
          {
            tab: "Claude Code",
            lang: "json",
            file: ".claude/settings.json",
            code: `{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "deny": [
      "Bash(git add -A)",
      "Bash(git add .)",
      "Bash(git push --force *)",
      "Bash(git push origin main)",
      "Bash(git reset --hard *)",
      "Read(./.env)",
      "Read(./.env.*)"
    ]
  }
}`,
          },
        ],
      },
      {
        title: "Write the hook",
        body: "In OpenCode a hook is a plugin: a JavaScript file in `.opencode/plugins/`, loaded at startup, whose `tool.execute.before` handler sees every tool call and throws to refuse it. The error message is what the agent reads. In Claude Code it is a `PreToolUse` command hook registered in `.claude/settings.json`: Claude Code sends the call as JSON on stdin, and exiting with code 2 blocks it, with stderr as the message Claude sees.\n\nThe rules are the same in both. Split the command on `&&`, `||`, `;` and pipes so every segment is checked on its own, then test each segment. A bare `git push` asks git for the current branch, because the command alone does not say what it pushes.",
        code: [
          {
            tab: "OpenCode",
            lang: "js",
            file: ".opencode/plugins/guards.js",
            code: `import { execFileSync } from "node:child_process"

const DEFAULT_BRANCH = "main"
const ENV_REASON =
  ".env files hold real credentials. Read configuration from the environment; .env.example lists the names."

const segments = command =>
  command.split(/&&|\\|\\||;|\\||\\n/).map(part => part.trim()).filter(Boolean)

const isEnvFile = file => {
  const name = file.split(/[\\\\/]/).pop() ?? ""
  return name === ".env" || (name.startsWith(".env.") && name !== ".env.example")
}

function currentBranch(cwd) {
  try {
    return execFileSync("git", ["branch", "--show-current"], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()
  } catch {
    return ""
  }
}

function checkCommand(command, cwd) {
  for (const part of segments(command)) {
    if (/^git\\s+add\\s+(-A\\b|--all\\b|\\.(\\s|$))/.test(part))
      return "git add -A and git add . stage every change in the tree, including .env files and work that is not yours. Stage the paths you changed: git add <path> <path>."
    if (/^git\\s+commit\\b.*\\s-[a-zA-Z]*a[a-zA-Z]*\\b/.test(part))
      return "git commit -a stages every tracked change. Stage named paths, then commit without -a."
    if (/^git\\s+push\\b/.test(part) && /--force\\b/.test(part) && !/--force-with-lease\\b/.test(part))
      return "git push --force can overwrite commits someone else pushed. Use --force-with-lease."
    if (/^git\\s+push\\b/.test(part)) {
      const named = part.split(/[\\s:]+/).includes(DEFAULT_BRANCH)
      if (named || currentBranch(cwd) === DEFAULT_BRANCH)
        return "This pushes " + DEFAULT_BRANCH + ". Work goes on a branch: git switch -c feature/<name>, then open a pull request."
    }
    if (/^git\\s+reset\\s+--hard\\b/.test(part))
      return "git reset --hard discards uncommitted work that may not be yours. Revert your own paths: git checkout -- <path>."
    if (part.split(/\\s+/).some(isEnvFile)) return ENV_REASON
  }
}

export const Guards = async ({ directory }) => ({
  "tool.execute.before": async (input, output) => {
    let reason
    try {
      if (input.tool === "bash") reason = checkCommand(output.args.command ?? "", directory)
      if (input.tool === "read" && isEnvFile(output.args.filePath ?? "")) reason = ENV_REASON
    } catch (error) {
      console.error("[guards] failed open: " + error.message)
    }
    if (reason) throw new Error("[guards] " + reason)
  },
})`,
          },
          {
            tab: "Claude Code",
            lang: "js",
            file: ".claude/hooks/guards.mjs",
            code: `import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"

const DEFAULT_BRANCH = "main"
const ENV_REASON =
  ".env files hold real credentials. Read configuration from the environment; .env.example lists the names."

const segments = command =>
  command.split(/&&|\\|\\||;|\\||\\n/).map(part => part.trim()).filter(Boolean)

const isEnvFile = file => {
  const name = file.split(/[\\\\/]/).pop() ?? ""
  return name === ".env" || (name.startsWith(".env.") && name !== ".env.example")
}

function currentBranch(cwd) {
  try {
    return execFileSync("git", ["branch", "--show-current"], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()
  } catch {
    return ""
  }
}

function checkCommand(command, cwd) {
  for (const part of segments(command)) {
    if (/^git\\s+add\\s+(-A\\b|--all\\b|\\.(\\s|$))/.test(part))
      return "git add -A and git add . stage every change in the tree, including .env files and work that is not yours. Stage the paths you changed: git add <path> <path>."
    if (/^git\\s+commit\\b.*\\s-[a-zA-Z]*a[a-zA-Z]*\\b/.test(part))
      return "git commit -a stages every tracked change. Stage named paths, then commit without -a."
    if (/^git\\s+push\\b/.test(part) && /--force\\b/.test(part) && !/--force-with-lease\\b/.test(part))
      return "git push --force can overwrite commits someone else pushed. Use --force-with-lease."
    if (/^git\\s+push\\b/.test(part)) {
      const named = part.split(/[\\s:]+/).includes(DEFAULT_BRANCH)
      if (named || currentBranch(cwd) === DEFAULT_BRANCH)
        return "This pushes " + DEFAULT_BRANCH + ". Work goes on a branch: git switch -c feature/<name>, then open a pull request."
    }
    if (/^git\\s+reset\\s+--hard\\b/.test(part))
      return "git reset --hard discards uncommitted work that may not be yours. Revert your own paths: git checkout -- <path>."
    if (part.split(/\\s+/).some(isEnvFile)) return ENV_REASON
  }
}

let reason
try {
  const call = JSON.parse(readFileSync(0, "utf8"))
  if (call.tool_name === "Bash") reason = checkCommand(call.tool_input?.command ?? "", call.cwd)
  if (call.tool_name === "Read" && isEnvFile(call.tool_input?.file_path ?? "")) reason = ENV_REASON
} catch (error) {
  console.error("[guards] failed open: " + error.message)
}
if (reason) {
  console.error("[guards] " + reason)
  process.exit(2)
}`,
          },
          {
            tab: "Claude Code",
            lang: "json",
            file: ".claude/settings.json",
            code: `{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|Read",
        "hooks": [
          {
            "type": "command",
            "command": "node \\"$CLAUDE_PROJECT_DIR/.claude/hooks/guards.mjs\\""
          }
        ]
      }
    ]
  }
}`,
          },
        ],
      },
      {
        title: "Test the hook before you trust it",
        body: "A hook is code, and code with a wrong regular expression denies nothing while looking like it works. The Claude Code script reads stdin, so you can feed it a fake tool call from the terminal and check the exit code: 2 and a reason for a denied command, 0 and no output for an allowed one.\n\nFor the OpenCode plugin, restart OpenCode so it loads the file, then ask the agent to run the command. The call should come back with the `[guards]` message instead of output.",
        code: [
          {
            lang: "bash",
            code: `echo '{"tool_name":"Bash","tool_input":{"command":"git add -A && git commit -m wip"},"cwd":"."}' \\
  | node .claude/hooks/guards.mjs; echo "exit $?"
# [guards] git add -A and git add . stage every change in the tree, ...
# exit 2

echo '{"tool_name":"Bash","tool_input":{"command":"git add src/invoices/late-fee.ts"},"cwd":"."}' \\
  | node .claude/hooks/guards.mjs; echo "exit $?"
# exit 0`,
          },
        ],
      },
    ],
    verify: [
      'Ask the agent to "commit everything with git add -A". The call should be denied with the rule and the fix, and the agent should stage named paths instead.',
      "On `main`, ask it to push. A bare `git push` should be denied because the current branch is the default one.",
      "Ask it to show the contents of `.env`. Both the read tool and `cat .env` should be denied; `.env.example` should still be readable.",
      "Ask it to run `git status && git add .`. The second segment should be caught even though the first is allowed.",
    ],
    pitfalls: [
      "Checking only the start of the command. `git status && git add -A` passes a check that looks at the first word; split on `&&`, `||`, `;` and pipes.",
      "Denying without saying what to do instead. The agent retries the same command in a different spelling until one gets through.",
      "A guard that fails closed on its own exception. One malformed input and every tool call in the session is refused.",
      "Assuming the hook covers everything. A hook sees the tool call, not intent; review still catches what no predicate can express.",
    ],
    platform:
      "The harness's `pc-system-reminders` plugin denies `git add -A`, `git commit -a`, unscoped `git clean`, `git reset --hard`, pushes of the default branch, `--force` without lease and writes outside the repository, each with the rule and the fix, and fails open on its own bugs. It also blocks editing, shell and spawning until the agent's skills are loaded, and holds the plan agent's shell to inspection commands.",
    links: [
      { label: "OpenCode: plugins", href: "https://opencode.ai/docs/plugins/" },
      { label: "OpenCode: permissions", href: "https://opencode.ai/docs/permissions/" },
      { label: "Claude Code: hooks", href: "https://code.claude.com/docs/en/hooks" },
      { label: "Claude Code: settings", href: "https://code.claude.com/docs/en/settings" },
      { label: "agent-harness on this site", href: "/docs/ai#agent-harness" },
    ],
  },

  // 8. Gate the diff
  {
    problem:
      'An agent fixes a rounding bug in two lines. The diff adds fourteen tests: one marked `it.skip` because it was flaky, one that snapshots the whole invoice object, three that only check `expect(repository.save).toHaveBeenCalled()`, and a doc comment reading "Gets the invoice total" above `getInvoiceTotal`. CI is green. The reviewer gets 400 lines for a two-line fix and skims them.',
    sections: [
      {
        title: "Decide what the gate measures",
        body: "Linters check code; this checks the change. It looks only at the lines the branch adds compared with the default branch, and fails on the shapes agents produce and reviewers tire of: more comment lines than a small share of the code added, separator banners, region markers, TODOs with no issue, commented-out code, and tests that are skipped, focused, snapshots, have no assertion, or assert only that a mock was called.\n\nIt has to be deterministic: the same diff gives the same result on your laptop, in the agent's session and in CI, with no model involved. Each failure names the rule and the fix, so an agent can correct its own diff without a person explaining it.",
      },
      {
        title: "Write the script",
        body: "The script below is plain Node.js with no dependencies. It finds the merge base with the default branch, reads the added lines from `git diff -U0`, counts comment and code lines, matches the slop shapes line by line, and checks each new test block for an assertion. It prints every problem with its file, line and fix, and exits 1 if there are any. Untracked files are not in `git diff`, so stage new files before running it.\n\nKeep the rules few and obvious. A gate people argue with gets disabled; a gate whose every failure is plainly right gets obeyed, by agents and by people.",
        code: [
          {
            lang: "js",
            file: "scripts/check-diff.mjs",
            code: `import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"

const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 1 << 26 })
const base = git("merge-base", process.argv[2] ?? "origin/main", "HEAD").trim()

const SOURCE = /\\.[cm]?[jt]sx?$/
const TEST = /\\.(test|spec)\\.[cm]?[jt]sx?$/
const SKIP = /(^|\\/)(node_modules|dist|generated)\\//
const LINE_RULES = [
  ["banner", /^\\s*\\/\\/\\s*[-=*#]{5,}/, "Delete the separator."],
  ["region", /^\\s*\\/\\/\\s*#?(end)?region\\b/i, "Delete the region markers."],
  ["untracked-todo", /\\/\\/\\s*(TODO|FIXME)(?!.*(#\\d+|https?:\\/\\/))/, "Link an issue or delete the TODO."],
  ["commented-out-code", /^\\s*\\/\\/\\s*(const|let|return|if|await|import)\\b.*[;{)]\\s*$/, "Delete it; git keeps the history."],
]
const TEST_RULES = [
  ["test-skipped", /\\b(it|test|describe)\\.skip\\(|\\bx(it|describe)\\(/, "Make the test run or delete it."],
  ["test-focused", /\\b(it|test|describe)\\.only\\(/, "Remove .only: it hides every other test."],
  ["test-snapshot", /\\.toMatch(Inline)?Snapshot\\(/, "Assert the values that matter instead."],
]

const problems = []
let code = 0
let comments = 0
const files = git("diff", "--name-only", "--diff-filter=AM", base)
  .split("\\n")
  .filter(file => SOURCE.test(file) && !SKIP.test(file))

for (const file of files) {
  const isTest = TEST.test(file)
  const added = new Set()
  let line = 0
  for (const row of git("diff", "-U0", "--no-color", base, "--", file).split("\\n")) {
    const hunk = row.match(/^@@ -\\d+(?:,\\d+)? \\+(\\d+)/)
    if (hunk) line = Number(hunk[1])
    if (hunk || line === 0 || !row.startsWith("+")) continue
    const text = row.slice(1)
    added.add(line)
    const where = file + ":" + line++
    if (!text.trim()) continue
    if (/^\\s*(\\/\\/|\\/\\*|\\*)/.test(text)) comments++
    else code++
    for (const [rule, pattern, fix] of [...LINE_RULES, ...(isTest ? TEST_RULES : [])])
      if (pattern.test(text)) problems.push({ rule, where, fix })
  }
  if (!isTest) continue
  const lines = readFileSync(file, "utf8").split("\\n")
  const starts = lines.flatMap((text, i) => (/^\\s*(it|test)\\(/.test(text) ? [i] : []))
  starts.forEach((start, n) => {
    if (!added.has(start + 1)) return
    const body = lines.slice(start, starts[n + 1] ?? lines.length).join("\\n")
    const asserts = body.match(/expect\\(.*/g) ?? []
    const where = file + ":" + (start + 1)
    if (asserts.length === 0) problems.push({ rule: "test-no-assertion", where, fix: "Assert something, or delete the test." })
    else if (asserts.every(a => /toHaveBeenCalled/.test(a)))
      problems.push({ rule: "test-mock-only", where, fix: "Assert on state or output, not only that a mock was called." })
  })
}

const budget = Math.max(2, Math.floor(code * 0.1))
if (comments > budget)
  problems.push({ rule: "comment-budget", where: comments + " comment lines for " + code + " code lines", fix: "Delete comments down to " + budget + "." })

for (const p of problems) console.log(p.rule + "  " + p.where + "\\n  " + p.fix)
console.log(problems.length === 0 ? "check-diff: clean" : "check-diff: " + problems.length + " problem(s)")
process.exitCode = problems.length === 0 ? 0 : 1`,
          },
        ],
      },
      {
        title: "Run it where the agent finishes",
        body: 'The gate is most useful before the pull request exists, inside the agent\'s own loop. Add it to the `verify` script AGENTS.md already names, so "run pnpm verify before you call it done" includes it without a new rule to remember.\n\nIt needs the default branch to compare against. Locally that is usually there; in a fresh clone, `git fetch origin main` first.',
        code: [
          {
            lang: "json",
            file: "package.json",
            code: `{
  "scripts": {
    "lint": "biome check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "check:diff": "node scripts/check-diff.mjs",
    "verify": "pnpm lint && pnpm typecheck && pnpm test && pnpm check:diff"
  }
}`,
          },
        ],
      },
      {
        title: "Run it on the pull request too",
        body: "A local gate can be skipped; the same script in CI cannot. Check out the full history (the default shallow clone has no merge base) and pass the pull request's base branch.",
        code: [
          {
            lang: "yaml",
            file: ".github/workflows/check-diff.yml",
            code: `name: check-diff
on: pull_request

jobs:
  check-diff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v7
        with:
          node-version: 22
      - run: node scripts/check-diff.mjs origin/\${{ github.base_ref }}`,
          },
        ],
      },
    ],
    verify: [
      'Add `it.skip("rounds", () => {})` and a `test(...)` with no `expect` to a test file, stage it, and run `node scripts/check-diff.mjs`. It should report `test-skipped` and `test-no-assertion` and exit 1.',
      "Add a `// ==========` separator to a source file. The gate should report `banner` with the file and line.",
      "Run it on a clean branch with one real fix and one regression test. It should print `check-diff: clean` and exit 0.",
      "Ask the agent to fix a bug and call it done. Its final `pnpm verify` should include the gate, and it should fix any finding before reporting.",
    ],
    pitfalls: [
      "Running it on the whole repository instead of the diff. Old code fails it everywhere, the gate is disabled within a week, and new slop gets through with the old.",
      "A shallow clone in CI. Without the base branch's history there is no merge base and the script fails for a reason unrelated to the change.",
      "Letting it grow into a style checker. Formatting belongs to the formatter; the gate is for what agents add and linters do not see.",
      "Raising the limits whenever it fails. If a change genuinely needs more tests or a comment, the reviewer can say so; a ratio tuned until nothing fails checks nothing.",
    ],
    platform:
      "The harness ships `.opencode/scripts/check-diff.mjs`, with comment budgets, the slop shapes and the test shapes, limits overridable under `codeRules` in `.opencode/harness.json`, and `--base`, `--paths` and `--json` options. `/plan-apply` runs it with the other checks, and the Platform merge gate runs it on the pull request head; a failing result never auto-merges.",
    links: [
      {
        label: "The comments and tests gate on this site",
        href: "/docs/ai#the-comments-and-tests-gate",
      },
      { label: "git diff", href: "https://git-scm.com/docs/git-diff" },
      { label: "actions/checkout", href: "https://github.com/actions/checkout" },
      { label: "agent-harness on this site", href: "/docs/ai#agent-harness" },
    ],
  },

  // 9. Make context cheap
  {
    problem:
      'You ask "Where is the late fee calculated?". The agent greps for `fee`, gets three hundred matches across tests, fixtures and email templates, and reads forty files to find one function. Then it runs `pnpm test` and two thousand lines of passing output fill the context. The next morning, in a new session, it rediscovers from scratch the decision it made with you yesterday.',
    sections: [
      {
        title: "Index the code with codegraph",
        body: "codegraph parses the repository into a local graph of symbols and the calls between them, stored in a SQLite database under `.codegraph/`. One query returns the relevant symbols' source and the call paths between them, where grep returns every line that contains a word.\n\n`codegraph install` wires its MCP server into the agents you name; `--target` takes a comma-separated list or `auto`, and `--location=local` keeps the configuration in the project. `codegraph init` builds the index, and `codegraph sync` updates it incrementally after changes. The MCP server exposes one tool by default, `codegraph_explore`, and the same query works from the terminal.",
        code: [
          {
            lang: "bash",
            code: `# Wire the MCP server into OpenCode and Claude Code for this project
npx @colbymchenry/codegraph install --target=opencode,claude --location=local --yes

# Build the index in .codegraph/
npx @colbymchenry/codegraph init

# Ask it what you would ask the agent
npx @colbymchenry/codegraph explore "late fee calculation"
npx @colbymchenry/codegraph query LateFee --limit 10

# Index statistics, and an incremental update after changes
npx @colbymchenry/codegraph status
npx @colbymchenry/codegraph sync`,
          },
        ],
      },
      {
        title: "Keep decisions between sessions with agentmemory",
        body: "agentmemory is a local memory server. It runs on your machine at `localhost:3111`, with a viewer at `localhost:3113`, and agents reach it through an MCP bridge, `@agentmemory/mcp`. The agent saves a decision with `memory_save` and finds it again with `memory_smart_search` in a later session, instead of rediscovering it.\n\nInstall it globally (it needs Node.js 20 or newer), start it in its own terminal, and check it answers. In Claude Code the project recommends its plugin, `/plugin install agentmemory`, which wires the bridge and records session events through hooks. Otherwise add the bridge as an MCP server; OpenCode uses its own shape, with a top-level `mcp` key and the command as an array.",
        code: [
          {
            lang: "bash",
            code: `npm install -g @agentmemory/agentmemory@latest

# In a separate terminal; keep it running
agentmemory

# From another terminal
curl http://localhost:3111/agentmemory/health`,
          },
          {
            tab: "OpenCode",
            lang: "json",
            file: "opencode.json",
            code: `{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "agentmemory": {
      "type": "local",
      "command": ["npx", "-y", "@agentmemory/mcp"],
      "environment": { "AGENTMEMORY_URL": "http://localhost:3111" },
      "enabled": true
    }
  }
}`,
          },
          {
            tab: "Claude Code",
            lang: "bash",
            code: `# Inside a Claude Code session: installs the plugin, which wires
# the @agentmemory/mcp server and the capture hooks
/plugin install agentmemory`,
          },
        ],
      },
      {
        title: "Compress command output with RTK",
        body: 'RTK is a single binary that filters and compresses the output of common commands before it reaches the model: a test run reports failures, not every passing test; `git status` drops the hints. `rtk init -g` installs a hook that rewrites shell commands to their `rtk` form automatically, so the agent does not have to remember the prefix. For OpenCode add `--opencode`.\n\nAnother project named rtk exists on crates.io, so check that you installed the right one: `rtk gain` should print a savings dashboard, not "command not found" or something unrelated.',
        code: [
          {
            lang: "bash",
            code: `# macOS and Linux
brew install rtk
# Windows
winget install rtk-ai.rtk

rtk --version

# Claude Code: a PreToolUse hook that rewrites shell commands to rtk
rtk init -g
# OpenCode
rtk init -g --opencode

# Tokens saved so far
rtk gain`,
          },
        ],
      },
      {
        title: "Tell the agent when to use each",
        body: "An agent with a code index still greps if nothing tells it the index is there and when it is better. Add a short section to your guardrails skill or AGENTS.md that says which tool answers which question, and when to fall back. Say what the index does not cover, too: config files, plain-text docs and raw string searches are still grep's job.",
        code: [
          {
            lang: "md",
            file: ".agents/skills/guardrails/SKILL.md",
            code: `## Context

- To find or understand code, call \`codegraph_explore\` first with a symbol
  name or a plain question. Fall back to grep and read when it returns
  nothing, or for config files, docs and raw strings, and say that you did.
- Before working in an unfamiliar area, call \`memory_smart_search\` for
  earlier decisions. After an architectural decision, call \`memory_save\`
  with what was decided and why.
- Run CLI commands through \`rtk\` when the hook has not already done it:
  \`rtk git diff\`, \`rtk pnpm test\`.`,
          },
        ],
      },
    ],
    verify: [
      'Ask "Where is the late fee calculated, and what calls it?". The agent should call `codegraph_explore` once and answer with the function and its callers, not run grep.',
      "Run `npx @colbymchenry/codegraph status`. It should report indexed files and symbols for the repository.",
      "Ask the agent to record a decision, then open a new session and ask about it. It should find it with `memory_smart_search`.",
      "Run a test command through the agent, then `rtk gain`. The dashboard should show tokens saved for that command.",
    ],
    pitfalls: [
      "Installing the tools and never telling the agent. It keeps grepping, because nothing in its context says there is a better way.",
      "Forgetting to start agentmemory. The MCP bridge then falls back to a handful of local tools and nothing is shared across sessions.",
      "An index that is never refreshed. After a large refactor, run `codegraph sync`, or the agent is sent to functions that moved.",
      "Installing the wrong rtk. Check `rtk gain` after installing; the crates.io project with the same name is unrelated.",
    ],
    platform:
      "Step 8 of the agent-harness wizard (also `npx @plainconceptsplatform/agent-harness optimization`) offers RTK, codegraph, agentmemory, simple-english and humanizer in one checklist: it runs `codegraph install --target=opencode` and `init`, installs agentmemory and its MCP server and skill, checks that `rtk` is on the path, and injects a matching usage section for each tool into `pc-guardrails-generic`.",
    links: [
      { label: "codegraph", href: "https://github.com/colbymchenry/codegraph" },
      { label: "agentmemory", href: "https://github.com/rohitg00/agentmemory" },
      { label: "RTK", href: "https://github.com/rtk-ai/rtk" },
      { label: "OpenCode: MCP servers", href: "https://opencode.ai/docs/mcp-servers/" },
      { label: "agent-harness on this site", href: "/docs/ai#agent-harness" },
    ],
  },
];
