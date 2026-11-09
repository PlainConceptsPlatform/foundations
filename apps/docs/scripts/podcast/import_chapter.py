"""Imports one NotebookLM audio overview into a case-study podcast.

It re-encodes the download to small mono AAC, transcribes it locally with
faster-whisper for the subtitles, and records the duration. Each chapter is
one episode; the follow-along uses a single piece at the start, so no spoken
"piece one point three" detection is needed. Everything runs on this machine.

    .venv/Scripts/python import_chapter.py <download> <slug> <chapter 1-5> <en|es>

Results go to public/case-studies/<slug>/podcast/<lang>/<chapter>.{m4a,json}
and merge into app/(site)/case-studies/_shared/podcast/episodes.json.
"""

import json
import sys
from pathlib import Path

import av
from faster_whisper import WhisperModel

HERE = Path(__file__).resolve().parent
DOCS = HERE.parent.parent
EPISODES = DOCS / "app" / "(site)" / "case-studies" / "_shared" / "podcast" / "episodes.json"
PARTS = HERE / ".case-parts"

SLUG_TO_CASE = {
    "ai-gateway": "ai-gateway",
    "plain-bots": "enterprise-bots",
    "growth-map": "growth-map",
}


def encode(source: Path, target: Path) -> float:
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


def main() -> None:
    source, slug, chapter, lang = Path(sys.argv[1]), sys.argv[2], sys.argv[3], sys.argv[4]
    case_id = SLUG_TO_CASE[slug]
    target = DOCS / "public" / "case-studies" / slug / "podcast" / lang / f"{chapter}.m4a"
    duration = encode(source, target)
    print(f"encoded {target.name}: {duration:.0f}s, {target.stat().st_size // 1024} KB")

    model = WhisperModel("small", device="cpu", compute_type="int8")
    raw, _ = model.transcribe(decode_16k(target), language=lang, vad_filter=True, beam_size=5)
    segments = [
        {"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip()} for s in raw
    ]
    print(f"{len(segments)} segments")

    PARTS.mkdir(exist_ok=True)
    episode = {
        "case": case_id,
        "slug": slug,
        "chapter": chapter,
        "lang": lang,
        "src": f"/case-studies/{slug}/podcast/{lang}/{chapter}.m4a",
        "transcript": f"/case-studies/{slug}/podcast/{lang}/{chapter}.json",
        "duration": round(duration, 2),
        "segments": segments,
    }
    (PARTS / f"{slug}-{chapter}-{lang}.json").write_text(
        json.dumps(episode, ensure_ascii=False), encoding="utf-8"
    )
    merge()


def load() -> dict:
    data: dict = {}
    for part in sorted(PARTS.glob("*.json")):
        ep = json.loads(part.read_text(encoding="utf-8"))
        data.setdefault(ep["case"], {}).setdefault(ep["lang"], {})[ep["chapter"]] = ep
    return data


def write(data: dict) -> None:
    index: dict = {cid: {"en": {}, "es": {}} for cid in SLUG_TO_CASE.values()}
    for case_id, langs in data.items():
        for lang, chapters in langs.items():
            for chapter, ep in chapters.items():
                transcript_path = DOCS / "public" / ep["transcript"].lstrip("/")
                transcript_path.parent.mkdir(parents=True, exist_ok=True)
                transcript_path.write_text(
                    json.dumps(ep["segments"], ensure_ascii=False), encoding="utf-8"
                )
                index.setdefault(case_id, {"en": {}, "es": {}}).setdefault(lang, {})[chapter] = {
                    "src": ep["src"],
                    "transcript": ep["transcript"],
                    "duration": ep["duration"],
                    "pieces": [{"piece": 0, "start": 0}],
                }
    EPISODES.write_text(json.dumps(index, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def merge() -> None:
    write(load())


if __name__ == "__main__":
    {"--merge": merge}.get(" ".join(sys.argv[1:]), main)()
