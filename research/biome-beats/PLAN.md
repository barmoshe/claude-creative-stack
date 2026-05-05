# Research Plan — BiomeBeats: a magnificent biome-driven sequencer for Ableton Live

> **What this document is.** A plan for the *research phase* of a new Ableton plug-in. The output of executing this plan is a set of markdown reports under `research/biome-beats/` — not code, not the final design. After the reports land, a separate design/implementation plan will be written based on their findings.

---

## 1. Context

The user wants to build a new Ableton plug-in that fuses two ideas:

1. **Beat Scholar's radial "pizza" sequencer aesthetic** — circular step grid, polyrhythmic per-row subdivisions (3..42 slices), negative swing, drag-out MIDI. Beat Scholar is built in JUCE and ships as VST3/AU/CLAP.
2. **The user's `barmoshe/cosmic-chord-synth` (biome-synth)** — but only the **world and assets** (the 5 biomes: Space, Jungle, Sea, Cyberpunk, Tundra; their shaders, palettes, sample timbres). The AI-DJ engine and DRIFT→DISSOLVE phase logic from that project are explicitly **out of scope** — BiomeBeats has its own user-driven engine.

Tonal centre: **chord/melody-forward, not drum-focused.** Beat Scholar is a drum sequencer; BiomeBeats inherits the radial UX but each slice plays *notes/chords* in the biome's scale, with drums as an accent layer — closer to the "cosmic *chord* synth" lineage.

We need research before design because four big unknowns block any sensible spec:

- What does Beat Scholar actually do well/badly that we should copy or improve? (UX, swing, MIDI semantics)
- What world/asset material in cosmic-chord-synth is reusable, where does it live, and under what licence?
- Should the plug-in be a Max for Live device or a JUCE plug-in? (Beat Scholar is JUCE; the user explicitly asked us to weigh both.)
- What prior art exists for *melodic/chord* radial sequencers (vs drum) so we don't reinvent solved problems?

Each unknown maps to a report below.

---

## 2. Research Goals

By the end of the research phase we must be able to answer, with citations:

1. **Feature parity & differentiation.** What does BiomeBeats need to match Beat Scholar on, and where can it innovate (chord-mode slices, biome palettes, polyrhythmic *chord* progressions)?
2. **Reusable assets.** Exactly which files in `barmoshe/cosmic-chord-synth` (shaders, textures, sample names, scale data, palette tokens) we will mirror — and which are off-limits (the AI-DJ).
3. **Form factor.** A defensible pick between Max for Live (.amxd) and JUCE (VST3/AU/CLAP) with concrete cost, time, distribution, and visual-ceiling numbers.
4. **Sequencer model.** A note/chord-aware sequencer data model that supports polyrhythm, scale-quantising, voicing, microtiming, and Beat Scholar's negative swing.
5. **Visual language.** A shader/animation reference board per biome with concrete techniques (noise, instancing, post-FX) sized for the chosen runtime.
6. **Ableton integration surface.** The exact LOM / `jweb` / `pattr` / `midiout` calls (M4L) or VST3 host APIs (JUCE) we need.

---

## 3. Report Catalog

All reports land under `research/biome-beats/` in the repo. Each report follows the same skeleton:

```
# <Report Title>
> Status: draft | reviewed | locked
> Owner: <agent or human>   Last updated: <date>

## TL;DR (≤150 words)
## Scope & questions
## Findings (with inline citations)
## Implications for BiomeBeats
## Open questions
## Sources
```

Length targets are firm — these are working documents, not essays.

