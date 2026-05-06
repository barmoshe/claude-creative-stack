# Research Findings — Monkey-Banana Beat Sequencer

> Audience: the build agent. Decisions are made; open questions are flagged at the bottom.

## 1. TL;DR

Build it as a **single React JSX artifact** with a **Phaser 4 character stage embedded in a `<PhaserStage/>` div**, **Tone.js v15** driving 8 tracks via `Tone.Transport` with **Euclidean rhythms as the default generator** (Markov + density-noise as alternates), and a **GSAP 3.14 + Phaser-native particle/filter** stack for juice. **Visuals are 70% procedural Canvas/SVG (UI, particles, banana objects, vines) + 30% AI-generated (monkey character sprite sheet via Recraft v3 pixel-art, jungle background via Flux 1.1 Pro)**, all produced by skills+MCP at *build time* and *cached as data URIs* inside the artifact — never fetched at runtime (sandbox blocks it). State lives in a single Zustand-shaped object in React (no Zustand lib in sandbox; rolled by hand on `useReducer`), persisted to `window.storage` as one combined `app-state` key. Animation feel = squash on every step, particle burst on accent steps, trauma-shake on kicks, Phaser `Filter.Bloom`/`ColorMatrix` for global juice, character state machine driven by audio events through a `Tone.Draw.schedule` → React event bridge.

Default this. Deviate only on the open questions in §3.

---

## 2. Track-by-Track Findings

### Track 1 — Procedural Drum Pattern Generation

**Decision: Euclidean rhythms (Bjorklund) as the default per-track generator, Markov chains for melodic tracks, density-controlled noise as a "wild" mode. Cellular automata kept as an Easter-egg style.**

#### Generator comparison

| Generator | Best for | Musicality (playful vibe) | Determinism w/ seed | Cost |
|---|---|---|---|---|
| **Euclidean (Bjorklund)** | Kick/snare/hat/perc — anything with a meter | High — every (k,n) pair sounds like a real drum pattern (tresillo, cinquillo, 5/8, 7/16). Foundational to Afro-Cuban/Afrobeat which fits "monkey jungle". | Trivial: `(k,n)` *is* the seed | O(n) |
| **Markov chains** | Bassline notes, lead melody (state = note + duration) | High when trained on a small corpus of pentatonic/dorian phrases. Tunable temperature. | Yes via mulberry32 seed feeding `Math.random()` | O(states) |
| **Cellular automata (rule 30/110)** | "Glitchy ratchet" hi-hats, percussion textures | Mid — interesting for 1 track, chaotic across all 8 | Yes — initial row is the seed | O(steps²) |
| **Density-controlled noise** | "Wild" mode, fills, transitions | Low–mid — needs heavy quantization to a beat grid; saved by snapping to euclidean(k=density·n, n) | Yes | O(n) |

Euclidean wins because it produces *musical* output for every parameter combination — a non-musician user mashing a Reroll button gets something they want to keep ~80% of the time. Cellular automata only does that ~30% of the time.

#### Recommended default per-track style assignment (8 tracks)

| Track | Sound | Generator | Default params |
|---|---|---|---|
| 1 Kick | `MembraneSynth` low | Euclidean | k=4, n=16 (four-on-the-floor) |
| 2 Snare | `NoiseSynth` band-passed | Euclidean | k=2, n=16 (backbeat) |
| 3 Closed Hat | `NoiseSynth` short | Euclidean | k=11, n=16 |
| 4 Open Hat | `NoiseSynth` long | Euclidean | k=3, n=16 (offbeat) |
| 5 Perc (bongo) | `MembraneSynth` mid | Euclidean | k=5, n=16 (cinquillo) |
| 6 Banana shaker | `NoiseSynth` HP filtered | Density noise | density=0.6 |
| 7 Bass | `MonoSynth` square | Markov over scale degrees | order=2, dorian |
| 8 Lead "ook" | `Synth` triangle | Markov | order=1, pentatonic-major |

#### Pattern API

```ts
type GenStyle = "euclidean" | "markov" | "noise" | "ca";
type Pattern = (boolean | number)[];   // bool for drums, MIDI for melodic

generatePattern({
  style: GenStyle,
  steps: number,                  // 16 default; 8/12/16/24/32 supported
  density?: number,               // 0–1; for noise/CA
  k?: number,                     // for euclidean
  scale?: "minor"|"dorian"|"pentatonic"|"blues",
  order?: number,                 // markov
  seed: number,                   // mulberry32; printed in UI
}): Pattern;

generateAll({ tracks: TrackSpec[], seed: number }): Pattern[];
// Reroll only the seed; same TrackSpec[] reproduces.
```

