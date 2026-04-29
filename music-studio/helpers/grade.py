#!/usr/bin/env python3
"""grade.py — color-grade a video via an ffmpeg filter preset or raw chain.

CLI contract (Spec 04 §6.1):

    grade.py <in> -o <out> [--preset <name>] [--filter '<raw>']

Either --preset or --filter must be provided. Both can be combined; the
preset's filter chain is applied first, then the raw filter.

Built-in presets are conservative and match a music-tech aesthetic:
- `neutral`: minimal corrections; safe default.
- `warm`: slight orange tint, gentle highlights, lifted shadows.
- `cool`: subtle teal cast, slightly crushed blacks.
- `punchy`: increased contrast and saturation; for demo-segment hype.
- `lofi`: desaturated mid-tones, vignette, mild grain.

Requires `ffmpeg` on PATH. Used by render.py internally.
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

PRESETS: dict[str, str] = {
    "neutral": "eq=contrast=1.02:saturation=1.02",
    "warm": "eq=contrast=1.04:saturation=1.05,colorbalance=rs=0.05:gs=0.0:bs=-0.05",
    "cool": "eq=contrast=1.05:saturation=0.95,colorbalance=rs=-0.04:gs=0.0:bs=0.06",
    "punchy": "eq=contrast=1.15:saturation=1.2:gamma=0.95",
    "lofi": "eq=saturation=0.7:contrast=0.95,vignette=PI/5,noise=alls=8:allf=t",
}


def build_filter(preset: str | None, raw: str | None) -> str:
    parts: list[str] = []
    if preset:
        if preset not in PRESETS:
            raise SystemExit(
                f"[grade] unknown preset {preset!r}; "
                f"available: {', '.join(PRESETS)}"
            )
        parts.append(PRESETS[preset])
    if raw:
        parts.append(raw)
    if not parts:
        raise SystemExit("[grade] either --preset or --filter is required")
    return ",".join(parts)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("input", type=Path)
    parser.add_argument("-o", "--output", required=True, type=Path)
    parser.add_argument("--preset", choices=sorted(PRESETS))
    parser.add_argument("--filter", dest="raw_filter", default=None,
                        help="raw ffmpeg video filter chain to append")
    args = parser.parse_args(argv)

    if shutil.which("ffmpeg") is None:
        sys.stderr.write("[grade] ffmpeg not found on PATH\n")
        return 2

    if not args.input.exists():
        sys.stderr.write(f"[grade] source not found: {args.input}\n")
        return 2

    args.output.parent.mkdir(parents=True, exist_ok=True)
    vfilter = build_filter(args.preset, args.raw_filter)

    cmd = [
        "ffmpeg",
        "-y",
        "-loglevel",
        "error",
        "-i",
        str(args.input),
        "-vf",
        vfilter,
        "-c:a",
        "copy",
        str(args.output),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        sys.stderr.write(result.stderr)
        return result.returncode

    sys.stdout.write(f"{args.output}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
