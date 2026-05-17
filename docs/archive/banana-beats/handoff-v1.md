# Banana Beats — Build Agent Handoff

> **You are a build agent.** This document is everything you need to build a monkey/banana-themed beat sequencer as a single HTML artifact. Follow the steps in order. Do not deviate from the spec unless a checkpoint fails.

---

## Target

**File**: `artifacts/html/banana-beats.html`
**Type**: Single-file HTML artifact (Claude.ai compatible)
**LOC budget**: 1200–1800 lines
**Theme**: Jungle monkey + banana, dark mode, oklch colors

---

## Stack & CDN (exact URLs)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/phaser@4.0.0/dist/phaser.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/tone@15.0.4/build/Tone.js"></script>
```

**No JSX transform** — use `const h = React.createElement;` throughout.

---

## Build Order

### Step 1: Generate Palette (MCP calls)

```
palette-oklch.generate_palette({ hue: 95, mode: "dark" })   → banana-yellow tokens
palette-oklch.generate_palette({ hue: 140, mode: "dark" })  → jungle-green tokens
palette-oklch.chart_palette({ hueStart: 30 })                → per-track colors (5 categorical)
palette-oklch.contrast_check({ foreground: {L:0.95,C:0.02,h:95}, background: {L:0.18,C:0.04,h:140} })  → verify ≥4.5:1
```

Bake results into CSS `:root` custom properties. Fallback values from research doc §4 (lines 287–301):

```css
:root {
  --bg: oklch(0.18 0.04 140);
  --surface: oklch(0.22 0.05 140);
  --border: oklch(0.30 0.05 140);
  --text: oklch(0.95 0.02 95);
  --text-muted: oklch(0.70 0.03 95);
  --accent: oklch(0.85 0.18 95);
  --accent-hi: oklch(0.92 0.18 95);
  --accent-2: oklch(0.65 0.20 320);
  --accent-3: oklch(0.75 0.15 200);
}
```

### Step 2: Generate AI Assets (optional)

```
asset-router.generate_image({
  prompt: "2D sprite sheet of a small cartoon monkey character, retro 16-bit pixel art style, clean outlines, transparent background, 32x32 frames, 4 frames each for poses: idle (neutral, slight breath bob), nod (head tilts to beat), dance (arms up, tail curled), freakout (mouth open, hands on head, sweat drop), yawn (mouth wide, one arm stretching). Tropical jungle palette: warm golden brown fur, banana-yellow highlights, large round eyes. Side view facing right, consistent silhouette across all frames.",
  style: "pixel",
  ratio: "4:3"
})

asset-router.generate_image({
  prompt: "Cartoon jungle scene background, 16:9, layered for parallax, saturated tropical palette, banana-yellow sun, deep greens, magenta orchid accents, cyan sky, flat illustration style, no characters, no text, painterly brush textures, gentle depth, leaves with chunky outlines, golden-hour lighting. Mood: chill",
  style: "stylized",
  ratio: "16:9"
})
```

If images are generated, download and convert to base64 data URIs. If not available, use procedural fallbacks (the artifact MUST work without AI assets).

### Step 3: Build HTML Skeleton

Create `artifacts/html/banana-beats.html`:
- DOCTYPE + head + meta + title
- `<style>` block with all CSS custom properties, layout grid, component styles
- `<body>` with `<div id="root"></div>` (React mount) and `<div id="phaser-host"></div>`
- CDN script tags (4 scripts above)
- Opening `<script>` tag for all app code

**Checkpoint**: file loads in browser, shows styled empty page.

### Step 4: Utilities (~50 LOC)

```js
// Seeded PRNG
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Euclidean rhythm (Bjorklund)
function euclidean(steps, hits) {
  if (hits <= 0) return new Array(steps).fill(false);
  if (hits >= steps) return new Array(steps).fill(true);
  const p = [];
  for (let i = 0; i < steps; i++)
    p.push(Math.floor(i * hits / steps) !== Math.floor((i-1) * hits / steps));
  return p;
}

