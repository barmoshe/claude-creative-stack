# BiomeBeats — Research Index

> A new Ableton plug-in fusing Beat Scholar's radial "pizza" sequencer UX with the world & assets of [`barmoshe/cosmic-chord-synth`](https://github.com/barmoshe/cosmic-chord-synth) (a.k.a. *biome-synth*). **Chord/melody-forward, not drum-focused.** This folder holds the *research phase* output — not code, not the final design.

**Working name:** BiomeBeats. **Plan:** [PLAN.md](PLAN.md). **Operational handoff:** [HANDOFF.md](HANDOFF.md).

---

## Fast-track scope

The user approved a four-report fast track in this session: **R1 → R2 → R3 → R10**. R4–R9 are scoped in [PLAN.md §4](PLAN.md) and may be commissioned later if R10 surfaces an unfilled gap.

| ID  | Report                                                              | Status | Owner           | Last updated | Abstract                                                                                                |
| --- | ------------------------------------------------------------------- | ------ | --------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| R1  | [Beat Scholar Deep Dive](01-beat-scholar-deep-dive.md)              | draft  | general-purpose | 2026-05-05   | 3..42 step rings, polyrhythm by misaligned ring lengths, ±200% swing, per-section time-sigs, drag-out `.mid`. JUCE/CLAP/MPE unconfirmed. |
| R2  | [cosmic-chord-synth Asset Inventory](02-cosmic-chord-synth-asset-inventory.md) | draft  | general-purpose | 2026-05-05   | Five-biome scale/BPM/drum-kit/ambient table, `biomes.json` proposal, file manifest. **No LICENSE at repo root** — mirror values, not bytes. |
| R3  | [Form Factor: Max for Live vs JUCE](03-form-factor-m4l-vs-juce.md)  | draft  | general-purpose | 2026-05-05   | 12-axis matrix. M4L wins MVP/distribution/reuse/cost; JUCE wins ceiling/MIDI accuracy/audience/cross-DAW. **VST3 SDK now MIT (Oct 2025).** |
| R10 | [Synthesis & Recommendations](10-synthesis-and-recommendations.md)  | draft  | main session    | 2026-05-05   | **Phase 1 = M4L `.amxd`, Phase 2 = JUCE 8 WebView.** All 5 biomes; per-slice chord events; THREE r128 for Space, Canvas2D for the rest. |

**Status legend:** `pending` (file not yet written) → `draft` (skeleton + first pass) → `reviewed` (human signed off) → `locked` (no further edits without bump).

---

## Deferred (not in fast track)

These belong to the full ten-report plan and remain unwritten unless re-commissioned.

| ID  | Report                                       | Why deferred                                                                          |
| --- | -------------------------------------------- | ------------------------------------------------------------------------------------- |
| R4  | Radial / Polyrhythmic Sequencer Prior Art    | R1 covers the immediate competitor; broader prior art is nice-to-have, not critical.  |
| R5  | Chord/Melody Sequencer Patterns              | R10 will propose a per-slice data shape from first principles; deeper survey can wait. |
| R6  | Visual Magnificence References               | R2 already names per-biome shader sources; gallery polish belongs in design phase.    |
| R7  | Ableton Integration Surface                  | `knowledge/11-creative-connectors.md` §11.4 plus R3's matrix already cover the surface needed for R10. |
| R8  | Audio Engine Capabilities                    | `knowledge/07-audio.md` is comprehensive; no new research needed for R10's MVP.       |
| R9  | UX & Interaction Model                       | R1's UX dissection seeds enough; full spec belongs to the design plan.                |

---

## Reading order

1. **[HANDOFF.md](HANDOFF.md)** — operational briefing for any agent picking this up.
2. **[PLAN.md](PLAN.md)** — full ten-report plan, methodology, acceptance criteria, risks.
3. **[R1](01-beat-scholar-deep-dive.md)**, **[R2](02-cosmic-chord-synth-asset-inventory.md)**, **[R3](03-form-factor-m4l-vs-juce.md)** — the inputs.
4. **[R10](10-synthesis-and-recommendations.md)** — *if you only read one document, read this.*

---

## Scope guardrails (do not violate)

- **Chord/melody-forward.** Each radial slice plays *notes/chords* in the active biome's scale; drums are a per-biome accent layer, not the centrepiece.
- **From cosmic-chord-synth, reuse only the *world and assets* — NOT the AI-DJ engine, NOT the DRIFT→PULSE→BLOOM→SURGE→DISSOLVE phase logic.** BiomeBeats has its own deterministic, user-driven engine.
- **R1, R2, R3 stop at "Implications: here are the options."** Only **R10** makes recommendations.
- **Every claim is cited.** No bare assertions.
