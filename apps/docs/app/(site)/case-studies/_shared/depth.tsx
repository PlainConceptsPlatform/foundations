"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Maximize2 } from "lucide-react";
import type { ReactNode } from "react";

export type Shot = {
  src: string;
  path: string;
  tag: string;
  caption: string;
};

export type Surface = {
  title: string;
  description?: string;
  detail: string;
  size?: "featured" | "wide";
  visual?: ReactNode;
};

function groupRows(shots: Shot[]) {
  if (shots.length <= 1) return [shots];
  const rest = shots.slice(1);
  const rows: Shot[][] = [shots.slice(0, 1)];
  for (let i = 0; i < rest.length; i += 2) rows.push(rest.slice(i, i + 2));
  return rows;
}

function Figure({ shot, base, featured }: { shot: Shot; base: string; featured: boolean }) {
  return (
    <Dialog>
      <figure
        className={cn(
          "overflow-hidden rounded-lg border border-border bg-card transition-colors duration-150 hover:border-primary/50",
          featured && "border-primary/30",
        )}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="shrink-0 font-mono text-xs text-primary">{shot.tag}</span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{shot.path}</span>
          <DialogTrigger asChild>
            <button
              type="button"
              data-tool-name="inspect_screenshot"
              data-tool-description={`Open the ${shot.path} screenshot at full size in a dialog`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors duration-150 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Inspect
              <Maximize2 aria-hidden className="size-3.5" />
            </button>
          </DialogTrigger>
        </div>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label={`Inspect ${shot.path}`}
            className="block w-full cursor-zoom-in bg-black text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <img
              src={`${base}/${shot.src}`}
              alt={shot.caption}
              width={1863}
              height={1085}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full"
            />
          </button>
        </DialogTrigger>
        <figcaption className="px-4 py-4 text-sm leading-relaxed text-muted-foreground">
          {shot.caption}
        </figcaption>
      </figure>
      <DialogContent className="w-[96vw] max-w-[96vw] gap-3 overflow-hidden p-3 sm:max-w-[96vw]">
        <DialogHeader className="px-1 pr-10">
          <DialogTitle className="text-base">{shot.path}</DialogTitle>
          <DialogDescription>{shot.caption}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[72vh] overflow-auto rounded-md border border-border bg-black">
          <img
            src={`${base}/${shot.src}`}
            alt={shot.caption}
            width={1863}
            height={1085}
            className="block h-auto w-full min-w-[70rem]"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SurfaceCell({
  index,
  title,
  description,
  detail,
  size,
  visual,
}: {
  index: number;
  title: string;
  description?: string;
  detail: string;
  size?: "featured" | "wide";
  visual?: ReactNode;
}) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 bg-card p-5",
        size === "featured" && "sm:col-span-2 sm:row-span-2 lg:col-span-2 lg:row-span-2",
        size === "wide" && "sm:col-span-2 lg:col-span-2",
      )}
    >
      <span className="shrink-0 font-mono text-xs text-primary">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h4 className="text-base font-semibold leading-tight">{title}</h4>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      {visual ? <div className="mt-auto border-t border-border pt-4">{visual}</div> : null}
      {visual ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{detail}</p>
      ) : (
        <p className="mt-auto text-sm leading-relaxed text-muted-foreground">{detail}</p>
      )}
    </article>
  );
}

export function ProductDepth({
  id,
  label,
  title,
  lede,
  shots,
  surfaces,
}: {
  id: string;
  label: string;
  title: string;
  lede?: string;
  shots: Shot[];
  surfaces: Surface[];
}) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const rows = groupRows(shots);

  return (
    <section
      id={id}
      className="scroll-mt-20 border-b border-border bg-muted/30 py-16 sm:py-20"
      aria-labelledby={`${id}-title`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-primary">{label}</p>
          <h2
            id={`${id}-title`}
            className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
          >
            {title}
          </h2>
          {lede ? <p className="mt-5 leading-relaxed text-muted-foreground">{lede}</p> : null}
          <p className="mt-3 text-sm text-muted-foreground">
            Select a screenshot to inspect it at full size.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {rows.map((row, rowIndex) => (
            <div
              key={row.map((shot) => shot.src).join("|")}
              className={cn(row.length === 2 && "grid gap-6 md:grid-cols-2")}
            >
              {row.map((shot) => (
                <Figure
                  key={shot.src}
                  shot={shot}
                  base={base}
                  featured={rowIndex === 0 && shots.length > 1}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-border pt-10">
          <h3 className="text-2xl font-bold tracking-tight">Implementation notes</h3>
          <div className="mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-flow-dense lg:grid-cols-4 lg:auto-rows-[minmax(11rem,1fr)]">
            {surfaces.map((surface, index) => (
              <SurfaceCell
                key={surface.title}
                index={index}
                title={surface.title}
                description={surface.description}
                detail={surface.detail}
                size={surface.size}
                visual={surface.visual}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