// Event bus
const bus = { _h:{}, on(e,f){(this._h[e]||=[]).push(f);}, off(e,f){this._h[e]=(this._h[e]||[]).filter(x=>x!==f);}, emit(e,d){(this._h[e]||[]).forEach(f=>f(d));} };
```

Also implement: `markovGenerate(table, length, seed)`, `densityNoise(steps, density, seed)`.

### Step 5: Audio Engine (~90 LOC)

**8 synths** (reference: research doc §2 Track 1):

| # | Name | Synth | Key params |
|---|------|-------|-----------|
| 0 | Kick | `MembraneSynth` | pitchDecay:0.05, octaves:6, decay:0.3 |
| 1 | Snare | `NoiseSynth` | band-pass filter 1000Hz, decay:0.15 |
| 2 | Closed Hat | `NoiseSynth` | HP filter, decay:0.08 |
| 3 | Open Hat | `NoiseSynth` | HP filter, decay:0.3 |
| 4 | Bongo | `MembraneSynth` | frequency:200, decay:0.2 |
| 5 | Shaker | `NoiseSynth` | HP 3000Hz, decay:0.05 |
| 6 | Bass | `MonoSynth` | square, filter Q:1 |
| 7 | Lead | `Synth` | triangle |

**Audio graph**:
```
Synths[0..7] → per-track Gain → per-track Panner
  ├→ FX Send 1 (Reverb, wet:0.3, decay:4)
  ├→ FX Send 2 (FeedbackDelay, wet:0.2, delayTime:"8n")
  └→ Master Gain → Limiter(threshold:-3) → Destination
