---
name: platform-new-project
description: Create a new Plain Concepts Platform app in an empty repository as a member of the Platform app family. Reads Kitchen-Sink's BLUEPRINT.md and its platform contract (.platform/contract.yml), takes the owned platform paths from the Kitchen-Sink template with Copier, reuses what the contract lists before building, then installs the harness, the workflows and the quality gates. Without access to Kitchen-Sink, builds an own design app from the public Foundations rules instead. Use when the user says "create a new Platform project", "new app from Kitchen-Sink", "start a project from the blueprint", or asks for a new Platform product app from scratch. For an existing codebase use platform-onboard.
---

# Platform New Project

Create a new Platform app. The default is a **family app**: built in Kitchen-Sink's shape around the new project's own domain, with its platform code taken from the Kitchen-Sink template so it stays identical to the other family apps. Kitchen-Sink is private; when it is not accessible, the fallback at the end builds an **own design** app from the public rules.

Kitchen-Sink's `BLUEPRINT.md` is the authority for building the app: the capabilities, the interview, the build steps, what to leave behind, and what the person must create. This skill does not restate it. It adds the family steps around it, and says where the template replaces a step of the blueprint.

The template's `.platform/contract.yml` is the authority for what the template owns and what the app must reuse. Read it; never work from a remembered list of paths.

## 1. Check access

```bash
gh api repos/PlainConceptsPlatform/Kitchen-Sink --jq .full_name
git ls-remote https://github.com/PlainConceptsPlatform/Kitchen-Sink.git 'refs/tags/v*'
```

