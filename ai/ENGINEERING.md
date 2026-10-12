# ENGINEERING

The engineering gates every Platform repository runs, how they are judged, and how they reach the Project-Health dashboard. The bar is the same for every project; what changes by project type is which practices apply.

Project-Health renders this standard as the **Engineering scorecard**: one row per project, a level from N0 to N3, a score, the gates in place, the share of AI-assisted commits, and alerts. The scorecard is computed from two sources, in this order of trust: the **Engineering Excellence facets** a repository publishes from its own CI, and, when a repository publishes none, **detection** from its workflow files (marked "Detected from workflows — no facets published"). Publishing facets is what makes a project's row a measurement rather than an inference.

## Practices

Ten practices, in two phases. The standard mode is what "green" requires.

| # | Practice | Phase | Standard mode | Usual tools | What it guarantees |
|---|---|---|---|---|---|
| 1 | Spec | Every build | Blocking | Reqnroll (.NET), playwright-bdd or Cucumber (TS) | Acceptance behaviour is written as Gherkin scenarios bound to the repository's specs (OpenSpec) and executed on every build. |
| 2 | Tests & coverage | Every build | Blocking | coverlet, `@vitest/coverage-v8`, JaCoCo, pytest-cov | Tests run on every build with a minimum line coverage per module. A plain test run without a coverage floor counts as present but weak (yellow). |
| 3 | Mutation score | Every build | Threshold | Stryker.NET, StrykerJS | Injected faults are caught: the covered-code mutation score stays above a floor. |
| 4 | Secrets | Every build | Blocking | TruffleHog (verified only) | Committed credentials fail the build. |
| 5 | Vulnerabilities (deps & IaC) | Every build | Blocking | Trivy (`fs`, CRITICAL/HIGH, ignore-unfixed) | Dependencies and infrastructure as code are scanned; critical and high fixable findings block. |
| 6 | Insecure patterns (SAST) | Every build | Blocking | Semgrep OSS (`--error`) | Static analysis blocks on insecure code patterns. |
| 7 | SBOM & licences | Every build | Policy | Syft (CycloneDX) | A software bill of materials is produced on every build, so licences and components can be checked against policy. |
| 8 | Complexity | Every build | Blocking | the complexity gate (coverlet complexity, ESLint `complexity`) | No new method above CC 15 or CRAP 30; the existing backlog may not grow. |
| 9 | DAST | After deploying to a test environment | Threshold | OWASP ZAP baseline (passive) | The deployed instance is scanned for what static tools cannot see: headers, cookies, CSP, endpoints answering without auth. |
| 10 | Performance | After deploying to a test environment | Threshold | k6, JMeter, Lighthouse CI | Response times or Lighthouse budgets hold. Only when the project requires it. |

Modes: **Blocking** fails the pipeline. **Threshold** holds a measured value above a committed floor and fails when it drops below. **Policy** produces an artefact that a policy is checked against.

## Project types and applicability

The type decides which practices count, so a project is never penalised for a practice that cannot apply to it. A practice that does not apply is shown grey and is left out of the gate count and the score. Declare the type in Project-Health's `projects.json` (`type`), and add `scorecard.notApplicable` only with a reason a reviewer would accept.

| Type | Not applicable by default | Notes |
|---|---|---|
| `back-front` | none | Web apps and APIs. |
| `browser-extension` | DAST | No deployed web surface. Gate the extension's own attack surface instead (see below). |
| `static-site` | Spec, Mutation, Complexity | Performance applies by default (Lighthouse CI). DAST is usually a passive weekly scan of production, since static sites rarely have a test environment. |
| `library` | DAST | |
| `mobile` | DAST | |
| `data` | Mutation, DAST | |
| `ml` | Spec, Mutation, DAST | |
| `other` | none | Everything applies until a type is chosen. |

"There are no specs to bind Gherkin to" is a gap, not an exemption: leave Spec applicable and red. DAST is not applicable when there is no deployed non-production environment and scanning production is not appropriate; record which one it is.

**Browser extensions** gate their manifest: a pull request that widens `permissions`, `host_permissions`, content-script matches, `externally_connectable` or `web_accessible_resources`, or weakens the CSP, fails unless it carries a matching spec or ADR change. The scorecard shows this under Vulnerabilities & IaC.

## Levels and score

Levels are cumulative, and only **green** practices count towards them. A practice that does not apply counts as met.

