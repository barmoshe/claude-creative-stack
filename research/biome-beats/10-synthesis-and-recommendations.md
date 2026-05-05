# Synthesis & Recommendations
> Status: draft
> Owner: main session
> Last updated: 2026-05-05 (v2 — full-scope synthesis over R1–R9, R11, R12)

> **If you only read one document about BiomeBeats, read this one.** It collapses [R1](01-beat-scholar-deep-dive.md), [R2](02-cosmic-chord-synth-asset-inventory.md), [R3](03-form-factor-m4l-vs-juce.md), [R4](04-radial-polyrhythmic-prior-art.md), [R5](05-chord-melody-sequencer-patterns.md), [R6](06-visual-magnificence-references.md), [R7](07-ableton-integration-surface.md), [R8](08-audio-engine-capabilities.md), [R9](09-ux-interaction-model.md), [R11](11-sound-design-deep-dive.md), and [R12](12-art-design-system.md) into a single set of locked picks and a consolidated punch list of open questions to clear before design begins. v1 of this file covered R1–R3 only; v2 supersedes it.

## TL;DR (≤150 words)

**Ship Phase 1 as a Max for Live device, then port to JUCE 8 WebView for Phase 2.** All 5 biomes (Space/Jungle/Sea/Cyberpunk/Tundra) inherit cosmic-chord-synth's `THEME_PRESETS` for synth + drum tunings — sound design is largely a port, not original work ([R11](11-sound-design-deep-dive.md)). Visuals reuse cosmic-chord-synth's Three.js shaders for Space and the Canvas2D layers for the rest, plus 5 ShaderToy techniques (Star Nest, Rainforest, Seascape, Cyber Punk, Auroras) as enrichment ([R6](06-visual-magnificence-references.md)). Design system: oklch tokens per biome, Motion (motion.dev) for animation, Lucide icons, 4-pt spacing ([R12](12-art-design-system.md)). UX uses `role="grid"` + `gridcell` — no canonical APG pattern for radial widgets exists ([R9](09-ux-interaction-model.md)). Six pre-design blockers: licence, tundra ambient, procedural-drums OK, plus three 1-day spikes (jweb drag-out, JUCE WebView fps, `.als` round-trip).

## Scope & questions

R10 v2 takes 11 input reports and locks one decision per axis: form factor, biome set, sequencer data shape, visual stack, integration approach, MVP scope, runtime clock, sound design, art design system, UX/accessibility, differentiation. Where inputs left tradeoffs, R10 picks. Where inputs surfaced unknowns, R10 forwards them as a punch list.

## Findings — what each input contributed

