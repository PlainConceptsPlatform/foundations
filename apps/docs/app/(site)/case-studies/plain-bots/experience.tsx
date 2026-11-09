"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useState } from "react";
import { ProductDepth, type Shot, type Surface } from "../_shared/depth";
import { Diagram, DiagramEdge, DiagramNode, DiagramZone } from "../_shared/diagram";
import { CaseStudyCta } from "../_shared/engagement";
import { useCaseListen } from "../_shared/listen";
import { createPodcast } from "../_shared/podcast";
import { PodcastPlayer } from "../_shared/podcast-player";
import { CaseHero, StorySection } from "../_shared/story";

const CHAPTERS = [
  {
    id: "bots-act",
    label: "A conversation becomes work",
    labelEs: "Una conversación se convierte en trabajo",
  },
  {
    id: "bots-handoff",
    label: "A person keeps the last word",
    labelEs: "Una persona tiene la última palabra",
  },
  {
    id: "bots-routines",
    label: "Work starts on a schedule",
    labelEs: "El trabajo empieza según un horario",
  },
  {
    id: "bots-route",
    label: "Choose the right specialist",
    labelEs: "Elegir al especialista adecuado",
  },
  { id: "bots-safe", label: "Every action leaves a trace", labelEs: "Cada acción deja rastro" },
];

const PODCAST = createPodcast(
  {
    en: CHAPTERS.map((chapter) => ({ title: chapter.label, duration: 10 })),
    es: CHAPTERS.map((chapter) => ({ title: chapter.labelEs, duration: 10 })),
  },
  "enterprise-bots",
);

const SHOTS: Shot[] = [
  {
    src: "case-studies/plain-bots/catalog.jpg",
    path: "Bots · Specialist catalog",
    tag: "01",
    caption: "Choose one specialist for a task, add several to a group chat or author a new bot.",
  },
  {
    src: "case-studies/plain-bots/composer.png",
    path: "Bots · One-to-one chat",
    tag: "02",
    caption:
      "The chat shows the mode, model and available tools. Manual mode asks before a change; bypass mode can proceed within the tool policy.",
  },
  {
    src: "case-studies/plain-bots/conversation.png",
    path: "Bots · Group chat and document",
    tag: "03",
    caption:
      "Two specialists answer a fictional brief and produce a Word document that can be downloaded from the thread.",
  },
];

