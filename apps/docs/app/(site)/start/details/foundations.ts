import type { StepGuide } from "./types";

/**
 * The guides behind the Foundations layer. The hand route uses only open tools anyone can
 * install; Platform's own packages and the platform-onboard skill appear only in `platform`.
 */
export const FOUNDATIONS_GUIDES: StepGuide[] = [
  // 1. One quality bar
  {
    problem:
      "Three repositories, three bars. One blocks on coverage, one runs a secret scanner that only reports, and one has no gates at all because nobody had time. An agent writes code in all three, and only the first one stops its mistakes. When someone asks how good the code is, the answer depends on which repository they open, and none of them can be compared with another.",
    sections: [
      {
        title: "Write the bar down before you wire it",
        body: 'A quality bar is a list of practices, each with a mode that says what failing it means. Platform uses eleven: spec, tests and coverage, mutation score, secrets, vulnerabilities, insecure patterns (SAST), SBOM and licences, complexity, DAST, performance, and code hygiene. Every one of them has a free, open tool, so the bar does not depend on anyone\'s product, and you can adopt it in any repository.\n\nThere are three modes. Blocking fails the pipeline. Threshold holds a measured value above a committed floor and fails when it drops below. Policy produces an artefact, such as a bill of materials, that a policy is checked against. Writing the mode next to the practice matters because a scanner that only reports is not the same practice as one that blocks, and the difference is invisible when you skim a workflow file.\n\nNot every practice applies to every repository. A static site has no domain logic to mutate and a library has no deployed surface to scan with DAST. Record which ones do not apply and why, so a missing gate is a decision someone made rather than something nobody noticed. "We have no specs yet" is a gap, not an exemption.',
        code: [
          {
            lang: "md",
            file: "QUALITY.md",
            code: `# Quality bar

Project type: back-front (web app and API)

| # | Practice | Mode | Tool | Runs |
|---|---|---|---|---|
| 1 | Spec | Blocking | playwright-bdd / Reqnroll | every PR |
| 2 | Tests and coverage | Blocking | @vitest/coverage-v8 / coverlet | every PR |
| 3 | Mutation score | Threshold | StrykerJS / Stryker.NET | weekly |
| 4 | Secrets | Blocking | TruffleHog, verified results | every PR |
| 5 | Vulnerabilities | Blocking | Trivy fs, HIGH and CRITICAL, unfixed ignored | every PR |
| 6 | SAST | Blocking | Semgrep CE with --error | every PR |
| 7 | SBOM and licences | Policy | Syft, CycloneDX JSON | every push to main |
| 8 | Complexity | Blocking | ESLint complexity, max 15 | every PR |
| 9 | DAST | Threshold | OWASP ZAP baseline (passive) | after each deploy to test |
| 10 | Performance | Threshold | Lighthouse CI | not applicable: internal tool, no budget agreed |
| 11 | Code hygiene | Threshold | jscpd, new clones only | every PR |

Floors only move up. Each floor carries a comment with the baseline it came from.`,
          },
        ],
      },
      {
        title: "Run the security gates on every pull request",
        body: "Secrets, vulnerabilities and SAST are the cheapest gates to add and the ones that protect you most, so they go first. Each is a single job with a public action or container image, and none needs an account or a token.\n\nThe TruffleHog action scans the commits between the base and the head of the pull request and always passes --fail, so any result fails the job. Restricting it to --results=verified means it only fails on credentials it has confirmed are live, which keeps false positives from teaching people to ignore it. Trivy's fs scan reads your lockfiles: HIGH,CRITICAL with ignore-unfixed blocks only on findings you can fix today, and exit-code: 1 is what turns the scan into a gate. Semgrep's --error makes it exit 1 when it has findings; without it, the scan reports and passes. p/default is Semgrep's default registry ruleset; --config auto also works, but it sends your project URL to the Semgrep registry to pick rules.\n\nThe SBOM is a policy artefact, not a gate. The job produces a CycloneDX file and uploads it as a workflow artifact, and your licence or component policy is checked against it. Running it on pushes to main is enough, since main is what you ship.",
        code: [
          {
            lang: "yaml",
            file: ".github/workflows/security.yml",
            code: `name: Security
on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  secrets:
    name: Secrets
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 0
      - uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --results=verified

  vulnerabilities:
    name: Vulnerabilities
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: aquasecurity/trivy-action@v0.36.0
        with:
          scan-type: fs
          scan-ref: .
          format: table
          severity: HIGH,CRITICAL
          ignore-unfixed: true
          exit-code: 1

  sast:
    name: SAST
    if: github.actor != 'dependabot[bot]'
    runs-on: ubuntu-latest
    container:
      image: semgrep/semgrep
    steps:
      - uses: actions/checkout@v6
      - run: semgrep scan --config p/default --error

  sbom:
    name: SBOM
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: anchore/sbom-action@v0
        with:
          path: .
          format: cyclonedx-json
          output-file: sbom.cdx.json`,
          },
          {
            lang: "bash",
            code: `# The same checks on your machine, before you push

# Secrets in the git history; --fail exits 183 when anything is found
trufflehog git file://. --results=verified --fail

# Fixable HIGH and CRITICAL vulnerabilities in lockfiles
trivy fs --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1 .

# Insecure patterns; --error exits 1 on findings
semgrep scan --config p/default --error

# A CycloneDX SBOM of the working directory
syft ./ -o cyclonedx-json=./sbom.cdx.json`,
          },
        ],
      },
      {
        title: "Put a floor under coverage and a ceiling on complexity",
        body: "A test run with no coverage floor tells you the tests passed, not that they test anything. Set a line-coverage floor per module, measured on the merged report of everything CI runs, and set it slightly below the number you measure today. A floor above today's number turns the gate red on day one and gets deleted. A floor slightly below it, raised as coverage grows, stays.\n\nComplexity is the other half. A method with many branches and few tests is where bugs live, so ENGINEERING.md caps cyclomatic complexity at 15 per method. In TypeScript, ESLint's built-in complexity rule enforces the cap; you can run ESLint for that one rule even if Biome does the rest of your linting.\n\nIn .NET, coverlet's MSBuild integration fails dotnet test when coverage drops below a threshold. Its default ThresholdStat is Minimum, which checks every module on its own rather than the total, and that is exactly what a per-module floor means: one assembly losing its tests cannot hide behind a well-tested one.",
        code: [
          {
            lang: "ts",
            file: "vitest.config.ts",
            tab: "TypeScript",
            code: `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src"],
      reporter: ["text", "json", "html"],
      thresholds: {
        // Baseline 78.4% lines on main (CI run of 2026-10-30). Only ever raise.
        lines: 77,
        // Invoice totals carry the money logic, so they get their own floor.
        // Glob thresholds do not inherit the global ones.
        "src/entities/invoice/**": {
          lines: 90,
        },
      },
    },
  },
});

// eslint.config.js, the complexity cap:
// export default [{ files: ["src/**/*.{ts,tsx}"], rules: { complexity: ["error", { max: 15 }] } }];`,
          },
          {
            lang: "bash",
            tab: ".NET",
            code: `# Add coverlet's MSBuild integration to each test project
dotnet add tests/Invoices.IntegrationTests package coverlet.msbuild

# Fail the run when any module drops below 77% line coverage.
# Baseline 78.4% on main (CI run of 2026-10-30). Only ever raise.
dotnet test \\
  /p:CollectCoverage=true \\
  /p:CoverletOutputFormat=cobertura \\
  /p:Threshold=77 \\
  /p:ThresholdType=line`,
          },
        ],
      },
      {
        title: "Check that the tests catch mistakes, once a week",
        body: "Coverage says a line ran. Mutation testing says a test noticed when the line was wrong: the tool changes the code (a > becomes >=, a condition flips, a return value changes) and checks that some test fails. A mutant that survives is a bug your tests would not have caught.\n\nMutation runs are slow, so run them weekly and on demand rather than on every pull request. The floor works like the coverage floor: measure the score, set break slightly below it, and raise it as the score grows. Stryker exits with code 1 when the score is below break, which is what makes the scheduled job fail. The thresholds are all or nothing, so set high, low and break together.\n\nnpm init stryker@latest asks which test runner you use and writes a starting configuration; for Vitest it installs @stryker-mutator/vitest-runner. Stryker.NET is a dotnet tool, installed with dotnet tool install dotnet-stryker into a local tool manifest, and it runs from the unit test project's directory.",
        code: [
          {
            lang: "json",
            file: "stryker.config.json",
            tab: "TypeScript",
            code: `{
  "testRunner": "vitest",
  "vitest": {
    "configFile": "vitest.config.ts"
  },
  "mutate": ["src/**/*.ts", "!src/**/*.test.ts"],
  "reporters": ["clear-text", "progress", "html", "json"],
  "thresholds": {
    "high": 80,
    "low": 65,
    "break": 60
  }
}`,
          },
          {
            lang: "json",
            file: "tests/Invoices.UnitTests/stryker-config.json",
            tab: ".NET",
            code: `{
  "stryker-config": {
    "project": "Invoices.Application.csproj",
    "mutate": ["**/*.cs", "!**/*.g.cs"],
    "reporters": ["html", "json", "progress"],
    "thresholds": {
      "high": 80,
      "low": 65,
      "break": 60
    }
  }
}`,
          },
          {
            lang: "yaml",
            file: ".github/workflows/mutation.yml",
            code: `name: Mutation
on:
  schedule:
    - cron: "0 4 * * 1" # Mondays, 04:00 UTC
  workflow_dispatch:

permissions:
  contents: read

jobs:
  mutation:
    name: Mutation score
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npx stryker run`,
          },
        ],
      },
      {
        title: "Hygiene, DAST, and making the gates required",
        body: "AI-assisted change tends to leave copy-pasted blocks behind. jscpd finds them. Gating on new clones against main, rather than on a percentage of the whole tree, means the duplication you already have does not block you while new duplication does. ENGINEERING.md counts a clone from 10 lines and 70 tokens, over production sources only, so tests, migrations and generated code are ignored.\n\nDAST scans a running instance for what static tools cannot see: missing security headers, insecure cookies, endpoints that answer without authentication. The OWASP ZAP baseline scan is passive, so it is safe to run after every deploy to a test environment. Start with fail_action off, triage the first report into a rules file, then turn it on. Never point it at an environment that holds real data.\n\nA gate that is not required only reports. Add every blocking job to a repository ruleset on the default branch as a required status check, and copy the check names from a real pull request: required checks match on the job's name, so renaming a job quietly stops it being required.",
        code: [
          {
            lang: "bash",
            code: `# Fail only on clones that main does not already have
npx jscpd src \\
  --min-lines 10 \\
  --min-tokens 70 \\
  --ignore "**/*.test.ts,**/migrations/**" \\
  --baseline-from-ref origin/main \\
  --fail-on-new-clones 0`,
          },
          {
            lang: "yaml",
            file: ".github/workflows/dast.yml",
            code: `name: DAST
on:
  deployment_status:
  workflow_dispatch:

permissions:
  contents: read
  issues: write # the action files its report as an issue

jobs:
  zap:
    name: DAST baseline
    if: github.event_name == 'workflow_dispatch' || github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: zaproxy/action-baseline@v0.15.0
        with:
          target: https://invoices-test.example.com
          rules_file_name: .zap/rules.tsv
          fail_action: false # set to true once the first report is triaged`,
          },
        ],
      },
    ],
    verify: [
      "Commit a made-up key on a branch and run trufflehog git file://. --results=verified,unknown: it is reported as unknown, which proves the scan reads your history. The CI job, restricted to verified results, stays green on it by design.",
      "Delete a test that covers src/entities/invoice and run npx vitest run --coverage: the run fails with a threshold error for that glob.",
      "Open a pull request and check that Secrets, Vulnerabilities and SAST are listed as required and that the merge button waits for them.",
      "Set break above your current score and run npx stryker run: it exits with code 1.",
    ],
    pitfalls: [
      "Seeding floors from a local run. CI merges unit, integration and acceptance coverage, so a local unit-only number is lower and the gate changes colour on its first CI run. Take the baseline from CI's merged report.",
      "Lowering a floor to get back to green. The floor is a ratchet; lowering it hides the regression it exists to catch.",
      "Capturing a scanner's exit code in a step. GitHub Actions runs bash with -e, so the step aborts at the scanner and every later step is skipped. Put set +e before the command whose exit code you keep.",
      "Leaving gates out of the ruleset. A blocking job that is not a required status check blocks nothing.",
    ],
    platform:
      "Platform repositories publish each gate's verdict as an Engineering Excellence facet that Project-Health turns into the L0 to L3 scorecard. The platform-onboard skill scans a repository for the gates it already has before adding the missing ones.",
    links: [
      { label: "Engineering gates (Foundations)", href: "/docs/reference/engineering" },
      { label: "The Engineering scorecard", href: "/docs/health/engineering" },
      { label: "TruffleHog", href: "https://github.com/trufflesecurity/trufflehog" },
      { label: "Trivy action", href: "https://github.com/aquasecurity/trivy-action" },
      { label: "Semgrep CLI reference", href: "https://docs.semgrep.dev/cli-reference" },
      {
        label: "StrykerJS configuration",
        href: "https://stryker-mutator.io/docs/stryker-js/configuration/",
      },
    ],
  },

  // 2. Boundaries that break the build
  {
    problem:
      "The architecture document says entities never import features. An agent adding an approval badge to the invoice entity needs the current user, finds it in features/auth, and imports it. The tests pass, review misses one import line among two hundred, and a month later nothing can be moved without dragging half the app with it. When a lint rule finally complains, the next agent makes it pass by adding an exception to the rule.",
    sections: [
      {
        title: "Write the rule as layers with one direction",
        body: "A boundary rule is only checkable if it is precise. The shape most frontends need is a short list of layers, each allowed to import only from the layers below it, plus two rules inside a layer: sibling slices do not import each other (compose them one layer up instead), and a slice is imported only through its public index.ts.\n\nThe layout below is Feature-Sliced Design as Platform uses it, with the canonical layer names. On Next.js the router folder sits at the project root, outside src/, and an empty root pages/ folder stops Next from reading src/pages as its Pages Router, so the FSD pages layer keeps its name. A new app can start with app, pages and shared and add the other layers when a real need appears. The direction rule is the same either way, and it is what keeps a slice safe to move or delete.",
        code: [
          {
            lang: "text",
            code: `src/
  app/        routing shell and providers (top)
  pages/      one slice per screen: invoice-list, invoice-detail
  widgets/    blocks that combine features: invoice-table
  features/   user actions: approve-invoice, export-invoices
  entities/   domain models and their ui: invoice, customer
  shared/     ui (shadcn), lib, api, config (bottom)

Allowed:   features/approve-invoice  ->  entities/invoice  (through its index.ts)
Forbidden: entities/invoice          ->  features/approve-invoice   (upward)
Forbidden: features/approve-invoice  ->  features/export-invoices   (sibling)
Forbidden: pages/invoice-detail      ->  entities/invoice/model/invoice.ts  (internals)`,
          },
        ],
      },
      {
        title: "Enforce it with dependency-cruiser",
        body: "dependency-cruiser reads your imports, resolves them through tsconfig paths, and fails when one matches a forbidden rule. It works with any layer names; when yours are the canonical FSD ones, Steiger (next section) is less to maintain, and it is what the Platform apps run. Install it with npm install --save-dev dependency-cruiser; npx dependency-cruiser --init writes a starting configuration you can replace with the one below.\n\nEach rule has a from and a to, matched as regular expressions on file paths. The sibling rule uses a capture group: the slice name matched in from is available as $1 in to, so pathNot excludes the slice's own files. The rules are generated from the layer list, so adding a layer is a one-line change.\n\nWith the err reporter, which is the default, the command exits with the number of error-severity violations, so any violation fails the CI job. Add it as a script and as its own job, so the check shows up under its own name in the pull request.",
        code: [
          {
            lang: "js",
            file: ".dependency-cruiser.cjs",
            code: `/** Layers from top to bottom. A layer imports only from layers after it. */
const layers = ["app", "pages", "widgets", "features", "entities", "shared"];
/** Layers made of slices, which get the sibling and public API rules. */
const sliced = ["pages", "widgets", "features", "entities"];

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    ...layers.slice(1).map((layer, i) => ({
      name: \`no-upward-imports-from-\${layer}\`,
      comment: \`\${layer} may only import from the layers below it.\`,
      severity: "error",
      from: { path: \`^src/\${layer}/\` },
      to: { path: \`^src/(\${layers.slice(0, i + 1).join("|")})/\` },
    })),
    ...sliced.map((layer) => ({
      name: \`no-sibling-imports-in-\${layer}\`,
      comment: "A slice does not import a sibling slice. Compose them one layer up.",
      severity: "error",
      from: { path: \`^src/\${layer}/([^/]+)/\` },
      to: { path: \`^src/\${layer}/\`, pathNot: \`^src/\${layer}/$1/\` },
    })),
    ...sliced.map((layer) => ({
      name: \`public-api-only-\${layer}\`,
      comment: "Import a slice through its index.ts, never its internals.",
      severity: "error",
      from: { pathNot: \`^src/\${layer}/\` },
      to: { path: \`^src/\${layer}/[^/]+/.+\`, pathNot: \`^src/\${layer}/[^/]+/index[.]ts$\` },
    })),
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
  },
};`,
          },
          {
            lang: "yaml",
            file: ".github/workflows/ci.yml (job)",
            code: `  boundaries:
    name: Boundaries
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      # Exits with the number of error-severity violations
      - run: npx dependency-cruiser --config .dependency-cruiser.cjs src`,
          },
        ],
      },
      {
        title: "Or use Steiger if you keep the canonical FSD names",
        body: "Steiger is the linter from the Feature-Sliced Design project. Its recommended configuration knows the canonical layer names (app, pages, widgets, features, entities, shared) and checks more than imports: forbidden imports between layers, public API sidesteps, typos in layer names, slices with a single user that should not exist yet. If your layers use those names, it is less to maintain than a hand-written dependency-cruiser config.\n\nInstall it with npm i -D steiger @feature-sliced/steiger-plugin and run npx steiger ./src; --watch keeps it running while you work. Turn rules off for a path only with a comment that says why, the same way you would justify any other exception.",
        code: [
          {
            lang: "js",
            file: "steiger.config.js",
            code: `import { defineConfig } from "steiger";
import fsd from "@feature-sliced/steiger-plugin";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // shared is a layer of segments, not slices, so it has no single public API
    files: ["./src/shared/**"],
    rules: {
      "fsd/public-api": "off",
    },
  },
]);`,
          },
        ],
      },
      {
        title: "In .NET, assert the layers in an architecture test",
        body: "A .NET solution already has a coarse boundary: a project cannot use what it does not reference. That stops Domain from referencing Infrastructure only as long as nobody adds the reference, and adding one is a single line in a .csproj that an agent will happily write to make a build pass. An architecture test turns the rule into a failing test that names the type that broke it.\n\nNetArchTest reads the compiled assemblies and checks dependencies by namespace. Put the tests in their own project (Invoices.ArchitectureTests) that references every layer, so the test sees the whole solution. ArchUnitNET is an alternative with the same idea and a richer rule language; pick one and keep all the layer rules in it.",
        code: [
          {
            lang: "csharp",
            file: "tests/Invoices.ArchitectureTests/LayerTests.cs",
            code: `using NetArchTest.Rules;
using Xunit;

namespace Invoices.ArchitectureTests;

// dotnet add tests/Invoices.ArchitectureTests package NetArchTest.Rules
public class LayerTests
{
    private static readonly System.Reflection.Assembly Domain =
        typeof(Invoices.Domain.Invoices.Invoice).Assembly;

    private static readonly System.Reflection.Assembly Application =
        typeof(Invoices.Application.Invoices.ApproveInvoice.ApproveInvoiceHandler).Assembly;

    [Theory]
    [InlineData("Invoices.Application")]
    [InlineData("Invoices.Infrastructure")]
    [InlineData("Invoices.Api")]
    public void Domain_does_not_depend_on_outer_layers(string outer)
    {
        var result = Types.InAssembly(Domain)
            .That()
            .ResideInNamespace("Invoices.Domain")
            .ShouldNot()
            .HaveDependencyOn(outer)
            .GetResult();

        Assert.True(result.IsSuccessful, $"Invoices.Domain depends on {outer}");
    }

    [Theory]
    [InlineData("Invoices.Infrastructure")]
    [InlineData("Invoices.Api")]
    public void Application_does_not_depend_on_infrastructure_or_api(string outer)
    {
        var result = Types.InAssembly(Application)
            .That()
            .ResideInNamespace("Invoices.Application")
            .ShouldNot()
            .HaveDependencyOn(outer)
            .GetResult();

        Assert.True(result.IsSuccessful, $"Invoices.Application depends on {outer}");
    }
}`,
          },
        ],
      },
      {
        title: "Gate the rule itself",
        body: 'The easiest way to pass a boundary check is to weaken the check: add a pathNot, turn a rule to warn, delete an InlineData line. That is the failure an agent produces most often, because from where it stands the lint error is the problem. So the files that hold the rules need an owner whose review is required, which makes widening a boundary an architecture decision and not a lint fix.\n\nList those files in CODEOWNERS and enable "Require review from Code Owners" in the branch protection rule or ruleset for the default branch. Then say the same thing to the agent in AGENTS.md: a boundary violation is reported, not fixed by editing the rule. The written rule explains why; the required review makes sure it holds when the explanation is ignored.',
        code: [
          {
            lang: "text",
            file: ".github/CODEOWNERS",
            code: `# Widening a boundary is an architecture decision, not a lint fix.
/.dependency-cruiser.cjs               @invoices-org/architects
/steiger.config.js                     @invoices-org/architects
/tests/Invoices.ArchitectureTests/     @invoices-org/architects
/ARCHITECTURE.md                       @invoices-org/architects`,
          },
          {
            lang: "md",
            file: "AGENTS.md (excerpt)",
            code: `## Boundaries
- Layers import only downward: app > pages > widgets > features > entities > shared.
- Import a slice through its index.ts.
- If the Boundaries check fails, move the code to the layer that owns it.
  Never edit .dependency-cruiser.cjs or the architecture tests to make it pass;
  if the rule is wrong, say so in the pull request and leave it to a code owner.`,
          },
        ],
      },
    ],
    verify: [
      "Add an import of a feature from an entity file and run npx dependency-cruiser --config .dependency-cruiser.cjs src: it reports no-upward-imports-from-entities and exits non-zero.",
      "Import entities/invoice/model/invoice.ts directly from a page: the public-api-only-entities rule fails.",
      "Add a reference from Invoices.Domain to Invoices.Infrastructure and use one of its types: dotnet test fails in LayerTests and names the dependency.",
      "Open a pull request that edits .dependency-cruiser.cjs: GitHub requests a review from the code owners and the merge waits for it.",
    ],
    pitfalls: [
      "Starting with severity warn. A warning nobody has to fix is a report, and the count only grows. Start at error with the current violations fixed or listed, not ignored.",
      "Forgetting tsConfig in the options. Without it, imports through path aliases such as @/entities/invoice are not resolved, so the most common imports are never checked.",
      "Letting the rule files go unowned. A boundary check whose config anyone can edit in the same pull request stops nothing.",
      "Testing namespaces that do not match the projects. NetArchTest checks namespaces, so a type in the Domain project declared under another namespace slips past the rule.",
    ],
    platform:
      "The platform-onboard skill checks for both guardrails in its preflight: a Steiger configuration with the FSD rules in CI for the frontend, and an architecture test project for .NET. It adds whichever is missing as its own OpenSpec change.",
    links: [
      { label: "Architecture (Foundations)", href: "/docs/reference/architecture" },
      {
        label: "dependency-cruiser rules reference",
        href: "https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md",
      },
      { label: "Steiger", href: "https://github.com/feature-sliced/steiger" },
      { label: "FSD layers", href: "https://feature-sliced.design/docs/reference/layers" },
      { label: "NetArchTest", href: "https://github.com/BenMorris/NetArchTest" },
      {
        label: "About code owners (GitHub)",
        href: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners",
      },
    ],
  },

  // 3. Executable specs
  {
    problem:
      "The spec says invoices above the approval limit need a second approver. An agent refactoring the approval handler drops the check, the unit tests it rewrote alongside pass, and invoices go out with one signature. The spec still says two. Nobody notices until finance asks why, and by then nobody can say which one was right.",
    sections: [
      {
        title: "Start from the spec's scenarios",
        body: "An executable spec is a requirement written as concrete scenarios, then run as a test. Writing the scenarios first, in the spec, keeps them about behaviour a person cares about rather than about how the code happens to be structured.\n\nIf you use OpenSpec, each capability has a spec at openspec/specs/<capability>/spec.md with requirements and scenarios. Whatever you use, the point is the same: one place that says what the system does, with a name you can refer to from a test. Here the capability is invoice-approval.",
        code: [
          {
            lang: "md",
            file: "openspec/specs/invoice-approval/spec.md",
            code: `# Invoice approval

### Requirement: Second approver above the limit
An invoice whose amount is above the approval limit SHALL need approvals from
two different people before it can be paid.

#### Scenario: Under the limit
- GIVEN the approval limit is 5000 EUR
- WHEN one person approves an invoice of 1200 EUR
- THEN the invoice is approved

#### Scenario: Over the limit
- GIVEN the approval limit is 5000 EUR
- WHEN one person approves an invoice of 8000 EUR
- THEN the invoice waits for a second approval

#### Scenario: Same person twice
- WHEN the person who approved an invoice of 8000 EUR approves it again
- THEN the approval is rejected`,
          },
        ],
      },
      {
        title: "Write the scenarios as Gherkin, tagged with their spec",
        body: "The feature file restates the spec's scenarios in Gherkin, the Given, When, Then format that both playwright-bdd and Reqnroll read. Keep the steps in the language of the domain (an invoice, an approver, a limit) and out of the language of the UI (a button, a field), so the same scenario survives a redesign.\n\nThe tag on the feature binds it to the spec. A tag is cheap to write and easy to check by script, which is what makes the binding enforceable: a scenario without a tag, or with a tag that names no spec, can fail the build. The same file runs unchanged in TypeScript and .NET.",
        code: [
          {
            lang: "gherkin",
            file: "features/invoice-approval.feature",
            code: `@spec:invoice-approval
Feature: Invoice approval
  Invoices above the approval limit need a second approver before they can be paid.

  Background:
    Given the approval limit is 5000 EUR

  Scenario: An invoice under the limit is approved by one approver
    Given a draft invoice "INV-1042" for 1200 EUR
    When "maria" approves invoice "INV-1042"
    Then invoice "INV-1042" is "approved"

  Scenario: An invoice over the limit waits for a second approver
    Given a draft invoice "INV-1043" for 8000 EUR
    When "maria" approves invoice "INV-1043"
    Then invoice "INV-1043" is "awaiting-second-approval"

  Scenario: The same person cannot approve twice
    Given a draft invoice "INV-1044" for 8000 EUR
    And "maria" has approved invoice "INV-1044"
    When "maria" approves invoice "INV-1044"
    Then the approval is rejected with "A second approver must be a different person"`,
          },
        ],
      },
      {
        title: "Bind the steps",
        body: "Each step is bound to a function by an expression with typed placeholders: {string} and {int} capture the quoted text and the number. Drive the steps through the API rather than the UI where you can. The behaviour lives behind the API, API steps are faster and less brittle, and a few UI journeys in your end-to-end suite cover the screens.\n\nIn playwright-bdd, steps are ordinary Playwright functions that receive fixtures. State shared between steps, such as the last response, lives in a custom fixture created with test.extend and passed to createBdd. In Reqnroll, steps are methods on a [Binding] class. Its context injection creates constructor parameters per scenario and disposes them afterwards, so a WebApplicationFactory in the constructor gives each scenario a fresh in-memory host.\n\nHow a test signs in as maria is your application's business. Below, a test-only authentication handler reads an X-Test-User header; it is registered in the test host and never in production.",
        code: [
          {
            lang: "ts",
            file: "features/steps/invoice-approval.steps.ts",
            tab: "TypeScript",
            code: `import { expect } from "@playwright/test";
import { Given, Then, When } from "./fixtures";

// fixtures.ts extends the Playwright test with a per-scenario "last" holding the latest response,
// and exports Given, When and Then from createBdd on that test.

const as = (user: string) => ({ "X-Test-User": user });

Given("the approval limit is {int} EUR", async ({ request }, amount: number) => {
  const response = await request.put("/api/settings/approval-limit", { data: { amount } });
  expect(response.ok()).toBe(true);
});

Given("a draft invoice {string} for {int} EUR", async ({ request }, number: string, amount: number) => {
  const response = await request.post("/api/invoices", { data: { number, amount, currency: "EUR" } });
  expect(response.ok()).toBe(true);
});

Given("{string} has approved invoice {string}", async ({ request }, user: string, number: string) => {
  const response = await request.post(\`/api/invoices/\${number}/approvals\`, { headers: as(user) });
  expect(response.ok()).toBe(true);
});

When("{string} approves invoice {string}", async ({ request, last }, user: string, number: string) => {
  last.response = await request.post(\`/api/invoices/\${number}/approvals\`, { headers: as(user) });
});

Then("invoice {string} is {string}", async ({ request }, number: string, status: string) => {
  const response = await request.get(\`/api/invoices/\${number}\`);
  expect(await response.json()).toMatchObject({ status });
});

Then("the approval is rejected with {string}", async ({ last }, detail: string) => {
  expect(last.response?.status()).toBe(409);
  expect(await last.response?.json()).toMatchObject({ detail });
});`,
          },
          {
            lang: "csharp",
            file: "tests/Invoices.AcceptanceTests/Steps/InvoiceApprovalSteps.cs",
            tab: ".NET",
            code: `using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Reqnroll;
using Xunit;

namespace Invoices.AcceptanceTests.Steps;

[Binding]
public sealed class InvoiceApprovalSteps(WebApplicationFactory<Program> factory)
{
    private readonly HttpClient _client = factory.CreateClient();
    private HttpResponseMessage? _last;

    [Given("the approval limit is {int} EUR")]
    public async Task GivenTheApprovalLimit(int amount) =>
        (await _client.PutAsJsonAsync("/api/settings/approval-limit", new { amount }))
            .EnsureSuccessStatusCode();

    [Given("a draft invoice {string} for {int} EUR")]
    public async Task GivenADraftInvoice(string number, int amount) =>
        (await _client.PostAsJsonAsync("/api/invoices", new { number, amount, currency = "EUR" }))
            .EnsureSuccessStatusCode();

    [Given("{string} has approved invoice {string}")]
    public async Task GivenHasApproved(string user, string number) =>
        (await Approve(user, number)).EnsureSuccessStatusCode();

    [When("{string} approves invoice {string}")]
    public async Task WhenApproves(string user, string number) =>
        _last = await Approve(user, number);

    [Then("invoice {string} is {string}")]
    public async Task ThenInvoiceIs(string number, string status)
    {
        var invoice = await _client.GetFromJsonAsync<InvoiceView>($"/api/invoices/{number}");
        Assert.Equal(status, invoice!.Status);
    }

    [Then("the approval is rejected with {string}")]
    public async Task ThenRejected(string detail)
    {
        Assert.Equal(HttpStatusCode.Conflict, _last!.StatusCode);
        var problem = await _last.Content.ReadFromJsonAsync<ProblemDetails>();
        Assert.Equal(detail, problem!.Detail);
    }

    private Task<HttpResponseMessage> Approve(string user, string number)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, $"/api/invoices/{number}/approvals");
        request.Headers.Add("X-Test-User", user); // test-only auth handler
        return _client.SendAsync(request);
    }

    private sealed record InvoiceView(string Number, int Amount, string Status);
}`,
          },
        ],
      },
      {
        title: "Run them on every build",
        body: "In TypeScript, install playwright-bdd next to Playwright (npm i -D @playwright/test playwright-bdd, then npx playwright install). defineBddConfig points at the features and the steps and returns the directory where bddgen writes the generated Playwright tests. The run is two commands: npx bddgen generates, npx playwright test runs. bddgen fails by default when a step has no definition, so a scenario added to the feature file without its binding breaks the build instead of being skipped. Add the generated .features-gen directory to .gitignore.\n\nIn .NET, add Reqnroll's package for your test framework (Reqnroll.xUnit for xUnit) to the acceptance test project and run dotnet test. Reqnroll turns tags into test categories (a trait named Category in xUnit), so dotnet test --filter Category=spec:invoice-approval runs one capability on its own.\n\nThese are acceptance tests over a real host, so they count towards the integration-heavy test trophy rather than adding a separate slow tier. Run them on every pull request, as a required check.",
        code: [
          {
            lang: "ts",
            file: "playwright.config.ts",
            tab: "TypeScript",
            code: `import { defineConfig } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

const testDir = defineBddConfig({
  features: "features/**/*.feature",
  steps: "features/steps/**/*.ts",
});

export default defineConfig({
  testDir,
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
  },
  reporter: [["html", { open: "never" }]],
});

// package.json
// "scripts": { "test:spec": "bddgen && playwright test" }`,
          },
          {
            lang: "bash",
            tab: ".NET",
            code: `# The acceptance test project: Reqnroll on xUnit, against an in-memory host
dotnet new xunit -o tests/Invoices.AcceptanceTests
dotnet add tests/Invoices.AcceptanceTests package Reqnroll.xUnit
dotnet add tests/Invoices.AcceptanceTests package Microsoft.AspNetCore.Mvc.Testing
dotnet add tests/Invoices.AcceptanceTests reference src/Invoices.Api

# Program must be visible to the tests: add "public partial class Program;"
# at the end of src/Invoices.Api/Program.cs

# Every scenario, or one capability through its tag
dotnet test tests/Invoices.AcceptanceTests
dotnet test tests/Invoices.AcceptanceTests --filter Category=spec:invoice-approval`,
          },
        ],
      },
      {
        title: "Fail a scenario that is bound to no spec",
        body: "Tags are only a binding if something checks them. A short script walks the feature files, reads the tags that apply to each scenario, and fails when a scenario has no @spec: tag or names a capability that has no spec. Run it before the scenarios in the same job, so a spec that was renamed or deleted breaks the build in the same pull request.\n\nThis closes the loop in both directions. A behaviour change that updates the code without the spec fails its scenario. A scenario written without a spec, or left behind when the spec goes, fails the check.",
        code: [
          {
            lang: "js",
            file: "scripts/check-spec-tags.mjs",
            code: `// Usage: node scripts/check-spec-tags.mjs features tests
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SCENARIO = /^(Scenario|Scenario Outline|Scenario Template|Example):/;
const problems = [];
const files = process.argv.slice(2).flatMap(walk).filter((file) => file.endsWith(".feature"));

for (const file of files) {
  let featureTags = [];
  let pending = [];
  readFileSync(file, "utf8").split(/\\r?\\n/).forEach((raw, index) => {
    const line = raw.trim();
    if (line.startsWith("@")) {
      pending.push(...line.split(/\\s+/));
      return;
    }
    if (line.startsWith("Feature:")) {
      featureTags = pending;
      pending = [];
      return;
    }
    if (SCENARIO.test(line)) {
      const specs = [...featureTags, ...pending].filter((tag) => tag.startsWith("@spec:"));
      if (specs.length === 0) problems.push(\`\${file}:\${index + 1} has no @spec: tag\`);
      for (const tag of specs) {
        const capability = tag.slice("@spec:".length);
        if (!existsSync(join("openspec", "specs", capability, "spec.md"))) {
          problems.push(\`\${file}:\${index + 1} \${tag} matches no openspec/specs/\${capability}/spec.md\`);
        }
      }
    }
    if (line !== "" && !line.startsWith("#")) pending = [];
  });
}

if (files.length === 0) problems.push("No .feature files found");
for (const problem of problems) console.error(problem);
process.exit(problems.length === 0 ? 0 : 1);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "node_modules" || entry.name === "bin" || entry.name === "obj") return [];
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}`,
          },
          {
            lang: "yaml",
            file: ".github/workflows/ci.yml (job)",
            code: `  spec:
    name: Spec
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: node scripts/check-spec-tags.mjs features
      - run: npx playwright install --with-deps
      - run: npx bddgen && npx playwright test`,
          },
        ],
      },
    ],
    verify: [
      'Remove the second-approver check from the handler and run the scenarios: "An invoice over the limit waits for a second approver" fails.',
      "Add a scenario with a step nobody has bound and run npx bddgen: generation fails and prints a snippet for the missing step.",
      "Change the tag to @spec:invoice-approvals and run node scripts/check-spec-tags.mjs features: it reports the tag and exits 1.",
      "Check that Spec is a required status check on the default branch.",
    ],
    pitfalls: [
      'Writing steps in the language of the UI ("I click the green button"). The scenario then breaks on every redesign and stops describing the rule.',
      "Generating scenarios from the code after the fact. They then confirm what the code does, including its bugs, instead of what the spec says it should do.",
      "Keeping state in module-level variables between steps. Playwright runs tests in parallel workers, so shared state leaks between scenarios; use a fixture.",
      "Marking failing scenarios with @skip and moving on. A skipped scenario is a spec nobody checks; fix the code or change the spec.",
    ],
    platform:
      "Platform repositories bind Gherkin scenarios to OpenSpec specs and run them as the blocking Spec practice, reported in the spec facet of the Engineering scorecard. The platform-onboard skill sets up OpenSpec before the frontend and .NET steps that rely on it.",
    links: [
      {
        label: "playwright-bdd: first test",
        href: "https://github.com/vitalets/playwright-bdd/blob/main/docs/getting-started/write-first-test.md",
      },
      {
        label: "playwright-bdd options",
        href: "https://github.com/vitalets/playwright-bdd/blob/main/docs/configuration/options.md",
      },
      {
        label: "Reqnroll context injection",
        href: "https://github.com/reqnroll/Reqnroll/blob/main/docs/automation/context-injection.md",
      },
      {
        label: "Reqnroll: executing specific scenarios",
        href: "https://github.com/reqnroll/Reqnroll/blob/main/docs/execution/executing-specific-scenarios.md",
      },
      { label: "OpenSpec", href: "https://github.com/Fission-AI/OpenSpec" },
      { label: "Engineering gates (Foundations)", href: "/docs/reference/engineering" },
    ],
  },

  // 4. The Platform look
  {
    problem:
      "Four internal apps, four blues. Each team picked a primary colour from a screenshot, hardcoded it in a dozen components, and wrote its own dark mode with its own mistakes. A rebrand means four projects and a few hundred search-and-replace edits, and the dark mode of the oldest app still shows white cards because someone wrote bg-white.",
    sections: [
      {
        title: "Define two layers of tokens: primitives and semantic",
        body: "A token is a named value. Primitives are the raw palette (brand-500, neutral-100) and say nothing about use. Semantic tokens say what a colour is for (primary, background, muted-foreground, border) and point at a primitive. Components only ever use semantic tokens, which is what lets you change the palette, or switch to dark mode, without touching a component.\n\nshadcn/ui works this way already. Its tokens come in pairs: a surface and the colour of text on it, such as primary and primary-foreground. Define them under :root for light mode and again under .dark with the same names; the components never need to know which mode is on. shadcn's defaults use oklch values; any CSS colour works.",
        code: [
          {
            lang: "css",
            file: "src/app/globals.css (tokens)",
            code: `:root {
  /* Primitives: the raw palette. Not used by components. */
  --brand-100: #e6f4f1;
  --brand-500: #0f766e;
  --brand-700: #0b4f4a;
  --neutral-0: #ffffff;
  --neutral-50: #f8fafc;
  --neutral-100: #f1f5f9;
  --neutral-200: #e2e8f0;
  --neutral-500: #64748b;
  --neutral-800: #1e293b;
  --neutral-900: #0f172a;
  --neutral-950: #020617;
  --red-500: #dc2626;

  /* Semantic tokens: what components use. */
  --background: var(--neutral-0);
  --foreground: var(--neutral-900);
  --card: var(--neutral-50);
  --card-foreground: var(--neutral-900);
  --popover: var(--neutral-0);
  --popover-foreground: var(--neutral-900);
  --primary: var(--brand-500);
  --primary-foreground: var(--neutral-0);
  --secondary: var(--neutral-100);
  --secondary-foreground: var(--neutral-900);
  --muted: var(--neutral-100);
  --muted-foreground: var(--neutral-500);
  --accent: var(--brand-100);
  --accent-foreground: var(--brand-700);
  --destructive: var(--red-500);
  --border: var(--neutral-200);
  --input: var(--neutral-200);
  --ring: var(--brand-500);
  --radius: 0.5rem;
}

.dark {
  --background: var(--neutral-950);
  --foreground: var(--neutral-50);
  --card: var(--neutral-900);
  --card-foreground: var(--neutral-50);
  --popover: var(--neutral-900);
  --popover-foreground: var(--neutral-50);
  --primary: var(--brand-500);
  --primary-foreground: var(--neutral-0);
  --secondary: var(--neutral-800);
  --secondary-foreground: var(--neutral-50);
  --muted: var(--neutral-800);
  --muted-foreground: var(--neutral-500);
  --accent: var(--brand-700);
  --accent-foreground: var(--brand-100);
  --destructive: var(--red-500);
  --border: var(--neutral-800);
  --input: var(--neutral-800);
  --ring: var(--brand-500);
}`,
          },
        ],
      },
      {
        title: "Expose the tokens to Tailwind and point shadcn at them",
        body: "Tailwind v4 reads its theme from CSS. An @theme inline block maps each semantic token to a Tailwind colour, so --color-primary: var(--primary) is what makes bg-primary and text-primary-foreground exist. The custom dark variant makes dark: utilities follow the .dark class rather than the operating system setting, so the user's choice wins.\n\nshadcn reads components.json to know where your CSS and components live. With tailwind.cssVariables set to true, which is the default, the components it copies in use the semantic utilities, so npx shadcn@latest add button card dialog gives you components already in your colours. For Tailwind v4, leave tailwind.config empty. Choose the style and base colour once: they cannot be changed after initialization without re-adding the components.\n\nTo add a token shadcn does not ship, such as warning, define --warning and --warning-foreground in both blocks and map them in @theme inline. If your design has no shadows, override Tailwind's shadow scale with a transparent value (0 0 #0000, not none, which would also drop the focus ring that shares the declaration) so copied components can stay unmodified.",
        code: [
          {
            lang: "css",
            file: "src/app/globals.css (top and bottom)",
            code: `@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

/* ...the :root and .dark blocks above... */

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}`,
          },
          {
            lang: "json",
            file: "components.json",
            code: `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/shared/ui",
    "utils": "@/shared/lib/utils",
    "ui": "@/shared/ui",
    "lib": "@/shared/lib",
    "hooks": "@/shared/hooks"
  }
}`,
          },
        ],
      },
      {
        title: "Switch dark mode with a class on html",
        body: "Dark mode is the dark class on the html element. Set it before the page paints, from an inline script in the head, or the page flashes light on every load for users who chose dark. The script reads the saved choice and falls back to the operating system's preference.\n\nBecause the server does not know the choice, the class on html differs between the server render and the client. suppressHydrationWarning on html tells React that this one attribute is expected to differ.",
        code: [
          {
            lang: "tsx",
            file: "src/app/layout.tsx",
            code: `import "./globals.css";

const setTheme = \`document.documentElement.classList.toggle(
  "dark",
  localStorage.theme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches),
);\`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: setTheme }} />
      </head>
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}

// A theme toggle stores the choice and flips the class:
// localStorage.theme = "dark"; document.documentElement.classList.add("dark");`,
          },
        ],
      },
      {
        title: "Use semantic utilities only, and check it in CI",
        body: "The rule is short: components use semantic utilities (bg-card, text-muted-foreground, border, rounded-lg) and never raw values. A hex colour in a component is invisible to the theme: it does not change in dark mode and it survives every rebrand. An arbitrary value such as p-[13px] does the same to spacing.\n\nReview misses these, so check them. A grep in CI that fails on arbitrary colour or pixel values and on inline styles catches most of them with no tooling to install. Use className on shadcn components for layout (margins, width, grid placement), not to recolour them; if a component needs a different colour, that is a variant or a token, decided once.",
        code: [
          {
            lang: "tsx",
            file: "src/entities/invoice/ui/invoice-card.tsx",
            code: `import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function InvoiceCard({ number, total, status }: InvoiceCardProps) {
  return (
    // Good: semantic utilities follow the theme and dark mode
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{number}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="text-muted-foreground">{total}</span>
        <Badge variant={status === "overdue" ? "destructive" : "secondary"}>{status}</Badge>
      </CardContent>
    </Card>
  );
}

// Avoid: <div className="bg-[#0f766e] p-[13px]" style={{ color: "#fff" }}>
type InvoiceCardProps = { number: string; total: string; status: string };`,
          },
          {
            lang: "bash",
            file: "scripts/check-tokens.sh",
            code: `#!/usr/bin/env bash
# Fails when a component carries a raw colour, an arbitrary pixel value or an inline style.
set -u
pattern='(bg|text|border|ring|fill|stroke|from|to|via)-\\[(#|rgb|hsl|oklch)|-\\[[0-9]+px\\]|style=\\{\\{'
if grep -rnE "$pattern" src --include='*.tsx'; then
  echo "Use semantic tokens (bg-primary, text-muted-foreground, rounded-lg), not raw values."
  exit 1
fi`,
          },
        ],
      },
    ],
    verify: [
      "Change --primary in :root once and reload: every button, focus ring and link that uses primary changes, and nothing else does.",
      "Toggle the dark class on html in the browser's devtools: every surface switches, and no card or input stays white.",
      "Reload with dark mode chosen and throttling on: the page never flashes light before it turns dark.",
      "Run bash scripts/check-tokens.sh on a branch that adds bg-[#0f766e] to a component: it prints the line and exits 1.",
    ],
    pitfalls: [
      "Using primitives in components (bg-[var(--brand-500)] or a --color-brand-500 utility). That ties the component to one palette and dark mode cannot remap it.",
      "Defining a token only under :root. It then has the light value in dark mode; every semantic token needs both blocks.",
      "Recolouring shadcn components through className. The override is local, inconsistent and lost when the component is updated; add a variant or a token instead.",
      "Checking contrast only in light mode. Dark palettes are usually derived by hand, so check text on every surface in both modes against WCAG 2.2 AA.",
    ],
    platform:
      "npx @plainconceptsplatform/ui-theme@latest init installs the Platform tokens (the Figma palette, light and dark, shadows neutralised), copies components.json, adds the theme import and shows how to wire the Outfit font; @plainconceptsplatform/ui-components adds shared pieces such as the Plain logo.",
    links: [
      { label: "shadcn/ui theming", href: "https://ui.shadcn.com/docs/theming" },
      { label: "components.json", href: "https://ui.shadcn.com/docs/components-json" },
      { label: "Tailwind dark mode", href: "https://tailwindcss.com/docs/dark-mode" },
      { label: "Design guidelines (Foundations)", href: "/docs/reference/design" },
      { label: "Tokens (Foundations)", href: "/docs/tokens" },
      { label: "Frontend theming (Foundations)", href: "/docs/frontend#theming" },
    ],
  },

  // 5. The Platform stack
  {
    problem:
      "Two apps from the same team. One fetches data inside components, the other in a hooks folder; one keeps its English text in the JSX, the other in a constants file; the .NET side of one has package versions in twelve project files. An engineer, or an agent, who learned one is lost in the other, and every review starts with a debate about where things go.",
    sections: [
      {
        title: "Slice the frontend by feature, with a public API per slice",
        body: "Feature-Sliced Design organises code by what it does for the user rather than by technical type. A slice is a folder for one business thing (the invoice entity, the approve-invoice feature), split into segments by purpose: ui, model, api, lib. Everything about approving an invoice lives in one place and can be deleted in one place.\n\nEach slice exposes one index.ts. Other slices import from it and nowhere else, so the slice can reorganise its files without breaking anyone, and its index.ts is the list of what it promises. Name files after the domain (format-invoice-total.ts), never utils.ts or types.ts: a catch-all file is where unrelated code goes to hide.\n\nPlatform apps build Next.js as a static export: the root app/ folder holds the layout and one page that mounts the SPA, react-router maps each URL to a screen in src/pages/, and the API serves the result from the same origin. A page slice uses the canonical segments, so the screen is pages/invoice-detail/ui/InvoiceDetailPage.tsx. The boundaries guide shows how to make the layer direction break the build.",
        code: [
          {
            lang: "text",
            code: `app/
  layout.tsx                        fonts and the theme script
  page.tsx                          mounts the SPA, nothing else
pages/.gitkeep                      empty: keeps Next away from src/pages
src/
  app/
    router.tsx                      /invoices/:number -> InvoiceDetailPage
    providers/composition-root.ts   the DI container (see below)
  pages/
    invoice-detail/
      ui/InvoiceDetailPage.tsx
      index.ts
  features/
    approve-invoice/
      ui/approve-invoice-button.tsx
      index.ts
  entities/
    invoice/
      model/invoice.ts              Invoice, InvoiceStatus
      lib/format-invoice-total.ts
      ui/invoice-card.tsx
      index.ts
  shared/
    api/index.ts                    re-exports the contracts
    api/contracts/invoice-contract.ts
    api/contracts/http/http-invoice-contract.ts
    config/i18n.ts
    config/locales/en.json
    ui/                             shadcn components`,
          },
          {
            lang: "ts",
            file: "src/entities/invoice/index.ts",
            code: `// The invoice entity's public API. Import from "@/entities/invoice", never from its files.
export { formatInvoiceTotal } from "./lib/format-invoice-total";
export type { Invoice, InvoiceStatus } from "./model/invoice";
export { InvoiceCard } from "./ui/invoice-card";`,
          },
        ],
      },
      {
        title: "Depend on interfaces, and wire them once",
        body: "Components should not know how data arrives. They depend on a contract (an interface such as IInvoiceContract), and one composition root decides which implementation backs it: HTTP in the app, a fake in a test. That keeps API clients swappable and makes a component test a matter of registering a fake, not of mocking fetch.\n\ninversify-hooks is a small open-source wrapper around InversifyJS for React. Classes are marked @injectable(), registered once with container.addSingleton, and resolved in components with useInject, which returns a one-element tuple. Pass the cid id as the second argument to addSingleton: the default id comes from the class name, which a minifier rewrites. It also exports mockSingleton and resetContainer for tests.\n\nBuild the container at module load in a client module that the root layout imports, never inside useEffect: render runs first, and useInject would find an empty container. Decorators need experimentalDecorators and useDefineForClassFields: false in tsconfig.json.",
        code: [
          {
            lang: "ts",
            file: "src/shared/api/contracts/",
            code: `// invoice-contract.ts: what the frontend needs from the invoices API
export type InvoiceDto = { number: string; amount: number; status: string };

export interface IInvoiceContract {
  get(number: string): Promise<InvoiceDto>;
  approve(number: string): Promise<InvoiceDto>;
}

// http/http-invoice-contract.ts: the implementation the app registers
import { injectable } from "inversify-hooks";
import type { IInvoiceContract, InvoiceDto } from "../invoice-contract";

@injectable()
export class HttpInvoiceContract implements IInvoiceContract {
  async get(number: string): Promise<InvoiceDto> {
    return this.send(\`/api/invoices/\${number}\`, { method: "GET" });
  }

  async approve(number: string): Promise<InvoiceDto> {
    return this.send(\`/api/invoices/\${number}/approvals\`, { method: "POST" });
  }

  private async send(url: string, init: RequestInit): Promise<InvoiceDto> {
    const response = await fetch(url, init);
    if (!response.ok) throw new Error(\`\${init.method} \${url} failed with \${response.status}\`);
    return response.json();
  }
}`,
          },
          {
            lang: "tsx",
            file: "src/app/providers/composition-root.ts and di-provider.tsx",
            code: `// composition-root.ts
import { cid, container } from "inversify-hooks";
import { HttpInvoiceContract, type IInvoiceContract } from "@/shared/api";

export function buildContainer(): void {
  container.addSingleton<IInvoiceContract>(HttpInvoiceContract, cid.IInvoiceContract);
}

// di-provider.tsx, imported by the root layout
"use client";
import { buildContainer } from "@/app/providers/composition-root";

buildContainer(); // at module load, before any component renders

export function DIProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}`,
          },
          {
            lang: "tsx",
            file: "src/features/approve-invoice/ui/approve-invoice-button.tsx",
            code: `"use client";
import { cid, useInject } from "inversify-hooks";
import { useTranslation } from "react-i18next";
import type { IInvoiceContract } from "@/shared/api";
import { Button } from "@/shared/ui/button";

export function ApproveInvoiceButton({ number, onApproved }: ApproveInvoiceButtonProps) {
  const { t } = useTranslation();
  const [invoices] = useInject<IInvoiceContract>(cid.IInvoiceContract);

  async function approve() {
    await invoices.approve(number);
    onApproved();
  }

  return <Button onClick={approve}>{t("invoices.actions.approve")}</Button>;
}

type ApproveInvoiceButtonProps = { number: string; onApproved: () => void };`,
          },
        ],
      },
      {
        title: "No magic strings: every text is a translation message",
        body: "Every piece of text a user can see or hear goes through the translation function, including the ones that are easy to forget: aria-label on an icon-only button, placeholders, empty states, validation messages, toasts. A hardcoded string is invisible to translators and impossible to audit, and an agent copying the component copies the string with it.\n\nreact-i18next with i18next does the work: initialise it once, keep messages in JSON files organised by area, and call t with a key. Do this from the first day; adding i18n to an app that already has a few hundred strings is a migration. Text in other languages is often longer, so check layouts with a longer language than English, and format dates and numbers with the active language's locale.\n\nA rule nobody checks becomes a suggestion. eslint-plugin-i18next's no-literal-string rule, in jsx-only mode, fails on literal text in JSX and in JSX attributes; exclude the attributes that are not user-facing.",
        code: [
          {
            lang: "ts",
            file: "src/shared/config/i18n.ts",
            code: `import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import es from "./locales/es.json";

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, es: { translation: es } },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }, // React already escapes output
});

export default i18n;`,
          },
          {
            lang: "json",
            file: "src/shared/config/locales/en.json",
            code: `{
  "invoices": {
    "title": "Invoices",
    "empty": "No invoices yet. Invoices you receive will appear here.",
    "actions": {
      "approve": "Approve",
      "delete": "Delete invoice"
    },
    "status": {
      "approved": "Approved",
      "awaiting-second-approval": "Waiting for a second approver"
    }
  }
}`,
          },
          {
            lang: "js",
            file: "eslint.config.js",
            code: `// npm install eslint-plugin-i18next --save-dev
import i18next from "eslint-plugin-i18next";

export default [
  i18next.configs["flat/recommended"],
  {
    files: ["src/**/*.tsx"],
    rules: {
      "i18next/no-literal-string": [
        "error",
        {
          framework: "react",
          mode: "jsx-only",
          "jsx-attributes": { exclude: ["className", "variant", "data-testid", "href"] },
        },
      ],
    },
  },
];`,
          },
        ],
      },
      {
        title: "On .NET: contexts behind ports, one place for versions, rules that fail the build",
        body: "The backend follows the same idea. Projects are the Clean Architecture layers (Domain, Application, Infrastructure, Api) with the dependency arrow pointing inward, and inside each layer the code is grouped by bounded context, not by type: Application declares the Invoices ports and DTOs, and Infrastructure holds the one or two services that implement them. Another context reaches invoices only through those ports. Expected failures are a few domain exceptions (not found, conflict, domain rule) that one exception handler maps to RFC 9457 ProblemDetails with a stable code, so every endpoint answers errors the same way.\n\nThree files at the solution root keep every project consistent. Directory.Build.props sets the build defaults once: nullable on, warnings as errors, code style enforced in the build. Directory.Packages.props turns on Central Package Management, so every package has one version for the whole solution and project files carry no Version attributes. .editorconfig sets rule severities; with EnforceCodeStyleInBuild, an IDE rule set to error fails dotnet build on the CI runner, not only in the editor.\n\nRegister services by hand in one DependencyInjection.cs per layer. It is one line per service, and it is the one place that shows which implementation backs each port, including the stub an integration falls back to; an integration test that resolves every endpoint catches a forgotten line.",
        code: [
          {
            lang: "xml",
            file: "Directory.Build.props",
            code: `<Project>
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
    <AnalysisLevel>latest-Recommended</AnalysisLevel>
  </PropertyGroup>
</Project>`,
          },
          {
            lang: "xml",
            file: "Directory.Packages.props",
            code: `<Project>
  <PropertyGroup>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>
  <ItemGroup>
    <PackageVersion Include="FluentValidation" Version="12.1.1" />
    <PackageVersion Include="Microsoft.EntityFrameworkCore.SqlServer" Version="10.0.14" />
    <PackageVersion Include="xunit" Version="2.9.3" />
    <PackageVersion Include="NetArchTest.Rules" Version="1.3.2" />
    <PackageVersion Include="Reqnroll.xUnit" Version="3.3.4" />
    <PackageVersion Include="Microsoft.AspNetCore.Mvc.Testing" Version="10.0.14" />
    <PackageVersion Include="coverlet.msbuild" Version="10.1.0" />
  </ItemGroup>
</Project>

<!-- In each .csproj, no Version attribute: <PackageReference Include="FluentValidation" /> -->`,
          },
          {
            lang: "ini",
            file: ".editorconfig",
            code: `root = true

[*.cs]
# Dead private code fails the build (needs EnforceCodeStyleInBuild)
dotnet_diagnostic.IDE0051.severity = error
dotnet_diagnostic.IDE0052.severity = error

# Accessibility modifiers are always written out
dotnet_diagnostic.IDE0040.severity = warning`,
          },
          {
            lang: "csharp",
            file: "src/Invoices.Infrastructure/DependencyInjection.cs",
            code: `// src/Invoices.Application/Invoices/IInvoiceCommandService.cs   the port
// src/Invoices.Infrastructure/Invoices/InvoiceCommandService.cs   the service
// src/Invoices.Api/Endpoints/InvoiceEndpoints.cs                  thin endpoints

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddScoped<IInvoiceCommandService, InvoiceCommandService>();
        services.AddScoped<IInvoiceReadService, InvoiceReadService>();

        // The stub or the real integration, chosen here and nowhere else.
        if (config.GetValue<bool>("Payments:Enabled"))
            services.AddHttpClient<IPaymentProvider, HttpPaymentProvider>();
        else
            services.AddSingleton<IPaymentProvider, StubPaymentProvider>();

        return services;
    }
}`,
          },
        ],
      },
    ],
    verify: [
      "Open any feature folder and find its index.ts: everything other slices use from it is exported there, and nothing outside imports its internal files.",
      "Write <Button>Approve</Button> in a component and run ESLint: i18next/no-literal-string fails on it.",
      "Register a fake IInvoiceContract in a component test and render ApproveInvoiceButton: the test needs no network and no fetch mock.",
      "Add an unused private method to a .NET class and run dotnet build: IDE0051 fails it. Add a Version attribute to a PackageReference: restore fails under Central Package Management.",
    ],
    pitfalls: [
      "Scaffolding every layer on day one. Empty widgets and entities folders are structure you have to justify later; add a layer when a real need appears.",
      "Building the DI container inside useEffect. Render runs first, useInject finds nothing registered and throws.",
      "Translating visible text but not aria-label, placeholders or toast messages. Screen reader users get English in a Spanish interface.",
      "Pinning a package version in one .csproj with VersionOverride to unblock a build. The solution now has two versions of the package, which is what Central Package Management exists to prevent.",
    ],
    platform:
      "The platform-onboard skill scans a brownfield app against these conventions and migrates it one domain at a time (pnpm, Next.js, Tailwind v4, shadcn, Biome, FSD with Steiger, inversify-hooks, react-i18next, then the theme), each step as its own OpenSpec change behind Playwright characterization tests, plus the .NET guardrails.",
    links: [
      { label: "Frontend (Foundations)", href: "/docs/frontend" },
      { label: "Backend (Foundations)", href: "/docs/backend" },
      { label: "FSD layers", href: "https://feature-sliced.design/docs/reference/layers" },
      { label: "inversify-hooks", href: "https://github.com/CKGrafico/inversify-hooks" },
      { label: "react-i18next", href: "https://react.i18next.com/getting-started" },
      {
        label: "Central Package Management",
        href: "https://learn.microsoft.com/en-us/nuget/consume-packages/central-package-management",
      },
    ],
  },
  // 6. Start from a living template
  {
    problem:
      "Four apps started from the same reference app a year ago. Each copy of the sign-in, the permission checks and the audit chain has been fixed since, a little differently each time. A security fix lands in one app and nobody remembers the other three, and when an agent is asked why two apps answer the same error differently, the honest answer is that nobody knows which copy is right.",
    sections: [
      {
        title: "Decide what is platform, and write the list down",
        body: "A template only stays useful if it is clear which files it owns. List them in one file the template ships, as globs relative to the repository root: the shared backend code, the shared web code, the deploy workflow, the documentation of that code. Everything not on the list belongs to the app, and the template never touches it.\n\nWrite it as a platform contract, .platform/contract.yml, an open format: owned is the list, source names the template and where to ask for a change, reuse names the docs and packages an agent should use before building its own, and sync says how an app takes the next version. Tools that read the same file can then guard it without knowing your template: agent-harness keeps agents off owned paths, the workflows' platform-template checks conformance and opens the sync pull requests, and Project Health shows the drift. None of them is required, and none needs the others.\n\nPut the shared code at paths that do not carry the app's name, such as apps/api/src/Platform/ and apps/web/src/shared/platform/. A file whose namespace or import path contains the app name is different in every app by construction, so it can never be compared and every update to it is a conflict. The shared code reads app-specific things (the permission catalog, the list of audit events) through an interface the app implements, never by importing app code.\n\nKeep agent and workflow configuration off the list. Those files already have an installer that owns them, and two owners for one file means each update undoes the other.",
        code: [
          {
            lang: "yaml",
            file: ".platform/contract.yml",
            code: `version: 1
source:
  name: Acme app template
  url: https://github.com/acme/reference-app
  changes: https://github.com/acme/reference-app/issues/new
owned: # only the template changes these
  - .platform/contract.yml
  - apps/api/src/Platform/**
  - apps/web/src/shared/platform/**
  - apps/api/Directory.Packages.Platform.props
  - docs/platform/**
  - .github/workflows/app-deploy.yml
reuse:
  docs: [docs/platform/]
  packages: ["@acme/ui"]
sync:
  marker: .copier-answers.yml
  version: { file: .copier-answers.yml, key: _commit }
  update: copier update --trust --defaults --conflict inline`,
          },
        ],
      },
      {
        title: "Turn the reference app into a Copier template",
        body: 'Copier copies a template into a project and, later, updates the project to a newer template version with a three-way merge, so a local edit is kept or shown as a conflict instead of silently overwritten. The template can be a working application: tag its releases (v1.4.0) and those tags are the template versions.\n\nA working app has far more files than the template owns, so the exclude list is include-only. It excludes everything first, then re-includes each owned path. The order matters: the "**" line must come first, and a broad re-include such as "!*/" or "!**/" brings every file back. Generate this list from the owned globs of the contract and add a check that fails when the two disagree, so they cannot drift.\n\nThe answers file is what records which template version an app is on, and sync.version in the contract points at its _commit key. Copier renders it from a .jinja file at the template root.',
        code: [
          {
            lang: "yaml",
            file: "copier.yml (at the reference app's root)",
            code: `_min_copier_version: "9.4.0"

# Generated from the owned globs of .platform/contract.yml. "**" must stay first.
_exclude:
  - "**"
  - "!apps/api/src/Platform/**"
  - "!apps/web/src/shared/platform/**"
  - "!apps/api/Directory.Packages.Platform.props"
  - "!docs/platform/**"
  - "!.github/workflows/app-deploy.yml"
  - "!.platform/contract.yml"
  - "!.copier-answers.yml"

app_name:
  type: str
  help: The app's name, in PascalCase`,
          },
          {
            lang: "text",
            file: ".copier-answers.yml.jinja",
            code: "{{ _copier_answers|to_nice_yaml -}}",
          },
        ],
      },
      {
        title: "Adopt it, update it, and date every exception",
        body: "An app joins with copier copy and --overwrite: the platform paths are written, everything else is left as it is. Taking a new template version is copier update, in its own pull request, through the same checks as any other change. With --conflict inline, a platform file the app changed locally comes back with conflict markers, which is the signal that the change belongs in the template.\n\nSometimes an app has to differ for a while: a capability it has not moved onto the shared code yet, or a fix it needs before the template ships it. Record that in the app, with a reason, an issue and an expiry date. An exception without a date becomes the new normal; one with a date turns back into a failure when the date passes, and someone has to decide again.",
        code: [
          {
            lang: "bash",
            code: `# Join: platform paths only, local versions overwritten
copier copy --trust --defaults --overwrite -d app_name=Invoices \\
  https://github.com/acme/reference-app.git .

# Take the next template version, in its own pull request
copier update --trust --defaults --conflict inline`,
          },
          {
            lang: "yaml",
            file: ".platform/exceptions.yml",
            code: `exceptions:
  - path: apps/web/src/shared/platform/shell/**
    reason: The invoices shell keeps its own sidebar until the export menu moves upstream.
    issue: https://github.com/acme/invoices/issues/412
    expires: 2026-12-15`,
          },
        ],
      },
      {
        title: "Check conformance in CI",
        body: "Conformance is a plain question: are the platform paths identical to the template version the answers file names? git answers it without any extra tool. Fetch that tag from the template repository, then diff the working tree against it, limited to the owned globs and excluding the paths of live exceptions. An expired exception is simply not excluded, so it fails.\n\nRun it on every pull request. The script below is the idea in a dozen lines; the platform-template of @plainconceptsplatform/workflows ships a complete guard that reads the same contract, also fails on conflict markers, and lets a template sync through. A change that edits a platform path without an exception fails here with the file named, which is when it is cheapest to move the change upstream.",
        code: [
          {
            lang: "bash",
            file: "scripts/check-template-conformance.sh",
            code: `#!/usr/bin/env bash
# Fails when a platform path differs from the template version this app records.
set -euo pipefail

src=$(yq -r '._src_path' .copier-answers.yml)
ref=$(yq -r '._commit' .copier-answers.yml)
git fetch --quiet --depth 1 "$src" "refs/tags/$ref:refs/tags/template-$ref"

specs=()
while read -r glob; do specs+=(":(glob)$glob"); done < <(yq -r '.owned[]' .platform/contract.yml)

today=$(date +%F)
if [[ -f .platform/exceptions.yml ]]; then
  while IFS=$'\\t' read -r path expires; do
    [[ "$expires" < "$today" ]] || specs+=(":(glob,exclude)$path")
  done < <(yq -r '.exceptions[] | [.path, .expires] | @tsv' .platform/exceptions.yml)
fi

git diff --exit-code --stat "template-$ref" -- "\${specs[@]}"`,
          },
        ],
      },
    ],
    verify: [
      "Run copier copy into an empty folder: it contains only the owned paths and .copier-answers.yml, and nothing of the reference app's business.",
      "Change a line in a platform file and run the conformance check: it fails and names the file. Add an exception dated next month: it passes. Date it yesterday: it fails again.",
      "Tag a new template version and run copier update in an app: the pull request touches only owned paths, and the answers file names the new tag.",
    ],
    pitfalls: [
      'Putting "**" anywhere but first in _exclude, or re-including with "!*/" or "!**/". Either way Copier copies the whole reference app into every project.',
      "Templating the app's name into shared files. They can never be identical across apps, so conformance is meaningless and every update conflicts.",
      "Editing a platform file in an app to get unblocked and moving on. The next update shows a conflict nobody remembers the reason for; move the fix upstream or record a dated exception.",
      "Listing harness or workflow files under owned. They already have an owner, and the two installers overwrite each other.",
      "Treating the template as a starter kit. Copied once and never updated, it is a fork with extra steps; the value is in copier update.",
    ],
    platform:
      "Kitchen-Sink is the template of the Platform app family: the reference app where every platform capability runs, tagged, with .platform/contract.yml and the include-only copier.yml generated from its owned paths. It still ships .platform/manifest, the same list one glob per line, for tool versions older than agent-harness 3.8.0 and workflows 1.12.0. Numa, Odyssey and Hermes are built from it. The platform-new-project skill creates a new app from its BLUEPRINT.md, platform-onboard adopts an existing one with copier copy --overwrite and converges it one capability at a time, and platform-upstream moves a fix born in an app into Kitchen-Sink first. Project-Health's Family tab reads each app's contract and shows its template version, conformance and exceptions. Kitchen-Sink is private: it requires access to the PlainConceptsPlatform organisation.",
    links: [
      {
        label: "Platform family (Foundations)",
        href: "/docs/reference/architecture#platform-family",
      },
      { label: "Copier", href: "https://copier.readthedocs.io/en/stable/" },
      {
        label: "Updating a project with Copier",
        href: "https://copier.readthedocs.io/en/stable/updating/",
      },
      {
        label: "git pathspec magic",
        href: "https://git-scm.com/docs/gitglossary#Documentation/gitglossary.txt-aiddefpathspecapathspec",
      },
    ],
  },
];