- **[R1 — Beat Scholar Deep Dive](01-beat-scholar-deep-dive.md):** the radial primitive. Per-row 3..42 step rings (polyrhythm via misaligned ring lengths), bipolar swing −200..+200% against 1/8/1/4/1/2 references, per-section time signatures (numerator 1..32, denom 2/4/8/16), drag-out MIDI as `.mid`, 16 multi-out audio channels. Documented weakness: only **note + velocity** are host-automatable — a free leapfrog.
- **[R2 — cosmic-chord-synth Asset Inventory](02-cosmic-chord-synth-asset-inventory.md):** the world. Five biomes with locked scale/BPM/drum-kit/ambient defaults, palette literals, motif lists. **No `LICENSE` at the repo root** — TS source is restrictive-by-default. 4 of 5 ambients are CC0/MIT; tundra is a placeholder.
- **[R3 — Form Factor: M4L vs JUCE](03-form-factor-m4l-vs-juce.md):** 12-axis matrix. M4L wins time-to-MVP / distribution / debug / reuse / cost; JUCE wins ceiling / MIDI accuracy / persistence / audience / future. **VST3 SDK relicensed MIT on 20 Oct 2025** — the JUCE commercial-distribution blocker is gone.
- **[R4 — Radial / Polyrhythmic Prior Art](04-radial-polyrhythmic-prior-art.md):** **NI Circular (Kontakt, 2024) is the closest direct competitor** — already radial, polyrhythmic, polymetric, chord-capable. Three unclaimed niches: (1) radial chord progressions as a MIDI effect, (2) biome-bundled scale + palette + timbre as a single theme, (3) polyrhythmic *harmonic* motion (different-length rings carrying chord events).
- **[R5 — Chord/Melody Sequencer Patterns](05-chord-melody-sequencer-patterns.md):** 5 plug-ins (Scaler 3, Captain Chords 5, Cthulhu, RapidComposer, Riffer 3) compared on scale picking, note constraint, chord building, voicing, progression, MIDI export. Proposes a per-slice data shape covering all surveyed features. Two leapfrog options: per-biome voicing palette as a first-class object, polyrhythmic chord rings on misaligned grids.
- **[R6 — Visual Magnificence References](06-visual-magnificence-references.md):** 20 references (4 per biome) plus 10-item Phase-1 technique shortlist with reduced-motion fallbacks. Strongest single shaders per biome: Star Nest (Space), Rainforest (Jungle), Seascape (Sea), Cyber Punk (Cyberpunk), Auroras (Tundra — also reusable for Space's nebula band).
- **[R7 — Ableton Integration Surface](07-ableton-integration-surface.md):** mapping table covering 9 needs × 2 runtimes (M4L primitive vs JUCE primitive). Three 1-day spikes flagged: `jweb` drag-out bridge, JUCE 8 WebView fps with THREE r128, `.als` round-trip after device remove/re-add (`pattrstorage` int→float coercion).
- **[R8 — Audio Engine Capabilities](08-audio-engine-capabilities.md):** defers to `knowledge/07-audio.md` for primitives. 6 gaps: chord voicing (`tonal@6.4.3` + `@tonaljs/voicing`), `Tone.PolySynth` voice-stealing, timing/lookAhead, polyrhythm phase-lock, SMF export (`midi-writer-js@3.2.1`), swing/microtiming. Clock decision per form factor in the Locked picks below.
- **[R9 — UX & Interaction Model](09-ux-interaction-model.md):** **WAI-ARIA APG has no canonical radial widget pattern** — closest fit is `role="grid"` + `gridcell`. Live 12 has no native iPad app — touch only via control-app mirrors. 14-action keyboard map. Three a11y risks: focus ring under shader bloom, screen-reader pattern for 2D radial, reduced-motion play cursor.
- **[R11 — Sound Design Deep Dive](11-sound-design-deep-dive.md):** 5 Tone.js synthesis recipes per biome. Drum kits: keep `default`/`tribal`/`aquatic`, add new `neon` (Cyberpunk) and `glacial` (Tundra). **Tone.PolySynth default `maxPolyphony:32` is under the worst-case 8 × 5 = 40** — per-biome caps proposed. **cosmic-chord-synth's `THEME_PRESETS` is fully extractable**: Phase 1 ships near-zero original sound design.
- **[R12 — Art Design System](12-art-design-system.md):** oklch palettes per biome (8 tokens × 5), 5 typography pairings (6/10 faces variable), Lucide icons, **Motion (motion.dev)** as the animation library (~18 KB, built-in `prefers-reduced-motion`). 4-pt base spacing with 8-pt rhythm. Window range 480→1024 with 720 default. Working name lean: **BiomeBeats** (alternates: *Pizzascale*, *RingScribe*).

## Locked picks

### 1. Form factor — **two-phase: M4L now, JUCE 8 WebView later**

- **Phase 1 (weeks 0–5):** Max for Live `.amxd` ([R3 §M4L](03-form-factor-m4l-vs-juce.md)). Reuses the repo's THREE r128 + Tone.js stack inside `jweb` essentially as-is. Drag onto a Live track, no installer, no codesigning, persists in the `.als` via `pattrstorage`.
- **Phase 2 (after Phase 1 ships):** JUCE 8 with the same HTML/JS UI loaded in `WebView` ([R3 §JUCE](03-form-factor-m4l-vs-juce.md)). C++ shell handles MIDI/state/parameters; UI is the validated Phase-1 frontend. Targets VST3 + AU + CLAP. AAX deferred ([R7 mapping](07-ableton-integration-surface.md)).

### 2. Biome set — **the original five, defaults from R2's `biomes.json`**

Space pent@94, Jungle pent@108, Sea lyd@76, Cyberpunk arab@128, Tundra min@68 ([R2](02-cosmic-chord-synth-asset-inventory.md)). Default roots: **C-Space, E-Jungle, F-Sea, A-Cyberpunk, A-Tundra** — picked to give five distinct tonal centres. Open for tuning during Phase-1 playtesting.

### 3. Sequencer data shape — **per-slice chord events**

Use [R5's expanded shape](05-chord-melody-sequencer-patterns.md):

```ts
type Slice = {
  pitchDegree: number;          // 0..scale.length-1
  octave: number;               // -2..+2 from biome's centre
  chordSize: 1 | 2 | 3 | 4 | 5; // 1 = melody note; 5 = max stack
  chordQuality?: "auto" | "major" | "minor" | "dim" | "aug" | "sus2" | "sus4";
  inversion: 0 | 1 | 2 | 3;
  voicing: "close" | "open" | "drop2" | "spread" | "shell";
  velocity: number;             // 0..1
  microtiming: number;          // -1..+1, fraction of one slice
  accent: boolean;
  tie: boolean;
  mute: boolean;
};

type Ring = {
  steps: number;                // 3..42
  rotation: number;
  swing: number;                // -2.0..+2.0 (R1: -200..+200%)
  swingRef: "1/8" | "1/4" | "1/2";
  timeSignatureSection?: TimeSig;
  slices: Slice[];
};
```

This is the leapfrog from R1+R5: every Beat Scholar row is one drum slot; every BiomeBeats ring is a chord progression.

### 4. Visual stack — **THREE r128 for Space, Canvas2D for the other four, both inside `jweb`**

Mirrors what cosmic-chord-synth ships ([R2 per-biome inventory](02-cosmic-chord-synth-asset-inventory.md#per-biome-inventory)). Phase-1 enrichment — port these techniques from [R6](06-visual-magnificence-references.md):

| Biome | Source repo | Phase-1 enrichment |
|---|---|---|
| Space | `shared/shaders.ts` (11 programs) | [Star Nest](https://www.shadertoy.com/view/XlfGRj) backdrop layer |
| Jungle | Canvas2D | [Rainforest](https://www.shadertoy.com/view/4ttSWf) colour-grade |
| Sea | Canvas2D | [Seascape](https://www.shadertoy.com/view/Ms2SD1) palette ramp on the wave overlay |
| Cyberpunk | Canvas2D | [Cyber Punk](https://www.shadertoy.com/view/7lVSDw) glitch sampler over the rain layer |
| Tundra | Canvas2D | [Auroras](https://www.shadertoy.com/view/XtGGRt) overlay (also doubles for Space's nebula band) |

THREE r128 only ([CLAUDE.md](../../CLAUDE.md), [knowledge/03-artifacts.md](../../knowledge/03-artifacts.md) §3.2). All 5 biomes honour `prefers-reduced-motion`.

### 5. Integration approach — **`jweb` HTML/JS UI + Max patcher MIDI shell**

Use [R7's mapping table](07-ableton-integration-surface.md#mapping-table--biomebeats-need--m4l--juce). Concretely for Phase 1:

- **Tempo / transport:** `live.observer` on `live_set tempo` / `is_playing` / `current_song_time`.
- **MIDI out:** `[js]` patcher emits notes via `outlet 0` to `[midiout]`.
- **Persistence:** `pattrstorage` with `@parameter_enable 1` / `@paraminitmode 1`.
- **Drag-out clip:** Max `dragdrop` overlay positioned over the `jweb` viewport — **note: no public reference implementation; this is a Phase-1 spike** ([R7](07-ableton-integration-surface.md#open-questions)).

### 6. Runtime clock — **per form factor**

From [R8](08-audio-engine-capabilities.md):

| Form factor | Audio clock | Visuals clock | MIDI source |
|---|---|---|---|
| Standalone artifact (testbed) | `Tone.Transport` | `Tone.Transport` | n/a |
| Phase 1 (M4L `.amxd`) | Live transport | `Tone.Transport` driven by `live.observer beat_time` | `[js]` driven by Live transport |
| Phase 2 (JUCE 8 + WebView) | Host PPQ via `processBlock` | WebView render-only | `MidiBuffer` in `processBlock` |

Fallback for Phase 1 if `live.observer beat_time` lag is audible: all-Tone.js + dummy MIDI track.

### 7. Sound design — **inherit cosmic-chord-synth's `THEME_PRESETS`, plus 2 new drum kits**

Per [R11](11-sound-design-deep-dive.md):

- **Synth recipes:** lift the 5 per-biome Tone.js patches from `THEME_PRESETS` directly. Phase 1 ships near-zero original sound design.
- **Drum kits:** keep `default` / `tribal` / `aquatic`; add `neon` (Cyberpunk: 909-style kick + sizzle hat + vinyl crackle accent) and `glacial` (Tundra: wood-block kick + ice-shimmer hat + pink-noise sweep).
- **Per-biome polyphony caps** (because Tone.PolySynth default `maxPolyphony:32` < worst-case 40): Cyberpunk 12, Sea 16, Tundra 16, Space 24, Jungle 24.
- **FX chains** per [R11 §Per-biome FX chains](11-sound-design-deep-dive.md#per-biome-fx-chains).
- **Cyberpunk `fatsawtooth(spread:30, count:3)` is the #1 CPU risk** on M4L `jweb` — monitor in Phase-1 playtesting.

### 8. Art design system — **oklch tokens, Motion lib, Lucide icons, 4-pt spacing**

Per [R12](12-art-design-system.md):

- **Color:** per-biome oklch palette tables (8 tokens × 5 biomes) + 5 shared neutrals. Cyberpunk's `accent` on `accent-strong` fails WCAG AA — reserved for shape fills only.
- **Typography:** 5 biome pairings (e.g. Space → JetBrains Mono + Space Grotesk; Cyberpunk → VT323 + Bebas Neue; Tundra → Manrope + Playfair). 6 of 10 faces are variable.
- **Iconography:** Lucide tree-shaken; 9-icon initial set. Slice states use shape (not just colour) — armed=solid-fill, muted=slashed, accent=chevron, tied=connector-arc, focused=outer-outline.
- **Motion:** [Motion (motion.dev)](https://motion.dev/) ≈18 KB, built-in `prefers-reduced-motion`, ESM, jweb-friendly.
- **Spacing:** 4-pt base with 8-pt rhythm. Window range 480→1024 with 720 default. Inner 40% diameter reserved for transport hub.
- **Working name:** **BiomeBeats** confirmed.

### 9. UX & accessibility — **`role="grid"` + `gridcell`, 14-action keyboard map, minimal pulse under reduced-motion**

Per [R9](09-ux-interaction-model.md):

- **ARIA:** `role="grid"` on the wheel; `gridcell` on each slice with `aria-label="ring 1, slice 5, C major chord, armed"`. Linearised reading order (ring 1 slice 0..N, ring 2 slice 0..N).
- **Keyboard:** 14 actions covering pitch/octave/mute/accent/tie/inversion/chord-size/biome/help. Tab/Shift-Tab walks slices.
- **Touch:** Live 12 has no native iPad app — touch arrives via control-app mirrors only (PULL, Knobbler4). 44pt minimum is hit by inner-edge wedges only at ≤32 slices per ring.
- **Reduced motion:** the play cursor keeps a 4%-scale 200ms pulse (essential motion stays minimal, doesn't disappear) — vestibular safety vs play-state legibility tradeoff resolved in favour of keeping minimal motion.
- **Focus ring on radial:** outer arc-stroke at 3px, biome-neutral white at 80% opacity; renders cleanly over shader bloom.

### 10. Differentiation — **claim the three unmet niches**

Per [R4](04-radial-polyrhythmic-prior-art.md):

1. Radial *chord* progressions as a **MIDI effect** (most competitors are drum-only or library-locked).
2. **Biome-bundled** scale + palette + timbre as a single selectable theme (no rival ships this fusion).
3. Polyrhythmic *harmonic* motion (different-length rings carrying chord events).

NI Circular (Kontakt, 2024) is the closest direct competitor — flag for a one-evening differentiation analysis: does Circular accept external chord input or only drive its built-in sources? Answer affects positioning copy.

### MVP scope — **what's in Phase 1, what's deferred**

**In:** one ring per pattern, 3..32 steps, per-ring chord events using the [R5 data shape](05-chord-melody-sequencer-patterns.md), swing, biome swap (palette + scale + BPM + synth + drum-kit + ambient), THREE r128 for Space, Canvas2D for the other four, MIDI-out, drag-out clip (pending spike), in-`.als` persistence, full host automation of *every* parameter (the R1 leapfrog), 14-action keyboard map, oklch tokens, Motion-driven UI animation.

**Out (Phase 2 or later):** multiple simultaneous rings (polyrhythm), per-section time-signature changes, MPE, CLAP/AAX, multi-channel audio out, factory sample browser, in-plugin effects rack, JUCE port.

## Pre-design blockers

Three user-action items + three engineering spikes — clear these *before* opening the design plan:

1. **Add `LICENSE` to `barmoshe/cosmic-chord-synth`** (MIT recommended). Five-minute fix; unblocks all TS-source mirroring. ([R2](02-cosmic-chord-synth-asset-inventory.md))
2. **Commission a CC0 tundra ambient** (~30s loop). Replaces the placeholder. ([R2](02-cosmic-chord-synth-asset-inventory.md))
3. **Confirm: keep procedural drums.** R10 recommends yes — matches lineage and is fastest. One-word confirmation needed. ([R11](11-sound-design-deep-dive.md))
4. **Spike: `jweb` → Max drag-out bridge** (1 day). No public reference impl; HTML can't call Max `dragdrop` directly. Phase 1 ship-blocker if it doesn't work. ([R7](07-ableton-integration-surface.md))
5. **Spike: JUCE 8 WebView fps with THREE r128** (1 day). No public benchmark; affects whether Phase 2 keeps the HTML/JS UI or rewrites in JUCE Components. ([R7](07-ableton-integration-surface.md))
6. **Spike: `.als` round-trip after device remove/re-add** (1 day). `pattrstorage` has documented int→float coercion bugs that would corrupt pattern data. ([R7](07-ableton-integration-surface.md))

## Open questions (consolidated punch list)

Surfacing every unresolved item from R1–R9 + R11–R12 in one place.

**[R1](01-beat-scholar-deep-dive.md):** Beat Scholar JUCE/CLAP/MPE confirmation; MIDI drag-out quantisation behaviour; latency benchmark numbers; per-row slice floor.

**[R2](02-cosmic-chord-synth-asset-inventory.md):** No `LICENSE` (action: add MIT); tundra ambient placeholder; default root note per biome; procedural-drums confirmation; `flowers/fruits/monkeys.svg` provenance; `mood` field repurpose vs drop; `src/synthsim/` is unrelated flight-sim — flagged.

**[R3](03-form-factor-m4l-vs-juce.md):** JUCE 8 WebView fps benchmark; Ableton Suite owner count; drag-out MIDI from `jweb`; iPad Live 12 touch; M4L multi-instance; MPE in M4L; AAX from JUCE.

**[R4](04-radial-polyrhythmic-prior-art.md):** NI Circular external-chord-input acceptance (highest priority — affects positioning).

**[R5](05-chord-melody-sequencer-patterns.md):** Whether to ship Phase 1 with the full per-slice editor or a reduced version (size vs power tradeoff).

**[R6](06-visual-magnificence-references.md):** Phase-1 fps targets per biome on integrated GPU; reduced-motion fallback aesthetics (does it look intentional or broken?).

**[R7](07-ableton-integration-surface.md):** all three spike items above.

**[R8](08-audio-engine-capabilities.md):** Does `live.observer beat_time` lag audibly drive MIDI? (1-day test). Does `Tone.Transport` running inside `jweb` stay in sync with Live's master clock when both are nominally locked to BPM?

**[R9](09-ux-interaction-model.md):** ARIA pattern verdict for the radial widget — `role="grid"` linearisation vs `role="application"` with managed focus + `aria-live` vs hybrid; reduced-motion play cursor amplitude; Push 3 standalone forwarding (does it render custom `jweb` UI or only `live.banks` parameter strip?).

**[R11](11-sound-design-deep-dive.md):** Cyberpunk `fatsawtooth` CPU envelope under M4L `jweb` (worst-case patch); whether to inherit ambient files or commission new ones; per-biome polyphony cap fine-tuning.

**[R12](12-art-design-system.md):** Cyberpunk contrast (the only failing pair); font payload size limits in `jweb`; curved focus-ring rendering quality at small radii.

## Sources

- All 11 input reports (R1–R9, R11, R12) — see linked sections above.
- [PLAN.md](PLAN.md) — research plan and acceptance criteria.
- [HANDOFF.md](HANDOFF.md) — operational briefing.
- [knowledge/03-artifacts.md](../../knowledge/03-artifacts.md) §3.2/§3.5 — artifact-sandbox constraints (apply inside `jweb`).
- [knowledge/07-audio.md](../../knowledge/07-audio.md) — Tone.js, Web Audio, scale utilities.
- [knowledge/11-creative-connectors.md](../../knowledge/11-creative-connectors.md) §11.4 — Ableton MCP / LOM tool surface.
- [knowledge/14-accessibility-performance.md](../../knowledge/14-accessibility-performance.md) — `prefers-reduced-motion`, INP.
- [CLAUDE.md](../../CLAUDE.md) — project routing and defaults (THREE r128, oklch, composite-only animation).
