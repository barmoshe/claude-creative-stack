#!/usr/bin/env python3
"""timeline_view.py — render a filmstrip + waveform PNG for a video range.

CLI contract (Spec 04 §6.1):

    timeline_view.py <video> <start> <end>

Output: PNG written to `<video-parent>/verify/<video-stem>-<start>-<end>.png`.
Stdout prints the output path.

This is the on-demand visual surface used by edit-director and the
self-eval loop in /film-episode (Spec 04 §12.4). It is NEVER pre-
computed in batch — call it only at decision points to keep the
packed-text view as the primary reading surface.

Implementation: ffmpeg builds a 6-tile filmstrip from evenly-sampled
frames, plus showwavespic to render the waveform, vertically stacked.
Requires `ffmpeg` on PATH.
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path


def parse_time(value: str) -> float:
    """Accept either seconds (12.5) or HH:MM:SS(.ms)."""
    if ":" in value:
        parts = value.split(":")
        parts = [float(p) for p in parts]
        if len(parts) == 2:
            m, s = parts
            return m * 60 + s
        if len(parts) == 3:
            h, m, s = parts
            return h * 3600 + m * 60 + s
        raise ValueError(f"unrecognised time: {value!r}")
    return float(value)


def fmt_time(seconds: float) -> str:
    return f"{seconds:.3f}"


def slug(value: float) -> str:
    return f"{value:.3f}".replace(".", "p")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("video", type=Path)
    parser.add_argument("start")
    parser.add_argument("end")
    parser.add_argument(
        "--tiles",
        type=int,
        default=6,
        help="number of filmstrip tiles (default 6)",
    )
    parser.add_argument(
        "--width",
        type=int,
        default=1280,
        help="output width in px (default 1280)",
    )
    args = parser.parse_args(argv)

    if shutil.which("ffmpeg") is None:
        sys.stderr.write("[timeline_view] ffmpeg not found on PATH\n")
        return 2

    video = args.video
    if not video.exists():
        sys.stderr.write(f"[timeline_view] source not found: {video}\n")
        return 2

    start = parse_time(args.start)
    end = parse_time(args.end)
    if end <= start:
        sys.stderr.write("[timeline_view] end must be > start\n")
        return 2

    out_dir = video.parent / "verify"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{video.stem}-{slug(start)}-{slug(end)}.png"

    duration = end - start
    tiles = max(1, args.tiles)
    tile_w = args.width // tiles
    tile_h = int(tile_w * 9 / 16)

    # Filmstrip: select frames evenly across the range, tile horizontally.
    # Waveform: showwavespic renders a single PNG of the audio range.
    # Stack vertically with vstack.
    filmstrip_filter = (
        f"trim=start={start}:end={end},setpts=PTS-STARTPTS,"
        f"fps={tiles}/{duration},"
        f"scale={tile_w}:{tile_h},"
        f"tile={tiles}x1[strip]"
    )
    waveform_filter = (
        f"atrim=start={start}:end={end},asetpts=PTS-STARTPTS,"
        f"showwavespic=s={args.width}x{tile_h}:colors=white[wave]"
    )
    composite_filter = (
        f"[0:v]{filmstrip_filter};"
        f"[0:a]{waveform_filter};"
        f"[strip][wave]vstack=inputs=2"
    )

    cmd = [
        "ffmpeg",
        "-y",
        "-loglevel",
        "error",
        "-i",
        str(video),
        "-filter_complex",
        composite_filter,
        "-frames:v",
        "1",
        str(out_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        sys.stderr.write(result.stderr)
        return result.returncode

    sys.stdout.write(f"{out_path}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
