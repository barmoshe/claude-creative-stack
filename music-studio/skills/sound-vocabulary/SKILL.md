---
name: sound-vocabulary
description: |
  Translates subjective sound language ("warmer", "punchier", "wider",
  "more glitchy", "darker", "lo-fi") into concrete Tone.js / Web Audio
  parameter changes. Use whenever the user describes how a synth, drum,
  or effect should sound using subjective adjectives. Output is a
  diff-able list of parameter changes the user can paste into a Claude
  Code session inside /workspace/playground/<build>/.
allowed-tools: Read, Write
model: claude-sonnet-4-6
---

# Sound Vocabulary

## Principle

Producers describe sounds in feelings. Code wants numbers. This skill
is the bridge.

The vocabulary bridge has three layers:

1. **Subjective adjective** — what the user said.
2. **Acoustic property** — what physical thing they're describing.
3. **Synthesis parameter** — what knob to turn, by how much.

Example:

> "warmer" → reduce high-frequency content above ~4 kHz, add subtle
> low-mid saturation around 200–500 Hz, slow attack envelope.
> → filter.frequency: 8000 → 3500
> → distortion.distortion: 0 → 0.15
> → envelope.attack: 0.005 → 0.02

## Inputs

- The subjective adjective(s) the user said.
- The current synth/drum/effect code (from `workspace/playground/<build>/src/`).

## Process

1. Read the current parameters from the build's source.
2. For each subjective adjective, look up its row in
   `references/vocabulary-bridge.md`.
3. Compute the parameter delta from the current values toward the
   target.
4. Output a diff-able patch the user can paste into Claude Code.
5. If multiple adjectives conflict ("warmer AND brighter"), surface the
   conflict and ask which the user prefers.

## Output format

```
Sound change: "make the kick punchier"

Acoustic interpretation:
- Faster attack on the amplitude envelope.
- More transient emphasis at 60–80 Hz.
- Slightly compressed body to push perceived loudness.

Parameter changes (Tone.js):
  envelope.attack:      0.01 → 0.001
  filter.Q:             1   → 3 (boost around 70 Hz)
  compressor.ratio:     —   → 4:1 (NEW: add Tone.Compressor in chain)
  compressor.threshold: —   → -24 dB

Diff to apply in src/synth.js:

- this.env.attack = 0.01;
+ this.env.attack = 0.001;
- this.filter.Q.value = 1;
+ this.filter.Q.value = 3;
+ this.compressor = new Tone.Compressor({ ratio: 4, threshold: -24 });
+ this.synth.chain(this.filter, this.compressor, Tone.Destination);
```

## Hard Rules (skill-specific)

- **Never change parameters without naming the acoustic interpretation.**
  The user must understand WHY the change makes the sound "punchier".
- **Never silently enlarge the chain.** Adding a new node (like a
  compressor) must be flagged as `(NEW: …)`.
- **Never apply more than three parameter changes per adjective.** If
  the acoustic interpretation needs more, surface the additional
  changes as optional.

## References

- `references/vocabulary-bridge.md` — the canonical adjective →
  acoustic → parameter table. Adapted from
  `dannyjpwilliams/ui-sound-design-skill` for music synthesis.
- `references/tone-js-parameter-ranges.md` — sane min/max for each
  Tone.js parameter.
- `references/web-audio-fallbacks.md` — for builds not using Tone.js.

## Anti-patterns

- Changing parameters without explaining the acoustic interpretation.
- Recommending a different synth architecture when a parameter tweak
  suffices.
- Silently changing more than three parameters.
- Using vague targets ("around 3000 Hz, give or take") when the user
  needs a paste-able number.
