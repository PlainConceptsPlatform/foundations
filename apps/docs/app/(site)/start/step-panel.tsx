"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import Link from "next/link";
import type { Dispatch, ReactNode, RefObject } from "react";
import { type JourneyAction, type JourneyState, isLayerComplete, litIn } from "./journey";
import { PILLARS, pillarAt } from "./steps";

type StepPanelProps = {
  state: JourneyState;
  shown: number | null;
  dispatch: Dispatch<JourneyAction>;
  headingRef: RefObject<HTMLHeadingElement | null>;
};

export function StepPanel({ state, shown, dispatch, headingRef }: StepPanelProps) {
  const pillar = pillarAt(state.current);

  if (state.phase === "intro") {
    return (
      <Panel eyebrow="Level 0" title="Your repository, with no AI yet" headingRef={headingRef}>
        <p className="text-muted-foreground leading-relaxed">
          Piece by piece, we will build on top of it everything a Platform repository has. Do each
          piece by hand to see why it is there, or put a whole layer in place at once.
        </p>
        <Button size="lg" onClick={() => dispatch({ type: "start" })}>
          Start
        </Button>
      </Panel>
    );
  }

  if (state.phase === "end") {
    return (
      <Panel
        eyebrow="Journey complete"
        eyebrowClassName="text-[var(--pc-success-300)]"
        title="From no AI to Platform"
        headingRef={headingRef}
      >
        <p className="text-muted-foreground leading-relaxed">Next time, one layer at a time:</p>
        <div className="flex flex-col gap-2">
          {PILLARS.slice(0, Math.max(state.built, 3)).map((layer) => (
            <Snippet key={layer.name} code={layer.shortcut} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="lg" className="flex-1">
            <Link href="/docs/adopt">Adopt in your project</Link>
          </Button>
          <Button size="lg" variant="outline" onClick={() => dispatch({ type: "reset" })}>
            Start over
          </Button>
        </div>
      </Panel>
    );
  }

  if (shown === null) {
    const isHealth = state.current === 2;
    const isLast = state.current === PILLARS.length - 1;

    return (
      <Panel
        eyebrow={`Layer ${state.current + 1} complete`}
        eyebrowClassName="text-[var(--pc-success-300)]"
        title={`Level ${state.current + 1} · ${pillar.level}`}
        headingRef={headingRef}
      >
        <p className="text-muted-foreground leading-relaxed">{pillar.outcome}</p>
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-sm">Next time, the whole layer at once:</span>
          <Snippet code={pillar.shortcut} />
        </div>
        <Button size="lg" onClick={() => dispatch({ type: "nextLayer" })}>
          {isHealth ? "Add Foundations (optional)" : isLast ? "See the result" : "Next layer"}
        </Button>
        {isHealth && (
          <Button size="lg" variant="outline" onClick={() => dispatch({ type: "finish" })}>
            Finish without Foundations
          </Button>
        )}
      </Panel>
    );
  }

  const step = pillar.steps[shown];
  if (!step) return null;
  const lit = shown < litIn(state);

  return (
    <Panel
      eyebrow={`Layer ${state.current + 1} · ${pillar.name} · piece ${shown + 1} of ${pillar.steps.length}`}
      title={step.title}
      headingRef={headingRef}
      badge={step.platformOnly ? <Badge variant="secondary">Platform only</Badge> : undefined}
    >
      <p className="text-muted-foreground leading-relaxed">{step.why}</p>
      <div className="flex flex-col gap-1.5 text-sm">
        <p className="rounded-md bg-destructive/15 px-2.5 py-2 text-[var(--pc-error-300)]">
          Before · {step.before}
        </p>
        <p className="rounded-md bg-success/15 px-2.5 py-2 text-[var(--pc-success-300)]">
          After · {step.after}
        </p>
      </div>
      <Snippet code={step.snippet} />
      <div className="flex items-center gap-2">
        <Button size="lg" className="flex-1" onClick={() => dispatch({ type: "light" })}>
          {lit ? "Next piece" : "Light it up"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          disabled={shown === 0}
          onClick={() => dispatch({ type: "back" })}
        >
          Back
        </Button>
      </div>
      <p className="hidden items-center gap-1.5 text-muted-foreground text-xs lg:flex">
        <Kbd>←</Kbd>
        <Kbd>→</Kbd>
        to move between pieces
      </p>
      {!isLayerComplete(state) && (
        <div className="flex flex-col gap-2 border-border border-t pt-4">
          <span className="text-muted-foreground text-sm">The whole layer at once?</span>
          <button
            type="button"
            onClick={() => dispatch({ type: "lightLayer" })}
            className="rounded-md border border-[var(--pc-blue-700)] bg-accent px-2.5 py-2 text-left font-mono text-accent-foreground text-xs transition-colors duration-150 ease-out hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            {pillar.shortcut}
          </button>
        </div>
      )}
      <Link href={pillar.docs.href} className="text-[var(--pc-blue-400)] text-sm hover:underline">
        Read more: {pillar.docs.label}
      </Link>
    </Panel>
  );
}

function Panel({
  eyebrow,
  eyebrowClassName = "text-muted-foreground",
  title,
  badge,
  headingRef,
  children,
}: {
  eyebrow: string;
  eyebrowClassName?: string;
  title: string;
  badge?: ReactNode;
  headingRef: RefObject<HTMLHeadingElement | null>;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby="start-panel-title"
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("text-sm", eyebrowClassName)}>{eyebrow}</span>
        {badge}
      </div>
      <h2
        id="start-panel-title"
        ref={headingRef}
        tabIndex={-1}
        className="font-bold text-2xl leading-tight tracking-tight focus-visible:outline-none"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Snippet({ code }: { code: string }) {
  return (
    <CodeBlock className="my-0">
      <Pre>
        <code>{code}</code>
      </Pre>
    </CodeBlock>
  );
}
