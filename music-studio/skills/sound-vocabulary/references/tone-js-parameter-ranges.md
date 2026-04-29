# Tone.js parameter ranges

Sane min/max for the parameters the vocabulary bridge touches. When `vocabulary-bridge.md` proposes a value outside these, clamp and flag.

## Envelope

| Parameter | Min | Max | Default | Notes |
|---|---|---|---|---|
| `attack` | 0.0001 s | 1 s | 0.005 s | Below 0.0005 s sounds clicky on most speakers. |
| `decay` | 0.001 s | 4 s | 0.1 s | |
| `sustain` | 0 | 1 | 0.5 | Linear ratio of attack peak. |
| `release` | 0.001 s | 8 s | 0.4 s | |
| `attackCurve` | — | — | "linear" | "linear" / "exponential" / "cosine" / "step" |

## Filter

| Parameter | Min | Max | Default | Notes |
|---|---|---|---|---|
| `frequency` | 20 Hz | 20000 Hz | 350 Hz | Below 60 Hz is felt, not heard. |
| `Q` | 0 | 20 | 1 | Above 12 self-oscillates. |
| `gain` | −40 dB | 40 dB | 0 | Used by peaking/shelf filters only. |

## EQ3

| Band | Centre | Range | Notes |
|---|---|---|---|
| `low` | < 250 Hz | −24 to +24 dB | Tubby above +6. |
| `mid` | 250–4000 Hz | −24 to +24 dB | Most damaging band; cut over boost. |
| `high` | > 4000 Hz | −24 to +24 dB | Harsh above +6. |

Crossover defaults: `lowFrequency = 400`, `highFrequency = 2500`.

## Distortion

| Parameter | Min | Max | Default | Notes |
|---|---|---|---|---|
| `distortion` | 0 | 1 | 0.4 | 0.4+ is overt, 0.1–0.2 is gluey. |
| `oversample` | "none" | "4x" | "none" | Use "2x" for clean transients. |

## Compressor

| Parameter | Min | Max | Default | Notes |
|---|---|---|---|---|
| `threshold` | −60 dB | 0 dB | −24 dB | |
| `ratio` | 1 | 20 | 4 | 4:1 is a safe bus default. |
| `attack` | 0.0001 s | 1 s | 0.003 s | |
| `release` | 0.0001 s | 1 s | 0.25 s | |
| `knee` | 0 dB | 40 dB | 30 dB | |

## Reverb

| Parameter | Min | Max | Default | Notes |
|---|---|---|---|---|
| `decay` | 0.001 s | 60 s | 1.5 s | Above 6 is special-purpose. |
| `preDelay` | 0 s | 0.1 s | 0.01 s | |
| `wet` | 0 | 1 | 0.5 | Don't exceed 0.4 on master. |

## Chorus

| Parameter | Min | Max | Default | Notes |
|---|---|---|---|---|
| `frequency` | 0 Hz | 20 Hz | 1.5 Hz | Above 8 Hz is flange/vibrato. |
| `delayTime` | 0 ms | 50 ms | 3.5 ms | |
| `depth` | 0 | 1 | 0.5 | |

## BitCrusher

| Parameter | Min | Max | Default | Notes |
|---|---|---|---|---|
| `bits` | 1 | 16 | 8 | Below 4 is unusable for most music. |

## When to flag instead of clamp

- Negative values where positive is expected.
- Values > 5× the documented max (suggests a unit confusion — Hz vs kHz, ms vs s).
- Frequencies below 10 Hz on the audio filter.
