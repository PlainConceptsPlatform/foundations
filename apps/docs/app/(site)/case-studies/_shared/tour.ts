"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Chapter = { id: string; label: string };

export function useGuidedTour(chapters: Chapter[], { intervalMs = 8000 } = {}) {
  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const indexRef = useRef(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToId = useCallback((id?: string) => {
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setPlaying(false);
  }, []);

  const schedule = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const next = indexRef.current + 1;
      if (next >= chapters.length) {
        stop();
        return;
      }
      indexRef.current = next;
      setActive(next);
      scrollToId(chapters[next]?.id);
      schedule();
    }, intervalMs);
  }, [chapters, intervalMs, stop, scrollToId]);

  const toggle = useCallback(() => {
    if (playing) {
      stop();
      return;
    }
    setPlaying(true);
    if (indexRef.current >= chapters.length - 1) indexRef.current = -1;
    schedule();
  }, [playing, schedule, stop, chapters.length]);

  const jumpTo = useCallback(
    (i: number) => {
      indexRef.current = i;
      setActive(i);
      scrollToId(chapters[i]?.id);
    },
    [chapters, scrollToId],
  );

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return { active, playing, toggle, stop, jumpTo };
}
