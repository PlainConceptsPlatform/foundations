# Agentic workflows

Workflow templates, the CLI, and the router live in [`PlainConceptsPlatform/agentic-workflows`](https://github.com/PlainConceptsPlatform/agentic-workflows).

## What moved

The copyable templates that used to live here (router, workers, shared imports, composite actions, the route matrix, the classifier) are now installed and maintained through the CLI in that repository.

## Install workflows in a repository

Install and configure [`agent-harness`](https://github.com/PlainConceptsPlatform/agent-harness) first: the workers call the skills and commands it provides.

```bash
# Interactive TUI for route and template selection (recommended)
npx @plainconceptsplatform/workflows@latest

# Every route, non-interactively
npx @plainconceptsplatform/workflows@latest add triage refine implement apply-review merge-gate audit release

# Refresh exactly the installed routes, keeping each worker's env: values
npx @plainconceptsplatform/workflows@latest update --dry-run
npx @plainconceptsplatform/workflows@latest update
```

There are seven routes: `triage`, `refine`, `implement`, `merge-gate`, `apply-review`, `audit` and `release`. The `direct` and `propose` routes and the `feature` label flow were retired.

The CLI installs into `.github/workflows/`, `.github/actions/`, and the repository root, always including `opencode.ci.json` and `scripts/compile-agent-workflows.mjs`. It generates the router from the installed route set. Compile with `node scripts/compile-agent-workflows.mjs`, not with bare `gh aw compile`.

## If the repository is not on GitHub

For a repository without GitHub Actions, [`PlainConceptsPlatform/loop-task`](https://github.com/PlainConceptsPlatform/loop-task) runs the same kind of agent work on a schedule from any machine.
