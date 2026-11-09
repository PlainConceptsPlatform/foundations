import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDown, Volume2 } from "lucide-react";
import type { ReactNode } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function CaseHero({
  id,
  eyebrow,
  title,
  lede,
  image,
  imageAlt,
  imageLabel,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  onListen,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lede: string;
  image: string;
  imageAlt: string;
  imageLabel: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  onListen: () => void;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
          <div>
            <p className="text-sm font-semibold text-primary">{eyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-balance text-4xl font-bold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
              {title}
            </h1>
          </div>
          <div>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">{lede}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <a href={primaryHref}>
                  {primaryLabel}
                  <ArrowDown aria-hidden />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onListen}
                data-tool-name="listen_to_case_study"
                data-tool-description="Open the podcast player and play this case study's audio overview, chapter by chapter"
              >
                <Volume2 aria-hidden />
                Listen to the story
              </Button>
              <Button asChild size="lg" variant="ghost">
                <a href={secondaryHref}>{secondaryLabel}</a>
              </Button>
            </div>
          </div>
        </div>

        <a
          href={primaryHref}
          className="group mt-12 block overflow-hidden rounded-lg border border-border bg-card transition-colors duration-150 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
            <span className="truncate text-sm font-medium">{imageLabel}</span>
            <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground transition-colors duration-150 group-hover:text-primary">
              {primaryLabel}
              <ArrowDown aria-hidden className="size-3.5" />
            </span>
          </div>
          <div className="max-h-[34rem] overflow-hidden bg-black">
            <img
              src={`${BASE_PATH}/${image}`}
              alt={imageAlt}
              width={1863}
              height={1085}
              fetchPriority="high"
              className="block h-auto w-full"
            />
          </div>
        </a>
      </div>
    </section>
  );
}

export function StorySection({
  id,
  title,
  intro,
  children,
  muted = false,
}: {
  id: string;
  title: string;
  intro?: string;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <section id={id} className={cn("scroll-mt-20 border-b border-border", muted && "bg-muted/30")}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 className="max-w-md text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {title}
            </h2>
            {intro ? (
              <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">{intro}</p>
            ) : null}
          </div>
          <div>{children}</div>
        </div>
      </div>
    </section>
  );
}
