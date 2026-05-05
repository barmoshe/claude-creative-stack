# BiomeBeats Research — Handoff to the Next Agent

> You are picking up a research project cold. Read this file first, then `PLAN.md` (the approved plan you are executing). Together they should be enough to start work without going back to the user.

---

## 1. The 60-second briefing

The user (`barmoshe`) wants a new **Ableton plug-in** that fuses two anchors:

- **Beat Scholar** (Modalics, JUCE-based VST3/AU/CLAP) — circular "pizza" step sequencer, polyrhythmic per-row subdivisions (3..42 slices), negative swing, drag-out MIDI. We borrow its **radial UX**.
- **`barmoshe/cosmic-chord-synth`** (a.k.a. *biome-synth*; live demo at biome-synth.lovable.app) — React 18 + TypeScript + Vite + Tone.js + Three.js, with five biomes: **Space, Jungle, Sea, Cyberpunk, Tundra**. We borrow its **world and assets only**.

**Working name:** BiomeBeats (open to change).

**Two scope boundaries the user has explicitly set — do not violate:**

1. **Chord/melody-forward, not drum-forward.** Each slice plays *notes/chords* in the biome's scale; drums are a per-biome accent layer, not the centrepiece. The lineage is *cosmic-chord-synth*, not a drum machine.
2. **From cosmic-chord-synth, reuse only the *world and assets* — NOT the AI-DJ engine, NOT the DRIFT→PULSE→BLOOM→SURGE→DISSOLVE phase logic.** BiomeBeats has its own deterministic, user-driven sequencing engine. If you find yourself describing or porting AI-DJ logic, stop.

---

## 2. Your deliverable

A set of markdown reports under `research/biome-beats/`. **Fast-track scope** (decided this session): produce **R1, R2, R3, R10** in that order of priority. The other six reports (R4–R9) are scoped in `PLAN.md` §4 and may be added later only if R10 surfaces an unfilled gap.

Report skeleton (every report uses this exact shape):

```
# <Report Title>
> Status: draft | reviewed | locked
> Owner: <agent name>   Last updated: <ISO date>

## TL;DR (≤150 words)
## Scope & questions
## Findings (with inline citations)
## Implications for BiomeBeats
## Open questions
## Sources
```

Lengths and source mix per report: see `PLAN.md` §3 table.

**R10 (Synthesis) is the only report that makes recommendations.** R1, R2, R3 must end at "Implications: here are the options" — *not* "here is the chosen path".

---

## 3. Defaults already locked this session

You do not need to re-ask the user about these:

| Decision | Value |
|---|---|
| Scope | Fast-track: R1, R2, R3, R10 |
| R10 audience | Collaborator-grade: polished but informal, full citations, every acronym defined first time |
| Asset licence (`cosmic-chord-synth`) | **Unconfirmed.** R2 must read its `LICENSE` file first and flag back if it forbids mirroring. Until confirmed, treat as *reference-only* — describe and link, do not copy code. |
| Post-research checkpoint | Decide after R10 lands |
| Biome set | Reuse the 5 from cosmic-chord-synth (Space/Jungle/Sea/Cyberpunk/Tundra) — for visual identity only |
| Form factor | **Open** — explicitly weigh Max for Live vs JUCE in R3 (Beat Scholar is JUCE; user asked us to consider both) |

---

## 4. Pre-flight intelligence (don't re-discover this)

These facts were already verified in scoping. Cite them directly; you only need to *deepen* them.

### Beat Scholar (Modalics)
- Built in **JUCE**; ships as VST3, AU, AAX, CLAP and standalone — explicitly **not** a Max for Live device. Source: KVR forum + Gearspace + ADSR coverage.
- Each beat is rendered as a **circle ("pizza")**, sliceable up to **42 slices**, allowing triplets/septuplets/32nds; per-row subdivisions enable polyrhythm.
- Supports **negative swing**, multiple time-signature **sections** per pattern, drag-out MIDI patterns into the DAW timeline.
- Sample browser, built-in effects, multi-channel audio out, MIDI-out to other instruments.
- Reviews: MusicRadar, Attack Magazine, Audio Plugin Guy, Sound & Design (Medium). Founder vision quote on MusicRadar.
- **Hostile sources during scoping:** `modalics.com` and `attackmagazine.com` returned 403 to WebFetch. Use `musicradar.com`, `synthtopia.com`, `kvraudio.com`, `gearspace.com`, `audiopluginguy.com`, `soundand.design`, and the Loopy Pro forum walkthrough as primary sources. Rotate; never single-source a claim.

