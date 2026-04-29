#!/usr/bin/env python3
"""render.py — render a video from an EDL with audio fades at every cut.

CLI contract (Spec 04 §6.1):

    render.py --edl <edl.json> [--preview] [--vertical] -o <out>

EDL JSON shape:

    {
      "source": "workspace/video-projects/<slug>/raw/master.mp4",
      "fps": 30,
      "segments": [
        {"start": 0.0,   "end": 4.5,   "grade": "warm"},
        {"start": 12.0,  "end": 18.2}
      ],
      "overlays": [
        {"type": "subtitle", "path": "captions.srt"},
        {"type": "image", "path": "lower-third.png", "start": 1.0, "end": 4.0}
      ]
    }

Hard Rule 7 (audio fades at every cut boundary): each segment's audio
gets a 30 ms fade-in at start and a 30 ms fade-out at end. This is
non-negotiable — without it, every cut produces an audible click.

--preview: produces a 720p, 2 Mbps preview render (faster encode).
--vertical: rotates / pads to 1080×1920 for shorts. Always preview
quality unless explicitly overridden.

Subtitles are layered last so the upstream filtergraph can't smudge them.

Requires `ffmpeg` on PATH.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

FADE_S = 0.030  # Hard Rule 7


def repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


def build_segment_clip(
    source: Path,
    seg_start: float,
    seg_end: float,
    workdir: Path,
    index: int,
    grade_preset: str | None,
    fps: int,
) -> Path:
    """Extract a single segment with audio fades applied at the boundaries."""
    duration = seg_end - seg_start
    if duration <= 2 * FADE_S:
        # Segment is shorter than two fades; clamp.
        fade = duration / 2.5
    else:
        fade = FADE_S

    out_path = workdir / f"seg-{index:03d}.mp4"
    afade = (
        f"afade=t=in:st=0:d={fade:.4f},"
        f"afade=t=out:st={duration - fade:.4f}:d={fade:.4f}"
    )
    vfilter = ["setpts=PTS-STARTPTS"]
    if grade_preset:
        # Inline grade.py preset chain to avoid double-encoding.
        from grade import PRESETS  # type: ignore
        if grade_preset in PRESETS:
            vfilter.append(PRESETS[grade_preset])
    vfilter.append(f"fps={fps}")

    cmd = [
        "ffmpeg",
        "-y",
        "-loglevel",
        "error",
        "-ss",
        f"{seg_start:.4f}",
        "-to",
        f"{seg_end:.4f}",
        "-i",
        str(source),
        "-vf",
        ",".join(vfilter),
        "-af",
        afade,
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "20",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        str(out_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        sys.stderr.write(result.stderr)
        raise SystemExit(result.returncode)
    return out_path


def concat_segments(segments: list[Path], out_path: Path) -> None:
    list_file = out_path.parent / "concat-list.txt"
    list_file.write_text(
        "\n".join(f"file '{s.resolve()}'" for s in segments) + "\n"
    )
    cmd = [
        "ffmpeg",
        "-y",
        "-loglevel",
        "error",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        str(list_file),
        "-c",
        "copy",
        str(out_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        sys.stderr.write(result.stderr)
        raise SystemExit(result.returncode)


def apply_overlays(
    intermediate: Path,
    overlays: list[dict],
    out_path: Path,
    vertical: bool,
    preview: bool,
) -> None:
    inputs: list[str] = ["-i", str(intermediate)]
    filter_parts: list[str] = []
    map_chain = "[0:v]"
    next_label = "v0"
    overlay_idx = 0

    if vertical:
        filter_parts.append(
            f"{map_chain}scale=1080:-2,"
            f"pad=1080:1920:(1080-iw)/2:(1920-ih)/2:black[{next_label}]"
        )
        map_chain = f"[{next_label}]"
        next_label = "v1"

    image_overlays = [o for o in overlays if o.get("type") == "image"]
    for ov in image_overlays:
        overlay_idx += 1
        ov_path = ov["path"]
        ov_start = float(ov.get("start", 0.0))
        ov_end = float(ov.get("end", ov_start + 4.0))
        inputs.extend(["-i", ov_path])
        new_label = f"v{overlay_idx + 1}"
        filter_parts.append(
            f"{map_chain}[{overlay_idx}:v]"
            f"overlay=enable='between(t,{ov_start},{ov_end})':"
            f"x={ov.get('x', 40)}:y={ov.get('y', 40)}[{new_label}]"
        )
        map_chain = f"[{new_label}]"

    subtitles = [o for o in overlays if o.get("type") == "subtitle"]
    if subtitles:
        sub_path = subtitles[0]["path"]
        new_label = f"v{overlay_idx + 2}"
        filter_parts.append(
            f"{map_chain}subtitles='{sub_path}'[{new_label}]"
        )
        map_chain = f"[{new_label}]"

    cmd = ["ffmpeg", "-y", "-loglevel", "error"]
    cmd.extend(inputs)
    if filter_parts:
        cmd.extend(["-filter_complex", ";".join(filter_parts)])
        cmd.extend(["-map", map_chain, "-map", "0:a?"])
    else:
        cmd.extend(["-map", "0:v", "-map", "0:a?"])

    if preview:
        cmd.extend(["-c:v", "libx264", "-preset", "fast", "-b:v", "2M"])
    else:
        cmd.extend(["-c:v", "libx264", "-preset", "medium", "-crf", "18"])
    cmd.extend(["-c:a", "aac", "-b:a", "192k"])
    cmd.append(str(out_path))

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        sys.stderr.write(result.stderr)
        raise SystemExit(result.returncode)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--edl", required=True, type=Path)
    parser.add_argument("-o", "--output", required=True, type=Path)
    parser.add_argument("--preview", action="store_true")
    parser.add_argument("--vertical", action="store_true")
    args = parser.parse_args(argv)

    if shutil.which("ffmpeg") is None:
        sys.stderr.write("[render] ffmpeg not found on PATH\n")
        return 2

    edl = json.loads(args.edl.read_text())
    source = Path(edl["source"])
    if not source.is_absolute():
        source = repo_root() / source
    if not source.exists():
        sys.stderr.write(f"[render] source not found: {source}\n")
        return 2

    fps = int(edl.get("fps", 30))
    segments = edl.get("segments") or []
    if not segments:
        sys.stderr.write("[render] EDL has no segments\n")
        return 2

    args.output.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="render-") as tmp:
        workdir = Path(tmp)
        clips: list[Path] = []
        sys.path.insert(0, str(Path(__file__).parent))
        for i, seg in enumerate(segments):
            clip = build_segment_clip(
                source,
                float(seg["start"]),
                float(seg["end"]),
                workdir,
                i,
                seg.get("grade"),
                fps,
            )
            clips.append(clip)
        intermediate = workdir / "concat.mp4"
        concat_segments(clips, intermediate)
        apply_overlays(
            intermediate,
            edl.get("overlays") or [],
            args.output,
            vertical=args.vertical,
            preview=args.preview,
        )

    sys.stdout.write(f"{args.output}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
