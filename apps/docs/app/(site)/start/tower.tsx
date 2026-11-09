"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import { type JourneyState, litIn } from "./journey";
import { PILLARS } from "./steps";

/** Vertical distance between layers, before the isometric projection squashes it. */
const LAYER_GAP = 80;
/** How far above its resting place a layer starts when it drops in. */
const DROP = 180;
/** rotateX(58deg) shows a z offset on screen as about 0.85 of its length. */
const PROJECTION = 0.85;
const ORIGIN_X = 280;
const ORIGIN_Y = 420;

const EASE = "ease-[cubic-bezier(0.2,0.8,0.2,1)]";

type TowerProps = {
  state: JourneyState;
  shown: number | null;
  /** The podcast is playing: the piece it is talking about pulses. */
  speaking?: boolean;
  onPick: (pillar: number, step: number) => void;
};

export function Tower({ state, shown, speaking = false, onPick }: TowerProps) {
  const running = state.phase === "run";
  const reduce = useReducedMotion();

  // The stage is drawn at 720×620 and scaled to the column it sits in, so the column's
  // width, not the viewport's, decides the size. The heights follow the same steps. Below
  // 540px the labels are hidden, so the stage shifts by the 80px the tower sits left of
  // its centre, times the scale, to centre the tower alone.
  return (
    <div className="@container">
      <div className="flex h-[298px] justify-center overflow-hidden @[440px]:h-[372px] @[540px]:h-[446px] @[640px]:h-[546px] @[720px]:h-[620px]">
        <div className="relative h-[620px] w-[720px] shrink-0 origin-top translate-x-[38px] scale-[0.48] @[440px]:translate-x-[48px] @[440px]:scale-[0.6] @[540px]:translate-x-0 @[540px]:scale-[0.72] @[640px]:scale-[0.88] @[720px]:scale-100">
          <div
            className="absolute size-0"
            style={{
              left: ORIGIN_X,
              top: ORIGIN_Y,
              transform: "rotateX(58deg) rotateZ(-45deg)",
              transformStyle: "preserve-3d",
            }}
          >
            {running && state.built > 0 && (
              <motion.div
                key={state.built}
                aria-hidden
                initial={reduce ? false : { opacity: 0, scale: 0.82 }}
                animate={
                  reduce ? { opacity: 0 } : { opacity: [0, 0.45, 0], scale: [0.82, 1.18, 1.32] }
                }
                transition={{ duration: 1.25, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -top-[150px] -left-[150px] size-[300px] rounded-[14px] border-2 border-primary"
              />
            )}
            <div className="absolute -top-[150px] -left-[150px] size-[300px] rounded-[14px] border border-[var(--pc-neutral-300)] bg-muted dark:border-[var(--pc-neutral-700)] dark:bg-secondary/40" />

            {PILLARS.map((pillar, p) => {
              const shownLayer = p < state.built;
              const z = LAYER_GAP * (p + 1);
              const active = running && p === state.current;

              return (
                <div
                  key={pillar.name}
                  aria-hidden={!shownLayer}
                  className={cn(
                    "absolute -top-[150px] -left-[150px] grid size-[300px] grid-cols-3 gap-2.5 rounded-[14px] border p-[18px]",
                    "transition-[transform,opacity,border-color] duration-700 motion-reduce:transition-none",
                    EASE,
                    // On a white page a light card barely shows, so in light mode a layer is
                    // white over the grey base with a stronger edge; dark keeps the card tone.
                    pillar.optional
                      ? "border-dashed bg-background/70 dark:bg-card/70"
                      : "bg-background/95 dark:bg-card/95",
                    active ? "border-primary" : "border-input dark:border-border",
                    shownLayer ? "opacity-100" : "pointer-events-none opacity-0",
                  )}
                  style={{ transform: `translateZ(${shownLayer ? z : z + DROP}px)` }}
                >
                  {pillar.steps.map((step, i) => {
                    const lit = i < litIn(state, p);
                    const current = active && i === shown;
                    const delay =
                      state.cascade?.pillar === p && i >= state.cascade.from
                        ? (i - state.cascade.from) * 90
                        : 0;

                    return (
                      <button
                        key={step.title}
                        type="button"
                        tabIndex={shownLayer ? 0 : -1}
                        aria-label={`${p + 1}.${i + 1} ${step.title}${lit ? ", done" : ""}`}
                        aria-current={current ? "step" : undefined}
                        onClick={() => onPick(p, i)}
                        className={cn(
                          "rounded-lg border transition-colors duration-300 ease-out motion-reduce:transition-none",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          lit
                            ? "border-primary bg-primary hover:bg-[var(--pc-blue-400)]"
                            : "border-input bg-muted hover:border-primary dark:border-border",
                          current && "border-accent-foreground",
                          current && !lit && "bg-accent",
                          current &&
                            speaking &&
                            "animate-pulse ring-2 ring-primary ring-offset-2 ring-offset-background motion-reduce:animate-none",
                        )}
                        style={{ transitionDelay: `${delay}ms` }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>

          <TowerLabel top={ORIGIN_Y - 20} title="Your repository" sub="src/, package.json" muted />
          {PILLARS.map((pillar, p) => (
            <TowerLabel
              key={pillar.name}
              top={ORIGIN_Y - PROJECTION * LAYER_GAP * (p + 1) - 20}
              title={`${p + 1} · ${pillar.name}`}
              sub={pillar.tagline}
              visible={p < state.built}
              active={running && p === state.current}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TowerLabel({
  top,
  title,
  sub,
  visible = true,
  active = false,
  muted = false,
}: {
  top: number;
  title: string;
  sub: string;
  visible?: boolean;
  active?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute hidden items-center gap-2.5 transition-opacity delay-200 duration-500 ease-out motion-reduce:transition-none @[540px]:flex",
        visible ? "opacity-100" : "opacity-0",
      )}
      style={{ left: ORIGIN_X + 228, top }}
    >
      <span
        className={cn(
          "h-px w-7",
          active ? "bg-primary" : "bg-[var(--pc-neutral-300)] dark:bg-[var(--pc-neutral-600)]",
        )}
      />
      <span className="flex flex-col">
        <span
          className={cn("font-medium text-sm", muted ? "text-muted-foreground" : "text-foreground")}
        >
          {title}
        </span>
        <span className="text-muted-foreground text-xs">{sub}</span>
      </span>
    </div>
  );
}
