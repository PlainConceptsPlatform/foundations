"""Imports one NotebookLM audio overview into the /start podcast.

It re-encodes the download to small mono AAC, transcribes it locally with
faster-whisper (free, open weights) for the subtitles, and finds where the hosts
announce each piece ("piece one point three", "pieza uno punto tres") so the tower
can follow along. Everything runs on this machine; nothing is uploaded.

    .venv/Scripts/python import_episode.py <download> <layer 1-4> <en|es>

Results go to public/podcast/<lang>/layer-<n>.m4a and app/(site)/start/podcast/episodes.json.
"""

import json
import re
import sys
from pathlib import Path

import av
from faster_whisper import WhisperModel

HERE = Path(__file__).resolve().parent
DOCS = HERE.parent.parent
DATA = DOCS / "app" / "(site)" / "start" / "podcast" / "episodes.json"
PARTS = HERE / ".parts"
PIECES = {1: 9, 2: 8, 3: 5, 4: 5}

NUMBERS = {
    "en": ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"],
    "es": ["uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"],
}
# Whisper writes what it hears, so the common mishearings count too.
WORD = {"en": "(?:piece|peace)", "es": "(?:pieza|piesa|pieca)"}
POINT = {"en": "point", "es": "punto"}


def encode(source: Path, target: Path) -> float:
    """Mono AAC at 48 kb/s: speech stays clear and an episode stays a few megabytes."""
    target.parent.mkdir(parents=True, exist_ok=True)
    with av.open(str(source)) as inp, av.open(str(target), "w", format="mp4") as out:
        stream = out.add_stream("aac", rate=24000)
        stream.bit_rate = 48000
        stream.layout = "mono"
        resampler = av.AudioResampler(format="fltp", layout="mono", rate=24000)
        for frame in inp.decode(audio=0):
            for resampled in resampler.resample(frame):
                for packet in stream.encode(resampled):
                    out.mux(packet)
        for resampled in resampler.resample(None):
            for packet in stream.encode(resampled):
                out.mux(packet)
        for packet in stream.encode(None):
            out.mux(packet)
    with av.open(str(target)) as check:
        return float(check.duration) / av.time_base


def decode_16k(path: Path):
    """Mono float32 at 16 kHz, what Whisper expects. faster-whisper's own decoder passes
    an option PyAV 19 no longer accepts, so it gets the samples ready-made."""
    import numpy as np

    chunks = []
    resampler = av.AudioResampler(format="flt", layout="mono", rate=16000)
    with av.open(str(path)) as inp:
        for frame in inp.decode(audio=0):
            for resampled in resampler.resample(frame):
                chunks.append(resampled.to_ndarray().reshape(-1))
        for resampled in resampler.resample(None):
            chunks.append(resampled.to_ndarray().reshape(-1))
    return np.concatenate(chunks).astype(np.float32)


def number_pattern(lang: str) -> str:
    words = "|".join(NUMBERS[lang])
    return rf"(?:\d|{words})"


def to_int(token: str, lang: str) -> int | None:
    token = token.lower()
    if token.isdigit():
        return int(token)
    return NUMBERS[lang].index(token) + 1 if token in NUMBERS[lang] else None


def find_pieces(segments: list[dict], layer: int, lang: str) -> list[dict]:
    """The first time each piece of this layer is announced, in ascending order."""
    n = number_pattern(lang)
    spoken = re.compile(rf"\b{WORD[lang]}\s+({n})\s+{POINT[lang]}\s+({n})\b", re.IGNORECASE)
    digits = re.compile(rf"\b{WORD[lang]}\s+(\d)[.,](\d)\b", re.IGNORECASE)
    found: dict[int, float] = {}
    for segment in segments:
        for pattern in (spoken, digits):
            for match in pattern.finditer(segment["text"]):
                major, minor = to_int(match[1], lang), to_int(match[2], lang)
                if major != layer or minor is None or not 1 <= minor <= PIECES[layer]:
                    continue
                piece = minor - 1
                if piece not in found and all(piece > p for p in found):
                    found[piece] = segment["start"]
    return fill_gaps(found, segments, PIECES[layer])


