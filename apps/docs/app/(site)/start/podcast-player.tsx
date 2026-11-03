"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Captions, ListOrdered, Pause, Play, SkipForward, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  LANGS,
  type Lang,
  type PlayableEpisode,
  type Segment,
  episodeFor,
  langsFor,
  loadLines,
  nextLayerWith,
} from "./podcast";

type PodcastPlayerProps = {
  layer: number;
  lang: Lang;
  onLang: (lang: Lang) => void;
  onLayer: (layer: number) => void;
  /** Called when the hosts reach a piece, so the tower can follow it. */
  onPiece: (layer: number, piece: number) => void;
  onPlayingChange: (playing: boolean) => void;
  onClose: () => void;
};

const SPEEDS = [1, 1.25, 1.5];

const COPY: Record<Lang, { episode: string; of: string; disclosure: string }> = {
  en: {
    episode: "Episode",
    of: "of 4",
    disclosure:
      "Generated with NotebookLM from the guides on this page. The voices are synthetic and the subtitles were transcribed automatically, so a word can be off.",
  },
  es: {
    episode: "Episodio",
    of: "de 4",
    disclosure:
      "Generado con NotebookLM a partir de las guías de esta página. Las voces son sintéticas y los subtítulos se han transcrito automáticamente, así que alguna palabra puede fallar.",
  },
};

