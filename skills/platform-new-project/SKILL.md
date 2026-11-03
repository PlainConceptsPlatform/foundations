---
name: platform-new-project
description: Create a new Plain Concepts Platform app in an empty repository as a member of the Platform app family. Reads Kitchen-Sink's BLUEPRINT.md, takes the platform code from the Kitchen-Sink template with Copier, then installs the harness, the workflows and the quality gates. Without access to Kitchen-Sink, builds an own design app from the public Foundations rules instead. Use when the user says "create a new Platform project", "new app from Kitchen-Sink", "start a project from the blueprint", or asks for a new Platform product app from scratch. For an existing codebase use platform-onboard.
---

# Platform New Project

Create a new Platform app. The default is a **family app**: built in Kitchen-Sink's shape around the new project's own domain, with its platform code taken from the Kitchen-Sink template so it stays identical to the other family apps. Kitchen-Sink is private; when it is not accessible, the fallback at the end builds an **own design** app from the public rules.

Kitchen-Sink's `BLUEPRINT.md` is the authority for building the app: the capabilities, the interview, the build steps, what to leave behind, and what the person must create. This skill does not restate it. It adds the family steps around it, and says where the template replaces a step of the blueprint.

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
3. Kitchen-Sink's `.platform/manifest` at the latest `v*` tag, so you know which paths the template owns.

Where the blueprint and Foundations disagree, the blueprint is the version that runs. Note the disagreement in the final report so Foundations can be corrected.

## 3. Ask

Ask the blueprint's questions in **one** message (its "Ask the person before writing code" and "How to ask" sections) and wait for the answers. Every family module is mandatory, so do not offer to drop one; only the choices the blueprint marks as varying are questions.

## 4. Build

Follow the blueprint's build steps, with these differences for a family app:

1. **Platform paths come from the template, first.** Before any app code:

   ```bash
   copier copy --trust --defaults -d app_name=<Name> https://github.com/PlainConceptsPlatform/Kitchen-Sink.git .
   ```

   This writes only the manifest paths and `.copier-answers.yml`. Commit it on its own.
2. **Never rename inside a platform path.** Platform paths are neutral (`apps/api/src/Platform/**`, `apps/web/src/shared/platform/**`): they carry no app name and must stay byte-identical to the template. Where the blueprint says to copy and rename Kitchen-Sink, apply that only to files outside the manifest.
3. **App files plug into the platform through its ports**: the permission catalog, the feature catalog, the audit event list, the settings. Those are the new project's own files, written for its domain.
4. **REST from the first endpoint**: HAL-FORMS with `_links` and `_templates`, built by the platform helper; the SPA renders actions from `_templates`.
5. **Platform versions** come from `Directory.Packages.Platform.props` and the pnpm `platform` catalog. Do not pin a platform package in the app's own `Directory.Packages.props` or `package.json`.

## 5. Install what is installed, never copy it

1. Harness: `npx @plainconceptsplatform/agent-harness@latest`, then `/repo-initialize`.
2. Workflows: `npx @plainconceptsplatform/workflows@latest add <routes>`, then `node scripts/compile-agent-workflows.mjs`.
3. Quality gates: `npx @plainconceptsplatform/workflows@latest add --template quality-gates`. Leave the floors in `quality.config.json` unset until the first CI run, then set them just below what it measured.
4. Regenerate the documents: `/make-architecture`, `/make-design`, `/make-guardrails`. The app's `ARCHITECTURE.md` describes its own domain, has the blueprint's "Capabilities kept" section, and links to `docs/platform/` for the platform capabilities instead of restating them.

## 6. Done means

- Everything in the blueprint's "Done means" holds.
- `.copier-answers.yml` names the latest Kitchen-Sink tag.
- Every manifest path is identical to that tag, and `.platform/exceptions.yml` is absent or empty: a new app starts with no exceptions.
- The quality-gates template is installed and the first CI run is green.

Hand the person the blueprint's list of what they must create (environments, cloud resources, the app registration, the ruleset, the workflow secrets), filled in for this project, and the `discover.yml` command from Foundations "Adopt in your project" to register the repository in Project-Health.

## Without access: own design from the public rules

Do not reconstruct Kitchen-Sink from memory or from fragments: an imitation of the template is not the template, and it cannot be updated by it. Build an own design app from what is public, and say so to the person.

1. Read Foundations `ai/ARCHITECTURE.md`, `ai/DESIGN.md`, `ai/ENGINEERING.md` and `ai/DOCUMENTATION.md`. They define the stack, the structure, the backend layers, the API surfaces, REST, feature flags and the search-engine rules.
2. Ask the person for the name, the domain (users, main records, the first two or three things a person does), the roles and the environments, in one message.
3. Build the structure those documents describe: a .NET modular monolith (Domain, SharedKernel, Application ports, Infrastructure services, a thin Api, Aspire AppHost and ServiceDefaults) and a React SPA built by Next.js as a static export with react-router, FSD with `pages/` checked by Steiger, inversify-hooks, react-i18next, and the theme from `@plainconceptsplatform/ui-theme` (Foundations `README.md`).
4. Install the harness, the workflows and the quality-gates template, as in step 5.
5. Tell the person the app is **own design**: its platform code is its own. When access to Kitchen-Sink is available it can join the family with `platform-onboard` (Route A), which replaces that code with the template's one capability at a time.