### cosmic-chord-synth (`barmoshe/cosmic-chord-synth`)
- Public repo on GitHub. **GitHub MCP in this session is scoped to `barmoshe/claude-creative-stack` only**, so you cannot use `mcp__github__get_file_contents` for it. Use **WebFetch on raw GitHub URLs** (`https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/<path>`) — that worked for the README during scoping.
- Tagline (from README): *"A playable world. Touch to make music across five biomes — space, jungle, sea, cyberpunk, and tundra — or let the AI DJ compose."*
- Stack: React 18 + TypeScript + Vite, Tone.js for synthesis, Three.js + GLSL shaders (visible Space biome), Tailwind + shadcn/ui.
- Five musical sections in the AI DJ: DRIFT → PULSE → BLOOM → SURGE → DISSOLVE. **You will not catalog or port this.** Mention it once in R2 as "out of scope".
- Run locally: `npm install && npm run dev` → `http://localhost:8080`. Live: `https://biome-synth.lovable.app/`.
- Likely files of interest for R2: `src/biomes/*` (per-biome data — palettes, scales, sample names), `public/` (any textures/audio), `src/shaders/*` if present, `LICENSE`. Probe with WebFetch on raw URLs.

### claude-creative-stack (this repo)
- `CLAUDE.md` is the routing doc — read first.
- `knowledge/07-audio.md` already covers Tone.js `Sequence`/`PolySynth`, Web Audio `AnalyserNode` FFT, jsfxr/ZzFX, Bjorklund Euclidean, scale utilities, Markov chains. **R8 should explicitly defer to it** rather than re-research these.
- `knowledge/11-creative-connectors.md` §11.4 documents the `ableton-mcp` connector and the M4L LOM surface (`live.session`, `live.tempo`, `live.fire_clip`, `live.add_clip`, `live.write_midi`, `live.set_device_param`, `live.bounce`). **R7 should mine this first** before web-searching.
- `knowledge/03-artifacts.md` §3.2/§3.5 lists the artifact-sandbox library whitelist and constraints (Tone.js ✅, THREE r128 ✅, no `localStorage`, only `window.storage`, only `api.anthropic.com/v1/messages` for fetch). The same constraints apply inside Max for Live `jweb`, so designs can be written once and run in both.
- Useful starters: `artifacts/html/tone-procmusic.html` (Euclidean rhythm Tone.js skeleton), `artifacts/html/audio-visualizer.html` (FFT analyser loop), `artifacts/html/three-r128-scene.html` (THREE r128 boilerplate — note the r128-only / no-CapsuleGeometry / no-addons-OrbitControls rule).
- Reusable skills: `skills/artifact-game-builder/SKILL.md` (skill template shape), `skills/palette-generator/`, `skills/shader-smith/`, `skills/critique-loop/`, `skills/procgen-toolkit/`.

---

## 5. Execution recipe

1. **Read in order:** this file → `PLAN.md` → `CLAUDE.md` → `knowledge/11-creative-connectors.md` §11.4 → `knowledge/07-audio.md` (skim).
2. **Create the README index** at `research/biome-beats/README.md` first, with all four fast-track reports listed `Status: pending`. Update statuses as work progresses.
3. **Launch in parallel** (single message, multiple `Agent` tool calls — cap 3 concurrent):
   - R1 → `general-purpose` agent, web research on Beat Scholar.
   - R2 → `general-purpose` agent, WebFetch on raw GitHub URLs for `cosmic-chord-synth`.
   - R3 → `general-purpose` agent, M4L vs JUCE comparison.
