// Generates the /start podcast from the scripts in app/(site)/start/podcast, locally and
// for free: Kokoro, an open-weight text-to-speech model (Apache-2.0), voices each turn,
// and LAME encodes the result to MP3. It also records where every turn starts, which is
// how the tower lights the piece being discussed.
//
// Run it by hand when a script changes, never in CI: the first run downloads the model.
//   cd apps/docs/scripts/podcast && npm install && npm run generate -- 1 2
// With no arguments it generates every episode.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Mp3Encoder } from "@breezystack/lamejs";
import { KokoroTTS } from "kokoro-js";

const here = dirname(fileURLToPath(import.meta.url));
const docs = join(here, "..", "..");
const scripts = join(docs, "app", "(site)", "start", "podcast");
const out = join(docs, "public", "podcast");

const MODEL = "onnx-community/Kokoro-82M-v1.0-ONNX";
const VOICES = { maya: "af_heart", leo: "am_puck" };
const KBPS = 48;
// A beat between speakers, and a shorter one when the same voice carries on.
const GAP = { change: 0.32, same: 0.18 };

const requested = process.argv.slice(2).map(Number).filter(Boolean);
const numbers = requested.length > 0 ? requested : [1, 2, 3, 4];

const tts = await KokoroTTS.from_pretrained(MODEL, { dtype: "fp32", device: "cpu" });
mkdirSync(out, { recursive: true });

const timings = await loadTimings();

for (const n of numbers) {
  const { [`EPISODE_${n}`]: episode } = await import(
    pathToFileURL(join(scripts, `episode-${n}.ts`)).href
  );
  console.log(`Episode ${n}: ${episode.turns.length} turns`);

  const chunks = [];
  const starts = [];
  let rate = 24000;
  let at = 0;
  let previous = null;

  for (const [i, turn] of episode.turns.entries()) {
    const audio = await tts.generate(turn.text, { voice: VOICES[turn.speaker] });
    rate = audio.sampling_rate;
    if (previous !== null) {
      const gap = previous === turn.speaker ? GAP.same : GAP.change;
      chunks.push(new Float32Array(Math.round(gap * rate)));
      at += gap;
    }
    starts.push(Math.round(at * 100) / 100);
    chunks.push(audio.audio);
    at += audio.audio.length / rate;
    previous = turn.speaker;
    if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${episode.turns.length}`);
  }

  const file = `layer-${n}.mp3`;
  writeFileSync(join(out, file), encode(chunks, rate));
  timings[n] = { src: `/podcast/${file}`, duration: Math.round(at * 100) / 100, starts };
  console.log(`  wrote public/podcast/${file}, ${Math.round(at)}s`);
}

writeFileSync(
  join(scripts, "timings.generated.ts"),
  `// Written by scripts/podcast/generate.mjs. Do not edit by hand.\nimport type { EpisodeTiming } from "./types";\n\nexport const TIMINGS: Partial<Record<number, EpisodeTiming>> = ${JSON.stringify(timings, null, 2)};\n`,
);

function encode(chunks, rate) {
  const encoder = new Mp3Encoder(1, rate, KBPS);
  const parts = [];
  for (const chunk of chunks) {
    const pcm = new Int16Array(chunk.length);
    for (let i = 0; i < chunk.length; i++) {
      pcm[i] = Math.max(-1, Math.min(1, chunk[i])) * 0x7fff;
    }
    for (let i = 0; i < pcm.length; i += 1152) {
      const frame = encoder.encodeBuffer(pcm.subarray(i, i + 1152));
      if (frame.length > 0) parts.push(Buffer.from(frame));
    }
  }
  parts.push(Buffer.from(encoder.flush()));
  return Buffer.concat(parts);
}

/** Keeps the timings of episodes not regenerated this run. */
async function loadTimings() {
  try {
    const { TIMINGS } = await import(pathToFileURL(join(scripts, "timings.generated.ts")).href);
    return { ...TIMINGS };
  } catch {
    return {};
  }
}
