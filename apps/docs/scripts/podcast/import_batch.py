"""Transcribes multiple podcast chapters with one Whisper model load.

Reuses import_chapter.encode/decode_16k/load/write so the only repeated cost
is the per-audio decode and transcribe, not the model load. Use it when more
than one chapter needs importing at once.

    .venv/Scripts/python import_batch.py <src> <slug> <ch> <lang> [<src> <slug> <ch> <lang> ...]

Skips re-encoding when the target .m4a already exists and is non-empty, so a
batch killed mid-transcription can be re-run without redoing finished steps.
"""

import sys
from pathlib import Path

from faster_whisper import WhisperModel

from import_chapter import SLUG_TO_CASE, DOCS, PARTS, encode, decode_16k, load, write


def main() -> None:
    args = sys.argv[1:]
    if len(args) % 4 != 0:
        raise SystemExit("usage: import_batch.py <src> <slug> <ch> <lang> [...]")

    jobs = [
        (Path(args[i]), args[i + 1], args[i + 2], args[i + 3])
        for i in range(0, len(args), 4)
    ]

    model = WhisperModel("small", device="cpu", compute_type="int8")
    encoded = []

    for source, slug, chapter, lang in jobs:
        case_id = SLUG_TO_CASE[slug]
        target = DOCS / "public" / "case-studies" / slug / "podcast" / lang / f"{chapter}.m4a"
        part = PARTS / f"{slug}-{chapter}-{lang}.json"

        if part.exists():
            print(f"skip {slug} {chapter} {lang}: part exists")
            encoded.append((slug, chapter, lang, case_id, target, part))
            continue

        if target.exists() and target.stat().st_size > 1024:
            duration = _duration(target)
            print(f"reuse {slug} {chapter} {lang}: {duration:.0f}s")
        else:
            duration = encode(source, target)
            print(f"encoded {slug} {chapter} {lang}: {duration:.0f}s")

        raw, _ = model.transcribe(decode_16k(target), language=lang, vad_filter=True, beam_size=5)
        segments = [
            {"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip()}
            for s in raw
        ]
        print(f"transcribed {slug} {chapter} {lang}: {len(segments)} segments")

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
        part.write_text(__import__("json").dumps(episode, ensure_ascii=False), encoding="utf-8")
        encoded.append((slug, chapter, lang, case_id, target, part))

    write(load())
    print(f"merged {len(encoded)} chapters into episodes.json")


def _duration(path: Path) -> float:
    import av

    with av.open(str(path)) as check:
        return float(check.duration) / av.time_base


if __name__ == "__main__":
    main()