const SURFACES: Surface[] = [
  {
    title: "Connection model",
    description: "Sign in without copying a key.",
    detail:
      "The standard path is OAuth with your company account. A tool such as VS Code uses the OAuth device flow and stores no key. A personal key is a fallback for clients such as a CLI that cannot complete OAuth. Generate one from AI Usage, treat it as a credential and revoke it when the tool supports OAuth.",
    visual: (
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="rounded-md border border-border bg-background px-2.5 py-1 font-medium">
          VS Code
        </span>
        <span aria-hidden className="text-muted-foreground">
          →
        </span>
        <span className="rounded-md border border-primary px-2.5 py-1 font-medium text-primary">
          OAuth device flow
        </span>
        <span aria-hidden className="text-muted-foreground">
          →
        </span>
        <span className="rounded-md border border-border bg-background px-2.5 py-1 font-medium">
          Plain
        </span>
      </div>
    ),
  },
  {
    title: "Specialists and chat templates",
    description: "One bot per task or several in one conversation.",
    detail:
      "A specialist is configured for one kind of work, such as issue triage, planning, handbook questions or account analysis. A chat template bundles several specialists into one conversation. The first bot you pick answers messages that name nobody. Type an at-sign and a bot name to address a particular specialist. An administrator can limit some bots and integrations to certain teams.",
    size: "featured",
    visual: (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {["issues-bot", "capacity-bot", "handbook-bot", "account-bot"].map((bot) => (
            <span
              key={bot}
              className="rounded-full border border-info/40 px-2.5 py-1 text-xs font-medium text-info"
            >
              {bot}
            </span>
          ))}
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Chat template · sprint-review
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="rounded-md border border-border bg-background px-2 py-1 font-medium">
              @issues-bot
            </span>
            <span aria-hidden className="text-muted-foreground">
              +
            </span>
            <span className="rounded-md border border-border bg-background px-2 py-1 font-medium">
              @capacity-bot
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Connected systems",
    description: "Each integration uses your access.",
    detail:
      "Integrations can reach mail, calendar, files, chat, the CRM, code hosting, reporting and other internal systems. Each one connects with your account, so a bot cannot reach anything you cannot reach yourself. Connect or disconnect each system from one page.",
    size: "wide",
    visual: (
      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ["Mail", true],
            ["Calendar", true],
            ["Teams", true],
            ["Files", true],
            ["CRM", true],
            ["Code", true],
            ["Reports", true],
            ["Ticketing", false],
          ] as [string, boolean][]
        ).map(([label, on]) => (
          <span
            key={label}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
              on ? "border-success/40 text-success" : "border-border text-muted-foreground",
            )}
          >
            {on ? <Check aria-hidden className="size-3" /> : <span aria-hidden>—</span>}
            {label}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Manual and bypass",
    description: "The chat mode controls changes.",
    detail:
      "Reading does not need approval. Before a bot changes something, manual mode asks first and bypass mode proceeds. A tool that its author marked to ask first still asks, and company blocks remain in force. In Settings, bypass is labelled Auto.",
    visual: (
      <div>
        <div className="inline-flex overflow-hidden rounded-md border border-border text-xs">
          <span className="bg-primary px-3 py-1.5 font-medium text-primary-foreground">Manual</span>
          <span className="px-3 py-1.5">Auto</span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Author <span className="font-medium text-foreground">ask-first</span> and company{" "}
          <span className="font-medium text-foreground">blocks</span> still apply.
        </p>
      </div>
    ),
  },
  {
    title: "Drafts, not sends",
    description: "A person sends mail and Teams messages.",
    detail:
      "A bot never sends mail or a Teams message on its own. It prepares a draft in the chat for you to read and send. Approval cards work the same way: the card can suggest an answer, but you select it or write your own.",
    size: "wide",
    visual: (
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="rounded-md border border-border bg-background px-2.5 py-1 font-medium">
          bot writes draft
        </span>
        <span aria-hidden className="text-muted-foreground">
          →
        </span>
        <span className="rounded-md border border-warning/40 px-2.5 py-1 font-medium text-warning">
          waits in chat
        </span>
        <span aria-hidden className="text-muted-foreground">
          →
        </span>
        <span className="rounded-md border border-success/40 px-2.5 py-1 font-medium text-success">
          you press send
        </span>
      </div>
    ),
  },
  {
    title: "Routines",
    description: "Recurring work on a schedule.",
    detail:
      "A routine asks one chat to do something on a schedule and reports back only when there is news. It runs as you without stopping for approval, while blocked tools stay blocked. Each role has a limit on active cloud routines, and repeated failed runs pause the routine.",
    visual: (
      <div className="flex items-center gap-3">
        <div aria-hidden className="relative size-10 rounded-full border-2 border-border">
          <span className="absolute left-1/2 top-1 h-3.5 w-px origin-bottom translate-x-[-50%] rotate-45 bg-primary" />
          <span className="absolute left-1/2 top-2 h-2.5 w-px origin-bottom translate-x-[-50%] bg-muted-foreground" />
        </div>
        <div className="text-xs">
          <p className="text-muted-foreground">Runs as you · no approval stop</p>
          <p className="mt-1 font-medium text-destructive">3 fails in a row → paused</p>
        </div>
      </div>
    ),
  },
  {
    title: "Your computer or the cloud",
    description: "Where the bot does the work.",
    detail:
      "When the signed-in desktop companion is running, a bot answers from your computer. Otherwise it uses the company cloud. Cloud time has an allowance per role. When that allowance runs out, the bot can keep working on your computer at no cost. The companion connects out, so your computer does not listen for connections. Browser work uses a separate profile, never your cookies or saved passwords.",
    size: "wide",
    visual: (
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md border border-border bg-background p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Companion running</p>
          <p className="mt-1 text-sm font-medium">Answers from your computer</p>
          <p className="mt-1 text-xs text-muted-foreground">Connects out · no inbound</p>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Cloud time</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <span className="block h-full bg-primary" style={{ width: "65%" }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Monthly allowance per role</p>
        </div>
      </div>
    ),
  },
  {
    title: "Memory",
    description: "Only the facts you choose to keep.",
    detail:
      "A chat can remember preferences and decisions between sessions. It learns only from your words, not from mail, web pages, files or tool results. Start a message with a slash and the word memory to save something. Ask the bot to forget anything you no longer want it to keep.",
    visual: (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full border border-info/40 px-2.5 py-1 text-xs font-medium text-info">
            prefers plain English
          </span>
          <span className="rounded-full border border-info/40 px-2.5 py-1 text-xs font-medium text-info">
            deepen drafts
          </span>
        </div>
        <p className="font-mono text-xs text-muted-foreground">/memory &lt;fact&gt;</p>
      </div>
    ),
  },
  {
    title: "Bot authoring",
    description: "Author, test and publish a specialist.",
    detail:
      "Authorised users make bots in a studio view. They write instructions, choose integrations and skills, test in a private chat and then publish. An administrator reviews every bot before it appears in the marketplace. Skills add capabilities such as humanising or plain-English writing. Explicit tools stay off until the author enables them for that bot.",
    size: "wide",
    visual: (
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {[
          ["Write instructions", ""],
          ["Choose tools", ""],
          ["Private test", ""],
          ["Admin reviews", "success"],
          ["Publish", "success"],
        ].map(([label, kind], i, arr) => (
          <span key={label} className="flex items-center gap-1.5">
            <span
              className={cn(
                "rounded-md border border-border bg-background px-2.5 py-1 font-medium",
                kind === "success" && "border-success/40 text-success",
              )}
            >
              {label}
            </span>
            {i < arr.length - 1 ? (
              <span aria-hidden className="text-muted-foreground">
                →
              </span>
            ) : null}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "The Teams assistant and its limits",
    description: "Help while you are busy or away.",
    detail:
      "The assistant can reply to colleagues, pass a message to you or hold a draft for approval. You choose who it answers and which topics it leaves to you. It never answers people outside the company or hides that it is an assistant. It never agrees to contracts, prices, deadlines, hiring or money. It cannot move meeting invitations or touch the files and terminal on your computer.",
    size: "wide",
    visual: (
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Can</p>
          <ul className="divide-y divide-border">
            {["Reply to colleagues", "Pass a message to you", "Hold a draft for approval"].map(
              (row) => (
                <li key={row} className="flex items-center gap-2 py-1.5">
                  <Check aria-hidden className="size-3.5 text-success" />
                  {row}
                </li>
              ),
            )}
          </ul>
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Cannot</p>
          <ul className="divide-y divide-border">
            {[
              "Answer outside the company",
              "Agree to contracts or money",
              "Touch your files or terminal",
            ].map((row) => (
              <li key={row} className="flex items-center gap-2 py-1.5">
                <span aria-hidden className="text-destructive">
                  ✗
                </span>
                {row}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
];

export function BotsExperience() {
  const listen = useCaseListen(PODCAST, CHAPTERS);

  return (
    <div className="overflow-clip bg-background text-foreground">
      <CaseHero
        id="bots-act"
        eyebrow="Enterprise Bots"
        title="Specialists that work in your systems, with your access."
        lede="Choose a bot, connect the tools it needs and decide when it must ask before changing anything. Mail and Teams messages stay as drafts until you press Send."
        image="case-studies/plain-bots/conversation.png"
        imageAlt="A group chat with two specialists and a generated Word document"
        imageLabel="Group chat · A finished Word document"
        primaryHref="#bots-product"
        primaryLabel="See the bots"
        secondaryHref="#bots-handoff"
        secondaryLabel="See the handoff"
        onListen={listen.listen}
      />
      <HumanHandoff />
      <RoutineClock />
      <IntentRouter />
      <AuditTrail />
      <Architecture />
      <ProductDepth
        id="bots-product"
        label="In the product"
        title="Specialists, chat and a finished document"
        lede="The catalog, a one-to-one chat and a group conversation that produces a downloadable Word document. The group task and its document are fictional."
        shots={SHOTS}
        surfaces={SURFACES}
      />
      <CaseStudyCta
        title="A bot with a job, access and clear limits."
        body="Specialists work with your connected systems and your permissions. Chat mode and tool policy decide what they can change, while mail and Teams messages wait for you to send them."
      />
      {listen.listening !== null && (
        <>
          <div aria-hidden className="h-40" />
          <PodcastPlayer
            key={listen.listening}
            podcast={PODCAST}
            index={listen.listening}
            lang={listen.lang}
            onLang={listen.chooseLang}
            onEpisode={listen.onEpisode}
            onPiece={listen.onPiece}
            onPlayingChange={listen.onPlayingChange}
            onClose={listen.close}
          />
        </>
      )}
    </div>
  );
}

function HumanHandoff() {
  const [approved, setApproved] = useState(false);

  return (
    <StorySection
      id="bots-handoff"
      title="The bot prepares the change. You approve it."
      intro="In manual mode, a bot asks before it changes something. Tools marked to ask first always do, and company blocks still apply."
    >
      <div className="rounded-lg border border-border bg-card p-6" aria-live="polite">
        <p className="text-sm font-medium text-muted-foreground">Interactive example</p>
        <h3 className="mt-4 text-2xl font-semibold tracking-tight">Merge hotfix to main?</h3>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          The diff changes only the retry policy. All checks pass.
        </p>
        {!approved ? (
          <button
            type="button"
            onClick={() => setApproved(true)}
            data-tool-name="approve_bot_change"
            data-tool-description="Approve the bot's proposed change in this interactive example; the decision is recorded to the audit trail"
            className="mt-6 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Approve merge
          </button>
        ) : (
          <div className="mt-6">
            <p className="flex items-center gap-2 font-semibold text-primary">
              <Check aria-hidden className="size-4" />
              Approved. The decision is written to the audit trail.
            </p>
            <button
              type="button"
              onClick={() => setApproved(false)}
              data-tool-name="reset_bot_approval_example"
              data-tool-description="Reset the approval example so the bot can ask again"
              className="mt-4 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Reset example
            </button>
          </div>
        )}
      </div>
    </StorySection>
  );
}

function RoutineClock() {
  return (
    <StorySection
      id="bots-routines"
      title="Routines start work on a schedule"
      intro="A routine runs as you and reports only when there is news. It does not pause for approval. Blocked tools remain blocked, and repeated failures pause it."
      muted
    >
      <article className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-sm text-muted-foreground">Illustrative routine</p>
            <h3 className="mt-1 text-xl font-semibold">Morning operations brief</h3>
          </div>
          <p className="font-mono text-2xl font-semibold">09:00</p>
        </div>
        <ol className="mt-5 space-y-4">
          {["Collect overnight deploys", "Triage open incidents", "Prepare the morning brief"].map(
            (job, index) => (
              <li key={job} className="flex items-baseline gap-4">
                <span className="font-mono text-xs text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{job}</span>
              </li>
            ),
          )}
        </ol>
      </article>
    </StorySection>
  );
}

function IntentRouter() {
  const [intent, setIntent] = useState(0);
  const routes = [
    ["@Incident The checkout is failing", "Incident specialist", "Traces, logs and rollback"],
    ["@Sales Prepare the renewal", "Sales specialist", "Account, terms and quote"],
    ["@Knowledge Who owns this service?", "Knowledge specialist", "Catalogue, team and contacts"],
  ] as const;
  const current = routes[intent] ?? routes[0];

  return (
    <StorySection
      id="bots-route"
      title="Choose which specialist answers"
      intro="The first bot you pick answers unnamed messages. Type an at-sign and a bot name to address a particular specialist."
    >
      <div
        className="grid gap-3"
        aria-label="Example messages"
        data-tool-name="route_to_specialist"
        data-tool-description="Pick which specialist bot answers; each button routes the example message to a different specialist (Incident, Sales, Knowledge)"
      >
        {routes.map(([prompt, specialist], index) => (
          <button
            key={prompt}
            type="button"
            onClick={() => setIntent(index)}
            aria-pressed={intent === index}
            data-tool-param-description={`Route to the ${specialist}`}
            className={cn(
              "rounded-md border px-4 py-3 text-left text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              intent === index
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {prompt}
          </button>
        ))}
      </div>
      <div className="mt-6 rounded-lg border border-border bg-card p-6" aria-live="polite">
        <p className="text-sm text-muted-foreground">Answer from</p>
        <h3 className="mt-2 text-2xl font-semibold">{current?.[1]}</h3>
        <p className="mt-3 text-sm text-muted-foreground">Reads: {current?.[2]}</p>
      </div>
    </StorySection>
  );
}

function AuditTrail() {
  return (
    <StorySection
      id="bots-safe"
      title="The chat keeps an ordered audit trail"
      intro="Reads, tool calls, approvals and the resulting change stay in sequence."
      muted
    >
      <p className="text-sm text-muted-foreground">Example sequence</p>
      <ol className="mt-4">
        {[
          "Read incident",
          "Reran test suite",
          "Opened hotfix",
          "Requested approval",
          "Merged after approval",
        ].map((action, index) => (
          <li key={action} className="grid grid-cols-[2.5rem_1fr] border-b border-border py-4">
            <span className="font-mono text-xs text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{action}</span>
          </li>
        ))}
      </ol>
    </StorySection>
  );
}

function Architecture() {
  return (
    <StorySection
      id="bots-arch"
      title="A path from your message to a connected system"
      intro="You talk to one chat. The specialist that answers uses your access to reach the connected systems. It works on your computer or in the company cloud, and every draft comes back to the chat before anything is sent."
    >
      <div className="hidden sm:block">
        <Diagram
          width={1000}
          height={470}
          label="Architecture of the bots platform: you on the left, the chat in the middle with one-to-one and template chats routing via an at-sign to specialists, specialists that reach the connected systems with your access, an execution lane for your desktop companion or the company cloud with its monthly allowance, drafts that come back to the chat for you to send, and an ordered audit trail that records every decision."
        >
          <DiagramZone x={24} y={40} w={180} h={104} label="YOU" />
          <DiagramNode x={39} y={72} w={150} h={48} main="Person" />

          <DiagramZone x={244} y={40} w={380} h={310} label="THE CHAT" />
          <DiagramNode
            x={268}
            y={72}
            w={150}
            h={48}
            main="1:1 chat"
            sub="one specialist"
            kind="primary"
          />
          <DiagramNode x={444} y={72} w={150} h={48} main="Chat template" sub="several together" />
          <DiagramNode
            x={334}
            y={168}
            w={180}
            h={52}
            main="Specialist(s)"
            sub="one per kind of work"
          />
          <DiagramNode
            x={334}
            y={288}
            w={180}
            h={48}
            main="Draft in chat"
            sub="you press Send"
            kind="success"
          />

          <DiagramZone x={664} y={40} w={312} h={140} label="CONNECTED SYSTEMS" />
          <DiagramNode
            x={676}
            y={68}
            w={288}
            h={84}
            main="Mail · Calendar · Teams"
            lines={["Files · Code · Reports", "CRM · internal tools"]}
          />

          <DiagramZone x={664} y={200} w={312} h={176} label="EXECUTION" />
          <DiagramNode
            x={676}
            y={228}
            w={288}
            h={48}
            main="Your computer"
            sub="desktop companion"
          />
          <DiagramNode
            x={676}
            y={296}
            w={288}
            h={44}
            main="Company cloud"
            sub="monthly allowance"
          />

          <DiagramNode x={268} y={396} w={332} h={44} main="Audit trail" sub="ordered, per chat" />

          <DiagramEdge
            points={[
              [193, 96],
              [264, 96],
            ]}
            label="talk"
            labelAt={[228, 88]}
          />
          <DiagramEdge
            points={[
              [352, 122],
              [384, 166],
            ]}
          />
          <DiagramEdge
            points={[
              [508, 122],
              [464, 166],
            ]}
            label="@-sign"
            labelAt={[424, 150]}
          />
          <DiagramEdge
            points={[
              [514, 182],
              [672, 100],
            ]}
            label="your access"
            labelAt={[592, 133]}
          />
          <DiagramEdge
            points={[
              [444, 222],
              [672, 250],
            ]}
            label="tool calls"
            labelAt={[556, 228]}
          />
          <DiagramEdge
            points={[
              [380, 222],
              [380, 284],
            ]}
            label="drafts, never sends"
            labelAt={[338, 244]}
          />
          <DiagramEdge
            points={[
              [664, 340],
              [548, 340],
              [548, 312],
              [517, 312],
            ]}
            dashed
            label="comes back as drafts"
            labelAt={[610, 332]}
          />
          <DiagramEdge
            points={[
              [424, 336],
              [424, 392],
            ]}
            dashed
            label="decisions"
            labelAt={[462, 370]}
          />
        </Diagram>
      </div>
      <div className="sm:hidden">
        <Diagram
          width={440}
          height={700}
          scrollable={false}
          label="Architecture of the bots platform, mobile view: a person talks to a chat, one-to-one or template, which routes via an at-sign to specialists. The specialists reach the connected systems with your access and run tool calls on your desktop companion or the company cloud. Drafts come back to the chat for you to send, and every decision is written to an ordered audit trail."
        >
          <DiagramZone x={16} y={16} w={408} h={90} label="YOU" />
          <DiagramNode x={110} y={46} w={220} h={48} main="Person" />

          <DiagramZone x={16} y={152} w={408} h={196} label="THE CHAT" />
          <DiagramNode
            x={36}
            y={184}
            w={184}
            h={52}
            main="1:1 chat"
            sub="one specialist"
            kind="primary"
          />
          <DiagramNode x={220} y={184} w={184} h={52} main="Chat template" sub="several together" />
          <DiagramNode
            x={110}
            y={276}
            w={220}
            h={52}
            main="Specialist(s)"
            sub="one per kind of work"
          />

          <DiagramZone x={16} y={372} w={202} h={150} label="CONNECTED SYSTEMS" />
          <DiagramNode
            x={28}
            y={404}
            w={178}
            h={100}
            main="Mail · Calendar · Teams"
            lines={["Files · Code", "Reports · CRM", "internal tools"]}
          />

          <DiagramZone x={222} y={372} w={202} h={150} label="EXECUTION" />
          <DiagramNode
            x={234}
            y={404}
            w={178}
            h={48}
            main="Your computer"
            sub="desktop companion"
          />
          <DiagramNode
            x={234}
            y={462}
            w={178}
            h={44}
            main="Company cloud"
            sub="monthly allowance"
          />

          <DiagramNode
            x={110}
            y={556}
            w={220}
            h={52}
            main="Draft in chat"
            sub="you press Send"
            kind="success"
          />
          <DiagramNode x={110} y={630} w={220} h={48} main="Audit trail" sub="ordered, per chat" />

          <DiagramEdge
            points={[
              [220, 106],
              [220, 130],
            ]}
            label="talk"
            labelAt={[252, 122]}
          />
          <DiagramEdge
            points={[
              [128, 236],
              [178, 274],
            ]}
          />
          <DiagramEdge
            points={[
              [312, 236],
              [262, 274],
            ]}
            label="@-sign"
            labelAt={[220, 258]}
          />
          <DiagramEdge
            points={[
              [170, 328],
              [117, 372],
            ]}
            label="your access"
            labelAt={[105, 352]}
          />
          <DiagramEdge
            points={[
              [270, 328],
              [323, 372],
            ]}
            label="tool calls"
            labelAt={[335, 352]}
          />
          <DiagramEdge
            points={[
              [323, 522],
              [240, 556],
            ]}
            dashed
            label="comes back as drafts"
            labelAt={[318, 548]}
          />
          <DiagramEdge
            points={[
              [220, 608],
              [220, 630],
            ]}
            dashed
            label="decisions"
            labelAt={[258, 624]}
          />
        </Diagram>
      </div>
    </StorySection>
  );
}
