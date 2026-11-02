/**
 * The journey from a repository with no AI to everything a Platform repository has, one
 * pillar per layer of the tower. Each step is something a reader can do by hand in any
 * repository; the pillar's shortcut is the Platform tool that does all of them at once.
 *
 * The order is the dependency order, not the order of the repositories on the home page:
 * the workflows call the harness's skills, Health reads what the workflows' CI publishes,
 * and Foundations comes last because it adds the least to a repository that is not a
 * Platform app.
 */

export type Step = {
  title: string;
  /** One sentence: why the step exists. */
  why: string;
  /** What an agent does in the repository before the step. */
  before: string;
  /** What it does after. */
  after: string;
  /** Needs the Platform GitHub App, the Forge gateway or the runner fleet. */
  platformOnly?: boolean;
};

export type Pillar = {
  name: string;
  tagline: string;
  /** The maturity level reached when every step of this pillar is in place. */
  level: string;
  shortcut: string;
  /** Shown when the layer is complete. */
  outcome: string;
  docs: { label: string; href: string };
  optional?: boolean;
  steps: Step[];
};

export const PILLARS: Pillar[] = [
  {
    name: "agent-harness",
    tagline: "the repository understands an agent",
    level: "Agents in the repo",
    shortcut: "npx @plainconceptsplatform/agent-harness@latest",
    outcome: "Your repository understands an agent. Next, it works without you.",
    docs: { label: "agent-harness", href: "/docs/ai#agent-harness" },
    steps: [
      {
        title: "Add AGENTS.md",
        why: "The one file every agent reads, every time.",
        before: "guesses how your repository is tested",
        after: "runs pnpm verify before it calls a change done",
      },
      {
        title: "Install skills from skills.sh",
        why: "Knowledge loaded on demand instead of sitting in every context.",
        before: "reinvents how to look for a library",
        after: "loads find-skills when it needs it",
      },
      {
        title: "Write your guardrails as a skill",
        why: "Git, secrets and quality rules, each with the reason behind it.",
        before: "commits a test .env",
        after: "leaves it out and says why",
      },
      {
        title: "Write ARCHITECTURE.md and DESIGN.md",
        why: "The agent stops guessing what you are building and how it should look.",
        before: "puts the service in the wrong layer",
        after: "puts it in the slice that owns it",
      },
      {
        title: "Create your first agents",
        why: "A plan agent cannot edit because its configuration says so, not because it promised.",
        before: "plans and edits in the same breath",
        after: "plan proposes, build implements",
      },
      {
        title: "Work from specs with OpenSpec",
        why: "Every change leaves a proposal, specs and tasks behind.",
        before: "changes code and leaves no trace of why",
        after: "opens a proposal and archives it when done",
      },
      {
        title: "Turn the nevers into hooks",
        why: "A written rule can be ignored. A denied one never runs.",
        before: "git add -A pushes your .env",
        after: "denied, told to stage explicit paths",
      },
      {
        title: "Gate the diff",
        why: "A script that fails when a change brings filler with it.",
        before: "adds tests that assert nothing",
        after: "check-diff refuses them before the pull request",
      },
      {
        title: "Make context cheap",
        why: "Fewer tokens per question, and more precise answers.",
        before: "reads 40 files to find one function",
        after: "asks codegraph and goes straight there",
      },
    ],
  },
  {
    name: "agentic-workflows",
    tagline: "agents work without you",
    level: "Autonomous",
    shortcut: "npx @plainconceptsplatform/workflows",
    outcome: "Issues are refined, implemented and merged on their own. Next, measure it.",
    docs: { label: "Agentic workflows", href: "/docs/ai#agentic-workflows" },
    steps: [
      {
        title: "Your first agentic workflow",
        why: "One markdown file: the frontmatter is the wiring, the body is the prompt.",
        before: "you start the agent by hand",
        after: "it starts on its own when an issue opens",
      },
      {
        title: "Take verbs away",
        why: "What an agent does not need does not exist for it.",
        before: "the audit could edit code",
        after: "it can create an issue and nothing else",
      },
      {
        title: "Labels are the state",
        why: "The event carries the transition, and no agent writes a label.",
        before: "nobody knows where an issue stands",
        after: "refine, then implement, visible on GitHub",
      },
      {
        title: "One router for every trigger",
        why: "One event, one route, and concurrency with a single owner.",
        before: "every label wakes every workflow",
        after: "the router decides and calls one worker",
      },
      {
        title: "Refine and implement",
        why: "From an issue to a sized story, and from the story to a pull request.",
        before: "vague issues nobody picks up",
        after: "one branch, one pull request that closes the issue",
      },
      {
        title: "The merge gate and the merge train",
        why: "One pull request at a time, stopping only for what is dangerous.",
        before: "everything waits for someone to read it",
        after: "what is safe merges on its own",
      },
      {
        title: "Evidence after the merge",
        why: "The journey is replayed in a browser and leaves screenshots.",
        before: "“works on my machine”",
        after: "a screenshot of every step on the pull request",
      },
      {
        title: "Forge and ephemeral runners",
        why: "Our own model, and no machines running while nothing does.",
        before: "a long-lived runner that fills up with leftovers",
        after: "a clean VM for every job",
        platformOnly: true,
      },
    ],
  },
  {
    name: "project-health",
    tagline: "you know whether it works",
    level: "Measured",
    shortcut: "Read BLUEPRINT.md in project-health and adopt it",
    outcome: "You know how much you deliver, at what quality, and how much the agents do alone.",
    docs: { label: "Measuring with Health", href: "/docs/health" },
    steps: [
      {
        title: "Measure delivery",
        why: "Deployment frequency and lead time, read from GitHub.",
        before: "“I think we are doing fine”",
        after: "deployments and lead time for every month",
      },
      {
        title: "Publish engineering facets",
        why: "CI records what it saw. Facets never gate anything.",
        before: "coverage gets checked when someone remembers",
        after: "every commit to main leaves a sample",
      },
      {
        title: "Measure autonomy",
        why: "How much of the agents' work merges without a person.",
        before: "no idea whether the agents help",
        after: "the share the gate merges, and how much is reverted",
      },
      {
        title: "Measure cost",
        why: "Tokens and time per kind of work, labelled “measured N of M”.",
        before: "the bill arrives with no context",
        after: "what each kind of work costs",
      },
      {
        title: "The roadmap",
        why: "Where each issue's time goes, and what is waiting for a person.",
        before: "stuck issues with no owner",
        after: "waiting on a human, made visible",
      },
    ],
  },
  {
    name: "Foundations",
    tagline: "optional: the Platform look and stack",
    level: "Platform",
    shortcut: "Use the platform-onboard skill",
    outcome: "Besides working like a Platform repository, it now reads and looks like one.",
    docs: { label: "Adopt in your project", href: "/docs/adopt" },
    optional: true,
    steps: [
      {
        title: "One quality bar",
        why: "The eleven practices in ENGINEERING.md, for any repository.",
        before: "every repository sets its own bar",
        after: "one shared bar you can measure",
      },
      {
        title: "Boundaries that break the build",
        why: "Layers and dependencies checked by a linter, not by review.",
        before: "the agent “fixes” a boundary by widening it",
        after: "widening the rule is gated too",
      },
      {
        title: "Executable specs",
        why: "Gherkin bound to OpenSpec, run on every build.",
        before: "the spec says one thing and the code another",
        after: "a spec that does not hold fails the build",
      },
      {
        title: "The Platform look",
        why: "Tokens and components: it looks like Platform with nothing customised.",
        before: "every app with its own blue",
        after: "one theme, through tokens",
      },
      {
        title: "The Platform stack",
        why: "Feature-sliced design, inversify-hooks, i18n and .NET guardrails.",
        before: "every project with its own architecture",
        after: "every project reads the same way",
      },
    ],
  },
];

export const TOTAL_STEPS = PILLARS.reduce((sum, pillar) => sum + pillar.steps.length, 0);

export function pillarAt(index: number): Pillar {
  const pillar = PILLARS[index];
  if (!pillar) throw new RangeError(`There is no layer ${index + 1}`);
  return pillar;
}
