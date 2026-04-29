#!/usr/bin/env python3
"""pack_takes.py — pack all cached transcripts for an episode into one
phrase-level reading view.

CLI contract (Spec 04 §6.1):

    pack_takes.py --episode <slug>

Reads:
    workspace/video-projects/<slug>/transcripts/*.json
Writes:
    workspace/video-projects/<slug>/takes_packed.md

Phrase-level breaks per Spec 03 §3.4 step 2:
- Silence ≥ 0.5 s.
- Speaker change.

The packed view is the LLM's primary reading surface for editing and
script-writing (Spec 03 §6.3). Frame-dumping is forbidden — the script-
writer and edit-director reason from this packed text plus on-demand
timeline_view.py queries.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

SILENCE_GAP_S = 0.5


def repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


def episode_dir(slug: str) -> Path:
    return repo_root() / "workspace" / "video-projects" / slug


def load_transcripts(transcripts_dir: Path) -> list[tuple[str, dict]]:
    out = []
    for path in sorted(transcripts_dir.glob("*.json")):
        try:
            payload = json.loads(path.read_text())
        except json.JSONDecodeError as exc:
            sys.stderr.write(f"[pack_takes] bad JSON in {path}: {exc}\n")
            continue
        out.append((path.stem, payload))
    return out


def pack_words(words: list[dict]) -> list[dict]:
    """Group words into phrases on silence ≥ SILENCE_GAP_S or speaker
    change. Returns list of phrase dicts: {start, end, speaker, text}."""
    phrases: list[dict] = []
    current: dict | None = None

    for word in words:
        text = word.get("text", "")
        start = float(word.get("start", 0.0))
        end = float(word.get("end", start))
        speaker = word.get("speaker", 0)
        if current is None:
            current = {
                "start": start,
                "end": end,
                "speaker": speaker,
                "text": text,
            }
            continue
        gap = start - current["end"]
        if gap >= SILENCE_GAP_S or speaker != current["speaker"]:
            phrases.append(current)
            current = {
                "start": start,
                "end": end,
                "speaker": speaker,
                "text": text,
            }
        else:
            current["end"] = end
            current["text"] = (current["text"] + " " + text).strip()
    if current is not None:
        phrases.append(current)
    return phrases


def fmt_time(seconds: float) -> str:
    minutes, secs = divmod(seconds, 60)
    return f"{int(minutes):02d}:{secs:05.2f}"


def render_packed(takes: list[tuple[str, dict]]) -> str:
    lines = ["# Packed takes", ""]
    for take_name, payload in takes:
        words = payload.get("words") or []
        phrases = pack_words(words)
        lines.append(f"## Take: {take_name}")
        if payload.get("stub"):
            lines.append("")
            lines.append(
                "_(stub transcript — replace by re-running transcribe.py "
                "with the elevenlabs-scribe MCP available)_"
            )
        lines.append("")
        if not phrases:
            lines.append("_(no phrases — empty transcript)_")
            lines.append("")
            continue
        for phrase in phrases:
            t = fmt_time(phrase["start"])
            speaker = phrase.get("speaker", 0)
            sp_tag = f"S{speaker} " if speaker else ""
            lines.append(f"- `{t}` {sp_tag}{phrase['text']}")
        lines.append("")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--episode", required=True)
    args = parser.parse_args(argv)

    episode = episode_dir(args.episode)
    transcripts_dir = episode / "transcripts"
    if not transcripts_dir.is_dir():
        sys.stderr.write(
            f"[pack_takes] no transcripts directory at {transcripts_dir}\n"
        )
        return 2

    takes = load_transcripts(transcripts_dir)
    if not takes:
        sys.stderr.write(
            f"[pack_takes] no transcripts found in {transcripts_dir}\n"
        )
        return 2

    packed = render_packed(takes)
    out_path = episode / "takes_packed.md"
    out_path.write_text(packed)
    sys.stdout.write(f"{out_path}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
