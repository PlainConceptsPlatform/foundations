"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Captions, ListOrdered, Pause, Play, SkipForward, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LANGS, type Lang, type Piece, type Podcast, type Segment, loadLines } from "./podcast";

type PodcastPlayerProps = {
  podcast: Podcast;
  index: number;
  lang: Lang;
  onLang: (lang: Lang) => void;
  /** Called to switch the episode (chapter); the parent restarts from there. */
  onEpisode: (index: number) => void;
  /** Called when the hosts reach a follow-along point, so the page can follow it. */
  onPiece: (index: number, piece: number) => void;
  onPlayingChange: (playing: boolean) => void;
  onClose: () => void;
};

const SPEEDS = [1, 1.25, 1.5];

const COPY: Record<Lang, { episode: string; ofWord: string; disclosure: string; guided: string }> =
  {
    en: {
      episode: "Episode",
      ofWord: "of",
      disclosure:
        "Generated with NotebookLM from the guide on this page. The voices are synthetic and the subtitles were transcribed automatically, so a word can be off.",
      guided: "The audio is still being produced. Until then this follows the guide on a timer.",
    },
    es: {
      episode: "Episodio",
      ofWord: "de",
      disclosure:
        "Generado con NotebookLM a partir de la guía de esta página. Las voces son sintéticas y los subtítulos se han transcrito automáticamente, así que alguna palabra puede fallar.",
      guided: "El audio todavía está en producción. Hasta entonces esto recorre la guía a tiempo.",
    },
  };

