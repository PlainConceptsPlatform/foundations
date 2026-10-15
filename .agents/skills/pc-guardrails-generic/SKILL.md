---
name: pc-guardrails-generic
description: Generic guardrails, foundational rules that all agents follow. Users add specialized guardrails skills for specific concerns. Covers secrets, code quality, security, tool usage, and engineer workflow.
license: MIT
---

## Transitive loads (optimization skills)

The marker sections below name the optimization skills this project selected. Load each before doing any work.

## Secrets

- Treat `.env` files as write-only: write to them when configuring, read credentials at runtime from the environment or secret store.
- Never put a credential, API key, or token in a log line, output, or commit in anything but encrypted or template form.

## Code

- Zero comments by default. Write one only for what the code cannot show and we do not control: a vendor bug, an external contract, a legal rule. Leave every file you touch with no comment slop, old or new.
- Never add a file that collects unrelated things — `constants.js`, `types.ts`, `utils.ts`. One responsibility per file, split by domain. A file importing from many unrelated modules is already the symptom.

## Temporary files

- Never write outside `$REPO_ROOT` or an OS temp directory: the next agent cannot see it and nobody cleans it up. Scratch goes under `$REPO_ROOT/.opencode/.tmp/` (enforced by pc-system-reminders).
- Never report a `.tmp/` path as a deliverable. Copy or move the artifact to its repository path first. Never leave scratch files behind unless they are evidence for a failure you are reporting.

## Tests

- Never write more tests than the change requires. A bug fix gets one regression test. A new function gets tests for its public contract, not every internal branch. Never aim for a coverage number.
- Never test framework or library internals. Test your code's contract, not that EF Core saves a tracked entity.
- Never generate integration, e2e, or snapshot tests unless explicitly asked. Mock nothing you do not own — use a fake that records state. Never add a test that duplicates a type-check or linter rule.
- `node .opencode/scripts/check-diff.mjs` enforces the comment and test rules on the diff and must exit 0.

<!-- PC-GUARDRAILS-RTK-START -->
## RTK

- Prefix CLI commands with `rtk` (`rtk git diff`, `rtk pnpm test`); it strips the output down to what matters. Read-only commands like `cat`, `ls` and `Get-Content` are exempt.
<!-- PC-GUARDRAILS-RTK-END -->

<!-- PC-GUARDRAILS-CODEGRAPH-START -->
## CodeGraph

- `codegraph_explore` replaces grep, glob and read for anything indexed: one call returns the relevant symbols' verbatim, line-numbered source plus the call paths between them, where finding the same thing by hand takes a dozen. Give it a symbol name, a file path, or a plain question.
- Fall back to grep, glob and read when it returns nothing, or for what it does not index: config files, plain-text docs, `.env` patterns, raw string searches. Say that it returned nothing when you do.
- It is an MCP server, not a CLI. Never run `codegraph` in bash.
<!-- PC-GUARDRAILS-CODEGRAPH-END -->

<!-- PC-GUARDRAILS-MEMORY-START -->
## Agentmemory

- Cross-session context lives in the agentmemory MCP tools: `memory_smart_search` for prior decisions before working somewhere unfamiliar, `memory_save` for architecture decisions and anything the next agent will need, plus `memory_sessions` and `memory_governance_delete`.
- It is an MCP server, not a CLI. Never run `agentmemory` in bash; start it with `agentmemory` in a separate terminal and use the tools.
<!-- PC-GUARDRAILS-MEMORY-END -->

<!-- PC-GUARDRAILS-SIMPLE-ENGLISH-START -->
## Simple English (optimization skill)

- Apply Simplified Technical English to all prose: `skill("simple-english")`. Editing, shell and spawning stay blocked until it is loaded (pc-system-reminders).
- Keep code blocks, identifiers, CLI commands, file paths, quoted errors, and product names exact.
<!-- PC-GUARDRAILS-SIMPLE-ENGLISH-END -->

<!-- PC-GUARDRAILS-HUMANIZER-START -->
## Humanizer (optimization skill)

- Load `skill("humanizer")` before writing prose (commit messages, PR descriptions, docs, proposals); unhumanized prose reads as machine-written. Editing, shell and spawning stay blocked until it is loaded (pc-system-reminders).
- Never apply it to code, config files, or terminal output: prose only.
<!-- PC-GUARDRAILS-HUMANIZER-END -->

## Engineer workflow (when spawned)

The lead puts your task IDs and their text in your prompt. Two things about that are not up to you:

- Load every skill under your `## Abilities` before you start, guardrails first, one `skill` call per `@skill-name`. Editing, shell and spawning are blocked until you have (pc-system-reminders).
- Edit only files in your assigned scope, then return: task IDs done, files changed, tests and lint result, decisions made. Then exit. Never poll for more work or claim a task the lead did not give you.