| ID | File | Length | Source mix | Owner |
|---|---|---|---|---|
| R1 | `01-beat-scholar-deep-dive.md` | 600–900 w | Web (Modalics, MusicRadar, Attack, KVR, Gearspace, Synthtopia) + YouTube walkthrough notes | Explore + WebSearch |
| R2 | `02-cosmic-chord-synth-asset-inventory.md` | 600–900 w | `github.com/barmoshe/cosmic-chord-synth` README, `src/biomes/*`, `public/` (via WebFetch raw URLs since GitHub MCP is scoped to `claude-creative-stack`) | WebFetch + user-supplied paste if private files |
| R3 | `03-form-factor-m4l-vs-juce.md` | 800–1200 w | Cycling74 docs, JUCE docs, Live API ref, Beat Scholar postmortems, dev-time benchmarks | WebSearch + WebFetch |
| R4 | `04-radial-polyrhythmic-prior-art.md` | 500–800 w | Polyend Tracker, Loopy Pro, Patatap, Reaktor radial blocks, Eurorack circular sequencers, Max for Live community devices | WebSearch |
| R5 | `05-chord-melody-sequencer-patterns.md` | 600–900 w | Scaler 3, Captain Chords, Cthulhu, Reason Chord Sequencer, Riffer, RapidComposer — UX for voicing, inversions, scale-quantising | WebSearch |
| R6 | `06-visual-magnificence-references.md` | 400–600 w + image links | Three.js examples, Refik Anadol, Ouchhh, Björk Biophilia apps, Plink, generative shader Twitter, ShaderToy biome shaders | WebSearch + curated links |
| R7 | `07-ableton-integration-surface.md` | 700–1000 w | Ableton LOM reference, M4L `jweb` docs, `pattr`, `midiout`, `live.api`, `live.observer`; if JUCE: VST3 SDK MIDI-out + tempo sync | WebFetch (cycling74.com) + Explore on `knowledge/11-creative-connectors.md` |
| R8 | `08-audio-engine-capabilities.md` | 400–600 w | `claude-creative-stack/knowledge/07-audio.md`, Tone.js docs, Web Audio AnalyserNode, polyrhythm timing accuracy benchmarks | Explore + WebSearch |
| R9 | `09-ux-interaction-model.md` | 500–700 w | Radial UI HCI papers, touch vs mouse vs MIDI-controller mapping, accessibility (`prefers-reduced-motion`, screen reader on slices), onboarding patterns | WebSearch |
| R10 | `10-synthesis-and-recommendations.md` | 1000–1500 w | Synthesises R1–R9 into a single recommendations doc that feeds the next phase (design + implementation plan) | Plan agent |

**Reports R1–R9 can run in any order.** R10 strictly depends on R1–R9.

---

## 4. Per-Report Briefs

Each brief tells the executing agent **exactly** what to look for, what to skip, and what the "Implications" section must answer.

### R1 — Beat Scholar Deep Dive
- **Must answer:** circular UI mechanics (slice count limits, slice-merge, slice-split), swing modes (incl. "negative swing"), section/bar architecture, time-signature changes mid-pattern, MIDI drag-out semantics, sample browser, effects rack, automation, MPE support, latency/timing accuracy, pricing, JUCE-specific tells.
- **Must skip:** marketing copy, founder backstory, unrelated Modalics products.
- **Implications section:** which 5–8 features BiomeBeats must match, which 2–3 it can deliberately skip, which 2–3 it can leapfrog (chord-mode slices, biome theming).
- **Search seeds:** "Beat Scholar review", "Modalics pizza sequencer polyrhythm", "negative swing Beat Scholar", "Beat Scholar MIDI export", "Beat Scholar JUCE", "Beat Scholar MPE".

### R2 — cosmic-chord-synth Asset Inventory
- **Must answer:** for each of the 5 biomes — palette tokens (oklch / hex), shader source path, particle/visual motifs, default sample/timbre names, default scale, any tempo/groove hints. List of files to mirror with their licence.
- **Constraint:** GitHub MCP in this session is scoped to `claude-creative-stack` only. Use WebFetch on `https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/...` raw URLs, or ask the user to paste contents if a file is missing.
- **Out of scope (do not catalog):** anything under `src/aiDj/`, phase-engine logic (DRIFT→DISSOLVE), composition/orchestration code. We deliberately ignore the AI-DJ.
- **Implications section:** a `biomes.json` shape proposal with mirrored values; a manifest of files to copy-with-attribution.

