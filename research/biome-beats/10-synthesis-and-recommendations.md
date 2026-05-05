# Synthesis & Recommendations
> Status: draft
> Owner: main session
> Last updated: 2026-05-05

> **If you only read one document about BiomeBeats, read this one.** It collapses [R1](01-beat-scholar-deep-dive.md), [R2](02-cosmic-chord-synth-asset-inventory.md), and [R3](03-form-factor-m4l-vs-juce.md) into a single set of locked picks and a consolidated punch-list of open questions to clear before design begins.

## TL;DR (≤150 words)

**Ship Phase 1 as a Max for Live device, then port to JUCE 8 WebView for Phase 2.** M4L gets a working radial chord/melody sequencer with all 5 biomes into Ableton in ~5 weeks by reusing the repo's existing THREE r128 + Tone.js artifact stack inside `jweb` essentially unchanged ([R3](03-form-factor-m4l-vs-juce.md)). JUCE is the long-term home — Beat Scholar's likely runtime, sample-accurate MIDI, cross-DAW VST3/AU/CLAP, now unblocked by the **MIT VST3 SDK as of 20 Oct 2025** ([R3](03-form-factor-m4l-vs-juce.md)) — but the 10–14 week first-time cost is too much to spend before validating the chord-mode pizza UX. Phase 1 is the experiment; Phase 2 is the product. Three blockers must clear before coding: (1) **licence cosmic-chord-synth**; (2) **commission the tundra ambient**; (3) **decide procedural-drums vs samples**. Everything else is design-phase work.

## Scope & questions

R10 takes R1's Beat Scholar feature dissection, R2's asset inventory, and R3's form-factor matrix and locks one decision per axis: form factor, biome set, sequencer data shape, visual stack, integration approach, MVP scope. Where R1–R3 left tradeoffs, R10 picks. Where R1–R3 surfaced unknowns, R10 forwards them as a punch list.

## Findings (with inline citations)

### What R1, R2, R3 each contributed