4. **Await all three**, then write **R10** sequentially yourself (or via a `Plan` agent) — it depends on R1–R3 being at draft.
5. **Bump statuses** to `reviewed` after a quick read-through; do not mark `locked` without the user.
6. **Commit cadence:** one commit per report at draft, one final commit when README index is updated and R10 is in.

### Citation rule (non-negotiable)
Every claim ends with a source — URL or repo file path. If you can't cite it, don't say it. If two sources disagree, state both and pick the better-supported one with a note.

### Source rotation (Beat Scholar)
Because `modalics.com` and `attackmagazine.com` 403 against WebFetch, never single-source either of them. Use ≥2 of: MusicRadar, Synthtopia, KVR, Gearspace, Audio Plugin Guy, Sound & Design (Medium), Loopy Pro forum, YouTube walkthrough transcripts (search via WebSearch).

### Asset-licence safety (cosmic-chord-synth)
Read `LICENSE` at the repo root before quoting *any* code or copying *any* asset. If absent or restrictive, R2 mirrors **descriptions and links only**, never the contents. Flag back to the user inline in R2's "Open questions".

---

## 6. Branch and commit conventions

This session's mandated dev branch is **`claude/ableton-sequencer-plugin-plan-q5cSq`**. The user has explicitly asked us to also push the handoff and plan files to **`main`**. Going forward, prefer the dev branch for in-flight reports; merge to main only when a report is at `Status: reviewed`.

Commit message style (matching repo history seen so far): lowercase scope-prefix, imperative mood. Examples:
- `research(biome-beats): scaffold plan and handoff`
- `research(biome-beats): R1 beat scholar deep dive (draft)`
- `research(biome-beats): R10 synthesis (draft)`

Always include the standard footer:

```
https://claude.ai/code/session_<id>
```

Don't push to main without explicit per-action permission for each push (the user gave permission for *this* handoff; treat that scope as exhausted).

---

## 7. Known blockers and their work-arounds

| Blocker | Mitigation |
|---|---|
| GitHub MCP scoped to `claude-creative-stack` only | WebFetch on raw GitHub URLs for `cosmic-chord-synth`; ask user to paste files only as last resort |
| `modalics.com` and `attackmagazine.com` return 403 | Use MusicRadar / Synthtopia / KVR / Gearspace / YouTube transcripts; rotate sources |
| `cosmic-chord-synth` licence unknown | Treat as reference-only until R2 confirms; flag to user |
| Some claims are version-sensitive (JUCE licence, M4L bundling, Anthropic model IDs) | Per `knowledge/99-caveats.md` — phrase as "as of mid-2026, …" with a link, never hard-code |
| Beat Scholar marketing copy is heavy on metaphor ("pizza", "deep-dish") | Ignore the food language; extract concrete numbers (slice limits, time-signature counts, swing range) |

---

## 8. Definition of done (fast-track)

You are done when **all** of these hold:

- [ ] `research/biome-beats/README.md` exists with a status table covering R1, R2, R3, R10.
- [ ] R1, R2, R3 are at `Status: draft` with full skeleton (TL;DR, scope, findings, implications, open questions, sources).
- [ ] R10 is at `Status: draft` and contains a single recommendation for: form factor, biome set, sequencer data shape, visual stack, integration approach, MVP scope.
- [ ] Every report's "Open questions" section is either empty *or* surfaced via `AskUserQuestion`.
- [ ] R3 explicitly engages with the JUCE option (does not bury it) — the user asked for it.
- [ ] R2 never mentions AI-DJ logic outside an "Out of scope" subsection.
- [ ] Every claim has a citation.
- [ ] Commits land on the dev branch with the conventional message format.

---

## 9. After you finish

Report back to the user with:

1. A 5-line summary of R10's locked recommendation.
2. The list of open questions surfaced across all four reports.
3. A proposed next step: either (a) expand to R4–R9, or (b) jump to a design plan based on R10. Do not pick for them — present both and ask.