### R3 — Form Factor: Max for Live vs JUCE
- **Must answer:** for each option — language/runtime, dev environment, debugging story, MIDI-out semantics, tempo sync, persistence, distribution (file type, install friction, codesigning), visual ceiling (jweb Chromium vs OpenGL/Metal), time-to-MVP estimate (weeks), cost (Max for Live licence requirement, JUCE licence model), reuse of `claude-creative-stack` assets.
- **Decision matrix:** ≥10 axes scored 1–5 each, with a recommended pick and a written rationale.
- **Implications section:** a single recommendation + 3 risks + a fallback plan.
- **Search seeds:** "Max for Live jweb performance", "JUCE VST3 MIDI out tempo sync", "Max for Live vs VST", "Beat Scholar JUCE", "JUCE licence tiers 2026".

### R4 — Radial / Polyrhythmic Sequencer Prior Art
- **Must answer:** ≥6 prior-art devices/apps with a 50-word capsule each. Tag each with: radial/grid/hybrid, drum/melodic/both, polyrhythm-yes/no, scale-aware-yes/no, MIDI-out-yes/no.
- **Implications section:** the 3 unmet niches BiomeBeats can claim.
- **Search seeds:** "polyrhythmic sequencer plugin", "radial step sequencer", "Reaktor Newscool", "Polyend Tracker workflow", "Euclidean sequencer Max for Live", "Loopy Pro circular sequencer".

### R5 — Chord/Melody Sequencer Patterns
- **Must answer:** for ≥5 chord/melodic plug-ins (Scaler 3, Captain Chords, Cthulhu, RapidComposer, Riffer, Reason Chord Sequencer) — how do they (a) pick a scale, (b) constrain notes to it, (c) build chords from a slice, (d) handle inversions/voicings, (e) suggest progressions, (f) export MIDI.
- **Implications section:** a per-slice data shape `{pitchDegree, chordSize, inversion, octave, accent, microtiming}` that covers everything we saw, plus the 1–2 affordances no competitor offers (e.g., per-biome voicing palette).
- **Search seeds:** "Scaler 3 chord sequencer review", "Cthulhu plugin chord", "Captain Chords 5", "best chord progression VST 2026".

### R6 — Visual Magnificence References
- **Must answer:** for each of the 5 biomes — 3–5 reference works (shader, generative-art, app, video) with a one-line technique note (e.g. "Worley noise + bloom + chromatic aberration"). Include direct ShaderToy IDs where they exist.
- **Implications section:** a shortlist of techniques that (a) run in `jweb` THREE r128 (per `knowledge/03-artifacts.md` and `knowledge/12-shaders-webgpu.md`), (b) hit 60fps on integrated GPU, (c) honour `prefers-reduced-motion`.
- **Search seeds:** "biome shader ShaderToy", "nebula fragment shader Three.js", "bioluminescent forest WebGL", "underwater caustics shader", "cyberpunk grid scanline shader", "aurora gradient shader".

### R7 — Ableton Integration Surface
- **Must answer (M4L track):** the exact `live.api`, `live.observer`, `pattr`, `jweb`, `js`, `midiout`, `outlet`, `dict` calls needed for: read tempo, read transport, read track-routing, write MIDI notes to the device's track, persist pattern data in the Live set, drag-out MIDI clip.
- **Must answer (JUCE track):** equivalent VST3 SDK calls — `IAudioProcessor::process` MIDI events, `ProcessContext::tempo`, `IPlugView`, `IAttributeList` persistence, drag-out via OS-level DnD.
- **Implications section:** a mapping table "BiomeBeats need ↔ M4L primitive ↔ JUCE primitive".
- **Source mix:** Cycling74 LOM docs, `claude-creative-stack/knowledge/11-creative-connectors.md` §11.4, JUCE tutorials, Steinberg VST3 SDK docs.

