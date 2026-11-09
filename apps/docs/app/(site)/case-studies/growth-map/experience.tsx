"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { ProductDepth, type Shot, type Surface } from "../_shared/depth";
import { Diagram, DiagramEdge, DiagramNode, DiagramZone } from "../_shared/diagram";
import { CaseStudyCta } from "../_shared/engagement";
import { useCaseListen } from "../_shared/listen";
import { createPodcast } from "../_shared/podcast";
import { PodcastPlayer } from "../_shared/podcast-player";
import { CaseHero, StorySection } from "../_shared/story";

const CHAPTERS = [
  {
    id: "map-journey",
    label: "A shared map for growth",
    labelEs: "Un mapa compartido para crecer",
  },
  {
    id: "map-skills",
    label: "Competencies and scopes",
    labelEs: "Competencias y ámbitos",
  },
  { id: "map-signal", label: "The assessment stages", labelEs: "Las fases de la evaluación" },
  {
    id: "map-org",
    label: "Two views before the review",
    labelEs: "Dos visiones antes de la revisión",
  },
  { id: "map-built", label: "Carry the actions forward", labelEs: "Trasladar las acciones" },
];

const PODCAST = createPodcast(
  {
    en: CHAPTERS.map((chapter) => ({ title: chapter.label, duration: 10 })),
    es: CHAPTERS.map((chapter) => ({ title: chapter.labelEs, duration: 10 })),
  },
  "growth-map",
);

const SHOTS: Shot[] = [
  {
    src: "case-studies/growth-map/personal.jpg",
    path: "Growth Map · Personal assessment",
    tag: "01",
    caption:
      "A personal map reads each competency across the scopes of impact. Colour shows the stage. The people, notes and framework shown are illustrative.",
  },
  {
    src: "case-studies/growth-map/growth-maps.jpg",
    path: "Growth Map · Campaign",
    tag: "02",
    caption:
      "A campaign lists the people in scope and who assesses them. All rows are sample data.",
  },
  {
    src: "case-studies/growth-map/configurator.jpg",
    path: "Growth Map · Configurator",
    tag: "03",
    caption: "Configurations run the full competency model or a lighter actions-only mode.",
  },
  {
    src: "case-studies/growth-map/framework.jpg",
    path: "Growth Map · Framework version",
    tag: "04",
    caption: "Each framework version records its effective date, publisher and the teams in scope.",
  },
];

