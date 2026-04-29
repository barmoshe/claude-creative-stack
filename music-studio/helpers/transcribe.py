#!/usr/bin/env python3
"""transcribe.py — word-level verbatim ASR with mtime-based caching.

CLI contract (Spec 04 §6.1):

    transcribe.py <video> [--num-speakers N]

Output: <video>.transcript.json next to the source.

Hard Rule 5 (cache transcripts per source): if the cache exists and is
newer than the source, skip and exit 0 with the cache path on stdout.
Hard Rule 6 (word-level verbatim ASR only): never request phrase-mode.

Backend: ElevenLabs Scribe via the `elevenlabs-scribe` MCP server. This
script is a thin shim — the actual MCP call happens from the calling
skill, which has MCP access. When invoked directly without MCP, the
script writes a stub transcript.json placeholder so downstream helpers
can be unit-tested without a live API key.

Output JSON shape (one element per word):

    {
      "source":   "<absolute-or-repo-relative-video-path>",
      "duration": <seconds, float>,
      "language": "<bcp-47-tag>",
      "words": [
        {
          "text":  "hello",
          "start": 0.42,
          "end":   0.71,
          "speaker": 0,
          "confidence": 0.97
        },
        ...
      ]
    }
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path


def cache_path_for(video: Path) -> Path:
    return video.with_suffix(video.suffix + ".transcript.json")


def cache_is_fresh(video: Path, cache: Path) -> bool:
    if not cache.exists():
        return False
    try:
        return cache.stat().st_mtime >= video.stat().st_mtime
    except FileNotFoundError:
        return False


def write_stub(video: Path, cache: Path, num_speakers: int) -> None:
    """Write a placeholder transcript so callers can be tested offline.

    Real transcription happens via the MCP from the skill layer. This
    stub is shaped identically and contains a single sentinel word so
    pack_takes.py and timeline_view.py can be exercised end-to-end.
    """
    payload = {
        "source": str(video),
        "duration": 0.0,
        "language": "und",
        "speakers": num_speakers,
        "stub": True,
        "note": (
            "Placeholder. Real transcription requires the elevenlabs-scribe "
            "MCP server, called from the skill layer. See Hard Rule 6: "
            "word-level verbatim ASR only."
        ),
        "words": [
            {
                "text": "[stub-transcript]",
                "start": 0.0,
                "end": 0.0,
                "speaker": 0,
                "confidence": 0.0,
            }
        ],
    }
    cache.write_text(json.dumps(payload, indent=2))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("video", type=Path)
    parser.add_argument("--num-speakers", type=int, default=1)
    parser.add_argument(
        "--force",
        action="store_true",
        help="ignore cache freshness and re-write (rare; defeats Hard Rule 5)",
    )
    args = parser.parse_args(argv)

    video = args.video
    if not video.exists():
        sys.stderr.write(f"[transcribe] source not found: {video}\n")
        return 2

    cache = cache_path_for(video)
    if not args.force and cache_is_fresh(video, cache):
        sys.stdout.write(f"{cache}\n")
        return 0

    write_stub(video, cache, args.num_speakers)
    # Touch mtime so subsequent runs short-circuit.
    os.utime(cache, None)
    sys.stdout.write(f"{cache}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
