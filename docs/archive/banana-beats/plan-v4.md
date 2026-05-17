# Banana Beats v4 — Algorithmic RPG Scene Engine

## Context

v3 wired 8 distinct animal characters to a procedural beat sequencer, each animating on its own track's hit. The user's verdict: **animations are poor, the stage doesn't feel like an RPG game running in the background.** The fix isn't more sprite polish — it's a fundamentally different layer: a procedural **RPG scene engine** that consumes pattern data + audio events and emits a continuously evolving battle/dungeon/world state. The 8 characters become a party adventuring in real time, with the sequencer acting as their action timeline.

**Locked-in user direction:**
- "Advanced algorithm and math that maps the sequences to animated video scenes of an RPG game in monkey + banana theme"
- "Always-on RPG world" — chars must idle alive even when stopped
- File-size budget: not specified → recommend procedural-only path (no AI assets), aim ~3000 LOC

---

## Why v3 Falls Flat (concrete weaknesses)

| # | v3 weakness | Source |
|---|---|---|
| 1 | Characters static between hits — only spring-decay; no idle locomotion, stance, or context-awareness | Stage code review (`createStage`, lines 580–1500) |
| 2 | No inter-character causality — 8 independent reactions, no call/response, no glance toward the active character | Stage code review |
| 3 | Particles untethered to pattern STRUCTURE — they fire per-hit but don't scale with combos, density, or sequence position | Stage code review |
| 4 | Background props (vines, torches, leaves) decoupled from BPM/trauma/density — they sway on their own clock | Stage code review |
| 5 | No scene-level intent — there's no narrative arc, no "boss arrives," no "world transforms," no progression | Stage code review |
| 6 | Trauma is binary-ish — no gradual world chaos (no parallax distortion, no saturation drift, no environmental destruction) | Stage code review |
| 7 | Character mechanics don't reflect audio CONTENT — the frog doesn't care if its hi-hat pattern is dense or sparse | Stage code review |

