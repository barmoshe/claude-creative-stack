# Loudness targets

## Per-platform integrated LUFS

| Platform | Integrated LUFS | True peak ceiling | Notes |
|---|---|---|---|
| **YouTube** | **−14** | **−1.0 dBTP** | Hard Rule 8 default. YouTube normalises louder content down. |
| Spotify (loud) | −11 | −1.0 dBTP | Streaming-loud preset — the channel's audio reach if cross-posted. |
| Spotify (default) | −14 | −1.0 dBTP | Matches YouTube. |
| Apple Music | −16 | −1.0 dBTP | Quieter normalisation. |
| Podcast feeds | −16 to −19 | −1.0 dBTP | Mono-mix–friendly. |

This channel ships to YouTube. Default to **−14 LUFS / −1.0 dBTP** unless the user explicitly cross-targets.

## Tolerance

±1 dB on integrated LUFS. Tighter than that produces a brick-wall master that sounds bad. Looser than that gets normalised down by the platform.

## Per-band crest factor (from `stem_analyze.py`)

| Band | Healthy crest factor (dB) |
|---|---|
| sub (0–60 Hz) | 8–14 |
| low (60–250 Hz) | 6–12 |
| low-mid (250–500 Hz) | 6–12 |
| mid (500–2000 Hz) | 8–14 |
| high-mid (2000–6000 Hz) | 10–18 |
| high (6000–20000 Hz) | 12–20 |

Crest factor below the band's lower bound = over-compressed (audibly squashed).
Crest factor above the band's upper bound = under-controlled (peaks will clip on master pass).

## When to NOT push to −14

- The demo's musical intent is dynamic (a quiet ambient piece with a sudden hit). If you push the integrated LUFS up, you destroy the dynamic surprise. Stay −16 to −18 for these and accept the platform normalising.
- A bug-as-feature beat that relies on a quiet glitch. If you normalise the glitch up, it stops sounding glitchy.
- Voice-only segments: target −16 LUFS short-term, ducked under any music bed.
