#!/usr/bin/env python3
"""stem_analyze.py — spectral balance and dynamic range for a stem.

CLI contract (Spec 04 §6.1):

    stem_analyze.py <stem>

Stdout: JSON with per-band RMS in dB and crest factor (peak vs RMS).

Bands match what the audio-engineer skill cares about when judging a
mix:
- sub:      0–60 Hz
- low:      60–250 Hz
- low-mid:  250–500 Hz
- mid:      500–2000 Hz
- high-mid: 2000–6000 Hz
- high:     6000–20000 Hz

Backend: numpy + scipy.signal (lighter than librosa for this task) plus
ffmpeg to decode arbitrary input formats to mono PCM.
"""

from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
import sys
from pathlib import Path

BANDS = [
    ("sub", 20.0, 60.0),
    ("low", 60.0, 250.0),
    ("low_mid", 250.0, 500.0),
    ("mid", 500.0, 2000.0),
    ("high_mid", 2000.0, 6000.0),
    ("high", 6000.0, 20000.0),
]


def decode_to_pcm(audio: Path, sample_rate: int = 48000):
    """Return (samples: numpy array, sample_rate: int)."""
    try:
        import numpy as np
    except ImportError:
        sys.stderr.write(
            "[stem_analyze] numpy is required. Install with: pip install numpy\n"
        )
        raise SystemExit(2)

    cmd = [
        "ffmpeg",
        "-nostats",
        "-loglevel",
        "error",
        "-i",
        str(audio),
        "-ac",
        "1",
        "-ar",
        str(sample_rate),
        "-f",
        "f32le",
        "-",
    ]
    result = subprocess.run(cmd, capture_output=True)
    if result.returncode != 0:
        sys.stderr.write(result.stderr.decode("utf-8", errors="ignore"))
        raise SystemExit(result.returncode)
    samples = np.frombuffer(result.stdout, dtype=np.float32)
    if samples.size == 0:
        raise SystemExit(f"[stem_analyze] decoded zero samples from {audio}")
    return samples, sample_rate


def db(value: float) -> float:
    if value <= 0.0:
        return float("-inf")
    return 20.0 * math.log10(value)


def band_rms(samples, sample_rate: int) -> dict[str, float]:
    """Per-band RMS in dB via FFT magnitude integration."""
    import numpy as np

    n = samples.size
    # Hann window for FFT
    window = np.hanning(n)
    spectrum = np.fft.rfft(samples * window)
    freqs = np.fft.rfftfreq(n, d=1.0 / sample_rate)
    magnitude = np.abs(spectrum) / np.sqrt(np.sum(window ** 2))

    out: dict[str, float] = {}
    for name, lo, hi in BANDS:
        mask = (freqs >= lo) & (freqs < hi)
        if not mask.any():
            out[name] = float("-inf")
            continue
        # Integrate power across the band, convert back to RMS.
        power = np.sum(magnitude[mask] ** 2)
        rms = math.sqrt(power / mask.sum())
        out[name] = db(rms)
    return out


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("stem", type=Path)
    parser.add_argument(
        "--sample-rate",
        type=int,
        default=48000,
        help="resample target before analysis (default 48000)",
    )
    args = parser.parse_args(argv)

    if shutil.which("ffmpeg") is None:
        sys.stderr.write("[stem_analyze] ffmpeg not found on PATH\n")
        return 2

    if not args.stem.exists():
        sys.stderr.write(f"[stem_analyze] source not found: {args.stem}\n")
        return 2

    try:
        import numpy as np
    except ImportError:
        sys.stderr.write(
            "[stem_analyze] numpy is required. Install: pip install numpy\n"
        )
        return 2

    samples, sample_rate = decode_to_pcm(args.stem, args.sample_rate)
    rms = float(np.sqrt(np.mean(samples ** 2)))
    peak = float(np.max(np.abs(samples))) if samples.size else 0.0
    payload = {
        "source": str(args.stem),
        "sample_rate": sample_rate,
        "rms_db": db(rms),
        "peak_db": db(peak),
        "crest_factor_db": db(peak) - db(rms) if rms > 0 else float("inf"),
        "bands_db": band_rms(samples, sample_rate),
    }
    sys.stdout.write(json.dumps(payload, indent=2) + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