| Level | Requires |
|---|---|
| N1 | Secrets, Vulnerabilities and SAST green, and tests present (green or yellow). |
| N2 | N1, plus Tests & coverage, Spec and SBOM green. |
| N3 | N2, plus Mutation, DAST and Complexity green. |

Anything below N1 is **N0**. The **score** is `(green + 0.5 × yellow) / applicable × 100`, the number behind the six-month trend. **Gates** is the count of build-phase practices present (green or yellow) over those that apply.

A practice is **green** when it is present in its standard mode and its last result on the default branch passed (or its threshold is met). It is **yellow** when it is present but weaker than the standard (report-only where blocking is expected, a test run without coverage), when a threshold is not met, or when there is no recent result (older than 14 days). It is **red** when it applies but is absent, or when a blocking practice fails on the default branch.

**Alerts.** "High AI usage, low engineering" fires when AI usage is 4/5 or more and the level is N1 or below: AI-assisted change is landing without the gates that would catch its mistakes. AI usage is the share of the month's default-branch commits that are AI-assisted (co-author trailers from Claude, Copilot, Codex, Cursor, Devin, Gemini, Windsurf, and agent or bot authors other than Dependabot, Renovate and `github-actions[bot]`), bucketed at 10, 25, 50 and 75%. "Engineering declining" fires when the score drops 10 points or more over three months.

## Thresholds and ratchets

Floors are set from a **measured baseline**, just below it, and only ever move up. A comment next to each floor records the baseline, the run it came from and every ratchet since. Never lower a floor to go green.