Reinforcing principles from the web:
- **Idle animation is what sells "alive"** — 1-pixel vertical bob at 400–500 ms reads as alive in shipped games. v3 has *some* breathing but no second-order detail (cape/hair/tail shift 1px opposite to body). [Pete's QBasic Site, Ch. 10](http://www.petesqbsite.com/sections/tutorials/tuts/tsugumo/chapter10.htm)
- **Damage-number readability:** animate the impact effect *behind* the number, not the number itself. This is a hard rule for v4's combo/damage feedback. [Damage Numbers in RPGs — Shweep](https://shweep.medium.com/damage-numbers-in-rpgs-1f0e3b1bc23a)
- **Cellular automata can BE the music *and* the level** — Otomata, Conway-CA-music, and CA-dungeon-gen all prove the same algorithm doubles as pattern source and spawn-grid. We exploit this: one CA tick generates both an enemy formation AND a sub-pattern. [Otomata](https://earslap.com/page/otomata.html), [Listening to Elementary CA — Holtzkener](https://medium.com/code-music-noise/listening-to-elementary-cellular-automata-661018229362), [Procedural Dungeon Generation: CA — jrheard](https://blog.jrheard.com/procedural-dungeon-generation-cellular-automata)
- **Audio-reactive visuals do not need "more" — they need pattern coupling.** Codrops' Three.js audio visualizer (2025) couples FFT bands to specific scene channels; we apply the same idea to the discrete pattern arrays we already own. [Codrops 3D Audio Visualizer](https://tympanus.net/codrops/2025/06/18/coding-a-3d-audio-visualizer-with-three-js-gsap-web-audio-api/)

---

## Architecture

The v3 stage stays as **layer A (stage)**: procedural Canvas, 8 characters, decorations, spotlights. v4 adds **layer B (RPG world)** rendered *behind* the characters and a **HUD layer C** rendered above. All three layers share one event bus.

```
┌─ Layer C (HUD) ────────────────────────────────┐
│ • Combo counters near each char                │
│ • Damage numbers (impact behind, number above) │
│ • Mini party HP/MP bars                        │
│ • Boss warning banner                          │
│ • Loot popups on accents                       │
├─ Layer A (existing v3 stage) ──────────────────┤
│ • Characters + spotlights + bamboo platform    │
│ • Tiki torches, hibiscus, banana bunches       │
├─ Layer B (NEW — RPG world) ────────────────────┤
│ • Tile-based scrolling battlefield BG          │
│ • Enemy sprites that spawn / advance / die     │
│ • Projectiles between chars and enemies        │
│ • Magic circles, slash arcs, status auras      │
│ • Day/night/weather, light shafts              │
│ • Boss silhouette during boss bars             │
│ • Floating loot, treasure chests, runes        │
└────────────────────────────────────────────────┘
```

`createStage` becomes a thin orchestrator that calls `worldEngine.tick(t, dt)` then `stage.draw()` then `hud.draw()`. The world engine owns its own state + RNG; the stage knows nothing about it.

---

## The Sequence-to-Scene Mapping (the "advanced algorithm")

### Scalar features extracted from pattern state every audio frame

```
density[i]        = pattern[i].filter(Boolean).length / 16
totalDensity      = mean(density)         // 0..1 — overall energy
swing             = stdDev(density)        // 0..1 — chaos vs uniformity
kickPulse         = density[0]             // ground intensity
busyness          = density[2] + density[3]  // hat density → casting speed
melodicHue        = lastBassMidi % 12 * 30  // 0..360 — spell color
leadContour       = leadPattern.map(midiToRelative)  // -1..+1 — arm IK target
consecutive[i]    = run-length of hits in track i
loopBar           = floor(totalSteps / 16) // 0..∞ — narrative phase
```

### The 5 master maps

#### 1. Density → enemy spawn rate (Poisson)
```
spawnInterval = 2.0 / (0.3 + totalDensity * 1.7)   seconds
enemyType = swing < 0.15 ? "swarm" :
            swing < 0.35 ? "grunt" :
            swing < 0.55 ? "elite" : "miniboss"
```

#### 2. Cellular automata → enemy formation
On every `loopWrap`, run **3 ticks of B5678/S345678** on a 16×4 grid seeded by `mulberry32(seed + loopBar)`. Resulting cave-shape becomes the enemy formation that spawns this loop. Empty cells = path; walls = enemies in defensive line. ([CA dungeon-gen — jrheard](https://blog.jrheard.com/procedural-dungeon-generation-cellular-automata))

#### 3. Markov bass note → spell element
The Markov bass scale already produces a midi value per step. Map note class → element:
| Note class | Element | Hue | Visual |
|---|---|---|---|
| 0 (C/root) | Earth | 30° | brown rocks erupt |
| 2 (D) | Wind | 200° | cyan slash |
| 3 (D♯/E♭) | Shadow | 280° | purple ribbon |
| 5 (F) | Water | 220° | blue droplets |
| 7 (G) | Fire | 25° | orange flame |
| 9 (A) | Holy | 60° | gold pillar |
| 10 (A♯/B♭) | Poison | 130° | green mist |

When bass fires on a step, the elephant launches an element-tinted projectile at the front-most enemy.

#### 4. Lead Markov contour → quetzal IK target
Treat 16 lead-track MIDI values as a normalized contour `[-1..+1]`. At step i, Sol the quetzal points its beak toward `(charX + contour[i] * 80, charY + contour[i] * 30)` and emits a tracer arc. Across one bar, the contour traces a melodic shape across the sky.

#### 5. Loop-bar phase → scene state machine
| Bar % 8 | Phase | What happens |
|---|---|---|
| 0–1 | **Encounter** | enemies emerge from fog at right edge, BG biome rolls in via parallax |
| 2–4 | **Battle** | full chaos — projectiles, damage numbers, screen shake, dense particles |
| 5 | **Climax** | mini-boss (large silhouette) walks in from background |
| 6 | **Boss fight** | boss attacks every kick; chars synchronize counter on accents |
| 7 | **Victory** | boss dies → loot chest spawns → palette warms to gold |
| → next 0 | **Travel** | parallax scrolls left fast, biome cross-fades to next |

Biome rotation: `["jungle", "cave", "temple", "volcano"]`, picked by `(loopBar / 8) % 4`. Each biome reskins the BG layer (color palette, foliage style, sky tint) without rebuilding chars.

#### 6. Combo system (per character)
```
if currentStep − lastHitStep[i] ≤ 1:  combo[i] += 1
else:                                  combo[i] = 1
damage[i] = baseDmg[i] * (1 + combo[i] * 0.15) * (0.7 + density[i] * 0.6)
```
Damage rendered as floating number with **shockwave ring behind it** (ring scales/fades, number stays ~static — readability rule). Combo counter shows next to char's HUD slot, color-shifted by hue rotation `combo[i] * 8°`.

#### 7. Mute/solo → party-formation semantics
- **Mute** = "downed" — char prone, gray-out, "Zzz" (already in v3); enemies path *through* their slot
- **Solo** = "spotlight battle" — only that char fights; all enemies funnel toward them; others fade to silhouette; spotlight intensifies; trauma multiplier ×1.5

---

## Per-track RPG class roles

Each animal already has a unique instrument; v4 binds it to an RPG action verb:

| # | Animal | Class | Verb | Visual |
|---|---|---|---|---|
| 0 | Gorilla (Kiko) | **Tank/Berserker** | SLAM | ground crack radial 90px on hit, knockback wave |
| 1 | Capuchin (Riko) | **Rogue** | DAGGER (alt L/R) | dual slash arcs from each stick, brief teleport blur |
| 2 | Tree Frog (Zuri) | **Mage (fast)** | RAPID-CAST | small cyan orbs spawn, fly toward nearest enemy |
| 3 | Chameleon (Luna) | **Sniper** | TONGUE-LASH | tongue extends as a long beam, locks target by hue |
| 4 | Spider Monkey (Bongo) | **Bard/Buffer** | RHYTHM-WAVE | radiant ring boosts neighbors' next-hit damage |
| 5 | Toucan (Mika) | **Ranger** | SCATTER-SEED | banana shrapnel cone forward, pierces small enemies |
| 6 | Elephant (Jumba) | **Elementalist** | ELEMENT-BLAST | Markov-driven elemental projectile (see map #3) |
| 7 | Quetzal (Sol) | **Healer/Conductor** | NOTE-ARC | melodic contour traces arcs that revive downed party |

**Inter-character rules:**
- Bongo's RHYTHM-WAVE buff lasts 1 bar. Buffed chars draw a faint glow border.
- Sol's NOTE-ARC passing over a downed (muted) char temporarily wakes them for 1 bar (visual only — audio still muted).
- Riko's DAGGER triggers crit (×2 dmg, white flash) when combo ≥ 4.
- Kiko's SLAM staggers all enemies in screen for 200ms.

---

## Always-on idle behavior (the "RPG world" feel)

Even with `isPlaying = false`, the world layer keeps ticking at 0.3× speed:

- **Idle bobs**: every char has a 1.2 Hz vertical 1px bob (BPM-locked when playing). Tail/cape elements shift 1px opposite (secondary motion).
- **Wandering critters** (3 at a time): butterflies, dragonflies, fireflies cross the BG following Perlin-noise paths; respawn after exit.
- **Weather**: `weatherIntensity = 0.1 + totalDensity * 0.6`. Rain droplets / fireflies / leaf flurry depending on biome.
- **Light shafts**: 3 parallax god-rays from above, drifting at 0.05 Hz.
- **Day/night**: real-world clock + bar count blends sky from oklch(0.30 0.08 230) → oklch(0.18 0.10 280) → oklch(0.15 0.06 25) over 4 minutes per cycle.
- **Sleep cascade**: 25 s no input → world desaturates 30 % + chars yawn in sequence (left-to-right, 1 char/sec). Any input → instant warm-back animation.

---

## HUD layer (C)

- **Mini party portraits** along top edge — each char's icon, current combo number, HP bar (HP = 100 − damageTakenFromBoss). Fades in only during battle/boss phases.
- **Combo gauges** floating just above each char, only when `combo > 1`. Fade out 1.5 s after streak breaks.
- **Damage numbers** spawned by `worldEngine.dealDamage(charIdx, enemyId, dmg)`. Each number rises 18 px over 0.6 s. Behind it, a shockwave ring (radius 4 → 18 px, alpha 1 → 0) reinforces impact.
- **Phase banner**: tiny text at top-center on phase transitions ("Battle Begins", "Boss: Banana King", "Victory!"). 0.8 s fade.
- **Loot popup**: on accent steps within victory phase, a tiny "+1 🍌" floats upward at the kicking char's location.
- **Reduced-motion**: all HUD floats become instant fades, no movement.

---

## Implementation phases

### Phase 1 — World engine skeleton (~250 LOC)
- New module `createWorldEngine({ getState })` returning `{ tick, draw, dealDamage, spawnEnemy, ... }`
- Layered draw order in main loop: `worldEngine.drawBack()` → existing stage decor → existing chars → `worldEngine.drawMid()` → HUD
- Event bus subscriptions for `trackHit`, `accent`, `loopWrap`, `step`
- Phase state machine (encounter / battle / climax / boss / victory / travel)

### Phase 2 — Enemy + projectile system (~400 LOC)
- Enemy entity pool (max 24 active): position, hp, type, sprite, hit-box
- 4 enemy types as procedural sprites: `swarmlet` (small bat shape), `grunt` (stout creature), `elite` (taller w/ crest), `miniboss` (twice the size)
- Projectile pool (max 60): origin char, target, parabolic arc, element hue, trail
- Hit detection: simple AABB; on hit → `dealDamage(charIdx, enemyId, dmg)`

### Phase 3 — CA-driven enemy formation (~80 LOC)
- 16×4 grid CA, B5678/S345678, 3 iterations on every loopWrap
- Empty cell ⇒ enemy path slot; wall cell ⇒ enemy spawn point this loop
- Visualize the cave outline behind enemies as a faint dotted line (debug-style; charming)

### Phase 4 — RPG class verbs + element mapping (~350 LOC)
- 8 verb implementations (one per char) — each a function `(ch, step, energy) → emit visual + spawn projectile`
- Markov-bass-note → element table → projectile hue/trail style
- Inter-character rules (bard buff aura, healer revive, rogue crit)

### Phase 5 — HUD (~200 LOC)
- Damage number renderer w/ shockwave-behind pattern
- Combo gauges, mini portraits with HP, phase banner, loot popups

### Phase 6 — Always-on idle world (~250 LOC)
- 1px-bob breathing on all chars (BPM-coupled or 1.2 Hz when stopped)
- Critter pool (butterflies + fireflies + dragonflies, 3 active)
- Weather (rain/firefly/leaf depending on biome)
- Day-night palette blender
- Sleep cascade

### Phase 7 — Biome rotation (~150 LOC)
- 4 biome BG drawers: jungle (current), cave (rocks + crystals), temple (pillars + glyphs), volcano (lava cracks)
- Cross-fade BG by interpolating layer-B alpha during travel phase

### Phase 8 — Polish + reduced-motion (~120 LOC)
- All world-engine motion respects `prefers-reduced-motion`: no parallax, no shake, no shockwaves; HUD becomes static text
- Performance: cap projectiles 60, enemies 24, particles 200, damage numbers 30
- Off-screen culling for entities

**Total estimated new code: ~1800 LOC. Target file size after v4: ~4200 LOC, ~150 KB.**

---

## Critical files

| File | Role |
|---|---|
| `artifacts/html/banana-beats.html` | **Output target** — extend `createStage` to compose `worldEngine` + existing chars + new HUD |
| `handoff-v1.md` | v3 build spec (still valid for layer A) |
| `research-monkey-sequencer.md` §3 | Animation routing matrix — extended to RPG verbs in this plan |
| `knowledge/06-games.md` | RPG primitives (BSP/CA/Verlet/spring) — reused throughout |
| `skills/procgen-toolkit/SKILL.md` | CA + BSP + Poisson reference for enemy formations |

---

## Risks & mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Frame-time blowout from 60 projectiles + 24 enemies + 200 particles + chars | High | Strict pools w/ caps; off-screen cull; one allocation per entity per spawn (no GC churn) |
| Visual noise drowns the chars | Medium | Layer B (world) drawn at α 0.85; enemies clipped to lower 60% of canvas; HUD only during battle/boss phases |
| RPG layer breaks during reroll/preset-load | Medium | `worldEngine.reset()` called on REROLL_ALL and LOAD_PRESET — flush enemies/projectiles, restart phase machine at "encounter" |
| Reduced-motion users get nothing interesting | Medium | Static "phase banner" text + static enemy silhouettes still render; just no animations |
| File grows past ~150 KB cap | Low | Procedural-only path (no AI sprites); each enemy/projectile drawn from primitives, not bitmaps |
| State sync: world engine reads game state via getter, but state changes mid-frame | Low | Snapshot getState once per audio-frame inside the sequence callback (already the v3 pattern) |

---

## Verification (after v4 lands)

1. **Always-on idle**: open page, do *not* press play. Wait 30s. Critters cross, torches flicker BPM-coupled at default 96, day-night blender ticks, no errors.
2. **Phase progression**: press play, observe 8 bars. Phase banner shows: Encounter → Battle → Climax → Boss → Victory → Travel → next biome. Biome BG crossfades.
3. **Class verbs**: pause on a bar with all 8 tracks dense. Verify each char emits its verb's visual signature (gorilla ground crack, capuchin dual slashes, etc.).
4. **Element mapping**: edit bass pattern to a single note that loops (e.g. only step 0). Verify the elephant's projectile color matches the note's element row in map #3.
5. **Combo + damage**: program 4 consecutive kick steps. Watch Kiko's combo gauge climb 1→4, damage numbers rise behind a shockwave ring.
6. **CA formation**: reroll several times, watch enemy spawn formation change deterministically per seed (run the same seed twice → same formation).
7. **Mute/solo semantics**: solo Lead — only Sol fights, others go silhouette, all enemies funnel to Sol. Mute Kick — Kiko goes prone, enemies path through his slot.
8. **Reduced-motion**: enable in DevTools, reload. No projectiles, no particles, no shockwaves, but HUD text + phase banner still readable.
9. **Performance**: with 8 dense tracks at 140 BPM, monitor frame time stays under 16 ms (60 fps).
10. **No regressions**: v3 features still pass — pads, mixer, FX, presets, Space/R/1–8 keyboard, persistence.

---

## Open questions for the user before build

1. **Boss design**: should the boss be a giant Banana King (a 9th procedural creature drawn as a huge crowned banana with the gorilla's silhouette but 4× scale), or just a darker palette-shifted "shadow gorilla"?
2. **Damage HUD intensity**: full damage numbers on every hit, or only on kills + accents (cleaner)?
3. **Enemy art direction**: cartoon jungle critters (peel-monsters, vine-things, mosquitoes) or generic RPG silhouettes (orcs, slimes, bats)? Theme says monkey/banana, so leaning peel-monsters.
4. **Biome cycling**: 4-biome rotation auto-advances every 8 bars. OK to keep automatic, or expose a manual "biome" picker in the FX tab?
5. **AI assets**: still procedural-only (recommend), or unlock the asset-router MCP and bake sprite atlases for the 4 enemy types + 4 biome backgrounds (~$0.50 in Replicate cost)?

---

## Sources

- [Procedural Dungeon Generation: Cellular Automata — jrheard's blog](https://blog.jrheard.com/procedural-dungeon-generation-cellular-automata) — B5678/S345678 rule, fill-then-iterate algorithm
- [Listening to Elementary Cellular Automata — Holtzkener (Code/Music/Noise)](https://medium.com/code-music-noise/listening-to-elementary-cellular-automata-661018229362) — CA cell→drum-trigger mapping
- [Otomata — earslap](https://earslap.com/page/otomata.html) — generative musical sequencer using CA agents
- [Procedural Level Generation in Games using a Cellular Automaton — Kodeco](https://www.kodeco.com/2425-procedural-level-generation-in-games-using-a-cellular-automaton-part-1) — cave-formation tutorial
- [Damage Numbers in RPGs — Shweep / Medium](https://shweep.medium.com/damage-numbers-in-rpgs-1f0e3b1bc23a) — readability rule (animate behind, not the number)
- [Coding a 3D Audio Visualizer with Three.js, GSAP & Web Audio API — Codrops (June 2025)](https://tympanus.net/codrops/2025/06/18/coding-a-3d-audio-visualizer-with-three-js-gsap-web-audio-api/) — channel-based pattern coupling pattern
- [Pete's QBasic Site Ch. 10 — Breathing Life Into Your Sprites](http://www.petesqbsite.com/sections/tutorials/tuts/tsugumo/chapter10.htm) — 1px bob + opposite-shift secondary motion
- [Synesthesia live music visualizer](https://synesthesia.live/) — reference for "stage performance" framing
- Repo agent's review of `artifacts/html/banana-beats.html` lines 580–1500 — v3 weakness audit
