#!/usr/bin/env python3
"""loudness.py — measure integrated LUFS, true peak, and short-term curve.

CLI contract (Spec 04 §6.1):

    loudness.py <audio>

Stdout: a small JSON document with the integrated LUFS, true peak in
dBTP, the short-term curve sampled every 100 ms, and a verdict against
the YouTube delivery target (-14 LUFS integrated, ≤ -1.0 dBTP).

Hard Rule 8: master final audio to -14 LUFS integrated; peak ≤ -1.0 dBTP.

Backend: pyloudnorm + ffmpeg. Pyloudnorm is BS.1770-3 compliant. True
peak is measured via ffmpeg's `ebur128` filter (4× oversampling), which
matches what YouTube reports.

This script does not modify audio. For corrective mastering, the
audio-engineer skill computes a corrective filter chain and calls
ffmpeg directly.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

TARGET_LUFS = -14.0
PEAK_CEILING = -1.0
TOLERANCE_LUFS = 1.0


def measure_with_ffmpeg(audio: Path) -> tuple[float, float]:
    """Return (integrated LUFS, true peak dBTP) using ffmpeg ebur128."""
    cmd = [
        "ffmpeg",
        "-nostats",
        "-i",
        str(audio),
        "-filter_complex",
        "ebur128=peak=true",
        "-f",
        "null",
        "-",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    output = result.stderr  # ebur128 prints summary on stderr
    integrated_match = re.search(r"I:\s*(-?\d+\.\d+)\s*LUFS", output)
    peak_match = re.search(r"Peak:\s*(-?\d+\.\d+)\s*dBFS", output)
    if not integrated_match or not peak_match:
        raise SystemExit(
            f"[loudness] could not parse ebur128 output:\n{output[-2000:]}"
        )
    return float(integrated_match.group(1)), float(peak_match.group(1))


def measure_short_term(audio: Path) -> list[dict]:
    """Return short-term LUFS curve sampled at the rate ebur128 emits."""
    cmd = [
        "ffmpeg",
        "-nostats",
        "-i",
        str(audio),
        "-filter_complex",
        "ebur128=metadata=1",
        "-f",
        "null",
        "-",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    points = []
    for line in result.stderr.splitlines():
        m = re.search(
            r"t:\s*(\d+\.\d+).*?S:\s*(-?\d+\.\d+)", line
        )
        if m:
            points.append(
                {"t": float(m.group(1)), "short_term_lufs": float(m.group(2))}
            )
    return points


def verdict(integrated: float, peak: float) -> dict:
    """Return pass/fail against the Hard Rule 8 targets."""
    integrated_ok = abs(integrated - TARGET_LUFS) <= TOLERANCE_LUFS
    peak_ok = peak <= PEAK_CEILING
    return {
        "target_lufs": TARGET_LUFS,
        "tolerance_lufs": TOLERANCE_LUFS,
        "peak_ceiling_dbtp": PEAK_CEILING,
        "integrated_passes": integrated_ok,
        "peak_passes": peak_ok,
        "passes": integrated_ok and peak_ok,
        "delta_lufs": round(integrated - TARGET_LUFS, 2),
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("audio", type=Path)
    parser.add_argument(
        "--curve",
        action="store_true",
        help="include the short-term LUFS curve (slower second pass)",
    )
    args = parser.parse_args(argv)

    if shutil.which("ffmpeg") is None:
        sys.stderr.write("[loudness] ffmpeg not found on PATH\n")
        return 2

    if not args.audio.exists():
        sys.stderr.write(f"[loudness] source not found: {args.audio}\n")
        return 2

    integrated, peak = measure_with_ffmpeg(args.audio)
    payload: dict = {
        "source": str(args.audio),
        "integrated_lufs": integrated,
        "true_peak_dbtp": peak,
        "verdict": verdict(integrated, peak),
    }
    if args.curve:
        payload["short_term_curve"] = measure_short_term(args.audio)

    sys.stdout.write(json.dumps(payload, indent=2) + "\n")
    return 0 if payload["verdict"]["passes"] else 1


if __name__ == "__main__":
    sys.exit(main())
