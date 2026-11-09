"use client";

import { cn } from "@/lib/utils";
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
    id: "gateway-door",
    label: "One endpoint for model traffic",
    labelEs: "Un endpoint para el tráfico de modelos",
  },
  {
    id: "gateway-rule",
    label: "What happens to a request",
    labelEs: "Qué ocurre con una petición",
  },
  { id: "gateway-cost", label: "Read usage and cost", labelEs: "Leer uso y coste" },
  {
    id: "gateway-up",
    label: "Route around unhealthy capacity",
    labelEs: "Desviar la capacidad degradada",
  },
  {
    id: "gateway-built",
    label: "Build with explicit gates",
    labelEs: "Construir con controles explícitos",
  },
];

const PODCAST = createPodcast(
  {
    en: CHAPTERS.map((chapter) => ({ title: chapter.label, duration: 10 })),
    es: CHAPTERS.map((chapter) => ({ title: chapter.labelEs, duration: 10 })),
  },
  "ai-gateway",
);

const SHOTS: Shot[] = [
  {
    src: "case-studies/ai-gateway/gateway-console.jpg",
    path: "Gateway console · Sources",
    tag: "01",
    caption:
      "Sources lists each upstream endpoint, its credential store and the capacity it serves.",
  },
  {
    src: "case-studies/ai-gateway/gateway-pools.jpg",
    path: "Gateway console · Pools",
    tag: "02",
    caption:
      "Pools divide a source's keys into non-overlapping ranges, each with its own balancing strategy.",
  },
  {
    src: "case-studies/ai-gateway/gateway-access.jpg",
    path: "Gateway console · Access",
    tag: "03",
    caption:
      "Identity groups and a manual exception list control access. Removing access invalidates an existing key on the next call.",
  },
  {
    src: "case-studies/ai-gateway/gateway-ops.jpg",
    path: "Gateway console · Operations",
    tag: "04",
    caption:
      "The operations view compares requests, errors, rate limits and latency over a selected time window.",
  },
];

