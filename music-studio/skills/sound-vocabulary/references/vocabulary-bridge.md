# Vocabulary bridge

The canonical table. Each adjective maps to acoustic interpretation + parameter deltas. Adapted from `dannyjpwilliams/ui-sound-design-skill` for music synthesis.

When the user says an adjective on this list, apply at most three changes per adjective. Surface additional changes as optional.

## Brightness

### "warmer"

- **Acoustic:** less high-frequency content; gentle low-mid saturation; slower attack.
- **Tone.js parameters:**
  - `filter.frequency`: → 3500 Hz (low-pass)
  - `distortion.distortion`: → 0.15 (gentle, asymmetric)
  - `envelope.attack`: → 0.02 (s)

### "brighter"

- **Acoustic:** open the high-pass on the chain; slight high-shelf boost; faster attack.
- **Tone.js parameters:**
  - `filter.frequency` (HPF): → 200 Hz
  - `eq3.high`: → +3 dB
  - `envelope.attack`: → 0.002

### "darker"

- **Acoustic:** strong low-pass cut; reduced high-mid; longer release.
- **Tone.js parameters:**
  - `filter.frequency`: → 1200 Hz
  - `eq3.highMid`: → −4 dB
  - `envelope.release`: → 0.8

## Energy / transient

### "punchier"

- **Acoustic:** faster attack, more transient at 60–80 Hz, light bus-compression.
- **Tone.js parameters:**
  - `envelope.attack`: → 0.001
  - `filter.Q`: → 3 (boost ~70 Hz)
  - `compressor.ratio`/`threshold`: → 4:1, −24 dB *(NEW node)*

### "softer" / "rounder"

- **Acoustic:** slower attack, gentler curve, lower peak.
- **Tone.js parameters:**
  - `envelope.attack`: → 0.05
  - `envelope.attackCurve`: → "exponential"
  - `gain`: → −3 dB

### "more aggressive"

- **Acoustic:** add saturation, narrow filter Q, faster attack.
- **Tone.js parameters:**
  - `distortion.distortion`: → 0.4
  - `filter.Q`: → 8
  - `envelope.attack`: → 0.001

## Space / width

### "wider"

- **Acoustic:** stereo spread via micro-detune or short delay on one side.
- **Tone.js parameters:**
  - `chorus.frequency`/`delayTime`: → 1.5 Hz, 3 ms *(NEW node)*
  - `panner.pan`: → split (alternate −0.4 / +0.4 for layered voices)
  - `chorus.depth`: → 0.4

### "tighter" / "narrower"

- **Acoustic:** mono-summed below 200 Hz; remove modulation; centred panning.
- **Tone.js parameters:**
  - `chorus.depth`: → 0.0 (or remove node)
  - `panner.pan`: → 0
  - `filter.frequency` HPF: → 200 Hz mono

### "more spacious"

- **Acoustic:** longer reverb, pre-delay, low feedback.
- **Tone.js parameters:**
  - `reverb.decay`: → 4.0
  - `reverb.preDelay`: → 0.05
  - `reverb.wet`: → 0.35 *(don't exceed 0.4)*

## Texture

### "more glitchy"

- **Acoustic:** sample-rate decimation; bit-crush; pitch jitter.
- **Tone.js parameters:**
  - `bitCrusher.bits`: → 6 *(NEW node)*
  - `chorus.frequency`/`depth`: → 12 Hz, 0.6 (used as flutter)
  - `pitchShift.pitch`: → ±0.5 semitones randomised

### "lo-fi"

- **Acoustic:** soft saturation, reduced high-end, light noise floor.
- **Tone.js parameters:**
  - `distortion.distortion`: → 0.2
  - `filter.frequency`: → 6500 Hz
  - `noise.volume`: → −34 dB *(NEW Tone.Noise mixed in)*

### "cleaner"

- **Acoustic:** remove saturation, flatten EQ, no noise floor.
- **Tone.js parameters:**
  - `distortion.distortion`: → 0
  - `eq3.low`/`mid`/`high`: → 0 dB
  - remove any `Tone.Noise` node from chain

## Pitch / movement

### "more wobbly"

- **Acoustic:** slow LFO on filter cutoff or pitch.
- **Tone.js parameters:**
  - `filterLFO.frequency`: → 1 Hz
  - `filterLFO.min`/`max`: → 200 Hz / 4000 Hz
  - `filterLFO.amount`: → 0.6

### "more stable" / "less moving"

- **Acoustic:** disable LFO; centre cutoff; reduce vibrato.
- **Tone.js parameters:**
  - `filterLFO.amount`: → 0
  - `vibrato.depth`: → 0
  - `pitchShift.windowSize`: → 0.05 (stabilise grain pitch)

## Conflict resolution

If the user requests two adjectives that pull opposite directions ("warmer AND brighter"), surface the conflict:

> "Warmer" reduces frequencies above 3.5 kHz; "brighter" boosts them.
> Pick one, or describe the specific frequency band you want enhanced.

Do not silently average the two — that produces a sound the user won't recognise as either.