export function PodcastPlayer({
  layer,
  lang,
  onLang,
  onLayer,
  onPiece,
  onPlayingChange,
  onClose,
}: PodcastPlayerProps) {
  const episode = episodeFor(layer, lang);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [captions, setCaptions] = useState(true);
  const [transcript, setTranscript] = useState(false);
  const lastPiece = useRef<number | null>(null);
  // Where to start the next source: switching language resumes at the same piece.
  const resumeAt = useRef(0);
  const next = nextLayerWith(layer + 1, lang);
  const copy = COPY[lang];

  // A new episode or language plays on its own: the listener just asked for it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: restart only when the source changes
  useEffect(() => {
    lastPiece.current = null;
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = resumeAt.current;
    setTime(resumeAt.current);
    resumeAt.current = 0;
    audio.playbackRate = speed;
    audio.play().catch(() => setPlaying(false));
  }, [layer, lang]);

  useEffect(() => onPlayingChange(playing), [playing, onPlayingChange]);
  useEffect(() => () => onPlayingChange(false), [onPlayingChange]);

  // The subtitles arrive a moment after the audio starts; until then there are none.
  const [lines, setLines] = useState<Segment[]>([]);
  const source = episode?.transcript;
  // biome-ignore lint/correctness/useExhaustiveDependencies: fetch again only when the episode changes
  useEffect(() => {
    setLines([]);
    if (!episode) return;
    let current = true;
    loadLines(episode).then((loaded) => current && setLines(loaded));
    return () => {
      current = false;
    };
  }, [source]);

  if (!episode) return null;
  const segment = lineAt(lines, time);

  function onTime() {
    const audio = audioRef.current;
    if (!audio || !episode) return;
    setTime(audio.currentTime);
    const piece = pieceAt(episode, audio.currentTime);
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

  function switchLang(to: Lang) {
    if (to === lang || !episode) return;
    const piece = pieceAt(episode, time);
    const other = episodeFor(layer, to);
    resumeAt.current = other?.pieces.find((p) => p.piece === piece)?.start ?? 0;
    onLang(to);
  }

  const available = langsFor(layer);

  return (
    <section
      aria-label={`Podcast, ${copy.episode} ${layer + 1}`}
      className="fixed inset-x-0 bottom-0 z-40 flex flex-col"
    >
      {/* biome-ignore lint/a11y/useMediaCaption: the subtitles and transcript are rendered below */}
      <audio
        ref={audioRef}
        src={episode.src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          if (next !== undefined) onLayer(next);
        }}
        onTimeUpdate={onTime}
      />

      {captions && segment && !transcript && (
        <div className="pointer-events-none flex justify-center px-4 pb-3">
          <p
            key={segment.start}
            lang={lang}
            className="max-w-3xl rounded-xl border border-border bg-background/95 px-5 py-3 text-center text-base leading-relaxed backdrop-blur animate-in fade-in-0 duration-200 motion-reduce:animate-none sm:text-lg"
          >
            {segment.text}
          </p>
        </div>
      )}

      <div className="border-border border-t bg-background/95 backdrop-blur">
        {transcript && (
          <Transcript
            lang={lang}
            lines={lines}
            current={segment}
            onSeek={seek}
            note={copy.disclosure}
          />
        )}

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
                <span className="font-medium">
                  {copy.episode} {layer + 1} {copy.of}
                </span>
                <span className="text-muted-foreground"> · {episode.title}</span>
              </span>
              <span className="shrink-0 text-muted-foreground tabular-nums">
                {clock(time)} / {clock(episode.duration)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={episode.duration}
              step={1}
              value={Math.min(time, episode.duration)}
              onChange={(event) => seek(Number(event.target.value))}
              aria-label="Position in the episode"
              aria-valuetext={`${clock(time)} of ${clock(episode.duration)}`}
              className="h-1.5 w-full cursor-pointer accent-[var(--primary)]"
            />
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            {available.length > 1 && (
              <fieldset className="mr-1 flex overflow-hidden rounded-md border border-border">
                <legend className="sr-only">Language</legend>
                {LANGS.filter((l) => available.includes(l.id)).map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => switchLang(l.id)}
                    aria-pressed={l.id === lang}
                    aria-label={l.label}
                    className={cn(
                      "px-2 py-1 font-medium text-xs transition-colors duration-150 ease-out motion-reduce:transition-none",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      l.id === lang
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {l.short}
                  </button>
                ))}
              </fieldset>
            )}
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
            {next !== undefined && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onLayer(next)}
                aria-label="Next episode"
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
  lang,
  lines,
  current,
  onSeek,
  note,
}: {
  lang: Lang;
  lines: Segment[];
  current: Segment | null;
  onSeek: (to: number) => void;
  note: string;
}) {
  const active = useRef<HTMLButtonElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: follow the line that is playing
  useEffect(() => {
    active.current?.scrollIntoView({ block: "nearest" });
  }, [current]);

  return (
    <div
      lang={lang}
      className="mx-auto max-h-[40vh] max-w-[1440px] overflow-y-auto border-border border-b px-4 py-4 sm:px-6 lg:px-12"
    >
      <ol className="flex max-w-3xl flex-col gap-0.5">
        {lines.map((segment) => {
          const isCurrent = segment === current;
          return (
            <li key={segment.start}>
              <button
                ref={isCurrent ? active : undefined}
                type="button"
                onClick={() => onSeek(segment.start)}
                aria-current={isCurrent ? "true" : undefined}
                className={cn(
                  "flex w-full gap-3 rounded-md px-3 py-1.5 text-left text-sm leading-relaxed transition-colors duration-150 ease-out motion-reduce:transition-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isCurrent ? "bg-accent text-accent-foreground" : "hover:bg-muted",
                )}
              >
                <span className="w-10 shrink-0 text-muted-foreground tabular-nums">
                  {clock(segment.start)}
                </span>
                {segment.text}
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-muted-foreground text-xs">{note}</p>
    </div>
  );
}

function lineAt(lines: Segment[], time: number) {
  let found: Segment | null = null;
  for (const segment of lines) {
    if (segment.start > time + 0.05) break;
    found = segment;
  }
  // Between two lines there is silence: keep the last line up a moment, not forever.
  return found && time <= found.end + 1.5 ? found : null;
}

/** The piece under discussion: the last one announced at or before this moment. */
function pieceAt(episode: PlayableEpisode, time: number) {
  let piece: number | null = null;
  for (const point of episode.pieces) {
    if (point.start > time + 0.05) break;
    piece = point.piece;
  }
  return piece;
}

function clock(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
