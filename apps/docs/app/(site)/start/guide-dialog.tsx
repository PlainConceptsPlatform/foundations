"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { CircleAlert, CircleCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useRef } from "react";
import { type CodeSample, type StepGuide, guideFor } from "./details";
import { pillarAt } from "./steps";

type GuideDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pillar: number;
  step: number;
  onNavigate: (step: number) => void;
};

export function GuideDialog({ open, onOpenChange, pillar, step, onNavigate }: GuideDialogProps) {
  const layer = pillarAt(pillar);
  const entry = layer.steps[step];
  const guide = guideFor(pillar, step);
  const bodyRef = useRef<HTMLDivElement>(null);
  if (!entry || !guide) return null;

  const last = layer.steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[88vh] flex-col gap-0 overflow-hidden bg-background p-0 text-foreground sm:max-w-3xl"
        // Radix focuses the first control, which can be a code tab halfway down; start
        // at the top instead, on the scrolling body, so the arrow keys scroll it.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          bodyRef.current?.focus();
        }}
      >
        <DialogHeader className="gap-2 border-border border-b px-6 pt-6 pb-5 text-left sm:px-8">
          <span className="text-muted-foreground text-sm">
            Layer {pillar + 1} · {layer.name} · piece {step + 1} of {layer.steps.length}
          </span>
          <DialogTitle className="font-bold text-2xl leading-tight tracking-tight">
            {entry.title}
          </DialogTitle>
          <DialogDescription className="text-base">{entry.why}</DialogDescription>
        </DialogHeader>

        <div
          key={`${pillar}.${step}`}
          ref={bodyRef}
          tabIndex={-1}
          className="flex min-w-0 flex-col gap-10 overflow-x-hidden overflow-y-auto px-6 py-6 focus-visible:outline-none sm:px-8"
        >
          <Block title="The problem">
            <Prose text={guide.problem} />
          </Block>

          <ol className="flex flex-col gap-10">
            {guide.sections.map((section, i) => (
              <li key={section.title} className="flex min-w-0 flex-col gap-3">
                <h3 className="flex items-baseline gap-3 font-semibold text-lg">
                  <span className="font-bold text-primary dark:text-[var(--pc-blue-400)]">
                    {i + 1}
                  </span>
                  {section.title}
                </h3>
                <Prose text={section.body} />
                {section.code && <CodeSamples samples={section.code} />}
              </li>
            ))}
          </ol>

          <div className="grid gap-6 sm:grid-cols-2">
            <Block title="Check that it works">
              <ul className="flex flex-col gap-2.5">
                {guide.verify.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-relaxed">
                    <CircleCheck
                      aria-hidden
                      className="mt-0.5 size-4 shrink-0 text-[var(--pc-success-700)] dark:text-[var(--pc-success-300)]"
                    />
                    <Inline text={item} />
                  </li>
                ))}
              </ul>
            </Block>
            <Block title="Common mistakes">
              <ul className="flex flex-col gap-2.5">
                {guide.pitfalls.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-relaxed">
                    <CircleAlert
                      aria-hidden
                      className="mt-0.5 size-4 shrink-0 text-[var(--pc-warning-700)] dark:text-[var(--pc-warning-300)]"
                    />
                    <Inline text={item} />
                  </li>
                ))}
              </ul>
            </Block>
          </div>

          <PlatformNote guide={guide} shortcut={layer.shortcut} />

          {guide.links && guide.links.length > 0 && (
            <Block title="Read more">
              <ul className="flex flex-col gap-2">
                {guide.links.map((link) => (
                  <li key={link.href}>
                    <GuideLink href={link.href}>{link.label}</GuideLink>
                  </li>
                ))}
              </ul>
            </Block>
          )}
        </div>

        <DialogFooter className="flex-row justify-between border-border border-t px-6 py-4 sm:justify-between sm:px-8">
          <Button variant="outline" disabled={step === 0} onClick={() => onNavigate(step - 1)}>
            Previous piece
          </Button>
          {step < last ? (
            <Button onClick={() => onNavigate(step + 1)}>Next piece</Button>
          ) : (
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Prose({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-3 text-[15px] leading-relaxed">
      {text.split(/\n\s*\n/).map((paragraph) => (
        <p key={paragraph}>
          <Inline text={paragraph} />
        </p>
      ))}
    </div>
  );
}

/** Backticks in guide text become inline code; everything else stays plain text. */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("`") && part.endsWith("`") && part.length > 1 ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: the split of a fixed string never reorders
          <code key={i} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** A tab can hold several files, such as a Claude Code settings.json and the script it runs. */
function CodeSamples({ samples }: { samples: CodeSample[] }) {
  const plain = samples.filter((sample) => !sample.tab);
  const tabs = new Map<string, CodeSample[]>();
  for (const sample of samples) {
    if (sample.tab) tabs.set(sample.tab, [...(tabs.get(sample.tab) ?? []), sample]);
  }
  const first = tabs.keys().next().value;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {plain.map((sample) => (
        <Code key={`${sample.file ?? ""}${sample.code}`} sample={sample} />
      ))}
      {first && (
        <Tabs defaultValue={first}>
          <TabsList>
            {[...tabs.keys()].map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          {[...tabs].map(([tab, group]) => (
            <TabsContent key={tab} value={tab} className="flex min-w-0 flex-col gap-3">
              {group.map((sample) => (
                <Code key={`${sample.file ?? ""}${sample.code}`} sample={sample} />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

function Code({ sample }: { sample: CodeSample }) {
  return (
    <DynamicCodeBlock
      lang={sample.lang}
      code={sample.code.trim()}
      codeblock={{ title: sample.file, className: "my-0" }}
    />
  );
}

function PlatformNote({ guide, shortcut }: { guide: StepGuide; shortcut: string }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-[var(--pc-blue-200)] dark:border-[var(--pc-blue-700)] bg-accent/60 p-5">
      <h3 className="font-medium text-accent-foreground text-xs uppercase tracking-wider">
        How Platform does it
      </h3>
      <p className="text-[15px] leading-relaxed">
        <Inline text={guide.platform} />
      </p>
      <p className="font-mono text-accent-foreground text-xs">{shortcut}</p>
    </section>
  );
}

function GuideLink({ href, children }: { href: string; children: ReactNode }) {
  const className =
    "inline-flex items-center gap-1.5 text-primary dark:text-[var(--pc-blue-400)] text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
      <ExternalLink aria-hidden className="size-3.5" />
    </a>
  );
}