const SURFACES: Surface[] = [
  {
    title: "Sources and upstream endpoints",
    description: "The services the gateway can call.",
    detail:
      "A source is one upstream endpoint: self-hosted vLLM, Azure OpenAI or another OpenAI-compatible service. It records which secret holds the credential and the number of upstream keys. The gateway checks health on a schedule and marks the source healthy or degraded. Administrators can add, edit, test or disable a source from one view.",
    visual: (
      <ul className="divide-y divide-border text-sm">
        {[
          { name: "Azure OpenAI", keys: "3 keys", state: "ok" as const },
          { name: "vLLM self-host", keys: "1 key", state: "ok" as const },
          { name: "OpenAI-compatible", keys: "2 keys", state: "deg" as const },
        ].map((row) => (
          <li key={row.name} className="flex items-center gap-2 py-2">
            <span
              aria-hidden
              className={cn(
                "size-2 shrink-0 rounded-full",
                row.state === "ok" ? "bg-success" : "bg-warning",
              )}
            />
            <span className="font-medium">{row.name}</span>
            <span className="ml-auto font-mono text-xs text-muted-foreground">{row.keys}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "Credential pools",
    description: "Capacity divided without overlapping keys.",
    detail:
      "A pool takes a range of a source's upstream keys. Its configuration sets how many keys stay active and which balancing strategy the pool uses. Model deployments point at a source and a pool, so routing and capacity stay together. The ranges cannot overlap, which prevents two pools from claiming the same key index.",
    size: "wide",
    visual: (
      <div>
        <div className="grid grid-cols-8 gap-1 sm:grid-cols-16" aria-hidden>
          {Array.from({ length: 16 }, (_, slot) => ({
            id: `slot-${slot}`,
            degraded: slot === 10,
          })).map((slot) => (
            <span
              key={slot.id}
              className={cn(
                "aspect-square rounded-sm",
                slot.degraded ? "border border-destructive bg-destructive/10" : "bg-primary",
              )}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
          <span className="text-muted-foreground">Credential pool</span>
          <span className="font-medium text-destructive">1 degraded</span>
        </div>
      </div>
    ),
  },
  {
    title: "Model catalog and pricing",
    description: "Deployments, routing and list prices.",
    detail:
      "The catalog lists deployments, their routing and a vision fallback. Pricing is kept by deployment and model, with an effective date and separate input, output and cached-token rates. Cached rates apply only to models that support prompt caching. The list price is indicative, not the final figure on the provider invoice.",
    size: "wide",
    visual: (
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="py-2 font-medium">Deployment</th>
            <th className="py-2 font-medium">Routing</th>
            <th className="py-2 text-right font-medium">In / Out · per 1M</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {[
            ["gpt-4-turbo", "primary", "$10 / $30"],
            ["gpt-4o", "primary", "$5 / $15"],
            ["llama-3-70b", "vision fallback", "$0.70 / $0.90"],
          ].map(([model, route, rate]) => (
            <tr key={model}>
              <td className="py-2 font-medium">{model}</td>
              <td className="py-2 text-muted-foreground">{route}</td>
              <td className="py-2 text-right font-mono text-xs text-muted-foreground">{rate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
  },
  {
    title: "Access",
    description: "Identity rules enforced on every call.",
    detail:
      "Access combines synchronized identity groups with a manual exception list. Service clients carry their own credentials, optional caller tags, and controls for rotation and revocation. The console records enforcement against each call. A deny rule always takes precedence over an allow rule.",
    visual: (
      <div className="flex flex-wrap gap-1.5">
        {[
          ["admins · allow", "allow"],
          ["power users · allow", "allow"],
          ["guests · deny", "deny"],
          ["exception-001 · deny", "deny"],
        ].map(([label, kind]) => (
          <span
            key={label}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium",
              kind === "allow"
                ? "border-success/40 text-success"
                : "border-destructive/40 text-destructive",
            )}
          >
            {label}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Flows inspector",
    description: "One request traced through each layer.",
    detail:
      "The inspector shows access, shields, rules, latency and MCP in a graph or a list. It names the identities, sources, pools and models that a request touched. Use it to explain why a call was allowed, routed or priced in a particular way without reading logs by hand.",
    size: "featured",
    visual: (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { label: "Identity", kind: "in" as const },
            { label: "Access", kind: "" as const },
            { label: "Route", kind: "" as const },
            { label: "Shields", kind: "" as const },
            { label: "Model", kind: "out" as const },
          ].map((node, i, arr) => (
            <span key={node.label} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium",
                  node.kind === "in" && "border-success text-success",
                  node.kind === "out" && "border-primary text-primary",
                )}
              >
                {node.label}
              </span>
              {i < arr.length - 1 ? (
                <span aria-hidden className="text-xs text-muted-foreground">
                  →
                </span>
              ) : null}
            </span>
          ))}
        </div>
        <div className="overflow-hidden rounded-md border border-border bg-background p-3">
          <svg
            viewBox="0 0 320 100"
            className="h-16 w-full"
            preserveAspectRatio="none"
            role="img"
            aria-label="Access, shields and latency across five request layers"
          >
            {[20, 50, 80].map((y) => (
              <line
                key={y}
                x1="40"
                y1={y}
                x2="300"
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-border"
              />
            ))}
            {[
              {
                y: 14,
                label: "access",
                data: [
                  [40, "allow"],
                  [86, "allow"],
                  [132, "deny"],
                  [178, "allow"],
                  [224, "allow"],
                ],
              },
              {
                y: 44,
                label: "shields",
                data: [
                  [40, "allow"],
                  [122, "allow"],
                  [168, "allow"],
                ],
              },
              {
                y: 74,
                label: "latency",
                data: [
                  [40, "warn"],
                  [86, "warn"],
                  [168, "warn"],
                  [214, "warn"],
                  [260, "warn"],
                ],
              },
            ].map((row) => (
              <g key={row.label}>
                <text
                  x="40"
                  y={row.y - 4}
                  fontFamily="ui-monospace, monospace"
                  fontSize={8}
                  className="fill-muted-foreground"
                >
                  {row.label}
                </text>
                {row.data.map(([x, kind], i) => {
                  const fill =
                    kind === "warn"
                      ? "var(--pc-warning-500)"
                      : kind === "deny"
                        ? "var(--pc-error-500)"
                        : "var(--pc-success-500)";
                  return <rect key={x} x={x} y={row.y} width="36" height="12" rx="2" fill={fill} />;
                })}
              </g>
            ))}
          </svg>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-success" /> Allow
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-destructive" /> Deny
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-warning" /> Latency ms
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "MCP and tool policies",
    description: "Allow and deny rules for Model Context Protocol tools.",
    detail:
      "The console lists each toolset and its read-only declarations. A read-only declaration is a stated contract, not a guarantee enforced by the gateway. Combine allows and denies per service client, then inspect the result in the flows view before relying on it.",
    visual: (
      <div className="flex flex-wrap gap-1.5">
        {[
          ["knowledge.read · allow", "allow"],
          ["actions.read · allow", "allow"],
          ["actions.write · deny", "deny"],
        ].map(([label, kind]) => (
          <span
            key={label}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium",
              kind === "allow"
                ? "border-success/40 text-success"
                : "border-destructive/40 text-destructive",
            )}
          >
            {label}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Operations",
    description: "A selected time window across the gateway.",
    detail:
      "The operations view reads metrics over five minutes, thirty minutes, one hour, eight hours, one day, fifteen days or thirty days. Select a window to compare requests, errors, rate limits and latency across sources, pools and deployments in that span.",
    size: "wide",
    visual: (
      <div>
        <svg
          viewBox="0 0 320 50"
          className="h-10 w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label="Requests and errors over the last hour"
        >
          <polyline
            points="0,32 32,24 64,28 96,18 128,22 160,14 192,20 224,12 256,18 288,10 320,16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary"
          />
          <polyline
            points="0,46 32,46 64,44 96,46 128,46 160,42 192,46 224,38 256,46 288,44 320,46"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-destructive"
          />
        </svg>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>
            Requests <span className="font-mono font-semibold text-foreground">1,284</span>
          </span>
          <span>
            Errors <span className="font-mono font-semibold text-foreground">3</span>
          </span>
          <span>
            p50 <span className="font-mono font-semibold text-foreground">412ms</span>
          </span>
          <span>
            p95 <span className="font-mono font-semibold text-foreground">1.8s</span>
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Usage, read carefully",
    description: "A direction of travel, not the provider invoice.",
    detail:
      "The usage view separates person API usage from client API usage. The client view groups by client, caller tag, model and date, with input tokens, output tokens, requests and gross cost. Each turn resends the conversation context, so input tokens can look high. Until prompt caching is available, every resent token counts as new. Gross cost uses list pricing, so treat it as a signal of which teams and models consume most rather than a final bill.",
    size: "wide",
    visual: (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Token split</span>
          <span className="font-mono text-xs text-muted-foreground">68% / 24% / 8%</span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-muted">
          <span className="bg-primary" style={{ width: "68%" }} />
          <span className="bg-primary/70" style={{ width: "24%" }} />
          <span className="bg-primary/20" style={{ width: "8%" }} />
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-primary" /> Input
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-primary/70" /> Output
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-primary/20" /> Cached
          </span>
        </div>
      </div>
    ),
  },
];

export function GatewayExperience() {
  const listen = useCaseListen(PODCAST, CHAPTERS);

  return (
    <div className="overflow-clip bg-background text-foreground">
      <CaseHero
        id="gateway-door"
        eyebrow="Custom AI Gateway"
        title="One base URL for every model your teams use."
        lede="The gateway authenticates each call, applies access and privacy rules, chooses an upstream source and records tokens, cost and latency."
        image="case-studies/ai-gateway/gateway-console.jpg"
        imageAlt="The source list in the AI Gateway console"
        imageLabel="Gateway console · Sources"
        primaryHref="#gateway-product"
        primaryLabel="See the gateway"
        secondaryHref="#gateway-rule"
        secondaryLabel="Follow a request"
        onListen={listen.listen}
      />
      <RequestFlight />
      <Redaction />
      <CostDecision />
      <Resilience />
      <Method />
      <Architecture />
      <ProductDepth
        id="gateway-product"
        label="In the product"
        title="The gateway in use"
        lede="Four working views: sources, pools, access and operations. Names, counts and identifiers in these screenshots are sample data."
        shots={SHOTS}
        surfaces={SURFACES}
      />
      <CaseStudyCta
        title="One endpoint for governed model traffic."
        body="Teams keep the models they need. Administrators manage access, credentials, routing and usage from the same control plane."
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

function RequestFlight() {
  const stages = [
    ["Authenticate", "OAuth device flow or a personal key."],
    ["Authorize", "Identity groups, enforced on every call."],
    ["Route", "The source, credential pool and model catalog."],
    ["Transact", "The provider receives the request. The gateway does not keep prompt bodies."],
    ["Measure", "Tokens, requests, cost and latency."],
  ];

  return (
    <StorySection
      id="gateway-rule"
      title="What happens before a provider sees the request"
      intro="Every call follows the same path."
    >
      <ol className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
        {stages.map(([name, detail], index) => (
          <li key={name} className="border-t border-border pt-4">
            <span className="font-mono text-xs text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 text-lg font-semibold">{name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{detail}</p>
          </li>
        ))}
      </ol>
    </StorySection>
  );
}

function Redaction() {
  const [masked, setMasked] = useState(false);

  return (
    <StorySection
      id="gateway-privacy"
      title="Sensitive values are redacted in the request path"
      intro="The policy runs inside the gateway, so a client cannot skip it."
      muted
    >
      <button
        type="button"
        onClick={() => setMasked((value) => !value)}
        aria-pressed={masked}
        data-tool-name="toggle_redaction_policy"
        data-tool-description="Toggle the redaction policy in this interactive example: applies or removes the masking of a sensitive token in the request path"
        className="w-full rounded-lg border border-border bg-card p-6 text-left transition-colors duration-150 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="block text-sm font-medium">Interactive example</span>
        <span className="mt-5 block font-mono text-lg leading-relaxed">
          Deploy this. The token is{" "}
          <span className={cn(masked && "bg-foreground px-2 text-background")}>
            {masked ? "[redacted]" : "secret-value"}
          </span>
          .
        </span>
        <span className="mt-6 block text-sm font-semibold text-primary">
          {masked ? "Show the original" : "Apply the policy"}
        </span>
      </button>
    </StorySection>
  );
}

function CostDecision() {
  const fields = [
    "Model and caller",
    "Input and output tokens",
    "Requests and latency",
    "Gross cost at list price",
  ];

  return (
    <StorySection
      id="gateway-cost"
      title="Usage data informs the next routing decision"
      intro="Model, tokens, caller and latency are recorded together. A routing rule can use that information before the next call."
    >
      <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
        {fields.map((field, index) => (
          <div key={field} className="bg-card p-5">
            <dt className="text-sm text-muted-foreground">
              Recorded {String(index + 1).padStart(2, "0")}
            </dt>
            <dd className="mt-2 font-semibold">{field}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
        Gross cost uses list pricing and is not the provider invoice. Input tokens can also look
        high because each turn resends the conversation context.
      </p>
    </StorySection>
  );
}

const POOL_SLOTS = Array.from({ length: 16 }, (_, slot) => ({
  id: `slot-${slot}`,
  degraded: slot === 10,
}));

function Resilience() {
  return (
    <StorySection
      id="gateway-up"
      title="Traffic drains away from degraded capacity"
      intro="The gateway checks every source on a schedule. Healthy keys keep serving while a degraded slot is drained."
      muted
    >
      <div
        className="rounded-lg border border-border bg-card p-6"
        role="img"
        aria-label="A credential pool with one degraded slot and fifteen healthy slots"
      >
        <div className="grid grid-cols-8 gap-2" aria-hidden>
          {POOL_SLOTS.map((slot) => (
            <span
              key={slot.id}
              className={cn(
                "aspect-square rounded-md",
                slot.degraded ? "border border-destructive bg-destructive/10" : "bg-primary",
              )}
            />
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-4 text-sm">
          <span className="text-muted-foreground">Credential pool</span>
          <span className="font-medium text-destructive">1 degraded</span>
        </div>
      </div>
    </StorySection>
  );
}

function Method() {
  return (
    <StorySection
      id="gateway-built"
      title="Built with the same gates it enforces"
      intro="Agent sessions read open issues, implement the work and open a pull request. People define the outcome. Authorization on every route and a hash-chained audit log must pass before merge."
    >
      <ol className="grid gap-6 sm:grid-cols-2">
        {["Specify", "Build", "Audit", "Release"].map((word, index) => (
          <li key={word} className="flex items-baseline gap-4 border-b border-border pb-4">
            <span className="font-mono text-xs text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-2xl font-semibold">{word}</span>
          </li>
        ))}
      </ol>
    </StorySection>
  );
}

function Architecture() {
  return (
    <StorySection
      id="gateway-arch"
      title="One service between callers and providers"
      intro="Clients call one base URL. The gateway authenticates the caller, applies access rules, routes through credential pools to a healthy source, and records usage on the way back. Providers never see the caller's identity."
      muted
    >
      <div className="hidden sm:block">
        <Diagram
          width={920}
          height={430}
          label="Architecture of the AI gateway: clients on the left call an OpenAI-compatible API. The gateway authenticates the caller, applies access rules, routes with redaction and fallback, and pulls from credential pools. A model catalog, a hash-chained audit log and usage metrics record the system; a secret store feeds credentials; upstream sources are checked on a schedule."
        >
          <DiagramZone x={24} y={40} w={180} h={124} label="CLIENTS" />
          <DiagramNode x={39} y={76} w={150} main="Client apps" sub="IDE · CLI · services" />

          <DiagramZone x={252} y={40} w={384} h={366} label="THE GATEWAY" />
          <DiagramNode
            x={272}
            y={76}
            w={164}
            main="Authenticate"
            sub="OAuth device flow"
            kind="primary"
          />
          <DiagramNode x={272} y={156} w={164} main="Access rules" sub="groups · deny wins" />
          <DiagramNode x={272} y={236} w={164} main="Route + shields" sub="redaction · fallback" />
          <DiagramNode x={272} y={316} w={164} main="Credential pools" sub="non-overlapping keys" />
          <DiagramNode x={456} y={156} w={164} main="Model catalog" sub="deployments · prices" />
          <DiagramNode x={456} y={316} w={164} main="Audit log" sub="hash-chained" />

          <DiagramZone
            x={680}
            y={40}
            w={216}
            h={246}
            label="UPSTREAM SOURCES"
            note="health checked on a schedule"
          />
          <DiagramNode x={696} y={86} w={184} h={48} main="vLLM" sub="self-hosted" />
          <DiagramNode x={696} y={150} w={184} h={48} main="Azure OpenAI" sub="managed" />
          <DiagramNode x={696} y={214} w={184} h={48} main="OpenAI-compatible" sub="any endpoint" />

          <DiagramNode x={24} y={316} w={180} main="Secret store" sub="credentials" />
          <DiagramNode x={680} y={316} w={216} main="Usage metrics" sub="tokens · cost · latency" />

          <DiagramEdge
            points={[
              [196, 102],
              [264, 102],
            ]}
            label="OpenAI-compatible API"
            labelAt={[230, 94]}
          />
          <DiagramEdge
            points={[
              [354, 128],
              [354, 150],
            ]}
          />
          <DiagramEdge
            points={[
              [354, 208],
              [354, 230],
            ]}
          />
          <DiagramEdge
            points={[
              [354, 288],
              [354, 310],
            ]}
          />
          <DiagramEdge
            points={[
              [538, 208],
              [538, 262],
              [444, 262],
            ]}
          />
          <DiagramEdge
            points={[
              [438, 258],
              [470, 310],
            ]}
            dashed
            label="each call"
            labelAt={[428, 300]}
          />
          <DiagramEdge
            points={[
              [436, 249],
              [648, 249],
              [648, 174],
              [692, 174],
            ]}
            label="model calls"
            labelAt={[542, 241]}
          />
          <DiagramEdge
            points={[
              [272, 342],
              [212, 342],
            ]}
            dashed
            label="secrets"
            labelAt={[242, 334]}
          />
          <DiagramEdge
            points={[
              [788, 262],
              [788, 310],
            ]}
            dashed
          />
        </Diagram>
      </div>
      <div className="sm:hidden">
        <Diagram
          width={440}
          height={870}
          scrollable={false}
          label="Architecture of the AI gateway, mobile view: client apps call an OpenAI-compatible API into the gateway, which runs authentication, access rules, model catalog, routing and credential pools in sequence, then records to a secret store and a hash-chained audit log. Model calls go to upstream sources checked on a schedule, and usage metrics record tokens, cost and latency."
        >
          <DiagramZone x={16} y={16} w={408} h={100} label="CLIENTS" />
          <DiagramNode
            x={110}
            y={48}
            w={220}
            h={52}
            main="Client apps"
            sub="IDE · CLI · services"
          />

          <DiagramZone x={16} y={168} w={408} h={468} label="THE GATEWAY" />
          <DiagramNode
            x={110}
            y={200}
            w={220}
            h={52}
            main="Authenticate"
            sub="OAuth device flow"
            kind="primary"
          />
          <DiagramNode
            x={110}
            y={274}
            w={220}
            h={52}
            main="Access rules"
            sub="groups · deny wins"
          />
          <DiagramNode
            x={110}
            y={348}
            w={220}
            h={52}
            main="Model catalog"
            sub="deployments · prices"
          />
          <DiagramNode
            x={110}
            y={422}
            w={220}
            h={52}
            main="Route + shields"
            sub="redaction · fallback"
          />
          <DiagramNode
            x={110}
            y={496}
            w={220}
            h={52}
            main="Credential pools"
            sub="non-overlapping keys"
          />
          <DiagramNode x={40} y={570} w={172} h={48} main="Secret store" sub="credentials" />
          <DiagramNode x={228} y={570} w={172} h={48} main="Audit log" sub="hash-chained" />

          <DiagramZone
            x={16}
            y={660}
            w={408}
            h={114}
            label="UPSTREAM SOURCES"
            note="health checked on a schedule"
          />
          <DiagramNode x={36} y={706} w={122} h={52} main="vLLM" sub="self-hosted" />
          <DiagramNode x={160} y={706} w={122} h={52} main="Azure OpenAI" sub="managed" />
          <DiagramNode x={284} y={706} w={122} h={52} main="OpenAI-compatible" sub="any endpoint" />

          <DiagramNode
            x={110}
            y={798}
            w={220}
            h={52}
            main="Usage metrics"
            sub="tokens · cost · latency"
          />

          <DiagramEdge
            points={[
              [220, 116],
              [220, 140],
            ]}
            label="OpenAI-compatible API"
            labelAt={[302, 132]}
          />
          <DiagramEdge
            points={[
              [220, 252],
              [220, 274],
            ]}
          />
          <DiagramEdge
            points={[
              [220, 326],
              [220, 348],
            ]}
          />
          <DiagramEdge
            points={[
              [220, 400],
              [220, 422],
            ]}
          />
          <DiagramEdge
            points={[
              [220, 474],
              [220, 496],
            ]}
          />
          <DiagramEdge
            points={[
              [170, 548],
              [126, 568],
            ]}
            dashed
          />
          <DiagramEdge
            points={[
              [270, 548],
              [314, 568],
            ]}
            dashed
          />
          <DiagramEdge
            points={[
              [220, 636],
              [220, 660],
            ]}
            label="model calls"
            labelAt={[282, 656]}
          />
          <DiagramEdge
            points={[
              [220, 774],
              [220, 798],
            ]}
            dashed
            label="recorded"
            labelAt={[258, 792]}
          />
        </Diagram>
      </div>
    </StorySection>
  );
}
