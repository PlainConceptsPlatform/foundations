import type { StepGuide } from "./types";

/**
 * The guides behind the project-health layer, in the order of its steps. Every hand route uses
 * the GitHub REST API, the gh CLI, Actions artifacts and a small script; project-health itself
 * only appears in `platform`.
 */
export const HEALTH_GUIDES: StepGuide[] = [
  // 1. Measure delivery
  {
    problem:
      "The monthly review of the invoices API opens with someone saying the team ships a lot, because the pull request count went up. Nobody can say how many times production changed in October, or how long the fix for the rounding bug, written on a Monday, took to reach users. The figures people do quote come from the CI page, where a re-run counts as two releases and a red pipeline counts as a failed one.",
    sections: [
      {
        title: "Decide what counts as a release",
        body: "Delivery in DORA terms is about production, so first decide which records say that production changed. On GitHub that is the Deployments API: every deployment carries the commit it shipped (`sha`), the ref it came from (`ref`), the environment it went to (`environment`) and when it was created (`created_at`). A workflow job that references an environment creates a deployment when it runs, so if your deploy job declares `environment: production` the records already exist, and you can read them without changing anything.\n\nEnvironment names differ between repositories: `production`, `prod`, `live`, one per region. List the ones the repository really uses before you pick one, because a wrong guess produces a metric that is quietly meaningless rather than visibly broken.\n\nThe last command matters more than it looks. A token that lacks the Deployments read permission can answer 404 instead of 403, and an empty list then reads as a project that never deploys. If the list is empty, check the token before you believe it.",
        code: [
          {
            lang: "bash",
            code: `# Which environments does this repository deploy to, and how often?
gh api "repos/{owner}/{repo}/deployments?per_page=100" --paginate \\
  --jq '.[].environment' | sort | uniq -c

# The production records: when, which commit, from which ref, by whom.
gh api "repos/{owner}/{repo}/deployments?environment=production&per_page=100" --paginate \\
  --jq '.[] | [.created_at, .sha[0:7], .ref, (.creator.login // "-")] | @tsv'

# Commits that produced more than one record (re-runs, one record per region).
gh api "repos/{owner}/{repo}/deployments?environment=production&per_page=100" --paginate \\
  --jq '.[].sha' | sort | uniq -c | sort -rn | head`,
          },
        ],
      },
      {
        title: "Count releases, not records, over the days that have passed",
        body: "A release is a distinct commit that reached production, not a deployment record. A re-run, a multi-region rollout or a tag deployed after its branch can each create several records for the same commit, and counting records inflates every number derived from them. Group by `sha` and keep the earliest record: that is the moment the commit arrived.\n\nIf your pipeline creates the record before it deploys, a record can exist for a deploy that never finished. Read the latest status of such a deployment: its `state` is one of `error`, `failure`, `inactive`, `pending`, `success`, `queued` or `in_progress`. Decide once whether a release needs a `success` status to count, and apply it to every month.\n\nA month in progress is not a month. Nine releases in the first twenty days divided by thirty-one days understates the pace, so divide by the days that have elapsed and mark the month as partial.",
        code: [
          {
            lang: "bash",
            code: `# Releases per month: one per commit, at the time of its first record.
gh api "repos/{owner}/{repo}/deployments?environment=production&per_page=100" --paginate \\
  --jq '.[] | {sha, created_at}' \\
| jq -s 'group_by(.sha) | map(min_by(.created_at))
         | group_by(.created_at[0:7])
         | map({month: .[0].created_at[0:7], releases: length})'

# The latest status of one deployment, when you need to know it finished.
gh api "repos/{owner}/{repo}/deployments/1834729305/statuses" \\
  --jq 'max_by(.created_at) | .state'`,
          },
        ],
      },
      {
        title: "Measure change lead time from the commit to production",
        body: "DORA defines change lead time as the time from a change being committed to it running in production. Compare each release with the one before it: the commits between the two shipped in this release, and each one's lead time is the release time minus the date it was written. A commit is attributed once, to the first release that carried it.\n\nReport percentiles, not an average. One commit that sat on a branch for three weeks should show up in the 90th percentile, not drag the whole month. The script below writes the month as JSON, with every metric either present with data or absent with a reason. It uses `gh api`, so it runs with whatever account `gh auth login` set up.\n\nThe compare endpoint returns at most 250 commits without paging parameters, so the script asks for pages of 100 and lets `--paginate` follow them. The first release in the history has nothing to compare against and is skipped rather than guessed.",
        code: [
          {
            lang: "js",
            file: "scripts/delivery.mjs",
            code: `// Usage: node scripts/delivery.mjs acme/invoices-api production 2026-10
import { execFileSync } from "node:child_process";

const [repo, environment, month] = process.argv.slice(2);
if (!repo || !environment || !month) {
  console.error("Usage: node scripts/delivery.mjs <owner/repo> <environment> <yyyy-mm>");
  process.exit(2);
}

// Every page of a listing, as one array of pages.
const pages = (path) =>
  JSON.parse(
    execFileSync("gh", ["api", "--paginate", "--slurp", path], {
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
    }),
  );

const HOUR = 3_600_000;
const from = new Date(\`\${month}-01T00:00:00Z\`);
const to = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1));
const now = Date.now();

// One release per commit, at the time of its first deployment record.
const records = pages(
  \`repos/\${repo}/deployments?environment=\${encodeURIComponent(environment)}&per_page=100\`,
).flat();
const firstSeen = new Map();
for (const record of records) {
  const at = Date.parse(record.created_at);
  if (!firstSeen.has(record.sha) || at < firstSeen.get(record.sha)) firstSeen.set(record.sha, at);
}
const history = [...firstSeen]
  .map(([sha, at]) => ({ sha, at }))
  .sort((a, b) => a.at - b.at);
const inMonth = history.filter((r) => r.at >= from.getTime() && r.at < to.getTime());

// A month in progress is divided by the days that have passed, not by the whole month.
const elapsedDays = Math.max((Math.min(to.getTime(), now) - from.getTime()) / (24 * HOUR), 1);

const deploymentFrequency =
  inMonth.length === 0
    ? { available: false, reason: \`No commit reached \${environment} in \${month}.\` }
    : {
        available: true,
        releases: inMonth.length,
        perWeek: Math.round((inMonth.length / elapsedDays) * 7 * 100) / 100,
      };

// Change lead time: each commit counts once, against the first release that carried it.
const leadHours = [];
for (const release of inMonth) {
  const previous = history[history.indexOf(release) - 1];
  if (!previous) continue; // the first release ever has nothing to compare against
  for (const page of pages(\`repos/\${repo}/compare/\${previous.sha}...\${release.sha}?per_page=100\`)) {
    for (const { commit } of page.commits) {
      const written = commit.author?.date ?? commit.committer?.date;
      const hours = written ? (release.at - Date.parse(written)) / HOUR : -1;
      if (hours >= 0) leadHours.push(hours);
    }
  }
}

const percentile = (sorted, p) => {
  const rank = (p / 100) * (sorted.length - 1);
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  return sorted[low] + (sorted[high] - sorted[low]) * (rank - low);
};
const sorted = leadHours.sort((a, b) => a - b);
const round = (n) => Math.round(n * 10) / 10;

const changeLeadTime =
  sorted.length === 0
    ? { available: false, reason: \`No commit could be attributed to a release in \${month}.\` }
    : {
        available: true,
        commits: sorted.length,
        p50Hours: round(percentile(sorted, 50)),
        p75Hours: round(percentile(sorted, 75)),
        p90Hours: round(percentile(sorted, 90)),
      };

const refused =
  "A repository cannot tell which releases needed immediate intervention in production.";

console.log(
  JSON.stringify(
    {
      repo,
      environment,
      month,
      partialMonth: now < to.getTime(),
      elapsedDays: Math.round(elapsedDays),
      deploymentFrequency,
      changeLeadTime,
      changeFailRate: { available: false, reason: refused },
      failedDeploymentRecoveryTime: { available: false, reason: refused },
    },
    null,
    2,
  ),
);`,
          },
        ],
      },
      {
        title: "No deployments yet: releases and merged pull requests",
        body: "Some repositories publish GitHub releases instead of recording deployments. A published, non-draft, non-prerelease release is a reasonable stand-in for a release to production if, and only if, publishing it is what deploys it. Say which source you used beside the number, because a release that was published and never deployed is not a delivery.\n\nThe same compare call works between two tags, so lead time can be computed from releases with the script above by swapping the source of the history.\n\nMerged pull requests answer a different question. The time from a pull request being opened to being merged is merge lead time, and it stops before production. It is worth having when nothing deploys yet, but report it under its own name and never mix it into change lead time: it starts later and ends earlier, so it always looks better.",
        code: [
          {
            lang: "bash",
            code: `# Published releases, oldest first.
gh api "repos/{owner}/{repo}/releases?per_page=100" --paginate \\
  --jq '.[] | select(.draft == false and .prerelease == false) | [.published_at, .tag_name] | @tsv' \\
| sort

# The commits one release added, with the date each was written.
gh api "repos/{owner}/{repo}/compare/v1.14.0...v1.15.0?per_page=100" --paginate \\
  --jq '.commits[] | [.sha[0:7], .commit.author.date] | @tsv'

# Merge lead time for October, in hours: a different metric, labelled as such.
gh pr list --state merged --search "merged:2026-10-01..2026-10-31" --limit 1000 \\
  --json number,createdAt,mergedAt \\
  --jq '.[] | [.number, (((.mergedAt | fromdate) - (.createdAt | fromdate)) / 3600 | floor)] | @tsv'`,
          },
        ],
      },
      {
        title: "Store the month, and refuse what you cannot know",
        body: "Write one file per month and commit it, for example `delivery/2026-10.json`. Deployment records live as long as the repository, but the decisions you made about them (which environment, which statuses count) should be frozen with the numbers they produced.\n\nTwo DORA metrics do not belong in the file. Change fail rate and failed deployment recovery time both need to know that a release caused a problem in production that needed immediate intervention, which is a fact about the running service and not about the repository. A red pipeline is a different thing: it fails before anything ships, and a deploy job that went green can still have broken production. A pipeline-based change fail rate reads as zero, or as noise, forever.\n\nDeployment rework rate is the exception that survives, because whoever ships an unplanned release can say so at the time with a label such as `hotfix`. With no label, record the absence rather than a rate of zero.",
        code: [
          {
            lang: "json",
            file: "delivery/2026-10.json",
            code: `{
  "repo": "acme/invoices-api",
  "environment": "production",
  "month": "2026-10",
  "partialMonth": false,
  "elapsedDays": 31,
  "deploymentFrequency": { "available": true, "releases": 14, "perWeek": 3.16 },
  "changeLeadTime": {
    "available": true,
    "commits": 61,
    "p50Hours": 20.4,
    "p75Hours": 49.8,
    "p90Hours": 126.1
  },
  "reworkRate": {
    "available": false,
    "reason": "No release in October carried the hotfix label."
  },
  "changeFailRate": {
    "available": false,
    "reason": "A repository cannot tell which releases needed immediate intervention in production."
  },
  "failedDeploymentRecoveryTime": {
    "available": false,
    "reason": "A repository cannot tell which releases needed immediate intervention in production."
  }
}`,
          },
        ],
      },
    ],
    verify: [
      "Pick one month and count the distinct commits in the production list by hand: the script's `releases` equals that count, not the number of records.",
      "Open the compare view for one release in the browser (`/compare/<previous>...<release>`): the oldest commit's age at release time is no larger than the month's maximum lead time.",
      "Run the script during the current month: `partialMonth` is true and `perWeek` uses the elapsed days, so it does not drop on the first day of the next month.",
      "Run it against an environment name that does not exist: every block reads `available: false` with a reason, and no zero appears anywhere.",
    ],
    pitfalls: [
      "Counting deployment records instead of distinct commits. A re-run or a rollout to three regions triples deployment frequency without anything new shipping.",
      "Dividing a month in progress by the whole month. The current month then always looks like the slowest one.",
      "Using a red pipeline as change fail rate. A failed pipeline never reached production, so the rate measures CI flakiness, and a release that broke production behind a green job does not count at all.",
      "Letting a missing value become zero. A project with no production environment then tops the table for fastest lead time; keep the block absent with a reason, and sort it last.",
    ],
    platform:
      "project-health's collector reads the production and staging deployments named in each project's `projects.json` entry, groups them into one release per commit, and reports deployment frequency over elapsed days, change lead time at p50, p75 and p90, issue to staging as a separate number, and rework rate from a `hotfix` label, while refusing change fail rate and recovery time outright. To adopt it, read BLUEPRINT.md in PlainConceptsPlatform/project-health and adopt it.",
    links: [
      {
        label: "DORA metrics: the five definitions",
        href: "https://dora.dev/guides/dora-metrics/",
      },
      {
        label: "REST API: deployments",
        href: "https://docs.github.com/en/rest/deployments/deployments",
      },
      {
        label: "REST API: deployment statuses",
        href: "https://docs.github.com/en/rest/deployments/statuses",
      },
      {
        label: "REST API: compare two commits",
        href: "https://docs.github.com/en/rest/commits/commits#compare-two-commits",
      },
      {
        label: "Managing environments for deployment",
        href: "https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments",
      },
      { label: "Health: Delivery", href: "/docs/health/delivery" },
    ],
  },

  // 2. Publish engineering facets
  {
    problem:
      "Coverage on the invoices API is read off a pull request comment when someone remembers to look. It was 81% in March and nobody can say what it was in May. The week a refactor dropped it to 64%, the coverage gate failed, the job stopped, and no number was recorded at all, so the one sample that mattered is the one that is missing.",
    sections: [
      {
        title: "One envelope for every report",
        body: "A facet is a small JSON report CI writes about one aspect of the code: `coverage`, `complexity`, `mutation`, `security`, `sbom` or `hygiene`. Each tool has its own output format, so wrap every report in the same envelope: which facet it is, which repository and ref produced it, which commit, which run and attempt, when it was written, and the data itself.\n\nThe envelope is what makes the reports readable later without knowing the tool. A reader can check that a report came from this repository's default branch before trusting its numbers, keep one sample per commit, and prefer the latest attempt of a re-run. Rates and scores are fractions from 0 to 1, never percentages, so every facet compares the same way.\n\nKeep the data shape stable and give it a version. A breaking change bumps `schemaVersion`, and a reader ignores a version it does not know rather than misreading it.",
        code: [
          {
            lang: "json",
            file: "coverage.json",
            code: `{
  "schemaVersion": 1,
  "facet": "coverage",
  "repo": "acme/invoices-api",
  "ref": "refs/heads/main",
  "commitSha": "9f2c4e1b7a0d3c5e8f6a1b2c3d4e5f6a7b8c9d0e",
  "runId": 11873402291,
  "runAttempt": 1,
  "generatedAt": "2026-10-14T09:41:27.512Z",
  "data": {
    "scopes": {
      "api": {
        "lineRate": 0.83,
        "branchRate": 0.71,
        "linesCovered": 4150,
        "linesValid": 5000,
        "floor": 0.8,
        "modules": {
          "invoices": { "lineRate": 0.91, "branchRate": 0.8, "linesCovered": 2275, "linesValid": 2500 },
          "payments": { "lineRate": 0.75, "branchRate": 0.62, "linesCovered": 1875, "linesValid": 2500 }
        }
      }
    },
    "global": { "lineRate": 0.83, "linesCovered": 4150, "linesValid": 5000 },
    "passed": true
  }
}`,
          },
        ],
      },
      {
        title: "Write the facet from the tool's own output",
        body: "The facet script reads what the tool already wrote and copies it into the envelope. It does not run the tool and it does not judge the result beyond recording whether the floor held. Here the tool is Vitest with the `json-summary` coverage reporter, which writes `coverage/coverage-summary.json` with covered and total counts for every file and a `total` entry.\n\nTwo rules keep the script honest. It never fails the job, because the gate is the gate and a facet only records what the gate saw. And when the tool's report is missing, it writes nothing: a facet that is not there reads as not available, which is true, while a facet full of zeros reads as a disaster that never happened.\n\nThe envelope helper is shared, so the other facets use the same fields from the same `GITHUB_*` variables Actions sets on every run.",
        code: [
          {
            lang: "ts",
            file: "vitest.config.ts",
            code: `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["src/**"],
    },
  },
});`,
          },
          {
            lang: "js",
            file: "scripts/lib/envelope.mjs",
            code: `import { writeFileSync } from "node:fs";

/** Wraps one facet's data in the envelope every facet shares, and writes <facet>.json. */
export function writeFacet(facet, data) {
  const env = process.env;
  const envelope = {
    schemaVersion: 1,
    facet,
    repo: env.GITHUB_REPOSITORY ?? null,
    ref: env.GITHUB_REF ?? null,
    commitSha: env.GITHUB_SHA ?? null,
    runId: env.GITHUB_RUN_ID ? Number(env.GITHUB_RUN_ID) : null,
    runAttempt: env.GITHUB_RUN_ATTEMPT ? Number(env.GITHUB_RUN_ATTEMPT) : null,
    generatedAt: new Date().toISOString(),
    data,
  };
  writeFileSync(\`\${facet}.json\`, \`\${JSON.stringify(envelope, null, 2)}\\n\`);
  return envelope;
}`,
          },
          {
            lang: "js",
            file: "scripts/facet-coverage.mjs",
            code: `// Reads Vitest's json-summary report and writes coverage.json. It never fails the job.
import { existsSync, readFileSync } from "node:fs";
import { relative, sep } from "node:path";
import { writeFacet } from "./lib/envelope.mjs";

const SUMMARY = "coverage/coverage-summary.json";
const FLOOR = Number(process.env.COVERAGE_FLOOR ?? "0.8");

if (!existsSync(SUMMARY)) {
  console.log(\`No \${SUMMARY}: the tests did not get far enough to measure, so no facet is written.\`);
  process.exit(0);
}

const summary = JSON.parse(readFileSync(SUMMARY, "utf8"));
const rate = (covered, total) => (total === 0 ? null : covered / total);

// A module is a folder under src/: src/invoices/approve.ts belongs to "invoices".
const totals = {};
for (const [file, counts] of Object.entries(summary)) {
  if (file === "total") continue;
  const parts = relative(process.cwd(), file).split(sep);
  const name = parts[0] === "src" && parts.length > 2 ? parts[1] : "root";
  const t = (totals[name] ??= { lines: 0, linesCovered: 0, branches: 0, branchesCovered: 0 });
  t.lines += counts.lines.total;
  t.linesCovered += counts.lines.covered;
  t.branches += counts.branches.total;
  t.branchesCovered += counts.branches.covered;
}

const modules = Object.fromEntries(
  Object.entries(totals).map(([name, t]) => [
    name,
    {
      lineRate: rate(t.linesCovered, t.lines),
      branchRate: rate(t.branchesCovered, t.branches),
      linesCovered: t.linesCovered,
      linesValid: t.lines,
    },
  ]),
);

const { lines, branches } = summary.total;
const lineRate = rate(lines.covered, lines.total);
const data = {
  scopes: {
    api: {
      lineRate,
      branchRate: rate(branches.covered, branches.total),
      linesCovered: lines.covered,
      linesValid: lines.total,
      floor: FLOOR,
      modules,
    },
  },
  global: { lineRate, linesCovered: lines.covered, linesValid: lines.total },
  passed: lineRate !== null && lineRate >= FLOOR,
};

writeFacet("coverage", data);
console.log(\`coverage.json: line rate \${lineRate}, floor \${FLOOR}, passed \${data.passed}\`);`,
          },
        ],
      },
      {
        title: "Upload from the default branch, even when the gate fails",
        body: "Order the steps so that the facet cannot be lost. The tests run and write their report. The facet step runs whatever happened before it (`!cancelled()`), so a failed test run still gets its chance. The floor is a separate step that reads the facet's verdict and fails the job. The upload runs after it, again with `!cancelled()`, so a red floor still leaves a sample: a drop is the sample most worth keeping.\n\nUpload from the default branch only. A pull request run measures code that may never merge, and mixing its numbers into the history makes the trend describe branches instead of the product. The pull request still runs the gate; it only keeps its facet to itself.\n\nOne artifact per facet, named `engineering-excellence-<facet>` and holding a single `<facet>.json`, makes the reports findable by name later, whichever workflow uploaded them.",
        code: [
          {
            lang: "yaml",
            file: ".github/workflows/ci.yml",
            code: `name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci

      - name: Tests with coverage
        run: npx vitest run --coverage

      # The facet records what the tests saw, whatever happened above.
      - name: Write coverage facet
        if: \${{ !cancelled() }}
        run: node scripts/facet-coverage.mjs
        env:
          COVERAGE_FLOOR: "0.8"

      # The gate is its own step, so a red floor cannot stop the facet being written.
      - name: Coverage floor
        run: node -e "process.exit(require('./coverage.json').data.passed ? 0 : 1)"

      # Default branch only, and even when the floor failed.
      - name: Upload coverage facet
        if: \${{ !cancelled() && github.ref == 'refs/heads/main' }}
        uses: actions/upload-artifact@v4
        with:
          name: engineering-excellence-coverage
          path: coverage.json
          if-no-files-found: warn
          retention-days: 90`,
          },
        ],
      },
      {
        title: "The other facets, and reading them back",
        body: "The other five follow the same pattern with a different tool's output: `complexity` from your complexity report (percentiles, methods over the threshold, the worst hotspots), `mutation` from the mutation tester's killed and survived counts, `security` from the verdicts of the blocking scanner jobs, `sbom` from the component count of the bill of materials, and `hygiene` from the duplication report. Produce only the facets you have. Three honest facets are better than six where half are placeholders.\n\nArtifacts expire, usually after 90 days, so they are a mailbox, not an archive. Something has to read them and keep the history: a scheduled job in another repository, or a script you run monthly. List the artifacts by name, keep the ones that have not expired and came from `main` of this repository rather than a fork's branch of the same name, and download one per commit.\n\nWhen a commit has several samples because its run was re-run, keep the one with the highest `runAttempt`. And check `repo` and `ref` in every envelope before using its numbers: a renamed prefix or a fork uploading under the same name would otherwise put another codebase's coverage on this one.",
        code: [
          {
            lang: "bash",
            file: "scripts/collect-facets.sh",
            code: `#!/usr/bin/env bash
# Copies every coverage facet from main into history/<commit>.json, once per commit.
set -euo pipefail
facet=coverage
mkdir -p history tmp

gh api "repos/{owner}/{repo}/actions/artifacts?name=engineering-excellence-$facet&per_page=100" --paginate \\
  --jq '.artifacts[]
        | select(.expired == false
                 and .workflow_run.head_branch == "main"
                 and .workflow_run.repository_id == .workflow_run.head_repository_id)
        | "\\(.workflow_run.id) \\(.workflow_run.head_sha)"' \\
| while read -r run sha; do
    [ -f "history/$sha.json" ] && continue
    gh run download "$run" -n "engineering-excellence-$facet" -D "tmp/$run"
    mv "tmp/$run/$facet.json" "history/$sha.json"
  done

# The trend: when each sample was written, its line rate, and whether the floor held.
jq -r '[.generatedAt, .data.global.lineRate, .data.passed] | @tsv' history/*.json | sort`,
          },
        ],
      },
    ],
    verify: [
      "After a push to main, `gh api \"repos/{owner}/{repo}/actions/artifacts?name=engineering-excellence-coverage\" --jq '.artifacts[0].workflow_run.head_branch'` prints `main`, and a pull request run adds no artifact of that name.",
      "Raise `COVERAGE_FLOOR` above the real rate on main: the job goes red and the artifact is still uploaded, with `passed: false`.",
      "Break the tests so no coverage report is written: the job is red and no coverage facet exists for that commit, rather than one full of zeros.",
      "Open one downloaded `coverage.json`: `repo`, `ref` and `commitSha` match the run that uploaded it, and every rate is between 0 and 1.",
    ],
    pitfalls: [
      "Making the facet gate. A facet script that exits non-zero, or a pipeline that fails on a facet value, turns a record into a second gate nobody owns; the floors belong to the gates.",
      "Uploading only on success. The default `if` skips the upload when a gate fails, which throws away exactly the drop you wanted to see.",
      "Writing a zero when the tool did not run. A missing facet means not measured; a zero means measured and terrible, and it pulls every average down with it.",
      "Treating artifacts as the history. They expire, so a dashboard that reads them directly forgets everything older than the retention period.",
    ],
    platform:
      'project-health reads the `engineering-excellence-<facet>` artifacts of every project that sets `"engineeringExcellence": { "enabled": true }`, validates them against its canonical `schema/engineering-excellence-facets.schema.json`, ignores any whose `repo` or `ref` does not match, keeps one sample per commit in the month file, and scores the Engineering scorecard as measured rather than inferred. To adopt it, read BLUEPRINT.md in PlainConceptsPlatform/project-health and adopt it; the reference producer is vendored from Atlas.',
    links: [
      { label: "actions/upload-artifact", href: "https://github.com/actions/upload-artifact" },
      {
        label: "REST API: list artifacts for a repository",
        href: "https://docs.github.com/en/rest/actions/artifacts#list-artifacts-for-a-repository",
      },
      { label: "gh run download", href: "https://cli.github.com/manual/gh_run_download" },
      { label: "Engineering standard: the facet contract", href: "/docs/reference/engineering" },
      { label: "Health: Engineering", href: "/docs/health/engineering" },
    ],
  },

  // 3. Measure autonomy
  {
    problem:
      "The agents on the invoices API opened thirty pull requests last month, and the team says the agents help a lot. Every one of them was merged by the tech lead after reading the diff, so the pipeline is autonomous only on paper. Or the opposite happens: the merge gate merges everything, two changes are reverted the next morning, and nobody connects the reverts to the gate.",
    sections: [
      {
        title: "Find the agent's pull requests by something it always does",
        body: "Autonomy is measured on merged pull requests the agent wrote, so the first job is to find them reliably. Pick a mark the agent always leaves and a person never does: a title prefix such as `[bot]`, or the GitHub App the agent opens pull requests as. A label is weaker, because people add and remove labels by hand.\n\nSearch treats brackets as punctuation, so a search for `[bot]` matches titles containing the word bot. Narrow with search, then check the prefix yourself. If the agent opens pull requests as an App, the `author:app/<name>` qualifier finds them exactly.\n\nCount merged pull requests, not opened ones. An agent that opens forty pull requests and gets four merged is not more autonomous than one that opens ten and gets nine.",
        code: [
          {
            lang: "bash",
            code: `# Merged in October, titled by the agent, with who merged each one.
gh pr list --state merged --search "merged:2026-10-01..2026-10-31" --limit 1000 \\
  --json number,title,mergedBy,mergedAt \\
  --jq '.[] | select(.title | startswith("[bot]")) | [.number, .mergedBy.login, .mergedAt[0:10], .title] | @tsv'

# The same, when the agent opens pull requests as a GitHub App.
gh pr list --state merged --search "author:app/invoices-agent merged:2026-10-01..2026-10-31" \\
  --limit 1000 --json number,mergedBy --jq '.[] | [.number, .mergedBy.login] | @tsv'`,
          },
        ],
      },
      {
        title: "Classify each merge by who merged it and the gate's last verdict",
        body: "Every merged agent pull request ends in one of three ways. **Merged by the gate**: the merge gate merged it and nobody was involved. **Parked, then merged by a person**: the gate's last verdict sent it to a person, and a person merged it. **Merged by a person**: someone merged it without the gate ever parking it. Only the first is autonomy; the other two are useful work that still needed someone.\n\nTwo facts decide it. Who merged it is `mergedBy`, compared with the accounts your gate merges as. What the gate decided has to be written somewhere you can read back: the simplest is a comment with a hidden marker and a verdict line. Read the last such comment, not the first, because a gate that parks a pull request and later approves it after a fix has changed its mind.\n\nNormalise logins before comparing them. The REST API names an App `invoices-merge-gate[bot]`, while `gh` and GraphQL can name the same account `app/invoices-merge-gate`.",
        code: [
          {
            lang: "md",
            file: "a merge gate comment",
            code: `<!-- merge-gate -->
**Verdict:** human-review

The change renumbers existing invoices in a migration. Merging it unseen would rewrite
numbers customers already hold, so a person should confirm the plan first.`,
          },
          {
            lang: "js",
            file: "scripts/autonomy.mjs",
            code: `// Usage: node scripts/autonomy.mjs acme/invoices-api 2026-10
import { execFileSync } from "node:child_process";

const [repo, month] = process.argv.slice(2);
const GATE_ACCOUNTS = ["invoices-merge-gate"]; // the accounts your merge gate merges as
const PARKED = ["human-review", "owner-review", "blocked"]; // verdicts that hand it to a person
const MARKER = "<!-- merge-gate -->";

const gh = (args) =>
  execFileSync("gh", args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
const pages = (path) => JSON.parse(gh(["api", "--paginate", "--slurp", path])).flat();
const login = (actor) => (actor?.login ?? "").replace(/^app\\//, "").replace(/\\[bot\\]$/, "");

const year = Number(month.slice(0, 4));
const first = \`\${month}-01\`;
const last = new Date(Date.UTC(year, Number(month.slice(5, 7)), 0)).toISOString().slice(0, 10);

const merged = JSON.parse(
  gh([
    "pr", "list", "--repo", repo, "--state", "merged", "--limit", "1000",
    "--search", \`merged:\${first}..\${last}\`,
    "--json", "number,title,mergedBy,mergeCommit",
  ]),
).filter((pr) => pr.title.startsWith("[bot]"));

// The verdict that stands is the gate's last comment, not its first.
function lastVerdict(number) {
  const comments = pages(\`repos/\${repo}/issues/\${number}/comments?per_page=100\`)
    .filter((c) => c.body?.includes(MARKER))
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  return comments.at(-1)?.body.match(/Verdict:\\*\\*\\s*([a-z-]+)/i)?.[1].toLowerCase() ?? null;
}

const outcomes = { gate: 0, parked: 0, person: 0 };
const rows = merged.map((pr) => {
  const verdict = lastVerdict(pr.number);
  const outcome = GATE_ACCOUNTS.includes(login(pr.mergedBy))
    ? "gate"
    : PARKED.includes(verdict)
      ? "parked"
      : "person";
  outcomes[outcome] += 1;
  return { number: pr.number, outcome, verdict, mergedBy: login(pr.mergedBy) };
});

// Reverts can land after the month ends, so read main from the first day until now.
const byMergeCommit = new Map(
  merged.filter((pr) => pr.mergeCommit).map((pr) => [pr.mergeCommit.oid, pr.number]),
);
const reverted = new Set();
for (const { commit } of pages(\`repos/\${repo}/commits?sha=main&since=\${first}T00:00:00Z&per_page=100\`)) {
  for (const match of commit.message.matchAll(/This reverts (?:commit )?([0-9a-f]{40})/g)) {
    if (byMergeCommit.has(match[1])) reverted.add(byMergeCommit.get(match[1]));
  }
}

const total = merged.length;
console.log(
  JSON.stringify(
    {
      repo,
      month,
      mergedBotPullRequests: total,
      outcomes,
      mergedByGateShare: total === 0 ? null : Math.round((outcomes.gate / total) * 1000) / 1000,
      revertedSoFar: [...reverted].sort((a, b) => a - b),
      pullRequests: rows,
    },
    null,
    2,
  ),
);`,
          },
        ],
      },
      {
        title: "Count reverts, and keep them beside the share",
        body: "The share merged by the gate is only worth having while nothing it merged has to be undone. So count, beside it, how many merged agent pull requests were later reverted. The two are read together: the share should climb as the gate earns trust, and the reverted count has to stay flat while it does. A share that climbs with reverts climbing too means the gate got more permissive, not better.\n\n`git revert` starts the new commit's message with `This reverts commit <full sha>.` by default, so a revert can be matched to the merge commit of the pull request it undid, which the script reads as `mergeCommit`. If your team reverts some other way, match whatever that leaves behind instead, and check one real revert by hand before you trust the count.\n\nReverts arrive late. A change merged on 30 October and reverted on 2 November belongs to October, so recompute the reverted count for recent months rather than freezing it the day the month ends.",
        code: [
          {
            lang: "bash",
            code: `# Revert commits on main since October began, with the commit each one undid.
gh api "repos/{owner}/{repo}/commits?sha=main&since=2026-10-01T00:00:00Z&per_page=100" --paginate \\
  --jq '.[] | select(.commit.message | test("This reverts (commit )?[0-9a-f]{40}"))
        | [.sha[0:7], .commit.author.date[0:10], (.commit.message | capture("This reverts (commit )?(?<sha>[0-9a-f]{40})").sha[0:7])]
        | @tsv'`,
          },
        ],
      },
      {
        title: "Report the share with its denominator",
        body: "Write the month with the three counts, the share, and the reverts. Always show the counts beside the share: two out of two is 100%, and so is forty out of forty, and only one of them says anything. With a handful of merges in a month, show the counts and leave the share out of any comparison between projects.\n\nA month with no merged agent pull requests has no share. Record `null` and say why, rather than 0%, which would claim the gate refused everything.\n\nThis is a monthly record of merges. If your gate also keeps its own scoreboard of verdicts, that is a different number (verdicts, not merged pull requests, over a different window), so label each with what it counts.",
        code: [
          {
            lang: "json",
            file: "autonomy/2026-10.json",
            code: `{
  "repo": "acme/invoices-api",
  "month": "2026-10",
  "mergedBotPullRequests": 27,
  "outcomes": { "gate": 19, "parked": 6, "person": 2 },
  "mergedByGateShare": 0.704,
  "revertedSoFar": [418],
  "pullRequests": [
    { "number": 402, "outcome": "gate", "verdict": "auto-merge", "mergedBy": "invoices-merge-gate" },
    { "number": 409, "outcome": "parked", "verdict": "human-review", "mergedBy": "maria-lopez" },
    { "number": 418, "outcome": "gate", "verdict": "auto-merge", "mergedBy": "invoices-merge-gate" }
  ]
}`,
          },
        ],
      },
    ],
    verify: [
      "The three outcome counts add up to `mergedBotPullRequests`, and that equals the number of `[bot]` pull requests GitHub's own list shows as merged in the month.",
      "Open three pull requests from the output, one per outcome, and check by hand who merged each and what the gate's last comment said.",
      "A pull request a person opened and merged does not appear at all, however its title reads after the prefix check.",
      "Revert one gate-merged pull request in a test repository with `git revert`: it appears in `revertedSoFar` on the next run.",
    ],
    pitfalls: [
      "Counting parked-then-merged as autonomy. A person read it and decided, which is the opposite of what the share is meant to show.",
      "Reading the gate's first verdict instead of its last. A pull request parked and later approved after a fix was merged by the gate's final decision.",
      "Comparing logins without normalising them. `app/invoices-merge-gate` and `invoices-merge-gate[bot]` are the same account, and a mismatch moves every gate merge into merged by a person.",
      "Reporting the share without the reverted count. A share can be pushed up by making the gate more permissive, and only the reverts show that it was.",
    ],
    platform:
      "project-health's Agentic tab finds each month's merged `[bot]` pull requests, classifies them from `merged_by` against the gate's App identities and the last `<!-- agent-merge-gate -->` verdict, and shows the share merged by the gate beside harness and workflow versions checked against npm; the reverted count lives in the workflows' Needs a human digest. To adopt it, read BLUEPRINT.md in PlainConceptsPlatform/project-health and adopt it.",
    links: [
      {
        label: "gh pr list: flags and JSON fields",
        href: "https://cli.github.com/manual/gh_pr_list",
      },
      {
        label: "Searching issues and pull requests",
        href: "https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests",
      },
      {
        label: "REST API: pull requests",
        href: "https://docs.github.com/en/rest/pulls/pulls#list-pull-requests",
      },
      {
        label: "REST API: list commits",
        href: "https://docs.github.com/en/rest/commits/commits#list-commits",
      },
      { label: "git revert", href: "https://git-scm.com/docs/git-revert" },
      { label: "Health: Agentic", href: "/docs/health/agentic" },
    ],
  },

  // 4. Measure cost
  {
    problem:
      "The model provider's bill for October is higher than September's, and nobody on the invoices API can say why. It could be triage on a flood of new issues, one implement run that looped for an hour, or the merge gate reviewing every push. The Actions page shows workflow durations, but the agent workflow also wakes on a schedule and on every comment, so its total time says nothing about the agents.",
    sections: [
      {
        title: "Make every agent run leave a usage file",
        body: "Nothing outside the run knows how many tokens it used, so the run has to say. Have the step that runs the agent write a small usage file from what the agent CLI reports, in the CLI's own units, and upload it as an artifact named after the kind of work: `implement-usage`, `triage-usage`, `merge-gate-usage`. Upload it with `!cancelled()`, so a run that failed after spending tokens still reports them.\n\nGive the step that runs the agent the same name in every workflow. That name is how you will find the agent's own time later, separate from checkout, installs and git work around it.\n\nRecord tokens by type (input, output, cache reads, cache writes) and the model. Do not convert them to money in the file: prices change, differ per account, and go stale in a committed file.",
        code: [
          {
            lang: "yaml",
            file: ".github/workflows/agent-implement.yml",
            code: `name: Agent implement

on:
  workflow_dispatch:
    inputs:
      issue:
        required: true
        type: string

jobs:
  agent:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    steps:
      - uses: actions/checkout@v4

      # The same step name in every agent workflow: it is how the agent's time is found.
      # Your wrapper runs the agent CLI and writes usage/usage.json from what it reported.
      - name: Run agent
        run: node scripts/run-agent.mjs --kind implement --issue "\${{ inputs.issue }}"

      - name: Upload usage
        if: \${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: implement-usage
          path: usage/
          if-no-files-found: ignore
          retention-days: 90`,
          },
          {
            lang: "json",
            file: "usage/usage.json (example values)",
            code: `{
  "kind": "implement",
  "issue": 412,
  "model": "example-model",
  "input_tokens": 182340,
  "output_tokens": 9412,
  "cache_read_tokens": 1204511,
  "cache_write_tokens": 64220
}`,
          },
        ],
      },
      {
        title: "Find agent runs by evidence, not by title",
        body: "Run titles leak. A run started from an issue and the same workflow dispatched by hand get different titles, and a list of titles per kind quietly misses whole kinds of work. Find runs by what happened inside them instead: list the runs of each agent workflow, read their jobs, and keep the ones where the agent step actually ran.\n\nA declared agent job is not an agent run. Workflows often declare an agent job with a condition that skips it, and a skipped job still appears in the job list. Requiring the agent step, with a start and an end time, means the kind of work and the duration come from the same evidence.\n\nFiltered run listings return at most 1,000 results, however many pages you ask for. A workflow that wakes every hour passes that in a month, so list a busy workflow a week at a time.",
        code: [
          {
            lang: "bash",
            code: `# The runs of one agent workflow created in October.
gh api "repos/{owner}/{repo}/actions/workflows/agent-implement.yml/runs?created=2026-10-01..2026-10-31&per_page=100" \\
  --paginate --jq '.workflow_runs[] | [.id, .event, .conclusion, .display_title] | @tsv'

# Did the agent step run in this one, and for how long?
gh api "repos/{owner}/{repo}/actions/runs/11902334417/jobs?per_page=100" \\
  --jq '.jobs[].steps[] | select(.name == "Run agent" and .conclusion != "skipped")
        | [.started_at, .completed_at, .conclusion] | @tsv'

# The usage artifact the run uploaded, if it uploaded one.
gh api "repos/{owner}/{repo}/actions/runs/11902334417/artifacts" \\
  --jq '.artifacts[] | select(.name | endswith("-usage")) | [.id, .name, .expired] | @tsv'`,
          },
        ],
      },
      {
        title: "Read the usage, and count what you could not read",
        body: "Totals are a floor. A run only reports usage if it reached the model and uploaded its artifact; a run that crashed before the upload, timed out, or whose artifact has expired counts as an agent run with no usage. Count both, and print them together as \"measured N of M\" beside every total, so a partial sum is never read as a complete one.\n\nTwo durations exist and they are not the same. The agent's own report may sum time spent inside model requests. The wall clock of the agent step is longer, because it also covers tool calls, file work and git. Neither is wrong; the script below reports the step's wall clock and says so.\n\nThe script lists runs, reads each run's jobs and artifacts, downloads the usage file with `gh run download`, and summarises per kind of work.",
        code: [
          {
            lang: "js",
            file: "scripts/cost.mjs",
            code: `// Usage: node scripts/cost.mjs acme/invoices-api 2026-10 agent-triage.yml agent-refine.yml agent-implement.yml
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [repo, month, ...workflows] = process.argv.slice(2);
const STEP = "Run agent";

const pages = (path) =>
  JSON.parse(
    execFileSync("gh", ["api", "--paginate", "--slurp", path], {
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
    }),
  );

const from = new Date(\`\${month}-01T00:00:00Z\`);
const last = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1) - 1);
const day = (d) => d.toISOString().slice(0, 10);

function readUsage(runId, name) {
  const dir = mkdtempSync(join(tmpdir(), "usage-"));
  try {
    execFileSync("gh", ["run", "download", String(runId), "--repo", repo, "-n", name, "-D", dir], {
      stdio: "ignore",
    });
    const file = join(dir, "usage.json");
    return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
  } catch {
    return null; // expired, never uploaded, or unreadable: unmeasured, not zero
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const kinds = {};
for (const workflow of workflows) {
  const kind = workflow.replace(/^agent-/, "").replace(/\\.ya?ml$/, "");
  const runs = pages(
    \`repos/\${repo}/actions/workflows/\${workflow}/runs?created=\${day(from)}..\${day(last)}&per_page=100\`,
  ).flatMap((page) => page.workflow_runs);

  for (const run of runs) {
    if (run.status !== "completed") continue; // still running: it has not uploaded usage yet
    const jobs = pages(\`repos/\${repo}/actions/runs/\${run.id}/jobs?per_page=100\`).flatMap((p) => p.jobs);
    const step = jobs
      .flatMap((job) => job.steps ?? [])
      .find((s) => s.name === STEP && s.conclusion !== "skipped" && s.started_at && s.completed_at);
    if (!step) continue; // the agent never ran, whatever the workflow is called

    const k = (kinds[kind] ??= { runs: 0, measured: 0, seconds: [], tokens: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } });
    k.runs += 1;
    k.seconds.push((Date.parse(step.completed_at) - Date.parse(step.started_at)) / 1000);

    const artifact = pages(\`repos/\${repo}/actions/runs/\${run.id}/artifacts?per_page=100\`)
      .flatMap((p) => p.artifacts)
      .find((a) => a.name.endsWith("-usage") && !a.expired);
    const usage = artifact ? readUsage(run.id, artifact.name) : null;
    if (!usage) continue; // counted in runs, not in measured: the totals are a floor

    k.measured += 1;
    k.tokens.input += usage.input_tokens ?? 0;
    k.tokens.output += usage.output_tokens ?? 0;
    k.tokens.cacheRead += usage.cache_read_tokens ?? 0;
    k.tokens.cacheWrite += usage.cache_write_tokens ?? 0;
  }
}

// Nearest-rank percentile, in seconds of the agent step's wall clock.
const pct = (values, p) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length ? sorted[Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)] : null;
};

const all = Object.values(kinds);
const runs = all.reduce((n, k) => n + k.runs, 0);
const measured = all.reduce((n, k) => n + k.measured, 0);
console.log(
  JSON.stringify(
    {
      repo,
      month,
      coverage: \`measured \${measured} of \${runs}\`,
      duration: "wall clock of the agent step",
      kinds: Object.fromEntries(
        Object.entries(kinds).map(([kind, k]) => [
          kind,
          {
            runs: k.runs,
            measured: k.measured,
            tokens: k.tokens,
            agentStepSeconds: {
              p50: pct(k.seconds, 50),
              p90: pct(k.seconds, 90),
              total: Math.round(k.seconds.reduce((a, b) => a + b, 0)),
            },
          },
        ]),
      ),
    },
    null,
    2,
  ),
);`,
          },
        ],
      },
      {
        title: "Keep what you measured, because artifacts expire",
        body: "Store each month's result, and the per-run records behind it, in a file you commit. Usage artifacts expire like any other, so a month you do not save while its artifacts exist can never be measured again. Saving the per-run records also makes the next collection cheap: a finished run that was measured once, including one found to have no usage, does not need its jobs and artifacts read again.\n\nPresent cost per kind of work, never as one total. Triage, refine, implement and the merge gate have very different shapes: many short runs against a few long ones. A total hides which kind moved, and the question after a surprising bill is always which one.\n\nAnd keep it in tokens. A figure in euros invites comparison against a budget the repository knows nothing about, and goes wrong silently the day a price changes.",
        code: [
          {
            lang: "json",
            file: "cost/2026-10.json",
            code: `{
  "repo": "acme/invoices-api",
  "month": "2026-10",
  "coverage": "measured 41 of 48",
  "duration": "wall clock of the agent step",
  "kinds": {
    "triage": {
      "runs": 19,
      "measured": 18,
      "tokens": { "input": 912400, "output": 41230, "cacheRead": 3120400, "cacheWrite": 210300 },
      "agentStepSeconds": { "p50": 74, "p90": 131, "total": 1602 }
    },
    "implement": {
      "runs": 17,
      "measured": 13,
      "tokens": { "input": 4410230, "output": 198340, "cacheRead": 21904110, "cacheWrite": 1203400 },
      "agentStepSeconds": { "p50": 1012, "p90": 2290, "total": 19430 }
    }
  }
}`,
          },
        ],
      },
    ],
    verify: [
      "Open three runs the script counted: each has the agent step with a start and end time, and a run whose agent job was skipped is not in the count.",
      "Delete the usage upload from one test run, or wait for one to fail before it: it is counted in M and not in N, and the totals do not change.",
      "Per kind, `measured` is never larger than `runs`, and the `coverage` line equals the sums across kinds.",
      "Re-run the script after a week: the earlier runs give the same numbers, unless their artifacts expired, in which case the stored file still has them.",
    ],
    pitfalls: [
      'Presenting a partial sum as the total. Without "measured N of M", a month where half the runs uploaded nothing looks half as expensive.',
      "Finding runs by title. Titles differ by trigger, so whole kinds of work go missing and the remaining ones look more expensive than they are.",
      "Counting a declared agent job as an agent run. A job that is skipped on every run will inflate the run count and halve every average.",
      "Timing the whole workflow. Checkout, installs and the jobs before the agent are not the agent, and they dominate short runs.",
    ],
    platform:
      "project-health's Agents panel finds agent runs from the job that actually ran the agent step, takes the duration from that step, reads tokens from the run's `*-usage` artifact, prints \"measured N of M\" beside the totals, and stores measured runs so the daily collection only pays for what happened since yesterday. To adopt it, read BLUEPRINT.md in PlainConceptsPlatform/project-health and adopt it.",
    links: [
      {
        label: "REST API: list workflow runs for a workflow",
        href: "https://docs.github.com/en/rest/actions/workflow-runs#list-workflow-runs-for-a-workflow",
      },
      {
        label: "REST API: list jobs for a workflow run",
        href: "https://docs.github.com/en/rest/actions/workflow-jobs#list-jobs-for-a-workflow-run",
      },
      {
        label: "REST API: artifacts",
        href: "https://docs.github.com/en/rest/actions/artifacts#list-artifacts-for-a-repository",
      },
      { label: "gh run download", href: "https://cli.github.com/manual/gh_run_download" },
      { label: "gh api: --paginate, --slurp, --jq", href: "https://cli.github.com/manual/gh_api" },
      { label: "Health: what the agents cost", href: "/docs/health/agentic#what-the-agents-cost" },
    ],
  },

  // 5. The roadmap
  {
    problem:
      "The board for the invoices API says twelve issues are in progress. In fact three have an agent on them, five are waiting for an answer to a question the refine agent asked on Tuesday, two have a pull request the gate parked for review, and two were labelled by a workflow and never started. Nobody can tell which is which without opening every issue, so the questions sit unanswered for days.",
    sections: [
      {
        title: "Let labels carry the state, and read them back as history",
        body: "If your agents hand issues over with labels, the labels already say who had each issue at each moment. Map them to a handful of states: **agent working** (`bot-working`), **waiting on a person** (`review`, `stalled`, `owner-review`), **pull request waiting to merge** (`pr-pending`), **queued** (open with none of those), and **by hand** (an issue that never carried an agent label at all). Use your own label names; what matters is that each one means exactly one state.\n\nThe current labels only say where an issue is now. Where its time went is in its timeline: every `labeled` and `unlabeled` event, with when it happened and who did it, plus `closed` and `reopened`. That history is what turns a board into a record.",
        code: [
          {
            lang: "bash",
            code: `# One issue's label history: when, what, by whom.
gh api "repos/{owner}/{repo}/issues/412/timeline?per_page=100" --paginate \\
  --jq '.[] | select(.event == "labeled" or .event == "unlabeled" or .event == "closed" or .event == "reopened")
        | [.created_at, .event, (.label.name // "-"), (.actor.login // "-")] | @tsv'

# Where every open issue stands right now.
gh issue list --state open --limit 200 --json number,title,labels \\
  --jq '.[] | [.number, ([.labels[].name] | join(",")), .title] | @tsv'`,
          },
        ],
      },
      {
        title: "Split each issue's open time into states",
        body: "Walk each issue's timeline in order, keeping the set of labels it carries, and at every event add the time since the previous one to the state those labels describe. Leave out the stretches between a close and a reopen, so a reopened issue shows a gap rather than invented work. An issue that never carried an agent label was worked by hand from start to end: calling that time queued would blame a queue for work a person was doing.\n\nTimes are wall clock. A pull request merged the next morning spends the night waiting to merge, and that is the point: the share of open time an agent was actually working is usually much smaller than people expect, and the rest is waiting for someone.\n\nThe issues endpoint returns pull requests too, so drop anything with a `pull_request` field. And `since` filters by last update, so also read the open issues, or an issue that sat untouched all month is missing from the month it spent waiting.",
        code: [
          {
            lang: "js",
            file: "scripts/roadmap.mjs",
            code: `// Usage: node scripts/roadmap.mjs acme/invoices-api 2026-10
import { execFileSync } from "node:child_process";

const [repo, month] = process.argv.slice(2);
const WORKING = ["bot-working"];
const WAITING = ["review", "stalled", "owner-review"];
const MERGE = ["pr-pending"];
const AGENT_LABELS = new Set(["triage", "refine", "implement", ...WORKING, ...MERGE]);
const HOUR = 3_600_000;

const pages = (path) =>
  JSON.parse(
    execFileSync("gh", ["api", "--paginate", "--slurp", path], {
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
    }),
  ).flat();

const from = Date.parse(\`\${month}-01T00:00:00Z\`);
const start = new Date(from);
const end = Math.min(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1), Date.now());

const stateOf = (labels) =>
  WORKING.some((l) => labels.has(l))
    ? "agent"
    : WAITING.some((l) => labels.has(l))
      ? "person"
      : MERGE.some((l) => labels.has(l))
        ? "merge"
        : "queued";

// Updated since the month began, plus everything still open; pull requests left out.
const found = new Map();
for (const issue of [
  ...pages(\`repos/\${repo}/issues?state=all&since=\${start.toISOString()}&per_page=100\`),
  ...pages(\`repos/\${repo}/issues?state=open&per_page=100\`),
]) {
  if (!issue.pull_request) found.set(issue.number, issue);
}
const issues = [...found.values()].filter(
  (i) => Date.parse(i.created_at) < end && (!i.closed_at || Date.parse(i.closed_at) >= from),
);

const totals = { agent: 0, person: 0, merge: 0, queued: 0, manual: 0 };
const rows = [];
for (const issue of issues) {
  const events = pages(\`repos/\${repo}/issues/\${issue.number}/timeline?per_page=100\`)
    .filter((e) => e.created_at)
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  const manual = !events.some((e) => e.event === "labeled" && AGENT_LABELS.has(e.label?.name));

  const spent = { agent: 0, person: 0, merge: 0, queued: 0, manual: 0 };
  const labels = new Set();
  let open = true;
  let cursor = Date.parse(issue.created_at);
  const advance = (until) => {
    const a = Math.max(cursor, from);
    const b = Math.min(until, end);
    if (open && b > a) spent[manual ? "manual" : stateOf(labels)] += (b - a) / HOUR;
    cursor = Math.max(cursor, until);
  };

  for (const e of events) {
    advance(Date.parse(e.created_at));
    if (e.event === "labeled") labels.add(e.label.name);
    else if (e.event === "unlabeled") labels.delete(e.label.name);
    else if (e.event === "closed") open = false;
    else if (e.event === "reopened") open = true;
  }
  advance(end);

  for (const state of Object.keys(totals)) totals[state] += spent[state];
  rows.push({ number: issue.number, title: issue.title, hours: spent });
}

const openHours = Object.values(totals).reduce((a, b) => a + b, 0);
console.log(
  JSON.stringify(
    {
      repo,
      month,
      issues: rows.length,
      agentWorkingShare: openHours === 0 ? null : Math.round((totals.agent / openHours) * 1000) / 1000,
      hours: Object.fromEntries(Object.entries(totals).map(([s, h]) => [s, Math.round(h)])),
      longestWaitingOnAPerson: rows
        .sort((a, b) => b.hours.person - a.hours.person)
        .slice(0, 10)
        .map((r) => ({ number: r.number, title: r.title, hours: Math.round(r.hours.person) })),
    },
    null,
    2,
  ),
);`,
          },
        ],
      },
      {
        title: "Name the label nobody picked up",
        body: "One way issues stall is invisible on GitHub. Events caused by a workflow's own `GITHUB_TOKEN` do not start other workflows, so when an automation sets `refine` on an issue with that token, the refine workflow never wakes, and the issue waits until a person sets the label again. Nothing on the issue says so.\n\nThe timeline does. A trigger label set by a workflow's account, followed by no `bot-working` within an hour or so, is almost always this. Check for it per issue, and list the ones you find with the rest of the roadmap, because nothing else will.",
        code: [
          {
            lang: "bash",
            code: `# Trigger labels on one issue, who set them, and whether an agent started afterwards.
gh api "repos/{owner}/{repo}/issues/418/timeline?per_page=100" --paginate \\
  --jq '.[] | select(.event == "labeled" and (.label.name == "triage" or .label.name == "refine"
                                              or .label.name == "implement" or .label.name == "bot-working"))
        | [.created_at, .label.name, .actor.login] | @tsv'

# 2026-10-21T08:02:11Z  refine       github-actions[bot]
# (no bot-working after it: the refine workflow never started)`,
          },
        ],
      },
      {
        title: "A Needs a human digest, rewritten in place",
        body: "The roadmap is a record of the month. People also need to know what is waiting on them now, and that belongs on GitHub rather than in a report. Keep one issue, **Needs a human**, and have a scheduled workflow rewrite its body every few hours with what genuinely needs a person: questions waiting on the author, decisions for the owner, pull requests the gate parked. Rewrite it in place instead of opening a new issue each time, so there is one place to look and nothing to close.\n\nFollow one rule when you decide what goes in it: retry a failure, report a decision. A park the machine caused (a crash, a timeout, an empty output) is retried automatically and listed separately, so nobody picks up work that is about to retry itself. A verdict an agent reached on purpose is reported and never retried, because running a decision again only reproduces it.\n\nCount bot-authored pull requests apart from the rest. Seven open dependency bumps are not seven things needing a person, and leave the digest itself out of the roadmap: it is not work. Create the `needs-a-human` label once before the first run.",
        code: [
          {
            lang: "yaml",
            file: ".github/workflows/needs-a-human.yml",
            code: `name: Needs a human

on:
  schedule:
    - cron: "17 */6 * * *"
  workflow_dispatch:

permissions:
  contents: read
  issues: write
  pull-requests: read

jobs:
  digest:
    runs-on: ubuntu-latest
    env:
      GH_TOKEN: \${{ github.token }}
      GH_REPO: \${{ github.repository }}
    steps:
      - uses: actions/checkout@v4
      - run: bash scripts/needs-a-human.sh`,
          },
          {
            lang: "bash",
            file: "scripts/needs-a-human.sh",
            code: `#!/usr/bin/env bash
# Rewrites one issue with what is waiting on a person. Decisions are reported, never retried.
set -euo pipefail

section() { # label, heading
  echo "## $2"
  gh issue list --state open --label "$1" --limit 100 --json number,title,updatedAt \\
    --jq '.[] | "- #\\(.number) \\(.title) (last change \\(.updatedAt[0:10]))"'
  echo
}

{
  echo "Rewritten every six hours by needs-a-human.yml. Last run $(date -u +%Y-%m-%dT%H:%MZ)."
  echo
  section review "Questions waiting on the author"
  section owner-review "Decisions for the owner"
  echo "## Pull requests the gate parked"
  gh pr list --state open --label human-review --limit 100 --json number,title \\
    --jq '.[] | "- #\\(.number) \\(.title)"'
  echo
  section stalled "Stalled, retrying by itself (no action needed yet)"
  echo "## Dependency updates"
  echo "$(gh pr list --state open --search "author:app/dependabot" --json number --jq length) open, counted apart."
} > digest.md

number=$(gh issue list --state open --label needs-a-human --limit 1 --json number --jq '.[0].number // empty')
if [ -n "$number" ]; then
  gh issue edit "$number" --body-file digest.md
else
  gh issue create --title "Needs a human" --label needs-a-human --body-file digest.md
fi`,
          },
        ],
      },
    ],
    verify: [
      "Pick one closed issue and read its timeline on GitHub: the hours the script gives each state match the gaps between its label changes, and they add up to the time it was open in the month.",
      "An issue nobody labelled for an agent shows all its time as by hand, not queued.",
      "Run the digest workflow twice: the same Needs a human issue is updated both times, and no second one is opened.",
      "Label a test issue `review`: it appears under questions waiting on the author on the next run, and disappears the run after the label is removed.",
    ],
    pitfalls: [
      "Calling hand work queued. An issue a person worked without agent labels then looks like it waited the whole time, and the queue gets blamed for it.",
      "Counting closed stretches. A reopened issue that was closed for a week did not wait a week; leave the gap.",
      "Reading the monthly roadmap as a live queue. It is a record collected after the fact; what needs a person now is the digest's job.",
      "Retrying decisions. Re-running an agent that parked on purpose produces the same verdict and hides the question from the person who has to answer it.",
    ],
    platform:
      'project-health\'s Roadmap tab (opt in with `"roadmap": { "enabled": true }` and the Pull requests read permission) reads every issue\'s timeline into the same five states, draws them as a Gantt with stalls, early-ended agent attempts and outcomes marked, and names labels nobody picked up; the Needs a human digest comes with agentic-workflows\' housekeeping job, every six hours. To adopt it, read BLUEPRINT.md in PlainConceptsPlatform/project-health and adopt it.',
    links: [
      {
        label: "REST API: timeline events for an issue",
        href: "https://docs.github.com/en/rest/issues/timeline",
      },
      {
        label: "Issue event types",
        href: "https://docs.github.com/en/rest/using-the-rest-api/issue-event-types",
      },
      { label: "gh issue list", href: "https://cli.github.com/manual/gh_issue_list" },
      { label: "gh issue edit", href: "https://cli.github.com/manual/gh_issue_edit" },
      {
        label: "Why a GITHUB_TOKEN event starts no workflow",
        href: "https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow",
      },
      { label: "Health: Roadmap", href: "/docs/health/roadmap" },
    ],
  },
];