- **[R1](01-beat-scholar-deep-dive.md):** the radial primitive — per-row 3..42 step rings, polyrhythm via misaligned ring lengths, bipolar swing −200..+200% against 1/8/1/4/1/2, per-section time-signature changes inside one pattern (numerator 1..32, denom 2/4/8/16), drag-out MIDI to the DAW timeline as `.mid`, 16 multi-out audio channels, $99 / $79 intro pricing. Beat Scholar's documented weakness: only **note + velocity** are host-automatable — a free leapfrog opportunity for BiomeBeats.
- **[R2](02-cosmic-chord-synth-asset-inventory.md):** the world. Five biomes with confirmed scale/BPM/drum-kit/ambient defaults: Space `pentatonic@94 + default + space-ambient.opus`, Jungle `pentatonic@108 + tribal + jungle-ambient.ogg`, Sea `lydian@76 + aquatic + sea-ambient.opus`, Cyberpunk `arabic@128 + default + cyberpunk-ambient.ogg`, Tundra `minor@68 + aquatic + tundra-ambient.ogg` (placeholder). Source palette is **one global palette plus per-biome background gradients**, not biome-keyed palette tables. Only Space uses THREE.js shaders (11 programs in `shared/shaders.ts`); the other four biomes are Canvas2D. **No `LICENSE` at the repo root** — TS source is restrictive-by-default until the owner says otherwise.
- **[R3](03-form-factor-m4l-vs-juce.md):** the runtime. M4L wins time-to-MVP (5/2), distribution friction (5/1), debug loop (5/3), reuse of the artifact stack (5/4), licence cost (5/3). JUCE wins visual ceiling (5/3), MIDI/tempo sample-accuracy (5/3), persistence robustness (5/4), audience size (5/2), cross-DAW future (5/1), MPE/MIDI 2.0 (5/3), accessibility (4/3). VST3 SDK relicensed MIT on 20 Oct 2025 ([Steinberg](https://github.com/steinbergmedia/vst3sdk), via [R3 sources](03-form-factor-m4l-vs-juce.md#sources)).

### Locked picks

#### 1. Form factor — **two-phase: M4L now, JUCE 8 WebView later**

- **Phase 1 (weeks 0–5):** Max for Live `.amxd`. Reuses the repo's THREE r128 + Tone.js stack inside `jweb` essentially as-is ([R3 §M4L](03-form-factor-m4l-vs-juce.md), `knowledge/03-artifacts.md` §3.2/§3.5). User-facing: drag onto a Live track, no installer, no codesigning, persists in the `.als` via `pattrstorage`.
- **Phase 2 (after Phase 1 ships):** JUCE 8 with the same HTML/JS UI loaded in `WebView`. C++ shell handles MIDI/state/parameters; UI is the validated Phase-1 frontend. Targets VST3 + AU + CLAP. AAX deferred. ([R3 §JUCE](03-form-factor-m4l-vs-juce.md))
- **Why this order:** the user explicitly asked us to engage seriously with the JUCE option ([HANDOFF.md §3](HANDOFF.md)). The answer is *"yes, JUCE is the long-term home — but the assets we already have map to M4L's `jweb` runtime in days, not weeks; ship the experiment, then port the validated UX."* That is engagement, not avoidance.

#### 2. Biome set — **the original five, defaults from R2's `biomes.json`**

Space, Jungle, Sea, Cyberpunk, Tundra. Scale/BPM/drum-kit/ambient values from [R2's proposed `biomes.json`](02-cosmic-chord-synth-asset-inventory.md#proposed-biomesjson-shape) — pentatonic@94, pentatonic@108, lydian@76, arabic@128, minor@68 respectively. Default roots (R2 left these as placeholders): C-Space, E-Jungle, F-Sea, A-Cyberpunk, A-Tundra — picked to match each biome's mood/tempo and to give five distinct tonal centres in the wheel. Open for tuning during Phase-1 playtesting.

#### 3. Sequencer data shape — **per-slice chord events, not per-slice notes**

```ts
type Slice = {
  pitchDegree: number;     // 0..scale.length-1
  octave: number;          // -2..+2 from biome's centre
  chordSize: 1 | 2 | 3 | 4 | 5;   // 1 = melody note; 5 = max stack
  inversion: 0 | 1 | 2 | 3;       // root, 1st, 2nd, 3rd
  voicing: "close" | "open" | "drop2" | "spread" | "shell";
  velocity: number;        // 0..1
  microtiming: number;     // -1..+1, fraction of one slice
  accent: boolean;         // bumps velocity + biome-specific FX hit
  tie: boolean;            // hold from previous slice
  mute: boolean;
};

type Ring = {
  steps: number;           // 3..42 (R1: per-row independent)
  rotation: number;        // global ring offset in steps
  swing: number;           // -2.0..+2.0 (R1: -200..+200%)
  swingRef: "1/8" | "1/4" | "1/2";
  timeSignatureSection?: TimeSig;
  slices: Slice[];
};
```

This is the leapfrog from R1: every Beat Scholar row is one drum slot, one note. Every BiomeBeats ring is a chord progression. Two rings of misaligned length (5-chord vs 4-bass) produce the polyrhythmic *harmonic motion* no drum-focused sequencer addresses.

#### 4. Visual stack — **THREE r128 for Space, Canvas2D for the other four, both inside `jweb`**

Mirrors what cosmic-chord-synth already ships ([R2 per-biome inventory](02-cosmic-chord-synth-asset-inventory.md#per-biome-inventory)). Constrains effort honestly: one biome ships shader-grade, four ship Canvas2D — matching the source repo's actual investment level. THREE r128 only ([CLAUDE.md](../../CLAUDE.md), `knowledge/03-artifacts.md` §3.2). All 5 biomes honour `prefers-reduced-motion` (per `knowledge/14-accessibility-performance.md`). FFT-driven motion via Tone.js → `AnalyserNode` reading the synth bus, not the host buffer (host audio is hard inside `jweb`).

#### 5. Integration approach — **`jweb` HTML/JS UI + Max patcher MIDI shell**

Max patcher carries: tempo (`live.observer` on `live_set tempo`), transport (`live.observer is_playing`/`current_song_time`), MIDI-out (`midiout` from a JS `[js]` object that consumes the ring schedule), persistence (`pattrstorage` with `@parameter_enable 1`/`@paraminitmode 1`). The drag-out clip uses Max's standard `dragdrop` from a hidden umenu of MIDI files generated on-demand. Max scheduler runs at signal-vector rate (~64 samples) — accept the jitter for Phase 1; sample-accuracy is a Phase-2 JUCE win ([R3 axis 5](03-form-factor-m4l-vs-juce.md)).

#### 6. MVP scope — **what's in Phase 1, what's deferred**

**In:** one ring per pattern, per-ring step count 3..32 (extending to 42 in Phase 2), per-ring chord events, swing, biome selection (palette + scale + BPM swap), one `jweb` THREE scene per biome (Space ports the existing shaders; the other four port the Canvas2D layers), MIDI-out to the host's MIDI graph, drag-out clip, in-`.als` persistence, host automation of *every* parameter (the R1 leapfrog).

**Out (Phase 2 or later):** multiple simultaneous rings (polyrhythm), per-section time-signature changes inside one pattern, MPE, CLAP/AAX, multi-channel audio out, factory sample browser, in-plugin effects rack. Phase 1 ships *one ring of chords per biome* — the cleanest possible kernel of the idea.

## Implications for BiomeBeats

The next phase is a **design plan** — Figma/wireframe of the radial UX, a JSON-schema spec for ring/slice/biome, the Max patcher skeleton, a `jweb` HTML/JS scaffold cribbing from `artifacts/html/three-r128-scene.html` and `artifacts/html/tone-procmusic.html`. Three blockers must clear *before* design starts:

1. **Licence cosmic-chord-synth.** The user owns `barmoshe/cosmic-chord-synth` ([R2 §Licence](02-cosmic-chord-synth-asset-inventory.md#licence)) — adding `LICENSE` (MIT recommended) is a five-minute fix that unblocks all TS-source mirroring. Until then, BiomeBeats reads values, not bytes.
2. **Commission a CC0 tundra ambient.** [`tundra-ambient.ogg`](02-cosmic-chord-synth-asset-inventory.md#tundra) is a placeholder. One CC0 arctic drone replaces it — Freesound or self-recorded, ~30 s loop.
3. **Procedural drums vs samples.** cosmic-chord-synth's `default`/`tribal`/`aquatic` kits are Tone.js synth tunings, not sample banks ([R2 §Repo-wide assets](02-cosmic-chord-synth-asset-inventory.md#repo-wide-assets-textures-fonts-audio)). For BiomeBeats Phase 1, keeping them procedural is fastest *and* matches the repo's lineage. R10 recommends keeping procedural; user confirmation before design.

## Open questions (consolidated punch list)

Surfacing every unresolved item from R1, R2, R3 in one place — these are what to ask the user before opening the design plan.

**From [R1](01-beat-scholar-deep-dive.md):**
- Beat Scholar JUCE confirmation — heavily implied by format coverage but never stated. Material because it would confirm Phase 2's runtime is the same one Beat Scholar uses.
- Beat Scholar MPE I/O — neither confirmed nor denied.
- Beat Scholar CLAP — not listed in any source through May 2026.
- MIDI drag-out quantisation behaviour — does dragged content bake humanize/swing or stay grid-quantised?
- Latency benchmark numbers — only qualitative reports exist.
- Per-row slice floor — likely 3, but unverified.

**From [R2](02-cosmic-chord-synth-asset-inventory.md):**
- **No `LICENSE` at repo root.** Action: add MIT before BiomeBeats mirrors any TS source.
- Tundra ambient is a placeholder. Action: source CC0 replacement.
- Default root note per biome is undocumented in `SCALES`. R10's picks (C/E/F/A/A) are recommendations to confirm.
- Drum-kit content is procedural. R10 recommends keeping procedural — user confirmation needed.
- `flowers.svg`, `fruits.svg`, `monkeys.svg` — original or derived? Action: confirm origin before mirroring.
- `mood` values in `SCALES` (0.2–0.85) drove the AI-DJ. Without an AI-DJ, repurpose for UI tinting or drop?
- `src/synthsim/` is an unrelated flight-sim module in the same repo — flagged so future agents don't waste cycles.

**From [R3](03-form-factor-m4l-vs-juce.md):**
- JUCE 8 WebView fps vs `jweb` for THREE r128 — no public benchmark. 1-day spike before Phase 2 starts.
- M4L install audience size — Ableton publishes no Suite-owner count.
- Drag-out MIDI from `jweb` — HTML→Max DnD bridge non-standard; needs prototyping.
- Touch input on iPad Live 12 — `jweb` touch story unclear.
- M4L multi-instance — `jweb` resource contention when 4+ load.
- MPE in M4L — fiddly; per-note expression test before committing in Phase 1.
- AAX from JUCE — separate Avid agreement still required; Phase 2+.

## Sources

- [R1 — Beat Scholar Deep Dive](01-beat-scholar-deep-dive.md)
- [R2 — cosmic-chord-synth Asset Inventory](02-cosmic-chord-synth-asset-inventory.md)
- [R3 — Form Factor: Max for Live vs JUCE](03-form-factor-m4l-vs-juce.md)
- [PLAN.md](PLAN.md) — research plan and acceptance criteria
- [HANDOFF.md](HANDOFF.md) — operational briefing
- [knowledge/03-artifacts.md](../../knowledge/03-artifacts.md) §3.2/§3.5 — artifact-sandbox constraints (apply inside `jweb`)
- [knowledge/07-audio.md](../../knowledge/07-audio.md) — Tone.js, Web Audio, scale utilities
- [knowledge/11-creative-connectors.md](../../knowledge/11-creative-connectors.md) §11.4 — Ableton MCP / LOM tool surface
- [knowledge/14-accessibility-performance.md](../../knowledge/14-accessibility-performance.md) — `prefers-reduced-motion`, INP
- [CLAUDE.md](../../CLAUDE.md) — project routing and defaults (THREE r128, oklch, composite-only animation)