def fill_gaps(found: dict[int, float], segments: list[dict], total: int) -> list[dict]:
    """The hosts walk the pieces in order but don't always say the number. A piece they
    skipped announcing goes between its neighbours, in proportion, at the start of the
    line nearest that moment, and is marked as estimated."""
    end = segments[-1]["end"] if segments else 0.0
    anchors = {-1: 0.0, total: end * 0.97, **found}
    known = sorted(anchors)
    pieces = []
    for piece in range(total):
        if piece in found:
            pieces.append({"piece": piece, "start": round(found[piece], 2)})
            continue
        before = max(k for k in known if k < piece)
        after = min(k for k in known if k > piece)
        at = anchors[before] + (anchors[after] - anchors[before]) * (piece - before) / (after - before)
        nearest = min(segments, key=lambda s: abs(s["start"] - at))["start"] if segments else at
        pieces.append({"piece": piece, "start": round(nearest, 2), "estimated": True})
    return pieces


def main() -> None:
    source, layer, lang = Path(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
    target = DOCS / "public" / "podcast" / lang / f"layer-{layer}.m4a"
    duration = encode(source, target)
    print(f"encoded {target.name}: {duration:.0f}s, {target.stat().st_size // 1024} KB")

    model = WhisperModel("small", device="cpu", compute_type="int8")
    raw, _ = model.transcribe(decode_16k(target), language=lang, vad_filter=True, beam_size=5)
    segments = [
        {"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip()} for s in raw
    ]
    pieces = find_pieces(segments, layer, lang)
    print(f"{len(segments)} segments, pieces found: {[p['piece'] + 1 for p in pieces]}")

    # Each import writes its own file, so several can run at once; --merge joins them.
    PARTS.mkdir(exist_ok=True)
    episode = {
        "src": f"/podcast/{lang}/layer-{layer}.m4a",
        "duration": round(duration, 2),
        "segments": segments,
        "pieces": pieces,
    }
    (PARTS / f"{lang}-{layer}.json").write_text(json.dumps(episode, ensure_ascii=False), encoding="utf-8")
    merge()


def load() -> dict:
    """Every episode, with its transcript, from the parts."""
    data: dict = {}
    for part in sorted(PARTS.glob("*.json")):
        lang, layer = part.stem.split("-")
        data.setdefault(lang, {})[layer] = json.loads(part.read_text(encoding="utf-8"))
    return data


def write(data: dict) -> None:
    """The page gets a small index (audio, length, pieces). Each transcript is its own
    file next to its audio, fetched only by someone who presses play."""
    index: dict = {}
    for lang, episodes in data.items():
        for layer, episode in episodes.items():
            transcript = DOCS / "public" / "podcast" / lang / f"layer-{layer}.json"
            transcript.write_text(json.dumps(episode["segments"], ensure_ascii=False), encoding="utf-8")
            index.setdefault(lang, {})[layer] = {
                "src": episode["src"],
                "transcript": f"/podcast/{lang}/layer-{layer}.json",
                "duration": episode["duration"],
                "pieces": episode["pieces"],
            }
    DATA.write_text(json.dumps(index, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def merge() -> None:
    write(load())


def redetect() -> None:
    """Finds the pieces again from the stored transcripts, without transcribing again."""
    data = load()
    for lang, episodes in data.items():
        for layer, episode in episodes.items():
            episode["pieces"] = find_pieces(episode["segments"], int(layer), lang)
            told = [p["piece"] + 1 for p in episode["pieces"] if not p.get("estimated")]
            print(f"{lang} {layer}: announced {told} of {PIECES[int(layer)]}")
            (PARTS / f"{lang}-{layer}.json").write_text(json.dumps(episode, ensure_ascii=False), encoding="utf-8")
    write(data)


if __name__ == "__main__":
    {"--merge": merge, "--redetect": redetect}.get(" ".join(sys.argv[1:]), main)()
