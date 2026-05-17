# Banana Beats — Implementation Plan

## Context

We've completed comprehensive research for a **monkey/banana-themed beat sequencer** (documented in `research-monkey-sequencer.md`). All architectural decisions are made. This plan covers the full build: asset generation → single-file HTML artifact → verification.

The goal: a playable, visually rich 8-track beat sequencer running as a Claude artifact, with procedural audio (Euclidean rhythms + Markov melodies), an animated monkey character, particle effects, and jungle theming.

---

## Pre-Implementation: Documentation

### Step 0: Save plan + handoff to repo
1. Save this plan as `plan-v1.md` in the repo root
2. Create `handoff-v1.md` — a concise agent-executable handoff document containing:
   - Project summary (what to build, target file path)
   - Stack & CDN URLs (exact versions)
   - Build order (numbered steps with checkpoints)
   - Asset generation commands (MCP tool calls with exact params)
   - Key code patterns to follow (audio sync, React in HTML, Phaser embed)
   - References to research doc sections for each decision
   - Acceptance criteria checklist

The handoff is the single document a build agent reads to execute the entire project without needing to re-read the research findings or this plan.

---

## Architecture

**Single HTML artifact** at `artifacts/html/banana-beats.html` (~1200–1800 LOC)

| Layer | Technology | Role |
|-------|-----------|------|
| Audio | Tone.js v15.0.4 (jsdelivr CDN) | 8-track synths, Transport, Sequences, FX chain |
| Stage | Phaser 4.0.0 (jsdelivr CDN) | Monkey character, particles, filters, jungle BG |
| UI | React 18.3.1 (cdnjs CDN) + vanilla CSS | Sequencer grid, tabs, mixer, FX, presets |
| State | `useReducer` + event bus | Single state tree, debounced `window.storage` persistence |

CDNs confirmed working in existing repo artifacts (`phaser4-platformer.html`, `tone-procmusic.html`).

---

## Phase 0: Pre-Build Asset Generation

Run MCP calls before writing the artifact. All outputs baked as inline data URIs.

### 0.1 Color Palette
- `palette-oklch.generate_palette({ hue: 95, mode: "dark" })` → banana-yellow tokens
- `palette-oklch.generate_palette({ hue: 140, mode: "dark" })` → jungle-green tokens
- `palette-oklch.chart_palette({ hueStart: 30 })` → per-track colors
- `palette-oklch.contrast_check()` → verify text/bg ≥ 4.5:1

### 0.2 AI Images (optional — procedural fallback always works)
- **Monkey sprite**: `asset-router.generate_image({ prompt: "2D sprite sheet cartoon monkey, 16-bit pixel art, 32x32 frames, 5 poses (idle/nod/dance/freakout/yawn), tropical jungle palette, transparent bg", style: "pixel", ratio: "4:3" })`
- **Jungle backgrounds (×3 vibes)**: `asset-router.generate_image({ prompt: "Cartoon jungle scene, layered parallax, saturated tropical, flat illustration, no characters. Mood: {chill|sunset|rave}", style: "stylized", ratio: "16:9" })`
- Estimated cost: ~$0.32 total
- Convert to base64 data URIs; cap total <500KB

### 0.3 Fallbacks
- Monkey → procedural Canvas primitives (circle head, oval body, line tail/arms)
- Backgrounds → CSS radial gradients (deep greens + golden sky)

---

## Phase 1: Build the Artifact

### File: `artifacts/html/banana-beats.html`

### Layer 1: Skeleton (~200 LOC)
- HTML boilerplate, `<style>` with oklch CSS custom properties
- Layout: CSS Grid (header / stage / tabs / content), viewport-locked
- Component styles: `.seq-cell`, `.tab-btn`, `.knob`, `.mixer-row`
- `@keyframes` for pulse, glow-border, shuffle
- `@media (prefers-reduced-motion: reduce)` overrides
- CDN `<script>` tags (React, ReactDOM, Phaser 4, Tone.js)
- React mount point + Phaser host div
- **Checkpoint**: page loads, shows "BANANA BEATS" header

