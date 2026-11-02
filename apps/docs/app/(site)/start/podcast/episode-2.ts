import type { Episode } from "./types";

export const EPISODE_2: Episode = {
  layer: 1,
  title: "Layer 2: agents work without you",
  summary:
    "Maya and Leo walk the eight pieces that let agents refine, implement and merge issues on their own, from a first agentic workflow to ephemeral runners.",
  turns: [
    { speaker: "maya", text: "Welcome back. I'm Maya." },
    { speaker: "leo", text: "And I'm Leo." },
    {
      speaker: "maya",
      text: "One-breath recap. Layer one gave the repository agents dot M D, skills, guardrails, architecture and design, agents with real limits, Open Spec, hooks, a diff gate and cheap context. The repository understands an agent.",
    },
    {
      speaker: "leo",
      text: "But it still only works when someone opens a terminal and starts it.",
    },
    {
      speaker: "maya",
      text: "So today, layer two. Agents work without you. Eight pieces, and same deal as last time: every one doable by hand.",
    },
    {
      speaker: "maya",
      piece: 0,
      text: "Piece two point one: your first agentic workflow.",
    },
    {
      speaker: "leo",
      text: "Someone opens an issue on a Friday: the approve button does nothing. An agent could ask for steps to reproduce within a minute, but it only runs when a developer pastes the issue into a terminal. Which happens on Tuesday, with half the context missing.",
    },
    { speaker: "maya", text: "So what's the tool?" },
    {
      speaker: "leo",
      text: "GitHub Agentic Workflows, G H A W. An extension for the GitHub CLI that turns a markdown file into a GitHub Actions workflow, which runs a coding agent in a sandbox.",
    },
    { speaker: "maya", text: "One markdown file." },
    {
      speaker: "leo",
      text: "One. The frontmatter is the wiring: when it runs, which engine, what it can read, which tools it has, what it may write. The body is the prompt. This first one runs when an issue opens and can write exactly one thing, a comment asking for what's missing.",
    },
    { speaker: "maya", text: "And if nothing's missing?" },
    {
      speaker: "leo",
      text: "The prompt says call the no-op tool. An agent that calls no tool at all ends the run with nothing to show and no reason given.",
    },
    { speaker: "maya", text: "Which engine runs it?" },
    {
      speaker: "leo",
      text: "Copilot by default. Claude Code is one line in the frontmatter. Each needs its credential as a repository secret. Then you compile, because Actions can't run markdown. The compiler writes a lock file beside it, an ordinary workflow, and that's what actually runs.",
    },
    { speaker: "maya", text: "What's the mistake here?" },
    {
      speaker: "leo",
      text: "Editing the markdown and pushing without recompiling. Everything stays green and the old prompt keeps running. So a CI check recompiles and fails on any difference. Platform ships a compile script that wraps the compiler, so its repositories never run the bare compile.",
    },
    {
      speaker: "maya",
      piece: 1,
      text: "Piece two point two: take verbs away.",
    },
    {
      speaker: "leo",
      text: "A weekly audit runs with a token that can write code, because that was the quickest way to get it working. One week it reads an issue that says, while you're there, delete the flaky test.",
    },
    { speaker: "maya", text: "And nothing stops it?" },
    {
      speaker: "leo",
      text: "A line in the prompt saying don't modify files. Which is a request, and a model can be talked out of a request.",
    },
    { speaker: "maya", text: "So what's the fix?" },
    {
      speaker: "leo",
      text: "In G H A W the agent job never holds a write token. Strict mode, the default, refuses write permissions on the agent. Writes go through safe outputs: the agent calls a tool like create issue, which only records the request.",
    },
    { speaker: "maya", text: "And then who writes?" },
    {
      speaker: "leo",
      text: "A separate job that runs no model. It checks each request against the configuration and applies what passes.",
    },
    {
      speaker: "maya",
      text: "So the agent requests, and the framework acts.",
    },
    {
      speaker: "leo",
      text: "Exactly. And a verb that isn't listed doesn't exist for it. This audit can create one issue, with a fixed title prefix and label. It can't comment or push, so no wording in an issue body can make it. And while three audit issues are still open, the next run is skipped.",
    },
    { speaker: "maya", text: "What goes wrong?" },
    {
      speaker: "leo",
      text: "Letting it add labels with no allowed list, so it can apply the ones that start other workflows. And you can rehearse: staged mode runs everything, applies nothing, and previews the writes. Every Platform worker declares read-only access and lists its writes.",
    },
    {
      speaker: "maya",
      piece: 2,
      text: "Piece two point three: labels are the state.",
    },
    {
      speaker: "leo",
      text: "Issue two twelve has needs refinement, in progress and ready, all at once. Two workflows and a person each added one, and nobody removed anything. A scheduled job picks it up twice.",
    },
    { speaker: "maya", text: "So the labels become a state machine." },
    {
      speaker: "leo",
      text: "A small one. Refine, refined, implement, bot working, pull request pending. Plus three a person keeps. Review parks anything for a human, future holds an issue back, and hold keeps a pull request off the merge train.",
    },
    { speaker: "maya", text: "And who moves them? The agent?" },
    {
      speaker: "leo",
      text: "Never the agent. A job with no model reads what actually happened and moves the label. A prompt injection can change what an agent says. Not which labels a shell script applies.",
    },
    {
      speaker: "maya",
      text: "And no polling, because the event already says what changed.",
    },
    {
      speaker: "leo",
      text: "Right. A labeled event says which label went on which issue. Nothing to sort.",
    },
    { speaker: "maya", text: "Is there a catch?" },
    {
      speaker: "leo",
      text: "A silent one. Writes made with the workflow's own token don't start new runs. Fine for bookkeeping. Fatal for a handoff. If refine adds implement with that token, no event fires, and the issue waits forever.",
    },
    { speaker: "maya", text: "And nothing fails?" },
    {
      speaker: "leo",
      text: "Nothing. So handoffs use a short-lived token from a GitHub App on the repository. Platform's catalog ships the label set, and a workflow that checks a person may add a label, then has the bot apply it again.",
    },
    {
      speaker: "maya",
      piece: 3,
      text: "Piece two point four: one router for every trigger.",
    },
    {
      speaker: "leo",
      text: "Five workflows each listen for labels. Add a bug label and five runs start, each spending a runner to decide it has nothing to do. And on a busy morning two of them grab the same issue.",
    },
    { speaker: "maya", text: "So, one router." },
    {
      speaker: "leo",
      text: "Workers are the agentic workflows, and they have no triggers of their own. They can only be called. The router is one plain workflow that owns every trigger, decides which one thing an event means, and calls that worker.",
    },
    { speaker: "maya", text: "How does it decide?" },
    {
      speaker: "leo",
      text: "A small classifier script. Event in, exactly one route out, no network, so a test runs the same code. A closed issue routes nowhere, and a bot's comment doesn't re-enter the route that posted it.",
    },
    { speaker: "maya", text: "And concurrency?" },
    {
      speaker: "leo",
      text: "Lives on the router and nowhere else. Refine runs one per issue, so two comments queue instead of racing. Implement runs one at a time for the whole repository.",
    },
    {
      speaker: "maya",
      text: "Does the router cut the number of runs?",
    },
    {
      speaker: "leo",
      text: "No, and people expect it to. GitHub still creates a run for every event. The unneeded ones just finish in seconds. One gotcha: the calling jobs must grant write all. A tidier list makes GitHub reject the call, with no log at all. Platform generates the router from the routes you install.",
    },
    {
      speaker: "maya",
      piece: 4,
      text: "Piece two point five: refine and implement.",
    },
    {
      speaker: "leo",
      text: "An issue says the total is wrong on fixed-price invoices. Nobody knows what wrong means. Point an agent at it anyway and it rewrites the pricing module, opens three pull requests, and closes nothing.",
    },
    { speaker: "maya", text: "Okay. Refine first." },
    {
      speaker: "leo",
      text: "Both workers start with a plain step that writes the issue and its comments to a file. The prompt says read this file, as untrusted data. That's harder to mistake for instructions than text it fetched mid-conversation.",
    },
    { speaker: "maya", text: "And refine ends how?" },
    {
      speaker: "leo",
      text: "One of two ways. Clear: it rewrites the body as a story with acceptance criteria, likely files and an estimate. Missing something: it posts the questions as one comment, and the author's reply routes back to refine. Eight points or more gets split into smaller issues.",
    },
    { speaker: "maya", text: "Then implement." },
    {
      speaker: "leo",
      text: "A step creates the branch first. The agent edits, runs the repository's own checks, commits, and asks for one pull request whose body says it closes the issue. Then it stops. It doesn't wait for CI, because that holds a runner idle.",
    },
    {
      speaker: "maya",
      text: "And what keeps it from cheating to green?",
    },
    {
      speaker: "leo",
      text: "Two sentences in the prompt. A vague sentence is not licence to redesign a module. And never pass by deleting a test, lowering a threshold or skipping a step. An agent told to make the build pass will make it pass.",
    },
    { speaker: "maya", text: "And if it crashes?" },
    {
      speaker: "leo",
      text: "A conclude job runs always. No pull request means the issue gets review and a comment, instead of bot working sitting on it for a week. Platform's workers add triage, sizing labels, linked sub-issues and a retry policy.",
    },
    {
      speaker: "maya",
      piece: 5,
      text: "Piece two point six: the merge gate and the merge train.",
    },
    {
      speaker: "leo",
      text: "Six pull requests overnight, every one waiting for a person. The first merge moves main under the other five. Two conflict, one fails CI. And by Monday the one change to the workflows slips through with the rest.",
    },
    { speaker: "maya", text: "So you decide what's dangerous." },
    {
      speaker: "leo",
      text: "First, and keep it short. Anything under the dot GitHub folder, secrets, a dot E N V file, keys or certificates, more than ten thousand changed lines outside tests and docs. Plus anything that can't be undone, like a migration that rewrites data.",
    },
    {
      speaker: "maya",
      text: "Why not park everything that touches authentication?",
    },
    {
      speaker: "leo",
      text: "Because nearly every feature does. A checkpoint that fires on everything isn't a checkpoint. Somebody ends up merging it unread.",
    },
    { speaker: "maya", text: "And the train?" },
    {
      speaker: "leo",
      text: "A job with no model. Each tick takes the oldest pull request that can move, one step. Wait for CI, merge the base in when it's behind, hand it to the gate when it's red or green. One at a time, so each merge lands on the base the next one is judged against.",
    },
    { speaker: "maya", text: "How does it hear that CI finished?" },
    {
      speaker: "leo",
      text: "Not with the obvious trigger, because GitHub never delivers it for bot pull requests. So CI's last job calls the router directly, and it has to run always, or failures never reach the train.",
    },
    { speaker: "maya", text: "And the gate itself?" },
    {
      speaker: "leo",
      text: "Red, it repairs and pushes to the same branch. Green, it reviews and reports structured evidence: findings, severity, whether it can be undone, confidence. It never names the outcome. A script decides, and merges only that exact commit.",
    },
    {
      speaker: "maya",
      text: "So if someone pushes after the review",
    },
    {
      speaker: "leo",
      text: "the merge is refused, and the train starts over on the new commit. And anything the script can't parse parks. A permissive default is how an unassessed change merges. Platform's gate also runs check diff from layer one.",
    },
    {
      speaker: "maya",
      piece: 6,
      text: "Piece two point seven: evidence after the merge.",
    },
    {
      speaker: "leo",
      text: "A pull request called approve invoices from the list merged on its own at ten past three in the morning. Next day the product owner asks if the button works.",
    },
    { speaker: "maya", text: "And the answer is a green check." },
    {
      speaker: "leo",
      text: "That's it. Nobody, person or machine, opened the page.",
    },
    { speaker: "maya", text: "So who writes the proof?" },
    {
      speaker: "leo",
      text: "The agent that implemented it, since it knows the journey. It writes a verification plan as data: waypoints, each with steps and the text that proves it got there, using labels and button names a person sees.",
    },
    { speaker: "maya", text: "And something replays it." },
    {
      speaker: "leo",
      text: "A short Playwright script, no model, in a headless browser, after the merge. It screenshots every waypoint, reached or not, because a screenshot of where it stopped is the most useful thing in a failure. It gates nothing. It's the record of what shipped.",
    },
    { speaker: "maya", text: "Mistake?" },
    {
      speaker: "leo",
      text: "Committing screenshots to the pull request's branch. New commit, so the gate's verdict no longer applies. It's also worth running before a person reviews a parked pull request. Often the screenshots are the review. Platform's evidence workflow does both.",
    },
    {
      speaker: "maya",
      piece: 7,
      text: "Piece two point eight: Forge and ephemeral runners. This one's Platform only, right?",
    },
    {
      speaker: "leo",
      text: "In its real form, yes. But there's an equivalent anyone can build.",
    },
    { speaker: "maya", text: "What's the scene?" },
    {
      speaker: "leo",
      text: "Agents on a vendor's API with a key on someone's credit card, so nobody knows which model a run used or what a month cost. And one long-lived runner whose disk fills mid-job, with yesterday's token still in the workspace.",
    },
    { speaker: "maya", text: "Lovely." },
    {
      speaker: "leo",
      text: "Platform runs its models behind its own gateway, Forge. Anyone can do the same with an OpenAI-compatible endpoint they operate: point the engine's base URL at it and allow its host in the sandbox network.",
    },
    { speaker: "maya", text: "And the runners?" },
    {
      speaker: "leo",
      text: "Ephemeral. A runner takes exactly one job and unregisters itself, on a machine created for that job and destroyed after it. Nothing survives. No full disk, no leftover credentials.",
    },
    { speaker: "maya", text: "Any trap?" },
    {
      speaker: "leo",
      text: "G H A W generates several jobs, so there are four runner settings to point at your pool. Check every one in the compiled lock. And never attach a self-hosted runner to a public repository, or anyone's fork runs on your machine.",
    },
    { speaker: "maya", text: "And Platform's version?" },
    {
      speaker: "leo",
      text: "Open Code pointed at Forge, on ephemeral Azure scale set runners. One job per machine, scaled by a small dot NET app. Zero machines at rest, two at most.",
    },
    {
      speaker: "maya",
      text: "So, layer two. A workflow that starts itself, verbs taken away, labels as state, one router, refine and implement, a merge train, evidence, and runners that disappear.",
    },
    { speaker: "leo", text: "Eight pieces." },
    { speaker: "maya", text: "And the shortcut?" },
    {
      speaker: "leo",
      text: "N P X, then the workflows package from Plain Concepts Platform. It opens a menu of every route with its install status. Install one, and you get the workers, the router, the shared actions and the compile script.",
    },
    { speaker: "maya", text: "And the level you reach?" },
    {
      speaker: "leo",
      text: "Autonomous. Issues are refined, implemented and merged on their own.",
    },
    {
      speaker: "maya",
      text: "Which raises the obvious question. Is any of it actually working?",
    },
    {
      speaker: "leo",
      text: "And I think we're doing fine isn't an answer.",
    },
    {
      speaker: "maya",
      text: "Next episode, layer three, project health: measuring delivery, autonomy and cost, so you know whether it works. See you then.",
    },
  ],
};