Both must succeed. If either fails, tell the person that Kitchen-Sink needs access to the PlainConceptsPlatform organisation, and either wait for access or, if they agree, follow [Without access](#without-access-own-design-from-the-public-rules).

Also check that the repository is empty or holds only a README and a licence, and that `copier --version` is 9.4 or newer (`pipx install copier`).

## 2. Read

1. Kitchen-Sink `BLUEPRINT.md`, to the end, before writing anything: `gh api repos/PlainConceptsPlatform/Kitchen-Sink/contents/BLUEPRINT.md -H "Accept: application/vnd.github.raw"`.
2. Everything it lists under "Read, in this order", including Foundations `ai/ARCHITECTURE.md` ("Platform family", "API surfaces", "REST").
3. Kitchen-Sink's `.platform/contract.yml` at the latest `v*` tag: `gh api "repos/PlainConceptsPlatform/Kitchen-Sink/contents/.platform/contract.yml?ref=<tag>" -H "Accept: application/vnd.github.raw"`. Note:
   - `owned`: the gitwildmatch globs the template owns. The app never writes or renames inside them.
   - `reuse.docs`, `reuse.packages` and `reuse.names`: what to read and reuse before building anything (step 4).
   - `source.changes`: where a change to an owned path is asked for.
   - `exceptions`: the app's exceptions file, empty for a new app.
   - `sync`: the marker, the version file and key, and the update command the template sync runs.

Kitchen-Sink also carries `.platform/manifest`, one owned glob per line. It is a legacy mirror of `owned` for older tool versions; do not read it when the contract is there.

Where the blueprint and Foundations disagree, the blueprint is the version that runs. Note the disagreement in the final report so Foundations can be corrected.

## 3. Ask

Ask the blueprint's questions in **one** message (its "Ask the person before writing code" and "How to ask" sections) and wait for the answers. Every family module is mandatory, so do not offer to drop one; only the choices the blueprint marks as varying are questions.

## 4. Build

Follow the blueprint's build steps, with these differences for a family app:

1. **Owned paths come from the template, first.** Before any app code:

   ```bash
   copier copy --trust -d app_name=<Name> -d app_slug=<name> --vcs-ref <latest v* tag> https://github.com/PlainConceptsPlatform/Kitchen-Sink.git .
   ```

   This writes only the contract's `owned` paths, the contract itself among them, and `.copier-answers.yml`. Commit it on its own.
2. **Reuse before you build.** Before designing any screen, endpoint or component:
   - read every path under `reuse.docs` (`docs/platform/` in the family), and link to it instead of describing its topics again;
   - list the exports of every package under `reuse.packages` (the `exports` of its `package.json` and the names its type declarations export, from `node_modules`), and import them instead of writing your own: a data table, a form field, a dialog, the theme;
   - treat every name under `reuse.names` the same way.

   Every plan you write has a "What is reused" section naming what it takes from these, and a new file never shadows a reusable name.
3. **Never rename inside an owned path.** Owned paths are neutral (`apps/api/src/Platform/**`, `apps/web/src/shared/platform/**`): they carry no app name and must stay byte-identical to the template. Where the blueprint says to copy and rename Kitchen-Sink, apply that only to files outside `owned`.
4. **App files plug into the platform through its ports**: the permission catalog, the feature catalog, the audit event list, the settings. Those are the new project's own files, written for its domain.
5. **REST from the first endpoint**: HAL-FORMS with `_links` and `_templates`, built by the platform helper, each template keyed by its action name; the SPA renders actions from `_templates` and sends the resource's `version` as `If-Match`. A state transition is a `PUT` on a noun sub-resource, never a verb in the path.
6. **Platform versions** come from `Directory.Packages.Platform.props` and the pnpm `platform` catalog. Do not pin a platform package in the app's own `Directory.Packages.props` or `package.json`.
7. **Readiness, not a smoke test.** Register a readiness probe with `AddReadinessProbe` for each read the app cannot work without, a one-row read through its real Application services (the template's own probes are the example). The deploy's readiness gate is the smoke test: there is no `SMOKE_TOKEN_PRE`, no `SMOKE_PATHS` and no Entra smoke role to create. A probe gates every replica, so do not register a dependency another system owns unless the app is no use without it.
8. **Settings the platform reads from the app's configuration.** Set `Platform:TrustedProxies` and `Platform:ForwardLimit` (for an internal Container Apps instance behind the shared Application Gateway: `0.0.0.0/0,::/0` and `2`; empty in `appsettings.Development.json`), because unset the platform trusts nothing and every caller shares the sign-in rate limit. List any anonymous SPA page in `Platform:AnonymousPages`. Set `Csp:AllowSameOriginFrames=true` only if the SPA frames sandboxed content of its own. Name the platform's audit events differently with `PlatformAuditActions` only when there is history to keep. A new app needs no `Platform:LegacySsoPurposes`.
9. **Web slots.** Pass the shell the app's `logo` and, when the app has more than one guided tour, a list of tours with a `scope` path prefix each. Wrap the platform's `test-support` helpers in the app's own `test-support` rather than copying them, and list the platform `setup.ts` in Vitest `setupFiles`.

## 5. Install what is installed, never copy it

1. Harness: `npx @plainconceptsplatform/agent-harness@latest`, then `/repo-initialize`. From 3.8.0 it reads the contract: it writes the "Reuse before you build" block into `AGENTS.md`, denies agent edits to owned paths, and `check-diff` reports `platform-file` and `reuse-shadow`.
2. Workflows: `npx @plainconceptsplatform/workflows@latest add <routes>`, then `node scripts/compile-agent-workflows.mjs`.
3. Templates: `npx @plainconceptsplatform/workflows@latest add --template quality-gates`, `--template platform-template` and `--template app-ci-dotnet-next`. Leave the floors in `quality.config.json` unset until the first CI run, then set them just below what it measured. The template sync and the conformance guard read the contract; nothing about Kitchen-Sink is configured by hand.
4. Regenerate the documents: `/make-architecture`, `/make-design`, `/make-guardrails`. The app's `ARCHITECTURE.md` describes its own domain, has the blueprint's "Capabilities kept" section, and links to the `reuse.docs` paths for the platform capabilities instead of restating them.

## 6. Done means

- Everything in the blueprint's "Done means" holds.
- The version the contract's `sync.version` points at (`_commit` in `.copier-answers.yml`) is the latest Kitchen-Sink tag.
- Every owned path is identical to that tag (`node scripts/check-platform-conformance.mjs --compare` passes), and the exceptions file is absent or empty: a new app starts with no exceptions.
- `AGENTS.md` carries the "Reuse before you build" block, and nothing in the app re-implements an export of a `reuse.packages` package.
- The quality-gates template is installed and the first CI run is green.
- `/api/v1/ready` answers 200 with the probes registered, and the deploy has no smoke secret. `Platform:TrustedProxies` is set for every deployed environment.

Hand the person the blueprint's list of what they must create (environments, cloud resources, the app registration, the ruleset, the workflow secrets), filled in for this project, with the repository variables `PRE_ENVIRONMENT` and `PRO_ENVIRONMENT` if the GitHub environments are not called `pre` and `pro`, and the `discover.yml` command from Foundations "Adopt in your project" to register the repository in Project-Health.

## Without access: own design from the public rules

Do not reconstruct Kitchen-Sink from memory or from fragments: an imitation of the template is not the template, and it cannot be updated by it. Build an own design app from what is public, and say so to the person.

1. Read Foundations `ai/ARCHITECTURE.md`, `ai/DESIGN.md`, `ai/ENGINEERING.md` and `ai/DOCUMENTATION.md`. They define the stack, the structure, the backend layers, the API surfaces, REST, feature flags and the search-engine rules.
2. Ask the person for the name, the domain (users, main records, the first two or three things a person does), the roles and the environments, in one message.
3. Build the structure those documents describe: a .NET modular monolith (Domain, SharedKernel, Application ports, Infrastructure services, a thin Api, Aspire AppHost and ServiceDefaults) and a React SPA built by Next.js as a static export with react-router, FSD with `pages/` checked by Steiger, inversify-hooks, react-i18next, and the theme from `@plainconceptsplatform/ui-theme` (Foundations `README.md`). Reuse `@plainconceptsplatform/ui-components` before writing a component of your own.
4. Install the harness, the workflows and the quality-gates template, as in step 5. There is no contract, so skip `platform-template`.
5. Tell the person the app is **own design**: its platform code is its own. When access to Kitchen-Sink is available it can join the family with `platform-onboard` (Route A), which replaces that code with the template's one capability at a time.