### Layer 2: Audio Core (~250 LOC)
- `mulberry32()` seeded PRNG
- `euclidean(steps, hits)` pattern generator (Bjorklund)
- Markov chain generator (for bass/lead tracks)
- Density noise generator (for shaker track)
- 8 synth definitions per research spec:
  - Kick: `MembraneSynth` low, Euclidean k=4 n=16
  - Snare: `NoiseSynth` band-passed, Euclidean k=2 n=16
  - Closed Hat: `NoiseSynth` short, Euclidean k=11 n=16
  - Open Hat: `NoiseSynth` long, Euclidean k=3 n=16
  - Perc/Bongo: `MembraneSynth` mid, Euclidean k=5 n=16
  - Banana Shaker: `NoiseSynth` HP, density=0.6
  - Bass: `MonoSynth` square, Markov order=2 dorian
  - Lead: `Synth` triangle, Markov order=1 pentatonic
- Audio graph: synths → per-track Gain/Pan → FX sends (Reverb, Delay) → Master → Limiter → Destination
- 8 `Tone.Sequence` instances with `Tone.Draw.schedule` bridge to event bus
- `await Tone.start()` on user gesture
- **Checkpoint**: click Play → hear kick+snare+hat patterns, BPM slider works

### Layer 3: Sequencer Grid (~150 LOC)
- React `SequencerGrid` component: 8 rows × 16 `<button>` cells
- `onClick` toggles step in state
- Current-step vertical bar indicator (synced via event bus)
- Per-track: name label, generator type dropdown, param controls, reroll button
- Track color-coded using chart palette tokens
- **Checkpoint**: grid synced to audio, toggling cells changes sound

### Layer 4: Phaser Stage (~200 LOC)
- `PhaserStage` React component: `useEffect` creates `Phaser.Game` in a `<div ref>`
- Jungle background (AI image texture or gradient fallback)
- Procedural monkey character: multi-part rig (body/head/tail/arm as separate sprites)
- Character FSM:
  - `idle` → `nod` (transport starts)
  - `nod` → `dance` (≥4 bars)
  - `dance` → `freakout` (trauma ≥ 0.7 OR density ≥ 0.85)
  - `*` → `idle` (transport stops)
  - `idle` → `sleep` (30s no input)
  - `sleep` → `yawn` → `idle` (any input)
- Per-tick animation: body bounce synced to beat, tail follow-through, arm IK
- **Checkpoint**: monkey visible, bounces to beat, state transitions work

### Layer 5: Juice (~150 LOC)
- 3 particle emitters (pre-pooled): dust (gray), banana-confetti (yellow), sparks (bright)
- Animation matrix:
  - Kick → `addTrauma(0.35)` + ColorMatrix tint flash 60ms
  - Snare → dust puff at character feet
  - Hat → head bob tween
  - Bass → body squash scaleY 1→0.92→1 over 120ms
  - Lead → tail wag amplitude bump
  - Every 4th step → banana confetti burst (16 particles)
  - Loop wrap → camera flash (white overlay 50ms)
  - Reroll → grid shuffle animation
  - BPM >120 → Bloom strength scales up
- Phaser Filters: `Bloom` on camera (subtle), `Vignette` on camera
- Trauma-based shake: `trauma²` scaling, decay per frame
- **Checkpoint**: full visual sync — kick shakes, snare puffs, confetti flies

### Layer 6: Tabs UI (~250 LOC)
- `TabBar` component: Sequencer | Mixer | FX | Presets
- `MixerTab`: 8 rows with gain slider, pan, mute/solo buttons, FX send amounts
- `FxTab`: 4 slots — type dropdown (Reverb/Delay/Filter/Distortion/BitCrusher/Chorus), 3 param sliders, wet/dry, on/off
- `PresetTab`: save/load/delete list, export/import JSON buttons
- **Checkpoint**: all tabs functional, FX audible, presets save/load

