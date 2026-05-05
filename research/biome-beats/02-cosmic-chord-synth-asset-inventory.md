# cosmic-chord-synth Asset Inventory
> Status: draft
> Owner: general-purpose agent
> Last updated: 2026-05-05

## TL;DR (≤150 words)

`barmoshe/cosmic-chord-synth` (a.k.a. `biome-synth`) is a React 18 + TypeScript + Vite + Tone.js + Three.js + Tailwind app with five themed scenes — Space, Jungle, Sea, Cyberpunk, Tundra — driven by touch input and an optional AI DJ. The repo's per-biome data lives under `src/components/biome-synth/<biome>/` (drums, particles, ripples, background art) plus a single shared registry at `src/components/biome-synth/shared/constants.ts` that maps each biome to a scale, BPM, drum kit, and ambient track.

**Licence verdict: missing.** No `LICENSE` file exists at the repo root (404). The README does not assert a licence. Audio sample provenance in `public/audio/CREDITS.txt` is CC0 / MIT for four of five tracks. **Treat all source code as restrictive until clarified with the repo owner.** Mirror descriptions, paths, and short snippets only — no full files, no asset bytes copied without explicit permission.

## Scope & questions

What palette, scale, sample, BPM, and visual-motif data does cosmic-chord-synth define per biome, and which assets can BiomeBeats legitimately re-use?

In scope: world and assets — palettes, biome scenes, scale/BPM tables, ambient samples, drum-kit naming, dependency manifest. Out of scope: the AI DJ engine (DRIFT → PULSE → BLOOM → SURGE → DISSOLVE phase logic) — see dedicated subsection.

Stop point: this enumerates what's available. R10 locks the BiomeBeats timbre/scale combination.

## Findings (with inline citations)

### Licence