```

**Transport + Sequences**:
```js
tracks.forEach((track, i) => {
  new Tone.Sequence((time, step) => {
    if (track.pattern[step]) {
      // trigger synth at audio time
      synths[i].triggerAttackRelease(/*note/dur*/, time);
    }
    // bridge to visuals via Tone.Draw
    Tone.Draw.schedule(() => {
      bus.emit("step", { track: i, step, active: track.pattern[step] });
    }, time);
  }, [...Array(16).keys()], "16n").start(0);
});
```

**Play button handler**: `await Tone.start(); Tone.Transport.bpm.value = state.bpm; Tone.Transport.start();`

**Checkpoint**: click Play → hear kick + snare + hat patterns. BPM slider changes tempo.

### Step 6: React App + Sequencer Grid (~200 LOC)

```js
const h = React.createElement;
const { useState, useEffect, useRef, useReducer, useCallback, useContext, createContext } = React;
```

**State shape** (research doc §5):
```js
const initialState = {
  bpm: 96, seed: 42, isPlaying: false,
  activeTab: "seq", vibe: "chill",
  tracks: [ /* 8 TrackSpec objects */ ],
  fx: [ /* 4 FxSlot objects */ ],
  master: { gain: 0.8, limiter: true },
  character: { state: "idle", trauma: 0, facing: 1 },
  presets: []
};
```

**Component tree**: `App > Header + PhaserStage + TabBar + (SequencerGrid | MixerTab | FxTab | PresetTab)`

**SequencerGrid**: 8 rows × 16 `<button>` cells. Each cell: `onClick` → `dispatch({ type:"TOGGLE_STEP", trackId, step })`. Current step highlighted via `bus.on("step")` subscription.

**Checkpoint**: grid renders, cells toggle, step indicator sweeps in sync with audio.

### Step 7: Phaser Stage (~200 LOC)

```js
function PhaserStage() {
  const ref = useRef(null);
  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO, parent: ref.current,
      width: 640, height: 280, transparent: true,
      scene: { create: stageCreate, update: stageUpdate }
    });
    return () => game.destroy(true);
  }, []);
  return h("div", { ref, style: { borderRadius:"12px", overflow:"hidden" } });
}
```

**stageCreate**:
- Draw gradient background (or load AI texture if available)
- Create procedural monkey: body (brown oval), head (circle + eyes + mouth), tail (bezier), arm (line)
- Set up 3 particle emitters: dust, banana-confetti, sparks
- Add Filters: `Bloom` (camera, strength:0.3), `Vignette` (camera)
- Subscribe to bus events for audio-reactive animations

**stageUpdate**:
- Tick character FSM (see states in research doc §3)
- Body bounce: `body.y = baseY - Math.abs(Math.sin(beatPhase * PI)) * amp`
- Tail follow-through: `tail.angle = lerp(tail.angle, body.y * 0.3, 0.2)`
- Decay trauma: `trauma = max(0, trauma - 0.025)`
- Apply shake: `cam.setScroll((rand()*2-1)*12*trauma², (rand()*2-1)*12*trauma²)`

**Audio event reactions** (via bus):
- `"kick"` → `addTrauma(0.35)` + ColorMatrix tint flash
- `"snare"` → dust burst at monkey feet
- `"hat"` → head bob tween (y -2, yoyo, 50ms)
- `"bass"` → body squash (scaleY 0.92, 120ms)
- `"lead"` → tail wag amplitude bump
- `"accent"` (every 4th step) → banana confetti burst (16 particles)
- `"loopWrap"` (step 0) → camera flash (white overlay 50ms)

**Checkpoint**: monkey visible, bounces to beat, particles fire on hits.

### Step 8: Mixer + FX + Presets Tabs (~250 LOC)

**MixerTab**: 8 rows — name, gain `<input type="range">`, pan range, mute/solo buttons, FX send sliders.

**FxTab**: 4 slots — type dropdown, 3 param ranges, wet/dry range, on/off toggle.

**PresetTab**: save (name input + button), load (list with play buttons), delete, export/import JSON.

**Checkpoint**: all tabs switch correctly, mixer changes audible, FX wet/dry works, presets persist.

### Step 9: Polish (~150 LOC)

- **Keyboard**: Space=play/stop, R=reroll, 1-8=reroll track, M=mute focused track
- **Persistence**: `window.storage.set("banana-beats-state", JSON.stringify({...}))` debounced 500ms
- **prefers-reduced-motion**: `matchMedia("(prefers-reduced-motion: reduce)")` → skip particles, shake, squash; set bloom to 0; CSS transitions → opacity-only
- **Vibe switcher**: chill (green accent), sunset (orange accent), rave (magenta accent) — swaps CSS vars + background
- **Accessibility**: `aria-label` on cells ("Kick step 3, active"), `role="application"` on canvas, `aria-live="polite"` region

**Checkpoint**: full feature set, keyboard works, state persists, reduced motion respected.

### Step 10: AI Asset Swap (if available)

If AI images were generated in Step 2:
- Replace procedural monkey draw calls with spritesheet texture loaded from base64 data URI
- Replace gradient background with AI jungle image
- Add provenance comments

**Final checkpoint**: production-ready artifact.

---

## Key Patterns (copy-paste ready)

### Euclidean pattern
See `artifacts/html/tone-procmusic.html` line 46–52.

### Phaser 4 game init
See `artifacts/html/phaser4-platformer.html` line 92–96.

### Trauma shake
See `artifacts/react/game-ecs-starter.jsx` line 101–108.

### Audio context unlock
```js
playBtn.addEventListener("click", async () => {
  await Tone.start();
  Tone.Transport.start();
});
```

### Storage (artifact-safe)
```js
async function saveState(state) {
  try { await window.storage.set("banana-beats-state", JSON.stringify(state)); } catch {}
}
async function loadState() {
  try { const r = await window.storage.get("banana-beats-state"); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
```

---

## Reference Documents

| Doc | What to look up |
|-----|----------------|
| `research-monkey-sequencer.md` §1 | TL;DR architecture summary |
| `research-monkey-sequencer.md` §2 Track 1 | Pattern generation API, 8-track table, audio sync pattern |
| `research-monkey-sequencer.md` §2 Track 3 | Animation routing matrix, character FSM, particle specs |
| `research-monkey-sequencer.md` §2 Track 4 | Asset matrix, AI prompts, color palette CSS block |
| `research-monkey-sequencer.md` §2 Track 5 | UI wireframes, state shape (TypeScript), reducer actions, keyboard map |
| `knowledge/03-artifacts.md` | Sandbox constraints (CDN allowlist, storage API, blocked APIs) |

---

## Acceptance Criteria

- [ ] File loads without console errors
- [ ] All 4 CDN scripts load successfully
- [ ] Click Play → audio context unlocks, 8 tracks produce sound
- [ ] BPM slider changes tempo in real-time (60–140 range)
- [ ] Sequencer grid: 8 rows × 16 cells, click toggles steps, step indicator sweeps
- [ ] Reroll button generates new random patterns (seeded)
- [ ] Monkey character visible in Phaser stage, bounces to beat
- [ ] Character FSM: idle → nod (on play) → dance (after 4 bars)
- [ ] Kick hits: screen shakes (trauma-based)
- [ ] Snare hits: dust particles at monkey feet
- [ ] Accent steps: banana confetti burst
- [ ] Mixer tab: gain/pan/mute/solo per track
- [ ] FX tab: reverb + delay audible with wet/dry control
- [ ] Presets tab: save/load/delete works
- [ ] Keyboard: Space=play/stop, R=reroll
- [ ] `prefers-reduced-motion`: no particles, no shake, opacity-only transitions
- [ ] State persists via `window.storage` (published artifact)
- [ ] Total file size < 100KB (excluding inlined images)
- [ ] 60fps on mid-range hardware during playback
