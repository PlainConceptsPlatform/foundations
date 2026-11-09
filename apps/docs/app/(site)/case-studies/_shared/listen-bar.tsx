"use client";

import { Button } from "@/components/ui/button";
import { Pause, Play, Volume2, X } from "lucide-react";

/**
 * The fixed bottom bar shown while the Listen tour is open. The status line
 * carries the current chapter; the disclosure note stays until the NotebookLM
 * audio replaces the guided preview.
 */
export function ListenBar({
  title,
  chapterLabel,
  playing,
  onToggle,
  onClose,
}: {
  title: string;
  chapterLabel: string;
  playing: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <Button
          size="icon"
          variant="secondary"
          onClick={onToggle}
          aria-label={playing ? "Pause" : "Play"}
          className="shrink-0 rounded-full"
        >
          {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
        </Button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm">
            <Volume2 aria-hidden className="size-4 shrink-0 text-primary" />
            <span className="truncate font-medium">{title}</span>
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {chapterLabel} · guided preview: the audio is produced with NotebookLM next
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close the player">
          <X aria-hidden />
        </Button>
      </div>
    </div>
  );
}
