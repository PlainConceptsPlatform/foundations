"use client";

import { cn } from "@/lib/utils";
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";

export function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/**
 * Scroll-in reveal for a case study section. A licensed exception to the motion
 * contract in ai/DESIGN.md, the same way /start is: it is a full-screen piece,
 * not a line-of-business screen. Only opacity and translate-y move, and
 * prefers-reduced-motion shows the content immediately.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      id={id}
      style={{ transitionDelay: `${delay}ms` } as CSSProperties}
      className={cn(
        "scroll-mt-20 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
        inView ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * A level meter that fills from the left with a scaleX transform, not a width,
 * so it stays on the contract and never forces layout. value is 0 to 1.
 */
export function ScaleBar({
  value,
  className,
  fillClassName,
  delay = 0,
  label,
}: {
  value: number;
  className?: string;
  fillClassName?: string;
  delay?: number;
  label?: string;
}) {
  const { ref, inView } = useInView(0.3);
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="progressbar"
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        style={{
          transform: inView ? `scaleX(${clamped})` : "scaleX(0)",
          transitionDelay: `${delay}ms`,
        }}
        className={cn(
          "h-full w-full origin-left rounded-full bg-primary transition-transform duration-1000 ease-out motion-reduce:transition-none",
          fillClassName,
        )}
      />
    </div>
  );
}
