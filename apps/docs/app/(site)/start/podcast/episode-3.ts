import type { Episode } from "./types";

export const EPISODE_3: Episode = {
  layer: 2,
  title: "Layer 3: you know whether it works",
  summary:
    "Maya and Leo walk through project-health: delivery, facets, autonomy, cost and the roadmap, measured honestly, so you know how much you ship, at what quality, and how much the agents do alone.",
  turns: [
    {
      speaker: "maya",
      text: "Welcome back. Quick recap: after layer one, the repository understands an agent. After layer two, agents work without you.",
    },
    { speaker: "leo", text: "Which raises the obvious question." },
    { speaker: "maya", text: "Is any of it working?" },
    {
      speaker: "leo",
      text: "That's layer three, project health. The level is called Measured: you know how much you deliver, at what quality, and how much the agents do alone.",
    },
    {
      speaker: "maya",
      text: "Measuring sounds like the part everyone promises and nobody does.",
    },
    {
      speaker: "leo",
      text: "Once agents do the work, I think we're doing fine stops being good enough. You need numbers. Honest ones. Three rules. A missing value is never a zero. You never estimate to fill a gap. And a green collection run is not proof that anything was measured.",
    },
    {
      speaker: "maya",
      text: "Write those down. Piece three point one: measure delivery.",
      piece: 0,
    },
    {
      speaker: "leo",
      text: "Picture the monthly review of an invoices API. Someone says the team ships a lot, because the pull request count went up.",
    },
    { speaker: "maya", text: "Which isn't the same thing." },
    {
      speaker: "leo",
      text: "Nobody can say how often production changed in October. The figures people quote come from the CI page, where a re-run counts as two releases.",
    },
    { speaker: "maya", text: "And a red pipeline counts as a failed one?" },
    {
      speaker: "leo",
      text: "So decide what counts as a release. In DORA terms, delivery is about production, and on GitHub that's the Deployments API. If your deploy job declares a production environment, the records already exist.",
    },
    { speaker: "maya", text: "That sounds almost too easy." },
    {
      speaker: "leo",
      text: "There's a catch. A token without permission to read deployments can answer not found instead of forbidden, and an empty list reads as a project that never deploys.",
    },
    {
      speaker: "maya",
      text: "So if the list comes back empty, check the token before you believe it.",
    },
    {
      speaker: "leo",
      text: "Right. Then don't count records. A re-run, or a rollout to three regions, creates several records for the same commit, and your frequency triples without anything new shipping. A release is a distinct commit that reached production.",
    },
    { speaker: "maya", text: "And lead time?" },
    {
      speaker: "leo",
      text: "From a change being committed to it running in production. Compare each release with the one before; the commits in between shipped in this one. Report percentiles, not an average, so one commit that sat on a branch for three weeks doesn't drag the whole month.",
    },
    { speaker: "maya", text: "What about this month? It's only half over." },
    {
      speaker: "leo",
      text: "Divide by the days that have passed, and mark it partial. Otherwise the current month always looks like the slowest.",
    },
    { speaker: "maya", text: "And change fail rate? Recovery time?" },
    {
      speaker: "leo",
      text: "Those, the repository refuses. Both need to know a release broke production and needed immediate intervention. That's a fact about the running service. A red pipeline fails before anything ships, and a green deploy can still break production.",
    },
    { speaker: "maya", text: "So a pipeline-based fail rate is just..." },
    {
      speaker: "leo",
      text: "Zero, or noise, forever. So the month's file says not available, with a reason. Otherwise a project with no production environment tops the table for fastest lead time.",
    },
    { speaker: "maya", text: "Winning by not existing." },
    {
      speaker: "leo",
      text: "Project health's collector does all this from each project's entry in projects dot JSON, and refuses fail rate and recovery time outright.",
    },
    {
      speaker: "maya",
      text: "Piece three point two: publish engineering facets.",
      piece: 1,
    },
    {
      speaker: "leo",
      text: "Same API. Coverage gets read off a pull request comment when someone remembers. Eighty-one percent in March, nobody knows in May. Then a refactor drops it to sixty-four, the coverage gate fails, the job stops, and no number is recorded at all.",
    },
    {
      speaker: "maya",
      text: "Oh no. So the one sample that mattered is the one that's missing.",
    },
    {
      speaker: "leo",
      text: "A facet is a small JSON report CI writes about one aspect of the code, like coverage, complexity or security. Each goes in the same envelope: which facet, repository, ref, commit and run, then the data.",
    },
    { speaker: "maya", text: "Why the envelope?" },
    {
      speaker: "leo",
      text: "So a reader can check the report came from this repository's default branch before trusting it, and keep one sample per commit. And rates are fractions from zero to one, never percentages.",
    },
    { speaker: "maya", text: "Does the facet script run the tests?" },
    {
      speaker: "leo",
      text: "No. It reads what the tool already wrote. And it never fails the job. The gate is the gate; a facet only records what the gate saw. If the tool's report is missing, it writes nothing.",
    },
    { speaker: "maya", text: "Rather than zeros." },
    {
      speaker: "leo",
      text: "A facet that isn't there reads as not available, which is true. A facet full of zeros reads as a disaster that never happened.",
    },
    { speaker: "maya", text: "How does the sample survive a red build?" },
    {
      speaker: "leo",
      text: "Order the steps. Tests, then the facet, then the floor as its own step, then the upload, each running unless the run was cancelled. The common mistake is uploading only on success, which throws away exactly the drop you wanted to see.",
    },
    { speaker: "maya", text: "And pull requests upload too?" },
    {
      speaker: "leo",
      text: "Main only. A pull request measures code that may never merge. Artifacts expire, usually after ninety days, so they're a mailbox, not an archive. Something has to read them and keep the history.",
    },
    { speaker: "maya", text: "Which is project health." },
    {
      speaker: "leo",
      text: "It validates each facet against its schema, ignores any whose repository or ref doesn't match, and scores the Engineering scorecard as measured rather than inferred.",
    },
    {
      speaker: "maya",
      text: "Piece three point three: measure autonomy. The one I've been waiting for.",
      piece: 2,
    },
    {
      speaker: "leo",
      text: "Say the agents opened thirty pull requests last month, and the team says they help a lot. Every one was merged by the tech lead after reading the diff.",
    },
    { speaker: "maya", text: "Ah. Autonomous on paper." },
    {
      speaker: "leo",
      text: "Or the opposite. The merge gate merges everything, two changes get reverted the next morning, and nobody connects the reverts to the gate.",
    },
    { speaker: "maya", text: "So where do you start?" },
    {
      speaker: "leo",
      text: "Find the agent's pull requests by a mark it always leaves and a person never does, like a title prefix. A label is weaker, because people change labels by hand. And count merged ones, not opened ones.",
    },
    { speaker: "maya", text: "Then?" },
    {
      speaker: "leo",
      text: "Each one ends one of three ways. Merged by the gate, nobody involved. Parked by the gate, then merged by a person. Or merged by a person without the gate ever parking it. Only the first is autonomy.",
    },
    {
      speaker: "maya",
      text: "Wait, parked then merged doesn't count? The gate looked at it.",
    },
    {
      speaker: "leo",
      text: "And handed it to a person, who read it and decided. Useful work, but it still needed someone. The gate writes its verdict in a comment with a hidden marker, and you read the last one, not the first. A gate that parks something and approves it after a fix has changed its mind.",
    },
    { speaker: "maya", text: "So the result is a percentage." },
    {
      speaker: "leo",
      text: "A share, always beside its counts. Two out of two is a hundred percent. So is forty out of forty. Only one of them says anything. And a month with no agent merges has no share. Null, with a reason. Zero percent would claim the gate refused everything.",
    },
    { speaker: "maya", text: "You mentioned reverts." },
    {
      speaker: "leo",
      text: "You count them beside the share. The share should climb, the reverts should stay flat. If both climb, the gate got more permissive, not better. And reverts arrive late, so you recompute recent months.",
    },
    { speaker: "maya", text: "And Platform shows this where?" },
    {
      speaker: "leo",
      text: "Project health's Agentic tab shows the share merged by the gate, and the reverted count lives in the workflows' Needs a human digest.",
    },
    {
      speaker: "maya",
      text: "Piece three point four: measure cost. The question my manager actually asks.",
      piece: 3,
    },
    {
      speaker: "leo",
      text: "October's bill from the model provider is higher than September's. Was it triage on a flood of issues? One implement run that looped for an hour? The merge gate reviewing every push?",
    },
    { speaker: "maya", text: "Can't you just check the Actions page?" },
    {
      speaker: "leo",
      text: "The agent workflow also wakes on a schedule and on every comment, so its time says nothing about the agents. Only the run knows its tokens, so the agent step writes a small usage file from what the agent CLI reports, named after the kind of work.",
    },
    { speaker: "maya", text: "In euros?" },
    {
      speaker: "leo",
      text: "In tokens. Prices change, differ per account, and go stale in a committed file.",
    },
    { speaker: "maya", text: "And how do I find the agent runs?" },
    {
      speaker: "leo",
      text: "By evidence, not by title. Titles differ by trigger, so whole kinds of work go missing. Keep the runs where the agent step actually ran, with a start and an end time. A declared job that was skipped isn't an agent run; count it and you halve every average.",
    },
    {
      speaker: "maya",
      text: "And a run that crashed before it uploaded anything?",
    },
    {
      speaker: "leo",
      text: "It's an agent run with no usage. You count both, and print measured N of M beside every total.",
    },
    { speaker: "maya", text: "Rule two. You don't guess the missing ones." },
    {
      speaker: "leo",
      text: "Never. The totals are a floor, and they say so. Without that line, a month where half the runs uploaded nothing looks half as expensive.",
    },
    { speaker: "maya", text: "One total for the month, then?" },
    {
      speaker: "leo",
      text: "Per kind of work. After a surprising bill, the question is always which one moved. And save each month before its artifacts expire. Project health's Agents panel stores measured runs, so each day it only collects what happened since yesterday.",
    },
    {
      speaker: "maya",
      text: "Last one. Piece three point five: the roadmap.",
      piece: 4,
    },
    { speaker: "leo", text: "The board says twelve issues are in progress." },
    { speaker: "maya", text: "Let me guess. They aren't." },
    {
      speaker: "leo",
      text: "Three have an agent on them. Five wait for an answer to a question the refine agent asked on Tuesday. Two have a pull request the gate parked. Two were labelled by a workflow and never started.",
    },
    {
      speaker: "maya",
      text: "And you can't tell which without opening all twelve.",
    },
    {
      speaker: "leo",
      text: "But if your agents hand issues over with labels, the labels say who had each issue at each moment. Map them to five states: agent working, waiting on a person, waiting to merge, queued, and by hand.",
    },
    { speaker: "maya", text: "By hand meaning?" },
    {
      speaker: "leo",
      text: "It never carried an agent label. Call that time queued and you blame a queue for work a person was doing.",
    },
    {
      speaker: "maya",
      text: "But labels only say where an issue is now.",
    },
    {
      speaker: "leo",
      text: "The timeline says where its time went. Every label added and removed, plus closes and reopens. Walk it in order, add each stretch to its state, and leave out the time it was closed. The share of time an agent was actually working is usually much smaller than people expect.",
    },
    { speaker: "maya", text: "Ouch. The rest is waiting." },
    {
      speaker: "leo",
      text: "And there's a sneaky one. Events caused by a workflow's own GitHub token don't start other workflows. So an automation sets the refine label, the refine workflow never wakes, and nothing on the issue says so.",
    },
    {
      speaker: "maya",
      text: "Except the timeline. A trigger label, then no agent picking it up.",
    },
    {
      speaker: "leo",
      text: "So the roadmap names those. And for what needs a person right now, there's the Needs a human digest: one issue, rewritten in place every few hours, with questions for the author, decisions for the owner, and pull requests the gate parked.",
    },
    { speaker: "maya", text: "What decides what goes in it?" },
    {
      speaker: "leo",
      text: "Retry a failure, report a decision. A crash or a timeout is retried and listed apart. A verdict an agent reached on purpose is reported, never retried, because running a decision again only reproduces it.",
    },
    { speaker: "maya", text: "And Platform draws all this?" },
    {
      speaker: "leo",
      text: "Project health's Roadmap tab draws those states as a Gantt chart and names the labels nobody picked up. The digest comes with agentic workflows, every six hours.",
    },
    {
      speaker: "maya",
      text: "So: delivery from production, not CI. Facets that record, never gate. Autonomy with its counts and reverts. Cost in tokens, measured N of M. And a roadmap of who's really holding each issue.",
    },
    {
      speaker: "leo",
      text: "And the honesty rules under all of it. Missing is never zero. Never estimate to fill a gap. And a green collection run can still have read an empty list, a token that can't see, or expired artifacts. Look at the numbers, not the check mark.",
    },
    { speaker: "maya", text: "And the whole layer at once?" },
    {
      speaker: "leo",
      text: "Ask your agent to read blueprint dot M D in project health and adopt it. With all five pieces in place, you're at Measured.",
    },
    {
      speaker: "maya",
      text: "Next time, layer four, Foundations. Which, I'm told, is optional.",
    },
    {
      speaker: "leo",
      text: "Optional, but it's where a repository starts to look like Platform.",
    },
    { speaker: "maya", text: "See you there." },
  ],
};
