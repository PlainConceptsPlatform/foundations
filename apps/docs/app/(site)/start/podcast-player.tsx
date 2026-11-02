"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Captions, ListOrdered, Pause, Play, SkipForward, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type PlayableEpisode, SPEAKERS, episodeFor } from "./podcast";

type PodcastPlayerProps = {
  layer: number;
  onLayer: (layer: number) => void;
  /** Called when the conversation reaches a piece, so the tower can follow it. */
  onPiece: (layer: number, piece: number) => void;
  onPlayingChange: (playing: boolean) => void;
  onClose: () => void;
};

const SPEEDS = [1, 1.25, 1.5];

export function PodcastPlayer({
  layer,
  onLayer,
  onPiece,
  onPlayingChange,
  onClose,
}: PodcastPlayerProps) {
  const episode = episodeFor(layer);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [captions, setCaptions] = useState(true);
  const [transcript, setTranscript] = useState(false);
  const lastPiece = useRef<number | null>(null);
  const next = episodeFor(layer + 1);

  // A new episode starts from the top and plays on its own: the listener asked for it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: restart only when the layer changes
  useEffect(() => {
    lastPiece.current = null;
    setTime(0);
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.playbackRate = speed;
    audio.play().catch(() => setPlaying(false));
  }, [layer]);

  useEffect(() => onPlayingChange(playing), [playing, onPlayingChange]);
  useEffect(() => () => onPlayingChange(false), [onPlayingChange]);

  if (!episode) return null;
  const turn = currentTurn(episode, time);
  const caption = captionAt(episode, turn, time);

  function onTime() {
    const audio = audioRef.current;
    if (!audio || !episode) return;
    setTime(audio.currentTime);
    const piece = pieceAt(episode, currentTurn(episode, audio.currentTime));
    if (piece !== null && piece !== lastPiece.current) {
      lastPiece.current = piece;
      onPiece(layer, piece);
    }
  }

  function seek(to: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = to;
    setTime(to);
  }

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }

  function cycleSpeed() {
    const nextSpeed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length] ?? 1;
    setSpeed(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
  }

  return (
    <section
      aria-label={`Podcast, episode ${episode.number}`}
      className="fixed inset-x-0 bottom-0 z-40 flex flex-col"
    >
      {/* biome-ignore lint/a11y/useMediaCaption: captions and the transcript are rendered below */}
      <audio
        ref={audioRef}
        src={episode.timing.src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          if (next) onLayer(layer + 1);
        }}
        onTimeUpdate={onTime}
      />

      {captions && caption && !transcript && (
        <div className="pointer-events-none flex justify-center px-4 pb-3">
          <p
            key={caption.key}
            className="max-w-3xl rounded-xl border border-border bg-background/95 px-5 py-3 text-center text-base leading-relaxed shadow-none backdrop-blur animate-in fade-in-0 duration-200 motion-reduce:animate-none sm:text-lg"
          >
            <span className="mr-2 font-semibold text-primary dark:text-[var(--pc-blue-400)]">
              {SPEAKERS[caption.speaker]}
            </span>
            {caption.text}
          </p>
        </div>
      )}

      <div className="border-border border-t bg-background/95 backdrop-blur">
        {transcript && <Transcript episode={episode} current={turn} onSeek={seek} />}

        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-12">
          <Button
            size="icon-lg"
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
            className="shrink-0 rounded-full"
          >
            {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
          </Button>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate">
                <span className="font-medium">Episode {episode.number} of 4</span>
                <span className="text-muted-foreground"> · {episode.title}</span>
              </span>
              <span className="shrink-0 text-muted-foreground tabular-nums">
                {clock(time)} / {clock(episode.timing.duration)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={episode.timing.duration}
              step={1}
              value={Math.min(time, episode.timing.duration)}
              onChange={(event) => seek(Number(event.target.value))}
              aria-label="Position in the episode"
              aria-valuetext={`${clock(time)} of ${clock(episode.timing.duration)}`}
              className="h-1.5 w-full cursor-pointer accent-[var(--primary)]"
            />
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={cycleSpeed}
              aria-label={`Playback speed, ${speed} times`}
              className="tabular-nums max-sm:hidden"
            >
              {speed}×
            </Button>
            <Button
              variant={captions ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setCaptions(!captions)}
              aria-label={captions ? "Hide subtitles" : "Show subtitles"}
              aria-pressed={captions}
            >
              <Captions aria-hidden />
            </Button>
            <Button
              variant={transcript ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setTranscript(!transcript)}
              aria-label={transcript ? "Hide transcript" : "Show transcript"}
              aria-pressed={transcript}
              className="max-sm:hidden"
            >
              <ListOrdered aria-hidden />
            </Button>
            {next && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onLayer(layer + 1)}
                aria-label={`Next episode: ${next.title}`}
              >
                <SkipForward aria-hidden />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close the podcast">
              <X aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Transcript({
  episode,
  current,
  onSeek,
}: {
  episode: PlayableEpisode;
  current: number;
  onSeek: (to: number) => void;
}) {
  const active = useRef<HTMLButtonElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: follow the turn that is playing
  useEffect(() => {
    active.current?.scrollIntoView({ block: "nearest" });
  }, [current]);

  return (
    <div className="mx-auto max-h-[40vh] max-w-[1440px] overflow-y-auto border-border border-b px-4 py-4 sm:px-6 lg:px-12">
      <ol className="flex max-w-3xl flex-col gap-1">
        {episode.turns.map((turn, i) => (
          <li key={`${i}-${turn.speaker}`}>
            <button
              ref={i === current ? active : undefined}
              type="button"
              onClick={() => onSeek(episode.timing.starts[i] ?? 0)}
              aria-current={i === current ? "true" : undefined}
              className={cn(
                "w-full rounded-md px-3 py-1.5 text-left text-sm leading-relaxed transition-colors duration-150 ease-out motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                i === current ? "bg-accent text-accent-foreground" : "hover:bg-muted",
              )}
            >
              <span className="mr-2 font-semibold">{SPEAKERS[turn.speaker]}</span>
              {turn.text}
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-muted-foreground text-xs">
        The voices are synthetic, generated with Kokoro, an open-weight text-to-speech model, from a
        script written for this page.
      </p>
    </div>
  );
}

function currentTurn(episode: PlayableEpisode, time: number) {
  let index = 0;
  episode.timing.starts.forEach((start, i) => {
    if (start <= time + 0.05) index = i;
  });
  return index;
}

/** The piece under discussion: the last one the conversation reached at or before this turn. */
function pieceAt(episode: PlayableEpisode, turn: number) {
  for (let i = turn; i >= 0; i--) {
    const piece = episode.turns[i]?.piece;
    if (piece !== undefined) return piece;
  }
  return null;
}

/**
 * Subtitles a sentence or two at a time. The generator only measures where each turn
 * starts, so within a turn each line gets a share of its time in proportion to its
 * length, which tracks a steady speaking voice closely enough to read along.
 */
function captionAt(episode: PlayableEpisode, index: number, time: number) {
  const turn = episode.turns[index];
  if (!turn) return null;
  const start = episode.timing.starts[index] ?? 0;
  const end = episode.timing.starts[index + 1] ?? episode.timing.duration;
  const lines = captionLines(turn.text);
  const total = lines.reduce((sum, line) => sum + line.length, 0);

  let at = start;
  for (const [i, line] of lines.entries()) {
    const span = ((end - start) * line.length) / total;
    if (time < at + span || i === lines.length - 1) {
      return { key: `${index}.${i}`, speaker: turn.speaker, text: line };
    }
    at += span;
  }
  return null;
}

const MAX_LINE = 120;

function captionLines(text: string) {
  const sentences = text.match(/[^.!?]+[.!?]+["”’)]*|[^.!?]+$/g)?.map((s) => s.trim()) ?? [text];
  const lines: string[] = [];
  for (const sentence of sentences) {
    const last = lines.at(-1);
    if (last && last.length + sentence.length + 1 <= MAX_LINE)
      lines[lines.length - 1] = `${last} ${sentence}`;
    else lines.push(sentence);
  }
  return lines;
}

function clock(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
