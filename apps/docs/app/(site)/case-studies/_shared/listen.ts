"use client";

import { useCallback, useEffect, useState } from "react";
import type { Lang, Podcast } from "./podcast";

const LANG_KEY = "platform-case-podcast-lang";

/**
 * The listening state shared by every case study: which chapter is open, the reader's
 * language, and the callbacks the shared player drives the page with. The page does the
 * follow-along: `onPiece` scrolls to the section a chapter points at.
 */
export function useCaseListen(podcast: Podcast, sections: { id: string }[]) {
  const [listening, setListening] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "en" || saved === "es") {
        setLang(saved);
        return;
      }
    } catch {}
    if (navigator.language?.toLowerCase().startsWith("es")) setLang("es");
  }, []);

  const chooseLang = useCallback((to: Lang) => {
    setLang(to);
    try {
      localStorage.setItem(LANG_KEY, to);
    } catch {}
  }, []);

  const listen = useCallback(() => setListening(0), []);
  const close = useCallback(() => setListening(null), []);
  const onEpisode = useCallback((index: number) => setListening(index), []);
  const onPlayingChange = useCallback((playing: boolean) => setSpeaking(playing), []);
  const onPiece = useCallback(
    (index: number) => {
      const id = sections[index]?.id;
      if (id)
        document.getElementById(id)?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
          block: "start",
        });
    },
    [sections],
  );

  return {
    listening,
    speaking,
    lang,
    chooseLang,
    listen,
    close,
    onEpisode,
    onPiece,
    onPlayingChange,
  };
}