No `LICENSE`, `LICENSE.md`, `COPYING`, or `COPYRIGHT` exists at the repo root, and `README.md` does not assert one (root tree: https://github.com/barmoshe/cosmic-chord-synth/tree/main; README: https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/README.md).

**Audio is separately attributed.** `public/audio/CREDITS.txt` lists CC0 1.0 sources for `space-ambient.opus` and `sea-ambient.opus` (EternityForest/Free-SFX), and MIT-licensed CC sources for `jungle-ambient.ogg` and `cyberpunk-ambient.ogg` (OreCruncher/DynamicSurroundings). `tundra-ambient.ogg` is flagged as a placeholder awaiting a CC0 replacement (`public/audio/CREDITS.txt`: https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/public/audio/CREDITS.txt).

**Implication:** four ambient files are copy-with-attribution; tundra needs replacement. TS source is treated as restrictive — mirror values, not bytes.

### Per-biome inventory

`THEME_PRESETS: Record<ThemeId, ThemePreset>` in `src/components/biome-synth/shared/constants.ts` is the source of truth for scale / BPM / drum-kit / ambient. Scene art lives under `src/components/biome-synth/<biome>/`; jungle/sea/cyberpunk/tundra use Canvas2D, Space uses Three.js shaders from `src/components/biome-synth/shared/shaders.ts`. A single global palette `PAL` ("Glacial Aurora 2026") is shared across biomes for accent and section transitions; biome identity comes from per-biome background gradients and motif modules (`src/components/biome-synth/shared/constants.ts`: https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/src/components/biome-synth/shared/constants.ts).

Global palette literal:
`PAL = [[0.08, 0.72, 0.65], [0.13, 0.83, 0.93], [0.51, 0.55, 0.97], [0.37, 0.92, 0.83], [0.65, 0.55, 0.98], [0.99, 0.83, 0.30]]` — teal, cyan, periwinkle, mint, lavender, gold (RGB 0–1 normalized) (`src/components/biome-synth/shared/constants.ts`).

Scale definitions (`SCALES`):
- `pentatonic: [0, 3, 5, 7, 10]` mood 0.5
- `minor: [0, 2, 3, 5, 7, 8, 10]` mood 0.2
- `major: [0, 2, 4, 5, 7, 9, 11]` mood 0.85
- `arabic: [0, 1, 4, 5, 7, 8, 11]` mood 0.25
- `lydian: [0, 2, 4, 6, 7, 9, 11]` mood 0.7

(`src/components/biome-synth/shared/constants.ts`)

#### Space

- **Palette:** no biome-local palette literal in `space/types.ts`. Star colours computed procedurally as RGB 0–1 arrays in `space/bgStars.ts`: cyan-tinted `(0.5, 0.95, 0.85)`, pale yellow `(0.95, 0.85, 0.7)`, blue-tinted white `(0.9, 0.92, 1.0)`, blue-white `(0.7, 0.8, 1.0)`. Inherits global `PAL` for accent/section colour (`src/components/biome-synth/space/bgStars.ts`: https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/src/components/biome-synth/space/bgStars.ts).
- **Shader source:** `src/components/biome-synth/shared/shaders.ts` exports 11 shader programs used by the Space biome (galaxy, particles, central star, halo, drum-star, post-process bloom/blur/composite). One-line summary: "starfield with scintillation and spiral breathing, plus warm-palette pulsing star with limb darkening, fed bass/treble/pitch/volume audio uniforms" (`src/components/biome-synth/shared/shaders.ts`: https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/src/components/biome-synth/shared/shaders.ts).
- **Visual motifs:** `bgStars`, `centralStar`, `drumStars`, `galaxy`, `nebulae`, `particles`, `rings`, `ripples`, `shootingStars`, `fftBars`, post-process bloom (`src/components/biome-synth/space/`: https://github.com/barmoshe/cosmic-chord-synth/tree/main/src/components/biome-synth/space).
- **Default scale / root:** `pentatonic` (root unspecified; `SCALES.pentatonic.notes = [0,3,5,7,10]`).
- **Tempo:** `bpm: 94`. Drum kit: `default`. Ambient: `/audio/space-ambient.opus`.
- All from `THEME_PRESETS.space` in `src/components/biome-synth/shared/constants.ts`.

#### Jungle

- **Palette (from `jungle/background.ts`):** mountains far `#0c2a1b`, mountains near `#143d28`, sky top `#0a1f14`, sky mid `#143d28`, horizon `#2d1b0a`, sun glow `rgba(245,158,11,0.28)`, ground top `#0e2617`, ground bottom `#050d08`, fern stems `rgba(82,183,136,0.55)`, rocks `rgba(14,38,23,0.9)` (`src/components/biome-synth/jungle/background.ts`: https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/src/components/biome-synth/jungle/background.ts).
- **Shader:** none — Canvas2D rendering. No biome-specific GLSL.
- **Visual motifs:** dense-canopy fronds + fireflies + drum glyphs + mist bands + ripples (`jungle/`: `background.ts`, `drums.ts`, `fireflies.ts`, `overlays.ts`, `particles.ts`, `ripples.ts`) (https://github.com/barmoshe/cosmic-chord-synth/tree/main/src/components/biome-synth/jungle).
- **Default scale / root:** `pentatonic`.
- **Tempo:** `bpm: 108`. Drum kit: `tribal`. Ambient: `/audio/jungle-ambient.ogg`.
- All from `THEME_PRESETS.jungle`.

#### Sea

- **Palette (from `sea/water.ts`):** sky gradient `#0a1f2e` → `#1a4d6e`; water gradient `#0a3a5e` → `#063a52` → `#021829`; light rays `rgba(168,230,207, var)` (`src/components/biome-synth/sea/water.ts`: https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/src/components/biome-synth/sea/water.ts).
- **Shader:** none — Canvas2D.
- **Visual motifs:** kelp/coral, swimming fish, bubbles, caustic light rays, animated waves, sea floor (`sea/`: `bubbles.ts`, `corals.ts`, `fish.ts`, `seafloor.ts`, `water.ts`, `wave.ts`, `drums.ts`, `overlays.ts`, `particles.ts`, `ripples.ts`) (https://github.com/barmoshe/cosmic-chord-synth/tree/main/src/components/biome-synth/sea).
- **Default scale / root:** `lydian` — note: README description "bright & floaty"; matches mood 0.7 in `SCALES.lydian`.
- **Tempo:** `bpm: 76`. Drum kit: `aquatic`. Ambient: `/audio/sea-ambient.opus`.
- All from `THEME_PRESETS.sea`.

#### Cyberpunk

- **Palette (from `cyberpunk/background.ts`):** sky gradient `#07021a` → `#12062e` → `#2a0a3f`; horizon band magenta `rgba(157, 0, 255, 0)` → hot pink `rgba(255, 43, 214, 0.35)` → cyan `rgba(33, 231, 255, 0.55)`; ground `#05020f` (`src/components/biome-synth/cyberpunk/background.ts`: https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/src/components/biome-synth/cyberpunk/background.ts).
- **Shader:** none — Canvas2D.
- **Visual motifs:** neon skyline, hologram billboards, neon rain, particle grid (`cyberpunk/`: `background.ts`, `buildings.ts`, `grid.ts`, `rain.ts`, `drums.ts`, `overlays.ts`, `particles.ts`, `ripples.ts`) (https://github.com/barmoshe/cosmic-chord-synth/tree/main/src/components/biome-synth/cyberpunk).
- **Default scale / root:** `arabic` — `[0,1,4,5,7,8,11]`, mood 0.25.
- **Tempo:** `bpm: 128`. Drum kit: `default`. Ambient: `/audio/cyberpunk-ambient.ogg`.
- All from `THEME_PRESETS.cyberpunk`.

#### Tundra

- **Palette (from `tundra/background.ts`):** sky gradient `#eaf8ff` → `#d8efff` → `#c3e4f7` → `#aad4ef`; sun glow `rgba(255,248,224,0.45)`; glacier far bright `#e7f3fb`, shadow `rgba(150,188,216,0.55)`; glacier close bright `#fafeff`, shadow `rgba(120,168,204,0.6)`; ice floor `#d5eaf4` → `#eef7fb` → `#ffffff`; horizon line `rgba(170,210,235,0.7)` (`src/components/biome-synth/tundra/background.ts`: https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/src/components/biome-synth/tundra/background.ts).
- **Shader:** none — Canvas2D.
- **Visual motifs:** glaciers, falling snow, penguin colony, aurora glow overlay (`tundra/`: `background.ts`, `snow.ts`, `penguins.ts`, `drums.ts`, `overlays.ts`, `particles.ts`, `ripples.ts`) (https://github.com/barmoshe/cosmic-chord-synth/tree/main/src/components/biome-synth/tundra).
- **Default scale / root:** `minor` — `[0,2,3,5,7,8,10]`, mood 0.2.
- **Tempo:** `bpm: 68`. Drum kit: `aquatic`. Ambient: `/audio/tundra-ambient.ogg` (file currently a placeholder; see "Open questions").
- All from `THEME_PRESETS.tundra`.

### Repo-wide assets (textures, fonts, audio)

- `public/audio/` — five ambient files plus `CREDITS.txt` (https://github.com/barmoshe/cosmic-chord-synth/tree/main/public/audio).
- `public/` SVGs — `flowers.svg`, `fruits.svg`, `monkeys.svg`, `placeholder.svg`, plus `favicon.ico`, `robots.txt`. The first three appear to be jungle-biome decoratives (consumed by `JungleFlora.tsx`, `FloatingBananas.tsx`, `JumpingMonkeys.tsx`) (https://github.com/barmoshe/cosmic-chord-synth/tree/main/public).
- No bitmap textures, no custom fonts.
- Audio is fully procedural Tone.js (`PolySynth`, `MembraneSynth`, `NoiseSynth`, `MetalSynth`, `Freeverb`); no sample packs (`src/components/biome-synth/hooks/useAudioEngine.ts`: https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/src/components/biome-synth/hooks/useAudioEngine.ts).

### Out of scope (AI-DJ engine — confirmed ignored)

The repo ships an AI DJ that runs a 5-phase loop **DRIFT → PULSE → BLOOM → SURGE → DISSOLVE** with per-section energy, drum, synth, and colour configs. Config data lives in `DJ_SECTIONS` (`src/components/biome-synth/shared/constants.ts`); orchestration lives in `src/components/biome-synth/hooks/useDjAutoPlay.ts`, surfaced via `src/components/biome-synth/components/DjPanel.tsx`.

BiomeBeats has its own deterministic, user-driven engine. **The AI-DJ engine, `DJ_SECTIONS`, `useDjAutoPlay.ts`, and `DjPanel.tsx` are out of scope.** No further analysis here.

## Implications for BiomeBeats

### Proposed `biomes.json` shape

```json
{
  "version": 1,
  "source": "cosmic-chord-synth (mirrored under conditional licence)",
  "biomes": {
    "space": {
      "scale": "pentatonic",
      "scaleNotes": [0, 3, 5, 7, 10],
      "rootHint": "C",
      "bpm": 94,
      "drumKit": "default",
      "ambient": "audio/space-ambient.opus",
      "palette": {
        "primaries": [[0.5, 0.95, 0.85], [0.95, 0.85, 0.7], [0.9, 0.92, 1.0]],
        "accent": [0.99, 0.83, 0.30]
      },
      "renderer": "three-r128",
      "motifs": ["bgStars", "centralStar", "nebulae", "shootingStars", "rings"]
    },
    "jungle": {
      "scale": "pentatonic",
      "scaleNotes": [0, 3, 5, 7, 10],
      "rootHint": "E",
      "bpm": 108,
      "drumKit": "tribal",
      "ambient": "audio/jungle-ambient.ogg",
      "palette": {
        "skyTop": "#0a1f14", "skyMid": "#143d28", "horizon": "#2d1b0a",
        "groundTop": "#0e2617", "groundBottom": "#050d08",
        "fern": "rgba(82,183,136,0.55)", "sun": "rgba(245,158,11,0.28)"
      },
      "renderer": "canvas2d",
      "motifs": ["background", "fireflies", "fronds", "ripples"]
    },
    "sea": {
      "scale": "lydian",
      "scaleNotes": [0, 2, 4, 6, 7, 9, 11],
      "rootHint": "F",
      "bpm": 76,
      "drumKit": "aquatic",
      "ambient": "audio/sea-ambient.opus",
      "palette": {
        "skyTop": "#0a1f2e", "skyBottom": "#1a4d6e",
        "waterTop": "#0a3a5e", "waterMid": "#063a52", "waterBottom": "#021829",
        "rays": "rgba(168,230,207,0.6)"
      },
      "renderer": "canvas2d",
      "motifs": ["water", "wave", "fish", "corals", "bubbles", "seafloor"]
    },
    "cyberpunk": {
      "scale": "arabic",
      "scaleNotes": [0, 1, 4, 5, 7, 8, 11],
      "rootHint": "A",
      "bpm": 128,
      "drumKit": "default",
      "ambient": "audio/cyberpunk-ambient.ogg",
      "palette": {
        "skyTop": "#07021a", "skyMid": "#12062e", "skyBottom": "#2a0a3f",
        "neonMagenta": "rgba(255,43,214,0.35)", "neonCyan": "rgba(33,231,255,0.55)",
        "ground": "#05020f"
      },
      "renderer": "canvas2d",
      "motifs": ["skyline", "buildings", "rain", "grid"]
    },
    "tundra": {
      "scale": "minor",
      "scaleNotes": [0, 2, 3, 5, 7, 8, 10],
      "rootHint": "A",
      "bpm": 68,
      "drumKit": "aquatic",
      "ambient": "audio/tundra-ambient.ogg",
      "palette": {
        "skyTop": "#eaf8ff", "skyMidA": "#d8efff", "skyMidB": "#c3e4f7", "horizon": "#aad4ef",
        "glacierBright": "#fafeff", "glacierShadow": "rgba(120,168,204,0.6)",
        "iceFloor": ["#d5eaf4", "#eef7fb", "#ffffff"]
      },
      "renderer": "canvas2d",
      "motifs": ["glaciers", "snow", "penguins", "aurora"]
    }
  }
}
```

### Manifest of files to copy-with-attribution

| path | kind | licence-ok? | notes |
| --- | --- | --- | --- |
| `src/components/biome-synth/shared/constants.ts` (THEME_PRESETS, SCALES, PAL only — exclude DJ_SECTIONS) | scale data + registry | conditional | Mirror values, not the file. Re-derive in BiomeBeats; cite source. Repo licence missing. |
| `src/components/biome-synth/shared/shaders.ts` | shader (Space biome) | conditional | Six fragment + vertex programs; r128-compatible already. Mirror only with owner permission. |
| `src/components/biome-synth/jungle/background.ts` | palette | conditional | Lift hex literals into `biomes.json`; do not copy code. |
| `src/components/biome-synth/sea/water.ts` | palette | conditional | Same. |
| `src/components/biome-synth/cyberpunk/background.ts` | palette | conditional | Same. |
| `src/components/biome-synth/tundra/background.ts` | palette | conditional | Same. |
| `src/components/biome-synth/space/bgStars.ts` | palette + procedure | conditional | Star RGB triples; document attribution. |
| `public/audio/space-ambient.opus` | audio | yes (CC0) | EternityForest/Free-SFX. CC0 1.0 — keep CREDITS.txt. |
| `public/audio/sea-ambient.opus` | audio | yes (CC0) | EternityForest/Free-SFX. CC0 1.0 — keep CREDITS.txt. |
| `public/audio/jungle-ambient.ogg` | audio | yes (MIT/CC) | OreCruncher/DynamicSurroundings; preserve attribution. |
| `public/audio/cyberpunk-ambient.ogg` | audio | yes (MIT/CC) | OreCruncher/DynamicSurroundings; preserve attribution. |
| `public/audio/tundra-ambient.ogg` | audio | no | Placeholder; needs CC0 replacement before BiomeBeats can ship. |
| `public/flowers.svg`, `fruits.svg`, `monkeys.svg` | texture (SVG) | conditional | Likely repo-original; ask owner to confirm. Useful for jungle motifs only. |
| `public/audio/CREDITS.txt` | attribution | yes | Mandatory companion to any audio file we mirror. |

Counts: **yes = 5**, **conditional = 8**, **no = 1**.

## Open questions

1. **No `LICENSE` file at the repo root.** README does not assert one. **Action:** ask the repo owner (Bar Moshe) to add an explicit licence (MIT recommended) before BiomeBeats mirrors any TS source. Until then, code-bytes should not be copied; we mirror values only.
2. **`tundra-ambient.ogg`** is a placeholder per `public/audio/CREDITS.txt`. **Action:** locate a CC0 arctic/ice-cave drone or commission one for BiomeBeats.
3. **Default root note per biome is undocumented.** `SCALES` provides intervals only; the live demo presumably picks a root at runtime. **Action:** in R10, decide BiomeBeats' default root per biome (the `rootHint` values above are placeholders).
4. **Drum-kit content for `tribal` and `aquatic` is procedural** (`Tone.MembraneSynth` / `NoiseSynth` / `MetalSynth` with biome-specific tuning), not sample-based. **Action:** in R10, decide whether BiomeBeats keeps procedural drums or swaps in sampled hits per kit.
5. **`public/flowers.svg`, `fruits.svg`, `monkeys.svg`** — original or derived? **Action:** ask owner; only safe to ship if confirmed original or trace-attributable.
6. **Mood values in `SCALES`** (0.2–0.85) are used by the AI-DJ for arrangement decisions. BiomeBeats does not have an AI-DJ — confirm in R10 whether mood is repurposed for any purpose (UI tinting?) or dropped.
7. **`src/synthsim/`** is a separate flight-simulator module (airframe, forces, telemetry) co-resident in the repo but **not** part of biome-synth. Confirmed no overlap; flagged here so future probes don't waste cycles on it (`src/synthsim/`: https://github.com/barmoshe/cosmic-chord-synth/tree/main/src/synthsim).

## Sources

- README — https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/README.md
- Repo root tree — https://github.com/barmoshe/cosmic-chord-synth/tree/main
- `package.json` — https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/package.json
- `src/components/biome-synth/shared/constants.ts` — https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/src/components/biome-synth/shared/constants.ts
- `src/components/biome-synth/shared/shaders.ts` — https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/src/components/biome-synth/shared/shaders.ts
- `src/components/biome-synth/shared/types.ts` — https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/src/components/biome-synth/shared/types.ts
- `src/components/biome-synth/space/` — https://github.com/barmoshe/cosmic-chord-synth/tree/main/src/components/biome-synth/space
- `src/components/biome-synth/space/bgStars.ts` — https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/src/components/biome-synth/space/bgStars.ts
- `src/components/biome-synth/jungle/` — https://github.com/barmoshe/cosmic-chord-synth/tree/main/src/components/biome-synth/jungle
- `src/components/biome-synth/jungle/background.ts` — https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/src/components/biome-synth/jungle/background.ts
- `src/components/biome-synth/sea/` — https://github.com/barmoshe/cosmic-chord-synth/tree/main/src/components/biome-synth/sea
- `src/components/biome-synth/sea/water.ts` — https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/src/components/biome-synth/sea/water.ts
- `src/components/biome-synth/cyberpunk/` — https://github.com/barmoshe/cosmic-chord-synth/tree/main/src/components/biome-synth/cyberpunk
- `src/components/biome-synth/cyberpunk/background.ts` — https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/src/components/biome-synth/cyberpunk/background.ts
- `src/components/biome-synth/tundra/` — https://github.com/barmoshe/cosmic-chord-synth/tree/main/src/components/biome-synth/tundra
- `src/components/biome-synth/tundra/background.ts` — https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/src/components/biome-synth/tundra/background.ts
- `src/components/biome-synth/components/` — https://github.com/barmoshe/cosmic-chord-synth/tree/main/src/components/biome-synth/components
- `src/components/biome-synth/hooks/` — https://github.com/barmoshe/cosmic-chord-synth/tree/main/src/components/biome-synth/hooks
- `src/components/biome-synth/hooks/useAudioEngine.ts` — https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/src/components/biome-synth/hooks/useAudioEngine.ts
- `public/` — https://github.com/barmoshe/cosmic-chord-synth/tree/main/public
- `public/audio/` — https://github.com/barmoshe/cosmic-chord-synth/tree/main/public/audio
- `public/audio/CREDITS.txt` — https://raw.githubusercontent.com/barmoshe/cosmic-chord-synth/main/public/audio/CREDITS.txt
