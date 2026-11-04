"use client";

import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

type SegmentedControlProps<T extends string> = {
  options: ReadonlyArray<SegmentedControlOption<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <fieldset className={cn("flex gap-1 border-none m-0 min-w-0 px-0.5 py-0.5", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn(
            "flex flex-1 items-center justify-center rounded bg-transparent px-1 py-1.5 text-[11px] text-muted-foreground cursor-pointer border-none transition-colors duration-150",
            "hover:bg-muted hover:text-foreground",
            value === option.value && "bg-accent text-accent-foreground",
          )}
          title={option.label}
          aria-label={option.label}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.icon ?? option.label}
        </button>
      ))}
    </fieldset>
  );
}