### Layer 7: Polish (~200 LOC)
- Vibe switcher (chill/sunset/rave) → swaps BG + palette accent
- Keyboard shortcuts: Space=play/stop, R=reroll, 1-8=reroll track, M=mute, Tab=cycle
- `window.storage` persistence: single combined key, debounced 500ms writes, try/catch wrapped
- `prefers-reduced-motion`: skip particles/shake/squash, bloom=0, CSS animations→opacity-only
- Remaining character states: freakout, sleep, yawn
- `aria-label` on grid cells, `role="application"` on canvas, `aria-live="polite"` announcements
- **Checkpoint**: full feature set, persists across reload, accessible

### Layer 8: AI Assets (~50 LOC of inlined data)
- Swap procedural monkey with AI sprite sheet (if generated in Phase 0)
- Swap gradient BG with AI jungle backgrounds (if generated)
- **Final checkpoint**: production-ready artifact

---

## Technical Notes

### React in HTML artifact (no JSX)
```js
const h = React.createElement;
const { useState, useEffect, useRef, useReducer } = React;
// Use h("div", { className: "foo" }, h("span", null, "text"))
```

### Audio-to-visual sync (ONLY correct pattern)
```js
new Tone.Sequence((time, stepIdx) => {
  if (pattern[stepIdx]) synth.triggerAttackRelease(..., time);
  Tone.Draw.schedule(() => bus.emit("step", { stepIdx }), time);
}, [...Array(16).keys()], "16n").start(0);
```

### State shape (from research doc)
```ts
AppState { bpm, seed, isPlaying, activeTab, vibe, tracks[8], fx[4], master, character, presets[] }
```

### Reducer actions
`PLAY`, `STOP`, `SET_BPM`, `REROLL_ALL`, `REROLL_TRACK`, `TOGGLE_STEP`, `SET_GAIN`, `MUTE`, `SOLO`, `SET_FX_PARAM`, `SAVE_PRESET`, `LOAD_PRESET`, `DELETE_PRESET`, `SET_TAB`, `SET_VIBE`

---

## Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| jsdelivr CDN blocked | Disproven by 5+ existing artifacts; fallback: vanilla Canvas 2D + raw Web Audio |
| React CDN untested in HTML artifacts | Fallback: vanilla DOM (proven in last-radio-station.html) |
| AI images fail / bad output | Procedural fallback always works; AI is visual upgrade only |
| File too large | Budget 1400 LOC; largest existing is 811; cap base64 images <500KB |
| Audio-visual drift | `Tone.Draw.schedule()` only; never rAF counting |
| Phaser + React conflicts | Loose coupling via event bus; Phaser in useEffect with destroy cleanup |
| Performance (8 synths + particles) | Cap 200 particles; SpriteGPULayer; detect low-end via hardwareConcurrency |

---

## Critical Files

| File | Purpose |
|------|---------|
| `research-monkey-sequencer.md` | Complete spec: tracks, state, FSM, animation matrix, prompts |
| `artifacts/html/tone-procmusic.html` | Tone.js audio pattern (euclidean, Transport, synths) |
| `artifacts/html/phaser4-platformer.html` | Phaser 4 pattern (Game config, sprites, squash/stretch) |
| `artifacts/html/last-radio-station.html` | Complex HTML artifact reference (oklch, Tone.js, storage) |
| `artifacts/react/game-ecs-starter.jsx` | Canvas 2D + trauma shake pattern |
| `knowledge/03-artifacts.md` | Sandbox constraints (CDN allowlist, storage API) |

---

## Verification

1. **Open** `artifacts/html/banana-beats.html` in browser
2. **Audio**: Play → all 8 tracks audible, BPM slider responsive, mute/solo work, FX audible
3. **Visual sync**: step indicator matches audio, no drift after 1 min
4. **Grid**: toggle cells → pattern changes, reroll generates new patterns
5. **Character**: FSM transitions (idle→nod→dance), reactions to audio events
6. **Juice**: kick shakes screen, snare puffs dust, accent drops confetti
7. **Tabs**: mixer/fx/presets all functional
8. **Persistence**: reload page → state restored (published artifact only)
9. **Reduced motion**: emulate in DevTools → no particles/shake, opacity-only transitions
10. **Keyboard**: Space/R/1-8/M/Tab shortcuts work
11. **Console**: no errors, no failed CDN loads
