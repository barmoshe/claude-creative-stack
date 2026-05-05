# BiomeBeats — Research Index

> A new Ableton plug-in fusing Beat Scholar's radial "pizza" sequencer UX with the world & assets of [`barmoshe/cosmic-chord-synth`](https://github.com/barmoshe/cosmic-chord-synth) (a.k.a. *biome-synth*). **Chord/melody-forward, not drum-focused.** This folder holds the *research phase* output — not code, not the final design.

**Working name:** BiomeBeats. **Plan:** [PLAN.md](PLAN.md). **Operational handoff:** [HANDOFF.md](HANDOFF.md).

---

## Full-scope research index (12 reports)

The original [PLAN.md](PLAN.md) scoped 10 reports (R1–R10). This session expanded to **12** — adding **R11 (Sound Design Deep Dive)** and **R12 (Art Design System)** at user request to deepen the sonic + visual identity work beyond what R5/R6 cover.

| ID  | Report                                                              | Status | Owner           | Last updated | Abstract                                                                                                |
| --- | ------------------------------------------------------------------- | ------ | --------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| R1  | [Beat Scholar Deep Dive](01-beat-scholar-deep-dive.md)              | draft  | general-purpose | 2026-05-05   | 3..42 step rings, polyrhythm by misaligned ring lengths, ±200% swing, per-section time-sigs, drag-out `.mid`. JUCE/CLAP/MPE unconfirmed. |
| R2  | [cosmic-chord-synth Asset Inventory](02-cosmic-chord-synth-asset-inventory.md) | draft  | general-purpose | 2026-05-05   | Five-biome scale/BPM/drum-kit/ambient table, `biomes.json` proposal, file manifest. **No LICENSE at repo root** — mirror values, not bytes. |
| R3  | [Form Factor: Max for Live vs JUCE](03-form-factor-m4l-vs-juce.md)  | draft  | general-purpose | 2026-05-05   | 12-axis matrix. M4L wins MVP/distribution/reuse/cost; JUCE wins ceiling/MIDI accuracy/audience/cross-DAW. **VST3 SDK now MIT (Oct 2025).** |
| R4  | [Radial / Polyrhythmic Prior Art](04-radial-polyrhythmic-prior-art.md) | draft  | general-purpose | 2026-05-05   | 7 capsules + tag matrix. **NI Circular** is the closest direct competitor. 3 unmet niches: chord-as-MIDI-effect, biome-bundled theme, polyrhythmic harmonic motion. |
| R5  | [Chord/Melody Sequencer Patterns](05-chord-melody-sequencer-patterns.md) | draft  | general-purpose | 2026-05-05   | Scaler 3 / Captain Chords 5 / Cthulhu / RapidComposer / Riffer 3 compared. Per-slice TS data shape proposed. Two leapfrog options. |
| R6  | [Visual Magnificence References](06-visual-magnificence-references.md) | draft  | general-purpose | 2026-05-05   | 20 references (4 per biome). Phase-1 technique shortlist with reduced-motion fallbacks. ShaderToy IDs: Star Nest, Rainforest, Seascape, Cyber Punk, Auroras. |
| R7  | [Ableton Integration Surface](07-ableton-integration-surface.md)    | draft  | general-purpose | 2026-05-05   | Mapping table: 9 BiomeBeats needs × M4L primitives × JUCE primitives. 3 hardest unknowns flagged as 1-day spikes. |
| R8  | [Audio Engine Capabilities](08-audio-engine-capabilities.md)        | draft  | general-purpose | 2026-05-05   | Defers to `knowledge/07-audio.md`. 6 gaps with libs (`tonal@6.4.3`, `midi-writer-js@3.2.1`). Runtime-clock decision per form factor. |
| R9  | [UX & Interaction Model](09-ux-interaction-model.md)                | draft  | general-purpose | 2026-05-05   | 14-action keyboard map. **No canonical APG pattern for radial widgets** — `role="grid"` + `gridcell` is the closest fit. 3 a11y risks flagged. |
| R10 | [Synthesis & Recommendations](10-synthesis-and-recommendations.md)  | draft  | main session    | 2026-05-05   | **v2** synthesis over all 11 inputs. 10 locked picks: form factor, biomes, data shape, visual stack, integration, clock, sound, art, UX/a11y, differentiation. |
| R11 | [Sound Design Deep Dive](11-sound-design-deep-dive.md)              | draft  | general-purpose | 2026-05-05   | 5 per-biome Tone.js synth recipes. New `neon` + `glacial` drum kits. **PolySynth `maxPolyphony:32` is under worst-case 40** — per-biome caps proposed. |
| R12 | [Art Design System](12-art-design-system.md)                        | draft  | general-purpose | 2026-05-05   | oklch tokens × 5 biomes (8 each), 5 typography pairings, 7 slice states (shape > colour), Motion.dev for animation, Lucide for icons, 4-pt spacing. |

**Status legend:** `pending` (file not yet written) → `draft` (skeleton + first pass) → `reviewed` (human signed off) → `locked` (no further edits without bump).

---

## Reading order

1. **[R10 — Synthesis & Recommendations](10-synthesis-and-recommendations.md)** — *if you only read one document, read this.*
2. **[HANDOFF.md](HANDOFF.md)** — operational briefing for any agent picking this up.
3. **[PLAN.md](PLAN.md)** — full research plan, methodology, acceptance criteria, risks.
4. **R1–R9, R11, R12** — the inputs. Read on demand from R10's links.

---

## Scope guardrails (do not violate)

- **Chord/melody-forward.** Each radial slice plays *notes/chords* in the active biome's scale; drums are a per-biome accent layer, not the centrepiece.
- **From cosmic-chord-synth, reuse only the *world and assets* — NOT the AI-DJ engine, NOT the DRIFT→PULSE→BLOOM→SURGE→DISSOLVE phase logic.** BiomeBeats has its own deterministic, user-driven engine.
- **R1–R9 + R11 + R12 stop at "Implications: here are the options."** Only **R10** makes recommendations.
- **Every claim is cited.** No bare assertions.