export function PodcastPlayer({
  podcast,
  index,
  lang,
  onLang,
  onEpisode,
  onPiece,
  onPlayingChange,
  onClose,
}: PodcastPlayerProps) {
  const episode = podcast.episodeFor(index, lang);
  const guiding = episode ? !episode.src : false;
  const next = podcast.nextWith(index + 1, lang);
  const copy = COPY[lang];

  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [captions, setCaptions] = useState(true);
  const [transcript, setTranscript] = useState(false);
  const lastPiece = useRef<number | null>(null);
  // Where to start the next source: switching language resumes at the same point.
  const resumeAt = useRef(0);
  const [lines, setLines] = useState<Segment[]>([]);
  const source = episode?.transcript;
  const endedRef = useRef(false);

  // Fresh closures for the guided clock, so a step never reads a stale value.
  const episodeRef = useRef(episode);
  episodeRef.current = episode;
  const onEpisodeRef = useRef(onEpisode);
  onEpisodeRef.current = onEpisode;
  const onPieceRef = useRef(onPiece);
  onPieceRef.current = onPiece;
  const nextRef = useRef(next);
  nextRef.current = next;

  // A new episode or language starts on its own: the listener just asked for it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: restart only when the source changes
  useEffect(() => {
    lastPiece.current = null;
    endedRef.current = false;
    const ep = podcast.episodeFor(index, lang);
    if (!ep) return;
    const t = resumeAt.current;
    resumeAt.current = 0;
    setTime(t);
    if (ep.src) {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = t;
      audio.playbackRate = speed;
      audio.play().catch(() => setPlaying(false));
    } else {
      // No audio yet: one line holds the whole guide, on one beat.
      setLines([]);
      setPlaying(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, lang]);

  // Subtitles arrive a moment after real audio starts; the guided preview has none.
  useEffect(() => {
    if (!source) return;
    let current = true;
    setLines([]);
    loadLines(source).then((loaded) => current && setLines(loaded));
    return () => {
      current = false;
    };
  }, [source]);

  // The guided clock: no audio, so a timer drives the progress.
  useEffect(() => {
    if (!guiding || !playing) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      setTime((t) => {
        const ep = episodeRef.current;
        if (!ep) return t;
        return Math.min(ep.duration, t + dt * speed);
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [guiding, playing, speed]);

  // The follow-along point under the playhead lights up as the guide passes it.
  useEffect(() => {
    if (!guiding || !episode) return;
    const piece = pieceAt(episode, time);
    if (piece !== null && piece !== lastPiece.current) {
      lastPiece.current = piece;
      onPiece(index, piece);
    }
  }, [time, guiding, episode, index, onPiece]);

  // The guided episode ends at its stop: on to the next, or stop on the last.
  useEffect(() => {
    if (!guiding || !episode || endedRef.current) return;
    if (time < episode.duration) return;
    endedRef.current = true;
    if (next !== undefined) onEpisode(next);
    else setPlaying(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, guiding, episode, next, onEpisode]);

  useEffect(() => onPlayingChange(playing), [playing, onPlayingChange]);
  useEffect(() => () => onPlayingChange(false), [onPlayingChange]);

  if (!episode) return null;
  const currentEpisode = episode;
  const segment = lineAt(lines, time);

  function onTime() {
    const audio = audioRef.current;
    if (!audio || !episode) return;
    setTime(audio.currentTime);
    const piece = pieceAt(episode, audio.currentTime);
    if (piece !== null && piece !== lastPiece.current) {
      lastPiece.current = piece;
      onPiece(index, piece);
    }
  }

  function seek(to: number) {
    if (currentEpisode.src) {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = to;
    }
    lastPiece.current = null;
    endedRef.current = false;
    setTime(to);
  }

  function toggle() {
    if (currentEpisode.src) {
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.paused) audio.play().catch(() => setPlaying(false));
      else audio.pause();
      return;
    }
    setPlaying((p) => !p);
  }

  function cycleSpeed() {
    const nextSpeed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length] ?? 1;
    setSpeed(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
  }

  function switchLang(to: Lang) {
    if (to === lang || !episode) return;
    const other = podcast.episodeFor(index, to);
    if (!other) return;
    // With real audio, resume at the same announced point; the guide keeps its place.
    resumeAt.current = episode.src
      ? (other.pieces.find((p) => p.piece === pieceAt(episode, time))?.start ?? time)
      : time;
    onLang(to);
  }

  const available = podcast.langsFor(index);

  return (
    <section
      aria-label={`${copy.episode} ${index + 1} ${copy.ofWord} ${podcast.count}`}
      className="fixed inset-x-0 bottom-0 z-40 flex flex-col"
    >
      {episode.src && (
        // biome-ignore lint/a11y/useMediaCaption: the subtitles and transcript are rendered below
        <audio
          ref={audioRef}
          src={episode.src}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            if (next !== undefined) onEpisode(next);
          }}
          onTimeUpdate={onTime}
        />
      )}

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
            note={copy[(guiding ? "guided" : "disclosure") as "guided" | "disclosure"]}
          />
        )}

        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-12">
          <Button
            size="icon-lg"
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
            data-tool-name="toggle_podcast"
            data-tool-description="Play or pause the case-study podcast at the current position"
            className="shrink-0 rounded-full"
          >
            {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
          </Button>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate">
                <span className="font-medium">
                  {copy.episode} {index + 1} {copy.ofWord} {podcast.count}
                </span>
                {guiding && (
                  <span className="ml-1.5 inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-0.5 align-middle font-mono text-[10px] text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-[var(--success)]" aria-hidden />
                    preview
                  </span>
                )}
                <span className="text-muted-foreground"> · {episode.title}</span>
              </span>
              <span className="shrink-0 text-muted-foreground tabular-nums">
                {clock(time)} / {clock(episode.duration)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(1, episode.duration)}
              step={1}
              value={Math.min(time, episode.duration)}
              onChange={(event) => seek(Number(event.target.value))}
              aria-label="Position in the episode"
              aria-valuetext={`${clock(time)} of ${clock(episode.duration)}`}
              className="h-1.5 w-full cursor-pointer accent-[var(--primary)]"
              data-tool-name="seek_podcast"
              data-tool-description="Seek to a position in the podcast chapter"
              data-tool-param-description="Position in seconds from the start of the chapter"
            />
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            {available.length > 1 && (
              <fieldset
                className="mr-1 flex overflow-hidden rounded-md border border-border"
                data-tool-name="switch_podcast_language"
                data-tool-description="Switch the podcast language between English and Spanish"
              >
                <legend className="sr-only">Language</legend>
                {LANGS.filter((l) => available.includes(l.id)).map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => switchLang(l.id)}
                    aria-pressed={l.id === lang}
                    aria-label={l.label}
                    data-tool-param-description={`Switch the podcast to ${l.label}`}
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
              data-tool-name="cycle_podcast_speed"
              data-tool-description="Cycle the podcast playback speed between 1, 1.25 and 1.5 times"
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
              data-tool-name="toggle_podcast_subtitles"
              data-tool-description="Show or hide the live subtitles of the podcast"
            >
              <Captions aria-hidden />
            </Button>
            <Button
              variant={transcript ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setTranscript(!transcript)}
              aria-label={transcript ? "Hide transcript" : "Show transcript"}
              aria-pressed={transcript}
              data-tool-name="toggle_podcast_transcript"
              data-tool-description="Show or hide the full transcript of the podcast chapter"
              className="max-sm:hidden"
            >
              <ListOrdered aria-hidden />
            </Button>
            {next !== undefined && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEpisode(next)}
                aria-label="Next episode"
                data-tool-name="next_podcast_episode"
                data-tool-description="Skip to the next podcast chapter in the current case study"
              >
                <SkipForward aria-hidden />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close the podcast"
              data-tool-name="close_podcast"
              data-tool-description="Close the podcast player"
            >
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
      {lines.length > 0 && (
        <ol
          className="flex max-w-3xl flex-col gap-0.5"
          data-tool-name="seek_podcast_to_line"
          data-tool-description="Jump the podcast to a transcript line; each button selects a timestamp and its text"
        >
          {lines.map((segment) => {
            const isCurrent = segment === current;
            return (
              <li key={segment.start}>
                <button
                  ref={isCurrent ? active : undefined}
                  type="button"
                  onClick={() => onSeek(segment.start)}
                  aria-current={isCurrent ? "true" : undefined}
                  data-tool-param-description={`Seek to ${clock(segment.start)}: ${segment.text}`}
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
      )}
      <p className="mt-3 text-muted-foreground text-xs">{note}</p>
    </div>
  );
}

function lineAt(lines: Segment[], t: number) {
  let found: Segment | null = null;
  for (const segment of lines) {
    if (segment.start > t + 0.05) break;
    found = segment;
  }
  // Between two lines there is silence: keep the last line up a moment, not forever.
  return found && t <= found.end + 1.5 ? found : null;
}

/** The follow-along point under discussion: the last one announced at or before this moment. */
function pieceAt(episode: { pieces: Piece[] }, t: number) {
  let piece: number | null = null;
  for (const point of episode.pieces) {
    if (point.start > t + 0.05) break;
    piece = point.piece;
  }
  return piece;
}

function clock(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