- **Coverage:** a line-coverage floor per module (per assembly in .NET, per package in TS), measured on the merged report of every suite that runs in CI.
- **Mutation:** the floor applies to the **covered-code** score, `(killed + timeout) / (killed + timeout + survived)`. Mutants with no coverage are a coverage problem, already measured, and are reported separately as a backlog. Mutation runs weekly and on dispatch, never on every PR; a PR-diff run is a useful report-only addition.
- **Complexity:** every method must satisfy **CC ≤ 15** (McCabe's 10, extended to the 15 NIST SP 500-235 allows) and **CRAP ≤ 30**, where `CRAP = CC² × (1 − coverage)³ + CC`. Complexity is allowed only when it is tested in proportion: CC 15 needs about 60% coverage, CC 20 about 71%, and CC 30 or more never passes. The existing backlog lives in a committed baseline file; a baselined method may stay but may not get worse, and the baseline only shrinks. A comment `complexity-justified: <reason> (#<issue>)` within five lines above a method exempts it, and the gate lists every exemption in the run summary. Generated code (`obj/`, `*.g.cs`, `*.designer.cs`) is excluded.
- **DAST:** passive baseline only, never an active scan against an environment holding real or append-only data. Start report-only, triage the first baseline, then make it blocking.

Gates must be **required status checks** on the default branch (a repository ruleset: pull request required, the blocking checks required, no force-push or deletion, repository admins as the only bypass). A gate that is not required only reports.

## Engineering Excellence facets

A repository publishes one artifact per facet from its **default branch**, named `engineering-excellence-<facet>` and containing `<facet>.json`. Facets are `coverage`, `complexity`, `mutation`, `security`, `sbom` and `hygiene`. The contract, an envelope `{schemaVersion, facet, repo, ref, commitSha, runId, runAttempt, generatedAt, data}` plus one schema per facet, is canonical in Project-Health (`schema/engineering-excellence-facets.schema.json`). Repositories vendor a copy and validate against it before uploading.

Facets **never gate**. The floors are judged by the gates; a facet records what they saw, pass or fail, and is uploaded even when a gate fails, because a drop is the data point most worth keeping. Retention is 90 days; the Project-Health collector runs daily and keeps the history, so nothing is lost when artifacts expire. The `security` facet's `jobs` are, by contract, the results of the **blocking** scanner jobs, so a scanner the facet reports counts as blocking whatever its workflow line looks like.

The reference implementation is in Atlas (`scripts/engineering-excellence.mjs`, `scripts/lib/`, `scripts/check-complexity.mjs`) and is vendored into each repository with a header pointing back to it.

## Adoption checklist

Each line is a yes or no. A repository has adopted the standard when every applicable line is yes.

- [ ] The project type is declared, and every practice marked not applicable has a recorded reason.
- [ ] Spec: Gherkin scenarios bound to specs run on every PR, and a scenario tag that matches no spec fails the run.
- [ ] Coverage: a merged report is gated by per-module floors, with the baseline recorded next to them.
- [ ] Mutation: a weekly run with covered-code floors, uploading its facet from a full run on the default branch.
- [ ] Secrets, Vulnerabilities and SAST run blocking on every PR; suppressions name a tracking issue.
- [ ] An SBOM is produced on every build of the default branch.
- [ ] The complexity gate runs on every PR against a committed baseline seeded from CI.
- [ ] DAST runs against a deployed test environment where one exists.
- [ ] The facets are produced by workflows that run on push to the default branch.
- [ ] The blocking checks are required by a ruleset on the default branch.
- [ ] Security findings the gates surface but cannot safely fix are open issues, not suppressions.

## Known pitfalls

Traps that cost real runs while the standard was rolled out. Each one looks like a different problem than it is.

**A pull request or push made with `GITHUB_TOKEN` triggers no workflows.** Symptom: a bot's release or update PR sits with required checks that never start, so it can never merge; or a tag pushed by a workflow never fires the deploy listening for it. Cause: GitHub suppresses events caused by `GITHUB_TOKEN` to prevent loops. Fix: mint a GitHub App token (`actions/create-github-app-token`) for anything that must trigger CI. Keep `GITHUB_TOKEN` deliberately where *not* triggering is the point, such as a release tag that must not auto-deploy to production.

**Steps run with `bash -e`, so `set -uo pipefail` does not stop an early exit.** Symptom: a step meant to "never fail on its own" (a scanner that records its exit code for a later gate) aborts at the scanner's pipeline, and every later step (report upload, leak check, gate) is skipped. Cause: Actions runs `bash --noprofile --norc -eo pipefail {0}`; setting other options leaves `-e` on. Fix: `set +e` explicitly before the command whose exit code you capture. Atlas#1947.

**`download-artifact` with a pattern that matches one artifact extracts it flat.** Symptom: an aggregation job that expects `<dir>/<artifact-name>/…` finds nothing and publishes an empty result. Cause: with several matches each artifact gets its own folder, with exactly one it lands directly in `path`. Fix: read both layouts, and fail rather than publish when nothing is found. Numa run 38204016134, Atlas#1949.

**DAST right after a deploy scans the old process, then the platform's error pages.** Symptom: header findings such as "Strict-Transport-Security not set" whose every instance is a `502 Bad Gateway`. Cause: without deployment slots, App Service keeps the old process answering for about a minute after a zip deploy, and a short "200 three times" probe can pass on it. Fix: before scanning, wait until the health endpoint reports the commit just deployed, then require a longer streak of 200s; when alerts sit only on 5xx responses, wait and scan once more, and report a persistent taint as an unstable target, never as a finding. Atlas#1947.

**Required status check names must match exactly, and the context differs between pull requests and the default branch.** Symptom: a ruleset waits forever for a check, or a renamed job blocks every merge. Cause: required checks match on the job's `name`, and a workflow called through `workflow_call` on the default branch (CI inside a CD pipeline) reports under a prefixed context. Fix: copy the contexts from a real PR's checks, and treat a required job's `name` as an API.

**Seed every baseline from CI's merged coverage, never from a local run.** Symptom: a gate that was green locally fails on its first CI run, or the reverse. Cause: CI merges unit, integration and acceptance coverage; a local unit-only run measures a different, lower number, and CRAP moves with coverage. Fix: download the coverage artifact from the PR's first CI run and seed or prune the baseline from it.

**Generated code dominates complexity.** Symptom: the top hotspots are methods nobody wrote, such as `[GeneratedRegex]` matchers at CC 1,600. Fix: exclude `obj/`, `*.g.cs` and designer files from complexity and module breakdowns, while the gated assembly coverage keeps its usual number.

**Callbacks share one identity.** Symptom: in TS, every anonymous function in a file maps to the same baseline key, so a new complex callback hides behind an old one. Fix: name callbacks by their innermost enclosing named function (`UsersTab/anonymous`).

**Detection that reads only workflow YAML misses what scripts do.** Symptom: a scanner invoked as `bash scripts/security/sast.sh` with `--error` inside the script reads as report-only; a Reqnroll suite run by a plain `dotnet test` reads as "no spec". Fix: publish facets, which carry the gate's own verdict, and do not rename steps to satisfy detection.

**Agent merges can be refused.** Symptom: an automation that opens, verifies and merges its own pull requests is stopped with "Merge Without Review". Cause: an agent's permission policy treats merging an unreviewed PR as a human decision. Fix: plan for a human merge step where the policy applies, and never route around it.

<!-- Last updated: 2026-10-12 -->