### R8 — Audio Engine Capabilities
- **Must answer:** what's already covered in `knowledge/07-audio.md` (Tone.js, Bjorklund Euclidean, scale utils) so we don't re-research; remaining gaps for chord-aware sequencing; polyrhythm timing accuracy of `Tone.Transport` vs raw `AudioContext.currentTime` vs Max's transport.
- **Implications section:** which engine drives the *runtime clock* in each form factor (artifact: Tone.Transport; M4L: Max transport; JUCE: host PPQ).

### R9 — UX & Interaction Model
- **Must answer:** primary interactions (click-to-arm, drag-to-pitch, right-click popover, scrub, keyboard shortcuts), MIDI-controller mappability, touch behaviour (M4L on iPad via Live 12?), accessibility (slice-as-button labels, focus ring on radial layout, reduced-motion shader fallback), onboarding (first-run pattern, biome tour).
- **Implications section:** a 1-page interaction spec ready to feed a Figma frame.

### R10 — Synthesis & Recommendations
- **Must answer:** "If you only read one document about this project, this is it." Pulls TL;DRs of R1–R9 + the locked decisions: form factor, biomes, sequencer data shape, visual stack, Ableton integration approach, MVP scope, phase plan.
- **Output also seeds:** the next planning round (design/implementation plan) — explicitly lists open questions to ask the user before coding begins.

---

## 5. Methodology