#### Audio→visual sync

Two clocks, one source of truth. `Tone.Transport` schedules audio at `t` (audio-clock seconds in the future). For visuals, **wrap every visual side-effect in `Tone.Draw.schedule(fn, t)`** which queues the callback to fire on the rAF tick closest to `t`. This is jitter-free because Tone re-aligns to the audio context, and you never animate from a bare `Transport.scheduleRepeat` callback.

```js
const seq = new Tone.Sequence((t, stepIdx) => {
  // audio
  if (kickPattern[stepIdx]) kick.triggerAttackRelease("8n", t);
  // visuals — DEFER to the visual clock
  Tone.Draw.schedule(() => {
    bus.emit("step", { stepIdx, accent: kickPattern[stepIdx] });
  }, t);
}, [...Array(16).keys()], "16n").start(0);
```

The React/Phaser side subscribes to `bus.on("step", …)` and runs juice (squash, particles, character state changes). This is the **only** correct pattern; do not use `setInterval` or rAF-counted steps — they drift the moment the main thread blocks.

#### Seed/save

- One `mulberry32(seed)` instance per generator call. Print seed in UI as a 6-digit number (mod 1e6) so users can re-roll and screenshot a "good roll".
- A preset is `{ trackSpecs: TrackSpec[], seed: number, bpm: number, fxState: …}` — fully reproducible.

---

### Track 2 — Rendering Framework Choice

