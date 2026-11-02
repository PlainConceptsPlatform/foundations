import type { Episode } from "./types";

export const EPISODE_1: Episode = {
  layer: 0,
  title: "Layer 1: the repository understands an agent",
  summary:
    "Maya and Leo start the journey from a repository with no AI and walk the nine pieces that teach it to understand an agent, from agents dot M D to cheap context.",
  turns: [
    {
      speaker: "maya",
      text: "Hi, and welcome. I'm Maya, and I spend my days asking engineers to explain things slowly.",
    },
    {
      speaker: "leo",
      text: "And I'm Leo. I build this kind of tooling, so I'm usually the one explaining slowly.",
    },
    {
      speaker: "maya",
      text: "One thing before we start: we're synthetic voices, reading a script the Platform team at Plain Concepts wrote for this page.",
    },
    {
      speaker: "leo",
      text: "Which means every fact in here comes from the page itself. Nothing made up.",
    },
    {
      speaker: "maya",
      text: "This series is one journey in four episodes. You start with a repository that has no AI in it at all, and you add four layers. The repository understands an agent. Agents work without you. You know whether it works. And last, if you want it, the Platform look and stack.",
    },
    {
      speaker: "leo",
      text: "And every piece can be done by hand, in any repository, with tools anyone can install. You don't need us.",
    },
    {
      speaker: "maya",
      text: "But each layer ends with one Platform command that does all of its pieces at once.",
    },
    {
      speaker: "leo",
      text: "The shortcut. But you should know what a shortcut does for you, so we walk the long way first.",
    },
    {
      speaker: "maya",
      text: "Today is layer one, the agent harness. Nine pieces. Ready?",
    },
    { speaker: "leo", text: "Ready." },
    {
      speaker: "maya",
      piece: 0,
      text: "Piece one point one: add agents dot M D. What goes wrong without it?",
    },
    {
      speaker: "leo",
      text: "Say you ask an agent to add a due date filter to an invoices endpoint. It runs N P M install in a P N P M repository and commits the wrong lockfile. It edits the generated Prisma client by hand. It runs N P M test, which doesn't exist.",
    },
    { speaker: "maya", text: "Oh no." },
    {
      speaker: "leo",
      text: "Then it calls it done without running the type check. Nothing it did was unreasonable. It just knew nothing about the repository.",
    },
    {
      speaker: "maya",
      text: "So agents dot M D is a read me for agents?",
    },
    {
      speaker: "leo",
      text: "Pretty much. A plain markdown file at the root, read at the start of every session. What you'd tell a new teammate on day one. Commands first, exactly as you type them. An agent can't do anything with run the usual checks.",
    },
    {
      speaker: "leo",
      text: "Then the layout, and rules phrased as nevers with a reason. Never import one module's repository from another, or the invoice totals skip the rounding rules. The agent can check its own diff against that.",
    },
    {
      speaker: "maya",
      text: "And the reason lets it handle a case you didn't think of.",
    },
    {
      speaker: "leo",
      text: "Exactly. One trap: Claude Code reads agents dot M D only when there's no Claude dot M D. Add one, and agents dot M D drops out of its context.",
    },
    {
      speaker: "maya",
      text: "Wait, so one Claude-specific line switches off the whole file?",
    },
    {
      speaker: "leo",
      text: "It does, unless Claude dot M D imports agents dot M D with a line at the top. To check, start a fresh session and ask how you know a change is finished. It should say P N P M verify and cite the file.",
    },
    { speaker: "maya", text: "And the Platform shortcut?" },
    {
      speaker: "leo",
      text: "It clears out stale instruction files, writes a bootstrap agents dot M D, and the repo initialize command replaces it with a full operating guide.",
    },
    {
      speaker: "maya",
      piece: 1,
      text: "Piece one point two: install skills from skills dot S H. Why not just make agents dot M D longer?",
    },
    {
      speaker: "leo",
      text: "Because every line of it is in every session. Someone pastes two hundred lines on how the team writes Playwright tests. Now the session that renames a variable pays for them, and the agent still writes tests its own way.",
    },
    { speaker: "maya", text: "So a skill is lazy loading." },
    {
      speaker: "leo",
      text: "Good way to put it. A skill is a folder with a skill dot M D file: a name, a description, then instructions. Only the description sits in context, so the description is the part that matters. The body loads when the agent decides it's relevant.",
    },
    { speaker: "maya", text: "And skills dot S H?" },
    {
      speaker: "leo",
      text: "A public directory of skills, ranked by installs, with security audits. A command line tool from Vercel Labs searches it and installs from any GitHub repository. Start with find skills, which teaches the agent to search the directory itself instead of improvising.",
    },
    { speaker: "maya", text: "Installed for me, or for the project?" },
    {
      speaker: "leo",
      text: "The project. Then it's committed and everyone gets the same skills. Installing globally works on your machine and nowhere else. And commit the skills lock file, which records where each skill came from and a hash of its content.",
    },
    {
      speaker: "maya",
      text: "Anything to watch before installing one?",
    },
    {
      speaker: "leo",
      text: "Read it first. It's instructions your agent will follow with your permissions. Platform's wizard installs from a committed lockfile, find skills among them, and the make engineer command picks skills for each specialist, always project-local.",
    },
    {
      speaker: "maya",
      piece: 2,
      text: "Piece one point three: write your guardrails as a skill.",
    },
    {
      speaker: "leo",
      text: "An agent writing a webhook test copies dot E N V to dot E N V dot test, real Stripe key included, and commits it. Same change: a doc comment above every function and eleven tests for a two-line fix.",
    },
    { speaker: "maya", text: "And agents dot M D said?" },
    {
      speaker: "leo",
      text: "Be careful with secrets. Keep code clean. Which, by its own standard, it was.",
    },
    { speaker: "maya", text: "So how do you write it properly?" },
    {
      speaker: "leo",
      text: "Two skills. Guardrails, for rules that hold in any repository, and project guardrails, for rules from this codebase. Each rule is a never with its reason, and the reason generalises. What forbids git add dash A also forbids git commit dash A: the tree may hold someone else's work.",
    },
    { speaker: "maya", text: "Where do the project rules come from?" },
    {
      speaker: "leo",
      text: "Evidence. Architecture dot M D, the lint config, CI, past incidents. And leave out what a tool already enforces. If the linter catches unused imports, a guardrail about it is noise.",
    },
    { speaker: "maya", text: "What do people get wrong?" },
    {
      speaker: "leo",
      text: "Treating the skill as enforcement. It's usually followed, but it's still a request. Platform generates the project skill with the make guardrails command, and a plugin blocks editing, the shell and spawning until both guardrails skills are loaded.",
    },
    {
      speaker: "maya",
      piece: 3,
      text: "Piece one point four: write architecture dot M D and design dot M D.",
    },
    {
      speaker: "leo",
      text: "You ask for payment reminders. The agent writes an email service in a shared utils file that queries the invoices table directly, so reminders skip the status rules and go out for invoices already paid. And it styles the banner with a new blue and a drop shadow, in a theme that has neither.",
    },
    { speaker: "maya", text: "Ouch. So architecture dot M D, written from what?" },
    {
      speaker: "leo",
      text: "From the code, not from memory. Folders, routes, data model, CI. And every section should say what breaks. Anything that computes a total outside the invoices module skips tax rounding. That's a constraint.",
    },
    { speaker: "maya", text: "And design dot M D?" },
    {
      speaker: "leo",
      text: "The tokens, colours, type, spacing, plus the intent tokens can't carry. Google's design dot M D format puts the tokens in the frontmatter and the intent in sections, and it has a linter you can run in CI.",
    },
    { speaker: "maya", text: "Common mistake?" },
    {
      speaker: "leo",
      text: "Generating both once and never again. Six months later they're confidently wrong, which is worse than missing. Platform generates both from the codebase, and later rewrites only the sections that moved since their last updated footer.",
    },
    {
      speaker: "maya",
      piece: 4,
      text: "Piece one point five: create your first agents. I'll be honest, this one sounds like overhead.",
    },
    {
      speaker: "leo",
      text: "Fair. You ask how it would split the PDF renderer out, and it starts moving files while it's still answering. Twelve files later, there's a refactor you never asked for.",
    },
    {
      speaker: "maya",
      text: "And telling it only plan lasts until the session compacts that sentence away.",
    },
    {
      speaker: "leo",
      text: "Right. So the planner has to be unable to edit, not asked not to. In Open Code you tighten the plan agent in its config: deny edits, allow only inspection commands in the shell, and deny spawning subagents.",
    },
    { speaker: "maya", text: "Why subagents?" },
    {
      speaker: "leo",
      text: "Because a planner that can call a build subagent just has it make the change. In Claude Code you write a planner subagent whose tool list has no edit and no write.",
    },
    { speaker: "maya", text: "Then specialists." },
    {
      speaker: "leo",
      text: "A backend engineer, say, with a description written as use when, because that's how delegation is decided. And a reviewer that can't edit, because a reviewer that fixes what it finds means nobody reviewed the fix.",
    },
    { speaker: "maya", text: "How do I check it?" },
    {
      speaker: "leo",
      text: "Ask the planner to rename a function. It should give you a plan, and the edit call should never appear. Platform regenerates build and plan on every startup, and the make engineer command creates the specialists.",
    },
    {
      speaker: "maya",
      piece: 5,
      text: "Piece one point six: work from specs with Open Spec.",
    },
    {
      speaker: "leo",
      text: "Three weeks after a change, someone asks why late fees are calculated per invoice line instead of on the total. The commit says fix late fees. The pull request says see commit.",
    },
    { speaker: "maya", text: "Classic." },
    {
      speaker: "leo",
      text: "And the next agent reads the code, decides it's a bug, and fixes it back.",
    },
    { speaker: "maya", text: "So Open Spec keeps the why." },
    {
      speaker: "leo",
      text: "It keeps specs, what the system does today, and changes, one folder per change in flight. You ask for a change through its propose command, and the agent writes a proposal, tasks, and spec deltas with scenarios, before any code exists.",
    },
    {
      speaker: "maya",
      text: "And in the example, the proposal says why per line.",
    },
    {
      speaker: "leo",
      text: "Because tax-exempt lines are exempt from the fee by contract. Then apply works through the tasks, and archive merges the deltas into the specs.",
    },
    { speaker: "maya", text: "Do I need a proposal to fix a typo?" },
    {
      speaker: "leo",
      text: "Please, no. That's the mistake that kills it. Agents dot M D should say behaviour changes get a proposal, bug fixes and refactors don't. Platform's wizard initialises Open Spec and wraps the flow in its plan propose, plan apply and plan archive commands.",
    },
    {
      speaker: "maya",
      piece: 6,
      text: "Piece one point seven: turn the nevers into hooks.",
    },
    {
      speaker: "leo",
      text: "Agents dot M D says never git add dash A, and so do the guardrails. Forty turns in, after compaction, the agent runs it anyway. It stages a local dot E N V and a colleague's half-written migration, then pushes to main.",
    },
    {
      speaker: "maya",
      text: "Every rule written down, and none of them in the way.",
    },
    {
      speaker: "leo",
      text: "A written rule can be ignored. A denied one never runs. A hook runs before a tool call and can refuse it. It can't judge code, but it can recognise a command: git add dash A, a push to the default branch, a force push, reading a dot E N V file.",
    },
    { speaker: "maya", text: "Where do you start?" },
    {
      speaker: "leo",
      text: "With the permission rules both tools already have. They're cheap, but they only match text. Then a real hook, a plugin in Open Code or a pre tool use hook in Claude Code, that checks every part of a chained command and answers each denial with the rule and the fix.",
    },
    { speaker: "maya", text: "Why does the fix matter?" },
    {
      speaker: "leo",
      text: "Otherwise the agent retries the same command in a different spelling until one gets through. And the hook should fail open on its own bugs. A guard that breaks every session is worse than the rule it enforces.",
    },
    {
      speaker: "leo",
      text: "Platform's system reminders plugin denies those commands and writes outside the repository, each with the rule and the fix.",
    },
    {
      speaker: "maya",
      piece: 7,
      text: "Piece one point eight: gate the diff.",
    },
    {
      speaker: "leo",
      text: "An agent fixes a rounding bug in two lines, and the diff adds fourteen tests. One skipped, one snapshot of the whole invoice, three that only check a mock was called. And a doc comment reading gets the invoice total, above get invoice total.",
    },
    { speaker: "maya", text: "But CI's green." },
    {
      speaker: "leo",
      text: "And the reviewer gets four hundred lines for a two-line fix, and skims them.",
    },
    { speaker: "maya", text: "So, a linter?" },
    {
      speaker: "leo",
      text: "Linters check code. This checks the change. A small script that reads only the lines the branch adds, and fails on comment slop, separator banners, commented-out code, and tests that are skipped, snapshots or assert nothing. No model, so the same diff always gets the same answer.",
    },
    { speaker: "maya", text: "Where does it run?" },
    {
      speaker: "leo",
      text: "Inside P N P M verify, so the agent hits it before the pull request exists. And in CI, because a local gate can be skipped. The mistake is running it on the whole repository. Old code fails everywhere, and the gate is disabled within a week.",
    },
    {
      speaker: "leo",
      text: "Platform ships check diff in the harness, and the merge gate runs it on the pull request. A failing result never auto-merges.",
    },
    {
      speaker: "maya",
      piece: 8,
      text: "Last one. Piece one point nine: make context cheap.",
    },
    {
      speaker: "leo",
      text: "You ask where the late fee is calculated. The agent reads forty files to find one function. Then two thousand lines of passing tests fill the context. Next morning, it rediscovers yesterday's decision from scratch.",
    },
    { speaker: "maya", text: "Three problems." },
    {
      speaker: "leo",
      text: "Three tools. Code Graph indexes the repository into a local graph of symbols and calls, so one query returns the relevant source and who calls it. Agent Memory is a local server where the agent saves a decision and finds it in a later session.",
    },
    { speaker: "maya", text: "And the test output?" },
    {
      speaker: "leo",
      text: "R T K, a single binary that compresses command output before the model sees it. A test run reports failures, not every pass. Check you got the right one, though. There's an unrelated project with the same name.",
    },
    { speaker: "maya", text: "Of course there is." },
    {
      speaker: "leo",
      text: "The big mistake is installing them and never telling the agent. It just keeps searching text. So your guardrails say which tool answers which question. Platform's wizard offers all of them in one checklist and writes that section for you.",
    },
    {
      speaker: "maya",
      text: "So, layer one. Agents dot M D, skills, guardrails, architecture and design, agents with real limits, Open Spec, hooks, the diff gate, and cheap context.",
    },
    { speaker: "leo", text: "Nine pieces." },
    { speaker: "maya", text: "And the shortcut?" },
    {
      speaker: "leo",
      text: "One command. N P X, then the agent harness package from Plain Concepts Platform, at latest. A wizard that walks through all nine.",
    },
    {
      speaker: "maya",
      text: "And that gets you to the level called agents in the repo.",
    },
    {
      speaker: "leo",
      text: "Your repository understands an agent.",
    },
    {
      speaker: "maya",
      text: "Which still means somebody has to sit there and start it.",
    },
    { speaker: "leo", text: "For now. That's next time." },
    {
      speaker: "maya",
      text: "Next episode, layer two: agents work without you. Issues refined, implemented and merged on their own. See you there.",
    },
  ],
};