- **Parallel agents.** Reports R1, R3, R4, R5, R6, R9 can be assigned to **Explore** or **general-purpose** subagents in parallel (they're independent web/research jobs). Cap at 3 concurrent.
- **R2** must run first or in parallel with R1 because it gates the asset list and may require user input (paste contents) if WebFetch on raw GitHub URLs fails.
- **R7, R8** read `claude-creative-stack/knowledge/*.md` first (Explore agent, single read pass) before any web search — half the answers are already in this repo.
- **R10** is sequential and runs only after R1–R9 are at "draft" status.
- **Citation rule.** Every claim in every report needs a source URL or a repo file path. No bare assertions.
- **Update cadence.** Each report's frontmatter `Last updated` is bumped on every revision; status moves draft → reviewed (human) → locked.
- **De-duplication.** If two reports overlap (e.g., R1 and R4 both touch swing), the canonical home is the lower-numbered report; the other links to it.

---

## 6. Directory Layout to Create

```
research/biome-beats/
├── README.md                              # index + status table for the 10 reports
├── HANDOFF.md                             # operational handoff to the executing agent
├── PLAN.md                                # this file
├── 01-beat-scholar-deep-dive.md
├── 02-cosmic-chord-synth-asset-inventory.md
├── 03-form-factor-m4l-vs-juce.md
├── 04-radial-polyrhythmic-prior-art.md
├── 05-chord-melody-sequencer-patterns.md
├── 06-visual-magnificence-references.md
├── 07-ableton-integration-surface.md
├── 08-audio-engine-capabilities.md
├── 09-ux-interaction-model.md
├── 10-synthesis-and-recommendations.md
└── assets/                                # downloaded screenshots, palette swatches, shader thumbnails
```

`research/biome-beats/README.md` is the single front door — it lists every report with status (draft/reviewed/locked), owner, last-updated, and a 30-word abstract. The user reads only the README until they want to dive into a specific report.

---

## 7. Acceptance Criteria

The research phase is **done** when:

1. All scoped reports exist at the path above with `Status: reviewed` (human signed off).
2. R10 contains a single locked recommendation for: form factor, biome set, sequencer data shape, visual stack, integration approach, MVP scope.
3. Every report's "Open questions" section is empty *or* every open question has been escalated to the user via `AskUserQuestion` and answered.
4. `research/biome-beats/assets/` contains: 5 biome palette swatches (oklch + hex), 5 shader thumbnails, ≥3 Beat Scholar UI screenshots (or hand-traced wireframes if licence forbids reuse), 1 decision-matrix image for R3.
5. The README index renders cleanly on GitHub (tables, links work, no broken anchors).

Only when all five hold do we move to the **design** phase (separate plan file).

---

## 8. Critical Files in `claude-creative-stack` Already Referenced

These don't get edited during the research phase — but R7, R8, R10 will *cite* them, so any executing agent should read them first:

- `CLAUDE.md` — routing, defaults, artifact constraints reminders.
- `knowledge/03-artifacts.md` §3.2, §3.5 — sandbox whitelist, constraints (also apply inside M4L `jweb`).
- `knowledge/04-animation.md` — composite-only animation rules.
- `knowledge/07-audio.md` §7.1, §7.5 — Tone.js Sequence + Bjorklund Euclidean.
- `knowledge/11-creative-connectors.md` §11.4 — Ableton MCP / M4L install + LOM tools.
- `knowledge/12-shaders-webgpu.md` — shader patterns.
- `knowledge/14-accessibility-performance.md` — INP, reduced-motion.
- `knowledge/99-caveats.md` — version-drift warnings.
- `artifacts/html/tone-procmusic.html` — Tone.js sequence skeleton (R8 reference).
- `artifacts/html/audio-visualizer.html` — `AnalyserNode` FFT loop (R8 reference).
- `artifacts/html/three-r128-scene.html` — THREE r128 boilerplate (R6 reference).
- `skills/artifact-game-builder/SKILL.md` — skill template (referenced by R10's downstream design plan).
- `skills/palette-generator/`, `skills/shader-smith/`, `skills/critique-loop/`, `skills/procgen-toolkit/` — reusable skills (R6, R8 reference).

---

## 9. Verification (of the research output, not of code)

After R10 lands and before opening the design plan:

1. **Spot-check citations.** Pick 5 random claims across R1–R9; click the cited source; confirm the claim is supported. ≥4/5 must pass.
2. **Compare R3 recommendation against the user's intent.** The user explicitly asked us to *consider* JUCE because Beat Scholar uses it. R3's recommendation must engage with that — not bury it.
3. **Confirm R2 stays inside the user's clarified scope:** *world and assets only*, not the AI-DJ engine. Grep R2 for "AI DJ" or "phase engine" — those terms should appear only in an explicit "out of scope" section.
4. **Skim the README index in GitHub preview** — every link resolves, every report has a TL;DR, status table is current.
5. **Open-question liquidation.** Pull every report's "Open questions" into a single list; every item must be either answered, deferred-with-rationale, or queued for the next user-Q&A round.

---

## 10. Risks & Mitigations

- **GitHub MCP scope.** This session can only read `barmoshe/claude-creative-stack`. R2 needs `barmoshe/cosmic-chord-synth`. **Mitigation:** WebFetch on raw GitHub URLs (public repo, works); fall back to asking the user to paste specific files.
- **Web fetch flakiness.** Several review sites (Modalics, Attack Magazine) returned 403 during scoping. **Mitigation:** rotate sources (MusicRadar, Synthtopia, KVR, Gearspace, YouTube transcripts, archive.org) — no single-source claims allowed.
- **Scope creep into design.** Easy to slide from "research" into "deciding the data model". **Mitigation:** every report ends at "Implications" — concrete options, *not* a chosen path. The single decision doc is R10, and only R10.
- **Stale model/version IDs.** Per `knowledge/99-caveats.md`, do not hard-code Anthropic model IDs in any report; phrase as "the latest Claude model at time of writing".
- **User-time cost.** Reading 10 reports is a lot. **Mitigation:** the README index + every report's 150-word TL;DR mean the user can stay at index-level until something specific catches their eye.