**Decision: React JSX artifact shell with Phaser 4 (CDN, v4.0.0) embedded as a single `<canvas>` inside a `<PhaserStage/>` component. UI is React + Tailwind core utilities. Pattern grid is React (it's UI, not a stage). Character + particle stage is Phaser. State is a single `useReducer` store passed via context.**

#### Why this combo over alternatives

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **React + Canvas 2D only** | Zero new deps; fewer moving parts | Particles + filters + sprite atlas + camera shake = re-implementing 30% of Phaser by hand | Reject — UX-heavy + animation-heavy hybrid is exactly what Phaser 4 is good at. |
| **Pure Phaser scene with DOM overlay** | Best frame rate | Sequencer grid as Phaser GameObjects is masochistic. Forms, sliders, modals are an enormous pile of glue. | Reject. |
| **Pixi v8 + React** | Highest raw sprite throughput (1M sprites OK), WebGPU preference | We don't need 1M sprites. No built-in physics/particle/filter parity with Phaser 4. More glue. | Reject. |
| **Phaser 4 stage + React UI ✅** | UI in React (cheap), stage in Phaser (full juice toolkit: `SpriteGPULayer`, unified `Filter` system, particles, tween, camera shake), single canvas | Two render contexts to coordinate; need a tiny event bus | **Adopt.** |

Phaser 4-specific wins for this app:
- `SpriteGPULayer` — banana-peel confetti and step-cell particles trivially hit 60fps even at 5000 particles.
- Unified Filter system — `camera.filters.internal.add(new Phaser.Filters.Bloom(...))` for global juice; `sprite.filters.internal.add(new Phaser.Filters.ColorMatrix(...))` for hue-pulse on accent steps.
- `setLighting(true)` on character = free 2D lighting reaction to the kick.
- Tween system (built-in) handles squash/stretch with no extra lib.

#### Component layout

```
<App>
  <ThemeProvider>            // CSS vars from palette-generator
    <StateProvider>          // useReducer; { pattern, bpm, mixer, fx, presets, character }
      <Header/>              // logo, BPM, play/stop, dice
      <main>
        <PhaserStage/>       // <div id="phaser-host"/> + Phaser game in useEffect
        <SequencerGrid/>     // 8 × N React buttons; clicking toggles step
        <Tabs>
          <MixerTab/>        // per-track gain/mute/solo/pan
          <FxTab/>           // reverb/delay/filter/distortion sends
          <PresetTab/>       // save/load/export JSON via window.storage
        </Tabs>
      </main>
    </StateProvider>
  </ThemeProvider>
</App>
```

#### Phaser embed pattern (artifact-safe)

```jsx
function PhaserStage(){
  const hostRef = useRef(null);
  const gameRef = useRef(null);
  useEffect(() => {
    if (!window.Phaser) return; // CDN loaded in HTML artifact root
    gameRef.current = new window.Phaser.Game({
      type: Phaser.AUTO, parent: hostRef.current, width: 640, height: 360,
      transparent: true,
      scene: { create: function(){ window._stage = this; } }
    });
    return () => { gameRef.current?.destroy(true); };
  }, []);
  return <div ref={hostRef} className="rounded-xl overflow-hidden"/>;
}
```

Phaser 4 is loaded via the artifact's CDN allowance — for a JSX artifact this means **wrapping in an HTML artifact** (not React), since the React artifact whitelist (per `knowledge/03-artifacts.md`) does **not** include Phaser. **Reverse the call: this is an HTML artifact with a React + ReactDOM CDN load,** OR a JSX artifact that does the entire stage in pure Canvas 2D.

**Recommended: ship as an HTML artifact** (`text/html`) with these CDN scripts:
- `https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js`
- `https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js`
- `https://cdn.jsdelivr.net/npm/phaser@4.0.0/dist/phaser.min.js` ← only `cdnjs.cloudflare.com` is whitelisted for HTML artifacts. **Phaser 4 is not on cdnjs as of May 2026.** Use `https://cdnjs.cloudflare.com/ajax/libs/phaser/3.90.0/phaser.min.js` (Phaser 3.90 is the highest on cdnjs) **OR** swap stage to vanilla Canvas 2D.

This is a real fork — see Open Question #1.

If forced to stay inside the React JSX artifact whitelist (no Phaser), the fallback is **pure Canvas 2D in a `useRef`d canvas**, doing particles + tweens by hand using the patterns in `artifacts/react/game-ecs-starter.jsx`. Lower ceiling but ships today. **Build agent: scaffold the Canvas 2D version first**, port to Phaser 4 only if the artifact host adds the CDN or we move to a `playground/` host.

---

### Track 3 — Advanced 2D Animation

**Decision: Pure procedural code (no Rive, no Spine) for the character. GSAP 3.14 for UI tweens & screen-shake. Phaser-native particles + Phaser 4 unified Filters for stage juice. Character is a multi-part rig (head/body/tail/arm/banana) drawn as procedurally-generated sprites with per-part transforms — squash/stretch, IK arm, tail follow-through.**

Rive is rejected for this build: (a) `@rive-app/canvas` is not on the artifact whitelist, (b) Rive files require designer authoring which isn't agent-friendly, (c) the character only needs ~5 states — overkill.

#### Animation routing matrix

| Event | Tool | Effect |
|---|---|---|
| Step tick (every 16th) | Phaser tween | All 8 step-cells pulse: `scale 1 → 1.06 → 1` over 80ms |
| Active step lights | CSS `@property --glow` | Cell border-glow color cycles via animated custom prop |
| Kick hit | `addTrauma(0.35)` + `ColorMatrix` filter on camera | Trauma-based shake; chromatic-aberration tint flash 60ms |
| Snare hit | Phaser ParticleEmitter burst (8 particles, dust palette) | Dust puff at character feet |
| Hat hit | GSAP `gsap.to(headEl, { y: -2, yoyo:true, duration:0.05 })` | Head bob |
| Bass note | Procedural squash on whole character: `scaleY 1 → 0.92 → 1` over 120ms | Body weight shift |
| Lead note | Tail wag (sine-driven secondary motion already running, amplitude bumped) | Personality |
| Accent (every 4th) | Phaser ParticleEmitter (banana confetti, 16 particles, gravity) | Celebration |
| Loop wrap (start of bar) | Phaser camera flash (white overlay 50ms decay 200ms) | Visual downbeat |
| Pattern reroll | `gsap.fromTo` on grid: `rotateZ -3→0`, stagger 0.02 | Grid "shuffles" |
| Mute toggle | CSS transition `opacity 1→0.3` + Phaser tint desat | Clear state feedback |
| BPM change >120 | Filter `Bloom` strength scales 0.3→0.8 | Energy ramps |
| Long idle (no input 8s) | Character state → "yawn" | Personality |

#### Character states (FSM)

```ts
type CharState = "idle" | "nod" | "dance" | "freakout" | "sleep" | "yawn";

// Transitions driven by audio + UI:
idle → nod      : transport starts
nod → dance     : >= 4 consecutive bars playing
dance → freakout: trauma >= 0.7 OR density >= 0.85
* → idle        : transport stop
idle → sleep    : 30s no input
sleep → yawn → idle : on any input
```

Each state is a small loop combining base sprite + per-part offset functions:

```js
function tickCharacter(t, state){
  // Base body bounce (synced to BPM)
  const beat = (Tone.Transport.position.beats ?? 0);
  body.y = baseY - Math.abs(Math.sin(beat * Math.PI)) * (state === "dance" ? 8 : 2);
  // Tail follow-through (1-spring delay behind body)
  tail.angle = lerp(tail.angle, body.y * 0.3, 0.2);
  // Arm IK toward banana target
  const target = bananas[Math.floor(beat) % bananas.length];
  arm.angle = Math.atan2(target.y - arm.y, target.x - arm.x);
  // State-specific
  if (state === "freakout") body.angle = Math.sin(t * 0.04) * 8;
  if (state === "yawn") mouth.scaleY = 1 + Math.sin(t * 0.005) * 0.5;
}
```

#### Particle systems

Pre-pool all emitters at `create()`. Three pre-configured emitters:
- **dust**: gray, lifespan 400ms, gravity 80, fade out
- **banana-confetti**: oklch(0.85 0.18 95), 6×3 px rectangles, lifespan 1200ms, gravity 200, rotate
- **sparks**: oklch(0.95 0.2 60), small circles, lifespan 200ms, no gravity, additive blend

Use Phaser 4's `SpriteGPULayer` to draw all particles in 1 draw call.

#### Shader/filter effects

| Effect | Phaser 4 Filter | When |
|---|---|---|
| Global bloom | `Filters.Bloom` on main camera | Always; strength scales w/ BPM/density |
| Hue pulse | `Filters.ColorMatrix` on character sprite | 80ms after each kick |
| Pixelate transition | `Filters.Pixelate` on camera | Preset load (200ms) |
| Vignette | `Filters.Vignette` | Always, subtle |
| Chromatic aberration | Custom 4-line ColorMatrix variant | Trauma > 0.5 |

If forced to pure Canvas 2D (no Phaser), drop bloom/CA — keep only `globalCompositeOperation = "lighter"` for sparks + a CSS `filter: blur()` on the canvas el for accent moments.

---

### Track 4 — Dynamic Asset & Graphics Generation

**Decision: ~70% procedural / ~30% AI. AI runs once at build time via `asset-router` MCP; outputs are sprite-packed and inlined into the final artifact as base64 data URIs. Runtime fetch is forbidden by the sandbox.**

#### Asset matrix

| Asset class | Source | Tool | Prompt / generator | When | Cache |
|---|---|---|---|---|---|
| **Monkey character (idle/nod/dance/freakout/yawn × 4-frame loops)** | AI | `asset-router.generate_image` → Recraft v3, style="pixel" | See prompt below | Build time, once | `sprite-packer` MCP → atlas PNG → base64 → inlined in HTML |
| **Jungle background (parallax: sky, far hills, mid leaves, near vines)** | AI | `asset-router.generate_image` → Flux 1.1 Pro, ratio="16:9" | See prompt below | Build time, once per "vibe" preset (3 vibes total) | Inlined as base64 |
| **Banana objects (whole, peel, slice — projectile sprites)** | Procedural | Inline SVG drawn at startup, painted to offscreen canvas via `drawImage`, used as Phaser texture | `<svg viewBox="0 0 32 32"><path d="…" fill="oklch(.85 .18 95)"/></svg>` | Session start | In-memory `OffscreenCanvas` |
| **Step cells, knobs, sliders, frame chrome, buttons** | Procedural | Pure Tailwind + CSS custom properties + `<svg>` icons (lucide-react `Play`, `Square`, `Dice5`, `Save`, `Trash2`) | n/a — code | Render time | React VDOM |
| **Particles (dust/confetti/sparks)** | Procedural | Phaser shape-based emitter or Canvas 2D arc/rect | `ctx.fillStyle = …; ctx.beginPath(); ctx.arc(…)` | Render time | Pool |
| **Vines / leaves overlay (animated foreground)** | Procedural | L-system + GSAP path-draw | `procgen-toolkit` L-system: axiom "F", rule "F→F[+F]F[-F]F", 4 iters | Session start | SVG inlined |
| **Color palette** | Procedural | `palette-oklch` MCP `generate_palette` with hue=95 (banana yellow) → derives jungle greens (hue=140) and accent magenta (hue=320) | Build time | CSS vars |
| **Logo / app title** | Procedural | Big-typography CSS, no AI needed | `font-size: clamp(2rem, 6vw, 4rem); font-weight: 800; letter-spacing: -0.02em;` | Render time | n/a |

#### Recraft v3 prompt — monkey sprite sheet

```
2D sprite sheet of a small cartoon monkey character, retro 16-bit pixel art style,
clean outlines, transparent background, 32×32 frames, 4 frames each for poses:
idle (neutral, slight breath bob), nod (head tilts to beat), dance (arms up, tail curled),
freakout (mouth open, hands on head, sweat drop), yawn (mouth wide, one arm stretching).
Tropical jungle palette: warm golden brown fur, banana-yellow highlights, large round eyes.
Side view facing right, consistent silhouette across all frames. Output as a single PNG
sprite sheet, frames laid out in rows of 4. Style reference: Stardew Valley villager portraits
crossed with classic Donkey Kong arcade.
--ratio 4:3 --style pixel
```

#### Flux 1.1 Pro prompt — jungle background

```
Cartoon jungle scene background, 16:9, layered for parallax (separate flat regions for
sky / far mountains / mid canopy / near vines), saturated tropical palette
(banana-yellow sun, oklch deep-greens, magenta orchid accents, cyan sky),
flat illustration style, no characters, no text, painterly brush textures,
gentle depth, leaves with chunky outlines, golden-hour lighting.
Style: Studio Ghibli meets retro arcade attract screen.
--ratio 16:9 --no characters --no text --no logos
```

Generate 3 variants by appending `, mood: chill | sunset | rave` for the three preset "vibes". Cap `count: 1` per call. Total AI cost at build time: ~5 Recraft images ($0.20) + 3 Flux images ($0.12) = **~$0.32 per build**.

#### Color generation (every session)

```js
// At app init, call palette-oklch via MCP at build time → bake into CSS vars:
:root {
  --bg:        oklch(0.18 0.04 140);   /* deep jungle */
  --surface:   oklch(0.22 0.05 140);
  --border:    oklch(0.30 0.05 140);
  --text:      oklch(0.95 0.02 95);
  --text-muted:oklch(0.70 0.03 95);
  --accent:    oklch(0.85 0.18 95);    /* banana */
  --accent-hi: oklch(0.92 0.18 95);
  --accent-2:  oklch(0.65 0.20 320);   /* magenta hot */
  --accent-3:  oklch(0.75 0.15 200);   /* cyan cool */
  --kick:      oklch(0.70 0.20 30);    /* drum colors per track */
  --snare:     oklch(0.78 0.15 60);
  --hat:       oklch(0.85 0.10 200);
  --perc:      oklch(0.70 0.15 320);
}
```

Verify pairs: text/bg = 11.2:1 (AAA), text-muted/bg = 4.8:1 (AA), accent/bg = 5.5:1 (AA on text "on accent" check). All pass.

#### Pipeline (build time vs. session vs. per-pattern)

| Stage | What runs | Where |
|---|---|---|
| **Build time** (skill+MCP, before artifact ships) | `asset-router` generates monkey sprites + 3 BG variants → `sprite-packer` packs atlas → palette-oklch generates tokens → all baked into HTML as data URIs and CSS vars | Skill: `asset-generator` |
| **Session start** (artifact loads in browser) | Decode atlas, instantiate Tone.js synths, set up Phaser scene, draw procedural vines, init Markov tables | `useEffect` on mount |
| **Per-pattern** (user clicks Reroll) | Run `generatePattern` × 8 with new seed; rebuild sequence; emit "reroll" event for grid shuffle anim | `dispatch({ type: "REROLL" })` |
| **Per-step** (during play) | Tone.Transport schedules audio; Tone.Draw bridges to event bus; Phaser/React subscribers run juice | `Tone.Sequence` callback |

---

### Track 5 — UX Architecture

**Decision: Single-page layout with a fixed top header, a tabbed center panel (Sequencer / Mixer / FX / Presets), the Phaser stage above the active tab, all on one scroll-locked viewport. No router. State is one object, persisted as one combined `window.storage` key.**

#### Wireframes (in words)

**Sequencer screen** (default)
```
┌──────────────────────────────────────────────────────────────┐
│  🍌 BANANA BEATS    BPM[ 96 ]  ▶ STOP  🎲 REROLL  💾 SAVE   │  Header
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   [ PHASER STAGE — monkey + jungle BG + particles ]          │  Stage
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ [ Sequencer ] [ Mixer ] [ FX ] [ Presets ]                   │  Tabs
├──────────────────────────────────────────────────────────────┤
│ KICK   ●·····●·····●····●  k=4 [euclid▼] 🎲                 │
│ SNARE  ····●·······●·····  k=2 [euclid▼] 🎲                 │
│ HAT    ●●●●●●●●●●●●●●●●  k=11 [euclid▼] 🎲                 │  8 rows
│ ...                                                          │
│ LEAD   pentatonic markov  ord=1   🎲                         │
└──────────────────────────────────────────────────────────────┘
   Step indicator (vertical bar) sweeps across the grid every 16n.
```

**Mixer screen** — same header & stage; tab swaps in:
```
| TRK | VOL slider | PAN | MUTE | SOLO | SEND→FX1 | SEND→FX2 |
| Kick | ▮▮▮▮▮▯▯ | ◯  | [M] | [S] |   ▮▮▯▯▯  |   ▯▯▯▯▯ |
... 8 rows
[ Master VOL ▮▮▮▮▮▮▯▯ | Limiter on/off ]
```

**FX screen** — 4 effect slots, each: type dropdown (Reverb/Delay/Filter/Distortion/BitCrusher/Chorus), 3 knobs (procedural SVG knob component), wet/dry, on/off. Routing is fixed FX1 = reverb send, FX2 = delay send (simpler than full matrix).

**Presets screen**
```
[ + New | Import JSON | Export JSON ]
┌──────────────────────────┐
│ "Disco Banana"   ▶ 🗑    │
│ "Jungle Trap"    ▶ 🗑    │
│ "Coconut Step"   ▶ 🗑    │
└──────────────────────────┘
```

Loading a preset crossfades over 200ms (pixelate filter pulse, GSAP grid wipe).

#### State shape (TypeScript-ish)

```ts
type GenStyle = "euclidean" | "markov" | "noise" | "ca";
type SynthKind = "membrane" | "noise" | "mono" | "synth" | "fm";

interface TrackSpec {
  id: number;
  name: string;
  synth: { kind: SynthKind; params: Record<string, number> };
  generator: { style: GenStyle; steps: number; k?: number; density?: number; scale?: string; order?: number };
  pattern: (boolean | number)[];   // resolved from generator+seed
  mixer: { gain: number; pan: number; mute: boolean; solo: boolean; sends: [number, number] };
  color: string;                   // oklch token name
}

interface FxSlot {
  type: "reverb" | "delay" | "filter" | "distortion" | "bitcrusher" | "chorus";
  enabled: boolean;
  params: Record<string, number>;  // 3 knobs
  wet: number;
}

interface CharacterState {
  state: "idle" | "nod" | "dance" | "freakout" | "sleep" | "yawn";
  trauma: number;
  facing: 1 | -1;
}

interface Preset {
  id: string;
  name: string;
  bpm: number;
  seed: number;
  tracks: TrackSpec[];
  fx: [FxSlot, FxSlot, FxSlot, FxSlot];
  vibe: "chill" | "sunset" | "rave";
  createdAt: number;
}

interface AppState {
  bpm: number;
  seed: number;
  isPlaying: boolean;
  activeTab: "seq" | "mixer" | "fx" | "presets";
  vibe: "chill" | "sunset" | "rave";
  tracks: TrackSpec[];          // length 8
  fx: [FxSlot, FxSlot, FxSlot, FxSlot];
  master: { gain: number; limiter: boolean };
  character: CharacterState;
  presets: Preset[];
}
```

Reducer actions: `PLAY`, `STOP`, `SET_BPM`, `REROLL_ALL`, `REROLL_TRACK(id)`, `TOGGLE_STEP(trackId, stepIdx)`, `SET_GAIN(trackId, v)`, `MUTE`, `SOLO`, `SET_FX_PARAM(slot, key, v)`, `SAVE_PRESET(name)`, `LOAD_PRESET(id)`, `DELETE_PRESET(id)`, `SET_TAB`, `SET_VIBE`.

#### Persistence

Single combined key — never write per-action:
```js
await window.storage.set("banana-beats:state", JSON.stringify({
  presets: state.presets,            // long-lived
  lastSession: { bpm, vibe, tracks, fx, master }  // resume on reload
}));
```
Debounce writes 500ms. Load on mount. Export = `URL.createObjectURL(new Blob([JSON.stringify(presets)]))` + `<a download>`.

#### Keyboard

| Key | Action |
|---|---|
| `Space` | play/stop |
| `R` | reroll all |
| `1`–`8` | reroll track N |
| `←` / `→` | previous/next preset |
| `M` (with track focused) | mute |
| `Tab` | cycle tabs |
| `?` | show shortcut overlay |

Respect `prefers-reduced-motion`: skip squash, particle bursts → static color flash, no shake. Reduce bloom strength to 0.

---

### Track 6 — Repo Skill Integration

**Decision: Use the existing skills as labeled. The build agent's first move is to invoke them in the order below.**

```
                ┌─────────────────────────────────────────┐
                │      Build agent (Claude in chat)        │
                └────────────┬────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────────────┐
        ▼                    ▼                            ▼
┌──────────────┐   ┌──────────────────┐         ┌────────────────────┐
│ palette-     │   │ procgen-toolkit  │         │ artifact-game-     │
│ generator    │   │ (L-system vines, │         │ builder            │
│ + palette-   │   │  pattern algos)  │         │ (HTML scaffold,    │
│ oklch MCP    │   │                  │         │  fixed-step loop)  │
└──────┬───────┘   └────────┬─────────┘         └─────────┬──────────┘
       │ CSS vars            │ JS modules                  │ skeleton
       ▼                     ▼                             ▼
┌────────────────────────────────────────────────────────────────────┐
│             Single-file artifact (HTML, with inline JSX)           │
└──────────────────────────────────▲─────────────────────────────────┘
                                    │ baked-in data URIs
            ┌───────────────────────┴───────────────────────┐
            │                                                │
   ┌────────┴─────────┐                          ┌──────────┴──────────┐
   │ asset-router MCP │                          │ sprite-atlas-builder│
   │ → Recraft v3     │                          │ + sprite-packer MCP │
   │ → Flux 1.1 Pro   │                          │ (atlas + JSON)      │
   └──────────────────┘                          └─────────────────────┘
       images URLs                                packed PNG → base64
            │                                                │
            └──────────► (downloaded, embedded as data URI) ◄┘
```

Skill invocation order at build time:
1. `palette-generator` (with hue=95) → CSS tokens
2. `procgen-toolkit` → L-system code + Markov tables (literal arrays)
3. `asset-router` MCP → 1 Recraft sprite-sheet call + 3 Flux BG calls (with seeds saved alongside)
4. `sprite-atlas-builder` → Phaser-compatible JSON manifest
5. `sprite-packer` MCP → final atlas PNG; convert to base64 data URI
6. `animation-composer` → confirms Phaser-tween + GSAP-screen-shake routing (mostly informational; reuses §3 routing matrix)
7. `artifact-game-builder` → the actual single-file scaffold with `useReducer` store, `Tone.Transport`, `<PhaserStage>`, tabs

Each skill output is captured into the `.claude/build/` working dir (or equivalent) and referenced by relative include statements that the final artifact-game-builder pass inlines.

---

### Track 7 — Risk & Constraint Audit

| Risk | Severity | Mitigation |
|---|---|---|
| **Phaser 4 not on cdnjs.cloudflare.com** (HTML artifacts only allow that CDN) | **High** — could block the chosen stack | Plan A: ship as React JSX artifact w/ pure Canvas 2D stage (no Phaser). Plan B: host on `playground/` outside the artifact sandbox. Plan C: try `https://cdn.jsdelivr.net/npm/phaser@4.0.0/dist/phaser.min.js` — historically jsdelivr has worked in some HTML artifact tests but is not officially allow-listed; verify before committing. |
| `localStorage`/`indexedDB` blocked | Med | Use `window.storage` exclusively. Single combined key. Debounce writes. |
| AI-generated assets cannot be fetched at runtime (only `api.anthropic.com/v1/messages` is allow-listed) | High | Generate at build time only; inline as base64 data URIs. Cap atlas <2 MB to stay well under 20 MB `window.storage` cap. |
| Tone.js audio drift when main thread blocks during heavy animation | Med | Use `Tone.Draw.schedule(fn, t)` for all visual side-effects; never count steps in rAF. Audio scheduling is on the audio thread anyway — drift only affects visuals, which Tone.Draw fixes. |
| 8 tracks × 16 steps × particles × bloom on mid-range hardware | Med | Phaser 4 `SpriteGPULayer` handles particle counts; cap simultaneous particles at 500 visible; throttle bloom on `prefers-reduced-motion`; set `Filter.Bloom` strength inversely to particle count. |
| Sprite-sheet generation flakiness from Recraft v3 (consistency across frames) | Med | Use `seed` param on Recraft calls. If frames drift, fall back to procedural sprite drawing (chunky pixel monkey from primitives — see `artifacts/react/game-ecs-starter.jsx` style). |
| User clicks "Start" before audio context unlocks | Low | Button handler calls `await Tone.start()` first, then `Transport.start()`. Show LED only after start resolves. |
| Pixel-art atlas size > 2 MB | Low | 32×32 frames × 5 states × 4 frames = 20 frames at 32×32 PNG ≈ ~50 KB. Fine. |
| License/attribution for generated assets | Low | `asset-router` writes `*.provenance.json` sidecar. For Suno or third-party samples we'd need attention; we're using Tone synthesis only — no third-party samples. |
| `<form>` accidentally used in React artifact | Low | All inputs use `onClick`/`onChange`; no `type="submit"`. |
| Tailwind arbitrary values (`text-[14px]`) sneaking into output | Low | Stick to core utilities; use CSS vars + inline style for any oddball sizing. |
| Phaser 4 GA stability on May 2026 (4.0.0 is recent) | Low–Med | Pinned version; watch `phaser.io/news` for hotfixes. Phaser 3.90 is the documented fallback. |

---

## 3. Open Questions for the User

1. **Phaser availability in HTML artifacts.** Phaser 4 is not on `cdnjs.cloudflare.com` (the only HTML-artifact-allowed CDN). Three paths — pick one before scaffolding:
   - **(A) Ship in `playground/` instead of as an artifact** (full Phaser 4, full juice ceiling, but no inline preview in chat).
   - **(B) Ship as artifact with pure Canvas 2D stage** (no Phaser, lower juice ceiling but inline preview works). This is what I'd default to.
   - **(C) Try `cdn.jsdelivr.net` for Phaser 4** in the HTML artifact and see if it executes. If yes, full Phaser; if no, fall back to (B).
2. **Mobile touch support — required for v1?** Touch is doable (Phaser/Pointer Events handle it) but adds work for the sequencer grid hit-testing on small screens. Default = desktop-first.
3. **MCP keys available at build time?** Findings assume `asset-router` has Replicate keys for Recraft v3 + Flux 1.1 Pro. If not, the router's stub fallback ships placeholder assets and the artifact still runs — but the monkey will be a procedural primitive shape and the BG will be a flat color.

Everything else is decided.

---

## 4. Recommended Next Step

The build agent should scaffold **path B** first: a single React JSX artifact with:

1. CSS palette block from `palette-generator` (hue=95) at the top.
2. `useReducer` store wired with the `AppState` shape from §5.
3. `Tone.js` import, 8-track audio graph (8 synths → per-track Gain → 2 FX sends → master Limiter).
4. `Tone.Transport` + 8 `Tone.Sequence` instances driven from `state.tracks[i].pattern`, each `.callback` doing audio + `Tone.Draw.schedule(emitStep)`.
5. `<canvas ref>` Phaser-less stage drawing the procedural monkey + 3 banana sprites + simple particle pool, subscribing to the step event bus.
6. React grid + Tabs + sliders + preset list (all `onClick`, no `<form>`).
7. `window.storage` debounced sync.
8. Procedural monkey drawn from primitives as a placeholder; AI sprite swap-in happens later via a one-line texture URL change once `asset-router` runs.

Once that runs end-to-end with euclidean kick + snare and visible character bounce, layer in: Markov bass/lead, FX rack, presets, vibe switcher, AI sprite atlas, then (if Phaser becomes available via path A or C) port the stage from Canvas 2D to Phaser 4.

Total file budget: target ~1,200–1,800 LOC for the v1 artifact.