const SURFACES: Surface[] = [
  {
    title: "Competencies and areas",
    description: "The behaviours named by the framework.",
    detail:
      "Competencies are grouped under areas, and each configuration defines its own. In the example on this page, a contributor map uses Ways of working, Craft and Clients, and a manager map swaps Craft for People. A competency belongs to one area, and two maps can share areas. Examples include collaboration, feedback, quality and communication.",
    size: "wide",
    visual: (
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md border border-border bg-background p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Contributor</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["Ways of working", "Craft", "Clients"].map((area) => (
              <span
                key={area}
                className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Manager</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["Ways of working", "People", "Clients"].map((area) => (
              <span
                key={area}
                className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Scopes of impact",
    description: "Where a person's influence lands.",
    detail:
      "Each competency is read at several scopes of impact, and each configuration names its own. The example on this page uses Own work, Team and Wider organisation. The grid places competencies in rows and scopes in columns, so breadth and depth can be read together.",
    size: "wide",
    visual: (
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
        <span className="rounded-md border border-primary px-2.5 py-1 font-medium text-primary">
          Own work
        </span>
        <span aria-hidden className="text-muted-foreground">
          →
        </span>
        <span className="rounded-md border border-border bg-background px-2.5 py-1 font-medium">
          Team
        </span>
        <span aria-hidden className="text-muted-foreground">
          →
        </span>
        <span className="rounded-md border border-primary px-2.5 py-1 font-medium text-primary">
          Wider organisation
        </span>
      </div>
    ),
  },
  {
    title: "Stages",
    description: "The assessment recorded in each cell.",
    detail:
      "A cell takes one of the stages the configuration defines. The example uses Emerging, Practising and Guiding. A cell can also be not applicable, or blank when nobody has assessed it yet. A free-text note under each competency holds the conversation around the assessment.",
    size: "featured",
    visual: (
      <div>
        <div className="grid grid-cols-[1fr_repeat(3,minmax(2.5rem,1fr))] gap-px overflow-hidden rounded-md border border-border bg-border text-xs">
          <span className="bg-card px-2 py-1.5 text-muted-foreground" />
          {["Own work", "Team", "Wider org"].map((scope) => (
            <span
              key={scope}
              className="bg-card px-1 py-1.5 text-center font-medium uppercase tracking-wide text-muted-foreground"
            >
              {scope}
            </span>
          ))}
          {[
            {
              label: "Collaboration",
              cells: [
                { id: "co-own", v: "P" },
                { id: "co-team", v: "E" },
                { id: "co-org", v: "—" },
              ],
            },
            {
              label: "Feedback",
              cells: [
                { id: "fb-own", v: "G" },
                { id: "fb-team", v: "P" },
                { id: "fb-org", v: "n/a" },
              ],
            },
            {
              label: "Quality",
              cells: [
                { id: "qu-own", v: "P" },
                { id: "qu-team", v: "P" },
                { id: "qu-org", v: "E" },
              ],
            },
            {
              label: "Communication",
              cells: [
                { id: "cm-own", v: "E" },
                { id: "cm-team", v: "—" },
                { id: "cm-org", v: "n/a" },
              ],
            },
          ].map(({ label, cells }) => (
            <div key={label} className="contents">
              <span className="bg-card px-2 py-1.5 text-muted-foreground">{label}</span>
              {cells.map((cell) => (
                <span
                  key={cell.id}
                  className={cn(
                    "px-1 py-1.5 text-center font-mono font-semibold",
                    cell.v === "E" && "bg-card text-primary",
                    cell.v === "P" && "bg-card text-primary/70",
                    cell.v === "G" && "bg-card text-success",
                    cell.v === "—" && "bg-card text-muted-foreground/40",
                    cell.v === "n/a" && "bg-card text-muted-foreground",
                  )}
                >
                  {cell.v}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-primary" /> E Emerging
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-primary/70" /> P Practising
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-success" /> G Guiding
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-muted-foreground/30" /> — blank
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-muted-foreground" /> n/a
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Two frameworks, in parallel",
    description: "Different roles, different maps.",
    detail:
      "Several configurations can run side by side, for example one for individual contributors and one for managers. They can share some areas and differ in others. A team can also run an actions-only configuration, where people agree growth actions without stages, scopes or competencies.",
    visual: (
      <div className="flex flex-col gap-1.5 text-xs">
        <span className="rounded-md border border-primary px-2.5 py-1.5 font-medium text-primary">
          Contributor map
        </span>
        <span className="text-center text-muted-foreground">shared areas</span>
        <span className="rounded-md border border-primary/70 px-2.5 py-1.5 font-medium text-primary/70">
          Manager map
        </span>
      </div>
    ),
  },
  {
    title: "The configurator",
    description: "A versioned framework.",
    detail:
      "An administrator edits the framework in the configurator. Each configuration has a key, name and description, and can use the full model or actions-only mode. Publish a version with an effective date and a note, keep a read-only history, and move between old and current versions.",
    size: "wide",
    visual: (
      <div className="divide-y divide-border text-sm">
        {[
          {
            badge: "v3",
            label: "current",
            date: "",
            eff: "effective today",
            current: true,
          },
          { badge: "v2", label: "previous", date: "read-only", eff: "" },
          { badge: "v1", label: "first", date: "read-only", eff: "" },
        ].map((row) => (
          <div key={row.badge} className="flex items-center gap-2 py-2">
            <span
              className={cn(
                "rounded px-1.5 py-0.5 font-mono text-xs",
                row.current
                  ? "bg-success text-success-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {row.badge}
            </span>
            <span className="font-medium">{row.label}</span>
            {row.eff ? (
              <span className="ml-auto text-xs text-muted-foreground">{row.eff}</span>
            ) : (
              <span className="ml-auto text-xs text-muted-foreground">{row.date}</span>
            )}
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Self and manager",
    description: "Two assessments against one map.",
    detail:
      "The person completes their own assessment and the manager completes theirs. The people list marks which of the two is done for each person. Comparing the two views sets the agenda for the review meeting before it starts.",
    visual: (
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md border border-border bg-background p-3 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Self</p>
          <div className="mt-1 text-lg font-semibold text-success">✓</div>
        </div>
        <div className="rounded-md border border-border bg-background p-3 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Manager</p>
          <div className="mt-1 text-lg font-semibold text-warning">…</div>
        </div>
      </div>
    ),
  },
  {
    title: "The review and its agreement",
    description: "A conversation followed by a record.",
    detail:
      "The person and manager meet, compare their views and agree the assessment for the cycle. They also agree a small set of growth actions to carry forward into the next campaign.",
    size: "wide",
    visual: (
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="rounded-md border border-border bg-background px-2.5 py-1 font-medium">
          Self assess
        </span>
        <span aria-hidden className="text-muted-foreground">
          →
        </span>
        <span className="rounded-md border border-border bg-background px-2.5 py-1 font-medium">
          Manager assess
        </span>
        <span aria-hidden className="text-muted-foreground">
          →
        </span>
        <span className="rounded-md border border-border bg-background px-2.5 py-1 font-medium">
          Meet &amp; compare
        </span>
        <span aria-hidden className="text-muted-foreground">
          →
        </span>
        <span className="rounded-md border border-success/40 px-2.5 py-1 font-medium text-success">
          Agree + actions
        </span>
      </div>
    ),
  },
  {
    title: "Override and history",
    description: "Who assesses and what came before.",
    detail:
      "A person's row names the current manager, the previous growth-map manager and any override, with its reason. Past campaigns stay available, so the same person can read the current assessment or an earlier cycle in one view. An audit module records who changed what.",
    size: "wide",
    visual: (
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Current mgr</dt>
        <dd className="font-medium">A. Ruiz</dd>
        <dt className="text-muted-foreground">Previous</dt>
        <dd>M. Soto</dd>
        <dt className="text-muted-foreground">Override</dt>
        <dd className="font-medium text-warning">A. Ruiz · reassignment</dd>
        <dt className="text-muted-foreground">Past cycles</dt>
        <dd>Cycle 3 · Cycle 2 · Cycle 1</dd>
      </dl>
    ),
  },
  {
    title: "How assessments are produced",
    description: "People enter them; the system keeps the record.",
    detail:
      "Growth Map is a conversation and agreement tool. The person and manager type their assessments, agree the result and keep its history. The system does not read calendars, commits or chat activity to produce a score.",
    visual: (
      <ul className="divide-y divide-border text-sm">
        <li className="flex items-center gap-2 py-1.5">
          <Check aria-hidden className="size-3.5 text-success" />
          Conversation &amp; agreement
        </li>
        <li className="flex items-center gap-2 py-1.5">
          <span aria-hidden className="text-destructive">
            ✗
          </span>
          No calendar scraping
        </li>
        <li className="flex items-center gap-2 py-1.5">
          <span aria-hidden className="text-destructive">
            ✗
          </span>
          No commit or chat mining
        </li>
      </ul>
    ),
  },
];

export function GrowthMapExperience() {
  const listen = useCaseListen(PODCAST, CHAPTERS);

  return (
    <div className="overflow-clip bg-background text-foreground">
      <CaseHero
        id="map-journey"
        eyebrow="Growth Map"
        title="A shared map for the growth conversation."
        lede="A person and their manager assess the same competencies, compare their views and agree the next actions in each review cycle."
        image="case-studies/growth-map/personal.jpg"
        imageAlt="A personal Growth Map with sample data and coloured assessment stages across scopes of impact"
        imageLabel="Personal assessment · Sample data"
        primaryHref="#map-product"
        primaryLabel="See the growth map"
        secondaryHref="#map-skills"
        secondaryLabel="How the model works"
        onListen={listen.listen}
      />
      <ImpactLevels />
      <Stages />
      <Review />
      <Actions />
      <Architecture />
      <ProductDepth
        id="map-product"
        label="In the product"
        title="The assessment grid and the framework behind it"
        lede="The personal assessment, the campaign that contains it, the configuration and the framework version. People, notes and the framework itself are sample data on this page."
        shots={SHOTS}
        surfaces={SURFACES}
      />
      <CaseStudyCta
        title="Keep the review, the agreement and the history in one place."
        body="A person and their manager assess the same framework, meet with the differences already visible and carry the agreed actions into the next campaign."
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

function ImpactLevels() {
  return (
    <StorySection
      id="map-skills"
      title="One competency, read at several scopes of impact"
      intro="The framework describes behaviours rather than job titles. Each configuration names its own scopes. This example uses three."
    >
      <ol className="grid gap-4 sm:grid-cols-3">
        {["Own work", "Team", "Wider organisation"].map((item, index) => (
          <li key={item} className="rounded-lg border border-border bg-card p-5">
            <span className="font-mono text-xs text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 text-xl font-semibold">{item}</h3>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
        Competencies form the rows. Scopes form the columns.
      </p>
    </StorySection>
  );
}

function Stages() {
  return (
    <StorySection
      id="map-signal"
      title="Each cell records a stage"
      intro="Each configuration defines its stages. This example uses three. A note under each competency holds the context that does not fit a stage."
      muted
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {["Emerging", "Practising", "Guiding"].map((signal, index) => (
          <div key={signal} className="flex items-baseline gap-4 border-b border-border pb-4">
            <span className="font-mono text-xs text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-2xl font-semibold">{signal}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
        A cell can also be not applicable or blank when nobody has assessed it yet.
      </p>
    </StorySection>
  );
}

function Review() {
  return (
    <StorySection
      id="map-org"
      title="Two assessments shape the review agenda"
      intro="The person completes one view and the manager completes the other. The people list shows which assessments are done."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-xl font-semibold">The person</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Records their own assessment across the same map.
          </p>
        </article>
        <article className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-xl font-semibold">The manager</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Records an independent view before the meeting.
          </p>
        </article>
      </div>
      <ul className="mt-6 space-y-3">
        {["Where do we agree?", "Where do we differ?", "What is the next step?"].map((question) => (
          <li key={question} className="border-l-2 border-primary pl-4 font-medium">
            {question}
          </li>
        ))}
      </ul>
    </StorySection>
  );
}

function Actions() {
  const steps = [
    ["Assess", "The person and manager complete their views."],
    ["Compare", "The differences set the meeting agenda."],
    ["Agree", "They record one assessment and a small set of actions."],
    ["Carry forward", "The next campaign reads the previous one."],
  ];

  return (
    <StorySection
      id="map-built"
      title="Agree the map, then carry the actions forward"
      intro="Each campaign produces one agreed assessment and a small set of growth actions."
      muted
    >
      <ol>
        {steps.map(([name, detail], index) => (
          <li key={name} className="grid grid-cols-[2rem_1fr] gap-4 border-b border-border py-4">
            <span className="font-mono text-xs text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="font-semibold">{name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </StorySection>
  );
}

function Architecture() {
  return (
    <StorySection
      id="map-arch"
      title="Two assessments against one map, then an agreement"
      intro="A versioned framework feeds the map. The person and the manager each complete their own assessment. A review meeting compares the two, agrees one result and a set of growth actions, and everything is kept in history with an audit trail."
    >
      <div className="hidden sm:block">
        <Diagram
          width={920}
          height={520}
          label="Architecture of the Growth Map: a framework configurator publishes a versioned framework with an effective date and a read-only history; the person and the manager on either side each complete an assessment against the same map; a review meeting compares the two; an agreed assessment and growth actions follow in each cycle; history and an audit module record who changed what."
        >
          <DiagramZone x={324} y={24} w={272} h={80} label="FRAMEWORK CONFIGURATOR" />
          <DiagramNode
            x={340}
            y={52}
            w={240}
            h={40}
            main="Versioned framework"
            sub="effective date · read-only history"
          />

          <DiagramZone x={24} y={136} w={176} h={104} label="YOU" />
          <DiagramNode x={39} y={168} w={146} h={48} main="Person" kind="primary" />

          <DiagramZone x={324} y={136} w={272} h={120} label="THE MAP" />
          <DiagramNode
            x={340}
            y={172}
            w={240}
            h={64}
            main="Assessment grid"
            sub="competencies × scopes"
          />

          <DiagramZone x={720} y={136} w={176} h={104} label="YOUR MANAGER" />
          <DiagramNode x={735} y={168} w={146} h={48} main="Manager" kind="primary" />

          <DiagramNode x={340} y={296} w={240} h={48} main="Review meeting" sub="compare · note" />
          <DiagramNode
            x={340}
            y={372}
            w={240}
            h={44}
            main="Agreed assessment + actions"
            sub="each cycle"
            kind="success"
          />
          <DiagramNode
            x={340}
            y={448}
            w={240}
            h={44}
            main="History · Audit trail"
            sub="read-only · who changed what"
          />

          <DiagramEdge
            points={[
              [460, 92],
              [460, 168],
            ]}
            label="published version"
            labelAt={[460, 132]}
          />
          <DiagramEdge
            points={[
              [185, 192],
              [338, 192],
            ]}
            label="self assessment"
            labelAt={[262, 184]}
          />
          <DiagramEdge
            points={[
              [735, 192],
              [580, 192],
            ]}
            label="manager assessment"
            labelAt={[657, 184]}
          />
          <DiagramEdge
            points={[
              [460, 236],
              [460, 294],
            ]}
            label="two views"
            labelAt={[460, 266]}
          />
          <DiagramEdge
            points={[
              [460, 344],
              [460, 370],
            ]}
            label="agree"
            labelAt={[460, 358]}
          />
          <DiagramEdge
            points={[
              [460, 416],
              [460, 446],
            ]}
            dashed
            label="recorded"
            labelAt={[460, 432]}
          />
        </Diagram>
      </div>
      <div className="sm:hidden">
        <Diagram
          width={440}
          height={640}
          scrollable={false}
          label="Architecture of the Growth Map, mobile view: a versioned framework with an effective date is published; the person and the manager each complete an assessment against the same grid; the review meeting compares the two views; the agreed assessment and growth actions are recorded; history and audit trail keep a read-only record of who changed what."
        >
          <DiagramZone x={16} y={16} w={408} h={92} label="FRAMEWORK CONFIGURATOR" />
          <DiagramNode
            x={110}
            y={48}
            w={220}
            h={44}
            main="Versioned framework"
            sub="effective date · read-only history"
          />

          <DiagramZone x={16} y={152} w={202} h={90} label="YOU" />
          <DiagramNode x={28} y={184} w={178} h={48} main="Person" kind="primary" />

          <DiagramZone x={222} y={152} w={202} h={90} label="YOUR MANAGER" />
          <DiagramNode x={234} y={184} w={178} h={48} main="Manager" kind="primary" />

          <DiagramZone x={16} y={288} w={408} h={110} label="THE MAP" />
          <DiagramNode
            x={70}
            y={320}
            w={300}
            h={64}
            main="Assessment grid"
            sub="competencies × scopes"
          />

          <DiagramNode x={110} y={422} w={220} h={52} main="Review meeting" sub="compare · note" />
          <DiagramNode
            x={110}
            y={496}
            w={220}
            h={48}
            main="Agreed assessment + actions"
            sub="each cycle"
            kind="success"
          />
          <DiagramNode
            x={110}
            y={566}
            w={220}
            h={48}
            main="History · Audit"
            sub="read-only · who changed what"
          />

          <DiagramEdge
            points={[
              [220, 108],
              [220, 132],
            ]}
            label="published version"
            labelAt={[276, 126]}
          />
          <DiagramEdge
            points={[
              [117, 242],
              [170, 288],
            ]}
            label="self assessment"
            labelAt={[116, 280]}
          />
          <DiagramEdge
            points={[
              [323, 242],
              [270, 288],
            ]}
            label="manager assessment"
            labelAt={[330, 280]}
          />
          <DiagramEdge
            points={[
              [220, 398],
              [220, 422],
            ]}
            label="two views"
            labelAt={[258, 416]}
          />
          <DiagramEdge
            points={[
              [220, 474],
              [220, 496],
            ]}
            label="agree"
            labelAt={[258, 490]}
          />
          <DiagramEdge
            points={[
              [220, 544],
              [220, 566],
            ]}
            dashed
            label="recorded"
            labelAt={[258, 560]}
          />
        </Diagram>
      </div>
    </StorySection>
  );
}
