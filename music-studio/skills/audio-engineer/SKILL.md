---
name: audio-engineer
description: |
  Audio polish: loudness, fades, mastering, stem analysis. Use whenever
  the user asks "polish the audio", "is this loud enough", "fix the
  pops", "master this", or mentions LUFS, dBTP, peaks, stems. Targets
  −14 LUFS integrated, −1.0 dBTP for YouTube delivery.
allowed-tools: Read, Write, Bash
model: claude-sonnet-4-6
---

# Audio Engineer

## Inputs

- An audio file path (.wav, .mp3, .flac).
- Optional: stems folder for stem-level analysis.

## Process

1. **Measure.** Run `helpers/loudness.py <input>` for integrated LUFS,
   short-term curve, true-peak. Read `verdict.passes`.
2. **Stem analysis (optional).** If stems are provided, run
   `helpers/stem_analyze.py <stem>` for each — surface per-band RMS and
   crest factor. Use `references/loudness-targets.md` to interpret.
3. **Compare against target.** Default target: −14 LUFS / −1.0 dBTP.
   See `references/loudness-targets.md` for platform-specific targets.
4. **If miss:** produce a corrective ffmpeg filter chain from
   `references/ffmpeg-mastering-chains.md` and apply.
5. **Re-measure** after applying the chain. Surface the before/after.
6. **Mastering report.** Write a one-paragraph summary with before/after
   numbers.

## Outputs

- Polished file at `<input-path>.mastered.wav`.
- Report at `<input-path>.mastering-report.md` with the shape:

```markdown
# Mastering report — <filename>

**Before:** −18.4 LUFS integrated, −0.3 dBTP
**Target:** −14.0 LUFS, ≤ −1.0 dBTP
**Chain:** loudnorm I=-14:LRA=11:TP=-1.0
**After:** −13.9 LUFS integrated, −1.1 dBTP

## Verdict

✓ Integrated within tolerance.
✓ True peak within ceiling.
```

## Hard Rules (skill-specific)

- **−14 LUFS integrated, ≤ −1.0 dBTP** for YouTube delivery (Hard Rule
  8). Tolerance ±1 dB on integrated.
- **Never silently clip.** If the corrective chain would clip, fail and
  surface — do not lower the bar.
- **Always re-measure after applying.** The chain might miss the
  target on first pass.

## References

- `references/loudness-targets.md` — per-platform targets (YouTube,
  Spotify, podcast feeds).
- `references/ffmpeg-mastering-chains.md` — corrective chains by symptom
  (too quiet, peaks clipping, dynamic range too wide, etc.).

## Anti-patterns

- Applying a mastering chain without measuring first.
- Squashing dynamics to hit LUFS — the brick-wall master sounds bad
  even if it measures right. Use the loudnorm filter's two-pass mode
  for content with wide dynamic range.
- Mastering the demo audio in isolation, then losing the loudness when
  it's muxed into the video — measure the FINAL muxed file too.
- Using `-c:a copy` after applying audio filters (silently strips them).
