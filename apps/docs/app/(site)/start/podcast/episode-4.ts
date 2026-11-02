import type { Episode } from "./types";

export const EPISODE_4: Episode = {
  layer: 3,
  title: "Layer 4: the Platform look and stack",
  summary:
    "Maya and Leo walk through Foundations, the optional last layer: one quality bar, boundaries that break the build, executable specs, the Platform look and the Platform stack, then look back at the whole journey.",
  turns: [
    {
      speaker: "maya",
      text: "Welcome to the last episode. Layer four, Foundations. And Leo, you made me promise to say this first.",
    },
    {
      speaker: "leo",
      text: "It's optional. It matters most if your repository is a Platform app. Everything in it you can reach with your own tools. The bar is what counts, not whose name is on it.",
    },
    {
      speaker: "maya",
      text: "So if I'm not building a Platform app, why keep listening?",
    },
    {
      speaker: "leo",
      text: "The first three pieces, quality, boundaries and specs, apply anywhere. The last two are the Platform look and stack.",
    },
    { speaker: "maya", text: "And the level at the end is called Platform." },
    {
      speaker: "leo",
      text: "Besides working like a Platform repository, it now reads and looks like one.",
    },
    {
      speaker: "maya",
      text: "Piece four point one: one quality bar.",
      piece: 0,
    },
    {
      speaker: "leo",
      text: "Three repositories, three bars. One blocks on coverage. One runs a secret scanner that only reports. And one has no gates at all, because nobody had time.",
    },
    { speaker: "maya", text: "And an agent writes code in all three." },
    {
      speaker: "leo",
      text: "And only the first one stops its mistakes. Ask how good the code is, and the answer depends on which repository you open.",
    },
    { speaker: "maya", text: "So what's the bar?" },
    {
      speaker: "leo",
      text: "Eleven practices, written down in engineering dot M D. Spec, tests and coverage, mutation score, secrets, vulnerabilities, static analysis, S B O M and licences, complexity, DAST, performance, and code hygiene. Every one has a free, open tool.",
    },
    {
      speaker: "maya",
      text: "Eleven sounds like a lot of overhead for a small team.",
    },
    {
      speaker: "leo",
      text: "Each one has a mode, and that's the point. Blocking fails the pipeline. Threshold holds a value above a committed floor. Policy checks an artefact, like a bill of materials. A scanner that only reports isn't the same practice as one that blocks.",
    },
    { speaker: "maya", text: "And if a practice doesn't apply to me?" },
    {
      speaker: "leo",
      text: "Write down why. A static site has no domain logic to mutate. But we have no specs yet is a gap, not an exemption.",
    },
    { speaker: "maya", text: "Where would you start?" },
    {
      speaker: "leo",
      text: "Security gates on every pull request: cheapest, and they protect you most. TruffleHog for secrets, failing only on credentials it's confirmed are live. Trivy for fixable high and critical vulnerabilities. Semgrep for static analysis, with the flag that makes it fail on findings.",
    },
    { speaker: "maya", text: "And without that flag?" },
    {
      speaker: "leo",
      text: "It reports and passes. Then a coverage floor set slightly below what CI measures today, a complexity cap of fifteen per method, and mutation testing with Stryker once a week.",
    },
    { speaker: "maya", text: "Why slightly below? Why not aim high?" },
    {
      speaker: "leo",
      text: "A floor above today's number turns red on day one and gets deleted. Slightly below, raised as coverage grows, stays. It's a ratchet. The mistake is lowering it to get back to green.",
    },
    { speaker: "maya", text: "Any other trap?" },
    {
      speaker: "leo",
      text: "A gate that isn't required only reports. Add every blocking job to the branch ruleset as a required check, and copy the names from a real pull request. Rename a job and it quietly stops being required.",
    },
    { speaker: "maya", text: "And how does Platform do it?" },
    {
      speaker: "leo",
      text: "Each gate's verdict becomes a facet that project health turns into the L zero to L three scorecard. The platform onboard skill finds the gates you already have before adding the missing ones.",
    },
    {
      speaker: "maya",
      text: "Piece four point two: boundaries that break the build.",
      piece: 1,
    },
    {
      speaker: "leo",
      text: "The architecture document says entities never import features. An agent adding an approval badge to the invoice entity needs the current user, finds it in the auth feature, and imports it.",
    },
    { speaker: "maya", text: "And review catches it." },
    {
      speaker: "leo",
      text: "Review misses one import line among two hundred. And when a lint rule finally complains, the next agent makes it pass by adding an exception to the rule.",
    },
    { speaker: "maya", text: "Oh, that is very agent." },
    {
      speaker: "leo",
      text: "From where it stands, the lint error is the problem. So the rule has to be precise. A short list of layers, each importing only from the layers below it. Sibling slices don't import each other. And a slice is imported only through its public index file.",
    },
    { speaker: "maya", text: "That's feature sliced design." },
    {
      speaker: "leo",
      text: "As Platform uses it on the Next.js App Router. App, views, widgets, features, entities, shared. Views is the pages layer, renamed so it doesn't collide with the Next.js app directory.",
    },
    { speaker: "maya", text: "And what actually enforces it?" },
    {
      speaker: "leo",
      text: "dependency-cruiser fails on forbidden imports, whatever your layers are called. With the canonical names, Steiger, the feature sliced design linter, is less to maintain. On dot NET, an architecture test with NetArchTest names the type that broke the rule.",
    },
    {
      speaker: "maya",
      text: "But the agent can still just go and edit the rule.",
    },
    {
      speaker: "leo",
      text: "Which is why you gate the rule itself. The rule files go in code owners, with code owner review required. Widening a boundary becomes an architecture decision, not a lint fix. And agents dot M D says the same: report a violation, don't edit the rule to pass.",
    },
    { speaker: "maya", text: "Common mistake?" },
    {
      speaker: "leo",
      text: "Starting at warn. A warning nobody has to fix is a report, and the count only grows. In Platform, the onboard skill checks for Steiger and an architecture test project, and adds whichever is missing as its own Open Spec change.",
    },
    {
      speaker: "maya",
      text: "Piece four point three: executable specs.",
      piece: 2,
    },
    {
      speaker: "leo",
      text: "The spec says invoices above the approval limit need a second approver. An agent refactoring the approval handler drops the check. The unit tests it rewrote alongside all pass.",
    },
    { speaker: "maya", text: "Well, of course they do. It rewrote them." },
    {
      speaker: "leo",
      text: "And invoices go out with one signature. The spec still says two. Nobody notices until finance asks why.",
    },
    { speaker: "maya", text: "So the spec itself has to run." },
    {
      speaker: "leo",
      text: "Right. Start from the spec's scenarios, in Open Spec, one spec per capability. Then restate them as Gherkin, given, when, then, in a feature file tagged with the spec it belongs to.",
    },
    { speaker: "maya", text: "Why the tag?" },
    {
      speaker: "leo",
      text: "The tag is the binding. It's cheap to write and easy to check with a script. A scenario without a tag, or with a tag that names no spec, fails the build. Change the code without the spec, the scenario fails. Delete the spec, the tag check fails.",
    },
    { speaker: "maya", text: "And what runs the scenarios?" },
    {
      speaker: "leo",
      text: "Playwright B D D in TypeScript, Reqnroll in dot NET. The same feature file runs in both. Drive the steps through the API where you can, and keep them in the language of the domain. An invoice, an approver, a limit. Not, I click the green button.",
    },
    { speaker: "maya", text: "Because the button moves." },
    {
      speaker: "leo",
      text: "And then the scenario stops describing the rule. The other mistake is generating scenarios from the code after the fact. Then they confirm what the code does, bugs included.",
    },
    { speaker: "maya", text: "What about tagging a failing one to skip it?" },
    {
      speaker: "leo",
      text: "A skipped scenario is a spec nobody checks. Fix the code or change the spec. Platform runs them as the blocking spec practice, reported in the spec facet of the Engineering scorecard.",
    },
    {
      speaker: "maya",
      text: "Piece four point four: the Platform look.",
      piece: 3,
    },
    {
      speaker: "leo",
      text: "Four internal apps, four blues. Each team picked a primary colour from a screenshot and hardcoded it in a dozen components.",
    },
    { speaker: "maya", text: "And four dark modes, I'm guessing." },
    {
      speaker: "leo",
      text: "Each with its own mistakes. The oldest still shows white cards in dark mode, because someone wrote background white.",
    },
    { speaker: "maya", text: "So, tokens." },
    {
      speaker: "leo",
      text: "Two layers of them. Primitives are the raw palette, brand five hundred, neutral one hundred, and say nothing about use. Semantic tokens say what a colour is for, primary, background, border, and point at a primitive. Components only ever use the semantic ones.",
    },
    { speaker: "maya", text: "That's how shad C N already works, right?" },
    {
      speaker: "leo",
      text: "Yes. Its tokens come in pairs, a surface and the text on it. You define them once for light mode and again under the dark class, with the same names. Tailwind four maps each one to a utility, so background primary just exists.",
    },
    {
      speaker: "maya",
      text: "How do you stop someone pasting a hex colour into a component?",
    },
    {
      speaker: "leo",
      text: "Review misses those, so a grep in CI fails on raw colours, arbitrary pixel values and inline styles. Nothing to install.",
    },
    { speaker: "maya", text: "And the classic mistake here?" },
    {
      speaker: "leo",
      text: "Defining a token only for light mode. Then it has the light value in dark mode. Every semantic token needs both blocks. And set the dark class before the page paints, or it flashes light on every load.",
    },
    { speaker: "maya", text: "And Platform's version of all that?" },
    {
      speaker: "leo",
      text: "The Platform UI theme package has an init command that installs the Platform tokens, light and dark, copies the shad C N config and adds the theme import. A components package adds shared pieces, like the Plain logo.",
    },
    {
      speaker: "maya",
      text: "Piece four point five: the Platform stack.",
      piece: 4,
    },
    {
      speaker: "leo",
      text: "Two apps from the same team. One fetches data inside components, the other in a hooks folder. One keeps its English in the J S X, the other in a constants file.",
    },
    {
      speaker: "maya",
      text: "And every review starts with a debate about where things go.",
    },
    {
      speaker: "leo",
      text: "Every single one. So on the frontend, feature sliced design, with a public index per slice. And files named after the domain. Never a file called utils.",
    },
    { speaker: "maya", text: "What's wrong with utils?" },
    {
      speaker: "leo",
      text: "A catch-all file is where unrelated code goes to hide. Then components depend on contracts, interfaces, wired once in a composition root. Platform uses inversify hooks, a small open-source wrapper around InversifyJS for React.",
    },
    { speaker: "maya", text: "Isn't dependency injection a bit much for a frontend?" },
    {
      speaker: "leo",
      text: "It buys you this: a component test becomes registering a fake, not mocking fetch. One trap. Build the container at module load, never inside a use effect. Render runs first and finds nothing registered.",
    },
    { speaker: "maya", text: "And text?" },
    {
      speaker: "leo",
      text: "No magic strings. Every text a user can see or hear goes through react I eighteen next, including the ones that are easy to forget: aria labels, placeholders, toasts. Miss those and screen reader users get English in a Spanish interface. A lint rule fails on literal text in J S X.",
    },
    { speaker: "maya", text: "And the backend?" },
    {
      speaker: "leo",
      text: "Same idea on dot NET: Clean Architecture layers, code grouped by feature inside them. Three root files keep every project consistent: build defaults with warnings as errors, central package management so each package has one version, and an editor config whose errors fail the build.",
    },
    { speaker: "maya", text: "And for an app that already exists?" },
    {
      speaker: "leo",
      text: "The platform onboard skill scans it against these conventions and migrates it one domain at a time, each step its own Open Spec change, behind Playwright characterization tests. Plus the dot NET guardrails.",
    },
    { speaker: "maya", text: "Which is also the shortcut for this layer." },
    {
      speaker: "leo",
      text: "Exactly. Ask your agent to use the platform onboard skill. When all five pieces are in place, you've reached Platform.",
    },
    {
      speaker: "maya",
      text: "And that's the series. Let's look back. Layer one?",
    },
    { speaker: "leo", text: "The repository understands an agent." },
    { speaker: "maya", text: "Layer two?" },
    { speaker: "leo", text: "Agents work without you." },
    { speaker: "maya", text: "Layer three?" },
    { speaker: "leo", text: "You know whether it works." },
    { speaker: "maya", text: "And layer four, optional." },
    {
      speaker: "leo",
      text: "It reads and looks like Platform. Same bar, same shape, same look.",
    },
    { speaker: "maya", text: "So where should someone actually start?" },
    {
      speaker: "leo",
      text: "At the top of the page. Layer one, piece one point one, add agents dot M D. Every piece can be done by hand, with tools anyone can install, and every layer ends with one command that does all of it.",
    },
    {
      speaker: "maya",
      text: "Start small, add a layer when you're ready, and skip the last one if it isn't for you.",
    },
    { speaker: "leo", text: "And measure before you brag." },
    {
      speaker: "maya",
      text: "Ha. Thanks for listening, everyone.",
    },
  ],
};
