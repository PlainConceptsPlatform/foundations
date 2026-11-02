"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { type JourneyState, litIn } from "./journey";
import { PILLARS } from "./steps";

type LayerListProps = {
  state: JourneyState;
  onPick: (pillar: number) => void;
};

export function LayerList({ state, onPick }: LayerListProps) {
  return (
    <ol aria-label="Layers" className="flex flex-col gap-1">
      {PILLARS.map((pillar, p) => {
        const reachable = p < state.built;
        const active = state.phase === "run" && p === state.current;
        const total = pillar.steps.length;

        return (
          <li key={pillar.name}>
            <button
              type="button"
              disabled={!reachable}
              aria-current={active ? "step" : undefined}
              onClick={() => onPick(p)}
              className={cn(
                "flex w-full items-center gap-3.5 rounded-lg border px-3.5 py-3 text-left",
                "transition-colors duration-300 ease-out motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-45",
                active ? "border-primary bg-card" : "border-border hover:bg-card",
              )}
            >
              <span
                className={cn(
                  "w-5 font-bold text-xl",
                  active ? "text-primary dark:text-[var(--pc-blue-400)]" : "text-muted-foreground",
                )}
              >
                {p + 1}
              </span>
              <span className="flex flex-1 flex-col gap-1.5">
                <span className="flex justify-between text-sm">
                  <span className="font-medium">
                    {pillar.name}
                    {pillar.optional && (
                      <span className="ml-1.5 text-muted-foreground text-xs">optional</span>
                    )}
                  </span>
                  <span className="text-muted-foreground">
                    {litIn(state, p)}/{total}
                  </span>
                </span>
                <Progress value={(litIn(state, p) / total) * 100} className="h-1 bg-muted" />
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
