# Banana Beats v4 — Full Reinvention Plan

## Context

The user requested a **full reinvention** of `artifacts/html/banana-beats.html`. Three axes need to land at once:

1. **STAGE** — RPG-game-running-in-the-background with algorithmic mappings from pattern data → scene events. (Detailed research already in `plan-v4.md`.)
2. **SEQ + MUSIC** — richer expression: velocity, probability, swing, humanization, melodic key/octave control, pattern banks.
3. **UX/UI** — bigger stage, smaller-but-denser sequencer, better transport (slider+tap-tempo, visual playhead, quick-action buttons), discoverable interactions.

Already-locked design decisions from earlier in this session (do **not** revisit):

- Boss = **Banana King** (4× crowned banana monster).
- Damage HUD = **OFF** — visual feedback only (impact rings, hit-flashes, enemy death squashes).
- Enemies = **Mixed per biome** (peel-monsters in jungle, slimes in cave, glyphs in temple, lava-imps in volcano) → 16 unique procedural enemy draws.
- Biome flow = **Auto-rotate every 8 bars** through `[jungle, cave, temple, volcano]`.
- Idle world = **Full** — chars idle-bob, critters cross, weather, day/night, fireflies, ticks at 0.3× when stopped.
- Class verbs = **Bold + readable** — chunky shapes, clear silhouettes per character.
- Assets = **Procedural but generous** — "don't be lazy, lots of assets, sprites, SVGs" → ~75 distinct draw functions.
- Combo viz = **Intensity multiplier** — combo drives bigger particles + brighter flash + larger shockwave (no numerals).
- HUD = **Phase banner + Boss warning only**.
- Reduced-motion = **Cinema-respect** — disable motion, keep static enemy silhouettes + biome tints + readable banner.

Since the user said "don't ask any questions" for the seq/music/UX axis, this plan **makes opinionated decisions** for all three axes and documents them as locked. They can override anything when reviewing the plan.

## Engineering reality check

The current artifact is 2,414 LOC / ~99 KB. v3 systems that **work and stay**: audio engine (synth graph, sequences, FX sends), reducer, persistence, palette, the `bus` event emitter, physics helpers (`springStep`, `updateVerletPoint`, `constrainDist`), `mulberry32`, `euclidean`, `markovGenerate`, `densityNoise`. **The reinvention is conceptual** — every visible surface changes, but we extend the existing file in place to avoid losing battle-tested code. Net target: ~5,500 LOC / ~190 KB.

## Critical files

| File | Change |
|---|---|
| `artifacts/html/banana-beats.html` | All edits land here. Three large sections rewritten + new code added. |

No other file modifications.

## Locked design — Axis 1: STAGE (RPG world engine)

Per `plan-v4.md` and the earlier-locked decisions in this session. Key implementation primitives:

- **3-layer architecture** — Layer A (existing v3 chars) + Layer B (NEW world engine: enemies, projectiles, biome BG, critters, weather, day/night) + Layer C (NEW HUD: phase banner, boss warning).
- **5 master maps**:
  1. `density → enemy spawn rate (Poisson)` + `swing (stdDev) → enemy type`.
  2. **Cellular automata** B5678/S345678 seeded by `seed + loopBar`, 16×4 grid → enemy formation each loop. Reuses jrheard's CA-dungeon recipe.
  3. Markov bass note class → spell **element** (7-element table: earth/wind/shadow/water/fire/holy/poison) → elephant projectile hue.
  4. Lead Markov contour → quetzal IK arc target (melody traces shape across sky).
  5. `loopBar % 8` → **scene phase**: encounter (0-1) → battle (2-4) → climax (5) → boss (6) → victory (7) → travel (next 0).
- **8 RPG class verbs** (bold readable): SLAM (Kiko) / DAGGER alt-LR (Riko) / RAPID-CAST (Zuri) / TONGUE-LASH (Luna) / RHYTHM-WAVE buff aura (Bongo) / SCATTER-SEED cone (Mika) / ELEMENT-BLAST (Jumba) / NOTE-ARC reviver (Sol).
- **Inter-character rules**: Bongo's RHYTHM-WAVE buffs neighbors' next hit; Sol's NOTE-ARC over a downed (muted) char wakes it visually for 1 bar; Riko's DAGGER crits at combo ≥4; Kiko's SLAM staggers all enemies for 200 ms.
- **Banana King boss** (~80 LOC + 40 LOC attack pattern) — walks in from background fog, slams every kick during boss phase, owns kick lane spiritually.
- **Combo intensity multiplier** — `combo[i]` scales particle count + flash brightness + shockwave radius for that char's verb. No numerals shown.
- **Always-on idle** — 1px char bob (BPM-coupled / 1.2 Hz idle), critter pool (3 active from 9 sprite designs), weather per biome (jungle leaves / cave motes / temple sigils / volcano sparks), day/night palette blender, sleep cascade after 25s no input.

**Asset budget**: ~75 distinct procedural draw functions, ~2,300 LOC of new visual code.

## Locked design — Axis 2: SEQ + MUSIC

### Per-cell expression

- **Velocity per cell** — click toggles on/off; click+drag-vertical sets velocity 0.2-1.0. Pad's vertical color fill height visualizes velocity. Default new hits = 1.0.
- **Probability per cell** — right-click cycles 100% / 75% / 50% / 25%. Sub-100% cells render with a small dotted overlay.
- Both feed into `triggerTrack(i, val, time)` — multiply `velocity` by Tone's velocity arg; gate by `Math.random() < probability` at audio-frame time.

### Pattern banks A/B/C/D

- 4 pattern slots per track. Switching active bank with keys `1`/`2`/`3`/`4` (replaces current per-track reroll keys; reroll moves to `Shift+1`-`Shift+8`).
- Banks editable independently. New tracks initialize bank A only; B/C/D start empty until edited.

### Swing + humanization (global)

- **Swing** slider 0-60% in transport — delays every odd 16th by `swing × 16th_duration × 0.5`. Implementation: schedule odd-step Tone events with offset.
- **Humanization** toggle — when on, each scheduled hit gets ±10ms timing jitter + ±10% velocity jitter (deterministic via `mulberry32(seed + step + track)` so it's reproducible with the seed).

### Melodic controls (Bass + Lead)

- **Octave** stepper (-2 / -1 / 0 / +1 / +2) per melodic track in mixer tab.
- **Root key** dropdown (C, C♯, D, D♯, E, F, F♯, G, G♯, A, A♯, B) per melodic track. Default C.
- Both apply post-Markov: final MIDI = `markovNote + (octave * 12) + rootOffset`.

### Sound variations per track

- Each track gets **3 sound variants** cycled via a small button next to the track name in the mixer tab. Variants:
  - Kick: `808 / acoustic-thud / banana-thump`
  - Snare: `crisp / fat / clap`
  - Closed Hat: `tight / loose / shaker-style`
  - Open Hat: `crashy / sizzle / wash`
  - Bongo: `low-tom / wood-block / temple-bell`
  - Shaker: `egg / maraca / leaf-rustle`
  - Bass: `square-sub / saw-grind / sine-pluck`
  - Lead: `triangle-bell / square-arp / pluck`

  Each variant tweaks synth params (osc type, envelope, filter freq, decay). Adds `variant: 0/1/2` to track state, audio engine reads it to swap settings.

### Quick-action buttons (transport bar)

- **Clear** — empties active bank for all tracks.
- **Fill** — applies a "starter kit" pattern (kick on 1/5/9/13, snare on 5/13, closed hat on every 16th).
- **Random Mute** — randomly mutes 1-3 tracks for variation. Click again to restore.

## Locked design — Axis 3: UX / UI / VISUAL STYLE

### New layout (full reinvention of the visible surface)

**v3** had: header → small stage (240px) → sequencer pads → tab bar → (mixer/fx/preset) panel → kb hint. Vertical, chassis-bound, ~860px wide.

**v4 layout** (still single HTML artifact, single React tree):

```
┌───────────────────────────────────────────────────────────────────┐
│  HEADER                                                           │
│  🍌 BANANA BEATS [LED]   [Phase: Battle]    [BPM 96 ▓▓▓░] [TAP]  │
│                                                  [▶/■]            │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│             RPG STAGE  (full-width, 360px tall)                   │
│        — biome BG / chars / enemies / boss / HUD —                │
│                                                                   │
├───────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────── PLAYHEAD BAR ────────────────────────┐│
│  │ ◢▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔│ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  KICK   ■ □ □ □ ■ □ □ □ ■ □ □ □ ■ □ □ □    🎲 [808 ▾]            │
│  SNARE  □ □ □ □ ■ □ □ □ □ □ □ □ ■ □ □ □    🎲 [Crisp ▾]          │
│  ... 8 rows ...  with row backlight tinted by track color         │
│                                                                   │
│  [Bank A] [B] [C] [D]    [SWING 35%▓▓░]  [HUMAN ✓]              │
│  [Clear] [Fill] [RandMute]    [SEQ] [MIX] [FX] [PRESET]          │
└───────────────────────────────────────────────────────────────────┘
```

### Visual style: **Hybrid beige + per-track halos** (locked)

- Chassis stays beige (current `oklch(0.88 0.07 75)`, etc.).
- Lit pads gain a **brighter glow** matching track color (`var(--tk0)` etc.) plus a halo shadow.
- Each pad row gets a subtle **backlight gradient** in its track color (~10% saturation), so tracks read as "channels" at a glance.
- Pad cells render velocity as a **vertical color-fill height** (full = 1.0, half = 0.5, etc.).
- Probability < 100% adds a small **dotted top-edge** to the pad.
- Step 1, 5, 9, 13 (downbeats) are **slightly larger** with a thin top tick mark.

### Transport upgrades

- **BPM = horizontal slider** (range 40-200) + numeric readout + **TAP TEMPO button** that registers tempo from inter-tap intervals (rolling avg over last 4 taps).
- **Big play/stop button** — primary CTA, takes ~120px width. Pulses subtly to BPM when stopped (encourages click).
- **Visual playhead bar** — horizontal sweep above the pad grid, 6px tall, moves left-to-right per `Tone.Draw.schedule` step events. Gives precise current-step indication independent of pad highlight.

### Interaction model (full)

| Action | Result |
|---|---|
| Left-click pad | Toggle on/off (step) |
| Click+drag-vertical on pad | Set velocity (0.2-1.0) |
| Right-click pad | Cycle probability (100/75/50/25%) |
| Hover pad | Tooltip: track name, step, velocity, probability |
| Click track name | Cycle sound variant (3 options) |
| 🎲 per-row | Reroll just that track's bank |
| `Space` | Play/stop |
| `R` | Reroll current bank, all tracks |
| `1-4` | Switch active pattern bank (A/B/C/D) |
| `Shift+1`-`Shift+8` | Reroll specific track |
| `M` | Toggle mute focused track |
| `Q` | Quick-clear active bank |
| `F` | Quick-fill active bank |
| Cmd/Ctrl+S | Save to URL hash, copy to clipboard, toast confirm |

### Tabs

Tabs are kept but **slim** (8px taller pills, less prominent — most controls now live in the main bar). Tab content panels:

- **SEQ** (default) — pattern banks A/B/C/D + swing + human + quick-actions (lives below pad grid).
- **MIX** — per-track gain, pan, mute, solo, sound variant cycler, octave + key for melodic tracks.
- **FX** — current 4 FX slots, unchanged.
- **PRESET** — current preset list + new "Copy URL" button that encodes current state to hash.

### State to URL hash

- Encode `{ bpm, swing, humanize, tracks, fx, master }` as base64-JSON in URL hash on "Copy URL" press.
- On load, if hash present, decode and `LOAD_SAVED` it.

## Existing utilities to reuse (don't reinvent)

| Utility | Location | Reuse |
|---|---|---|
| `mulberry32(seed)` | top of artifact | All deterministic randomness (CA seed, humanize jitter, critter paths) |
| `euclidean(steps, hits)` | top of artifact | Drum patterns (kept), enemy formation rhythms |
| `markovGenerate` | top of artifact | Bass + lead notes (kept) |
| `bus` (event emitter) | top of artifact | Subscribe `trackHit`, `accent`, `loopWrap`, `step` |
| `springStep`, `updateVerletPoint`, `constrainDist` | physics helpers | Enemy bobs, projectile parabolas, boss verlet chains, critter wing flapping |
| `TRACK_COLORS_RAW` | top of artifact | Per-track hue source for projectile tints, spotlight colors, combo flash, row backlights |
| `palette-oklch` MCP | available | Generate biome-specific palette tokens at build time (cave hue 280, temple 50, volcano 25) |

## Implementation phase order (build incrementally; preview after each)

1. **State + reducer extensions** (~150 LOC) — add per-cell velocity (`Float[]`) and probability (`Float[]`), pattern banks (`{ a, b, c, d }` per track, `activeBank` per track or global), swing, humanize, sound-variant per track, octave + root for bass/lead. Migrate `pattern` reads to `getCurrentBank(track).pattern`.
2. **Audio engine extensions** (~200 LOC) — read velocity into Tone trigger, gate by probability, apply swing offset for odd 16ths, apply humanization jitter, apply variant settings + octave + root.
3. **Layout reinvention** (~300 LOC) — restructure JSX: full-width stage on top, transport bar with BPM slider + tap-tempo + big play, playhead bar, pad grid with row backlights + larger downbeat cells. Update CSS.
4. **Pad cell upgrades** (~250 LOC) — velocity fill, probability dots, drag-to-set-velocity, right-click probability, hover tooltips.
5. **Pattern banks UX** (~120 LOC) — bank switcher A/B/C/D, keyboard shortcuts, per-bank state in reducer.
6. **Quick actions** (~80 LOC) — Clear, Fill, RandMute buttons + handlers + keyboard.
7. **Sound variants** (~150 LOC) — variant cycler per track in mixer, audio engine variant mapping (kick: 808/acoustic/banana-thump; etc.), 24 distinct synth configs total (8 tracks × 3).
8. **URL hash save/load** (~80 LOC) — base64-JSON encode/decode, "Copy URL" button in preset tab + Cmd/Ctrl+S.
9. **World engine skeleton** (~150 LOC) — `createWorldEngine({ getState, bus })` with phase machine, wiring into stage's main draw loop.
10. **Always-on idle world** (~250 LOC) — char idle bobs, critter pool (9 sprite designs, 3 active), weather sub-system, day/night palette blender, sleep cascade.
11. **Biome BG plates × 4** (~320 LOC) — jungle (current), cave (rocks + crystals + bioluminescent moss), temple (pillars + glyphs + dust motes), volcano (lava cracks + smoke). Cross-fade on travel.
12. **Enemy system + 16 enemy draws** (~700 LOC) — entity pool max 24, AABB hit detection, 4 types × 4 biomes (16 unique procedural).
13. **Projectile system + element mapping** (~250 LOC) — pool max 60, parabolic arcs, 7 element styles per Markov-bass-note table.
14. **8 class verbs** (~400 LOC) — bold readable visuals; combo intensity multiplier wired in.
15. **Banana King boss + boss phase** (~140 LOC) — drawBananaKing, attack pattern (slams every kick during boss bar), boss-phase camera zoom 1.0 → 1.05.
16. **HUD layer** (~80 LOC) — phase banner ("Encounter / Battle / Climax / Boss / Victory / Travel"), Boss warning red flash 1 bar before boss.
17. **Reduced-motion guards** (~60 LOC) — wrap motion-emitting code paths in `if (!reducedMotion)`. Static fallback for enemies (frozen mid-pose).
18. **Performance polish** (~60 LOC) — entity caps (24 enemies, 60 projectiles, 200 particles, 9 critters), off-screen culling.

**Total new code: ~3,500 LOC. Final file: ~5,900 LOC, ~200 KB.** Within procedural-only budget.

## Verification

1. **Layout**: page loads, transport bar visible at top with BPM slider + tap-tempo + big play; full-width stage takes top half; pad grid below has row backlights and larger downbeat cells.
2. **Per-cell velocity**: drag-vertically on a kick cell, see fill height change; play it back, hear loudness change.
3. **Per-cell probability**: right-click a cell 4 times, see dotted overlay change (100→75→50→25→100); play, observe probabilistic firing.
4. **Pattern banks**: edit on bank A; press `2`, edit a different pattern; press `1` again — bank A pattern reappears.
5. **Swing**: set 50% swing, play; even 16ths feel pushed. At 0%, even and straight.
6. **Humanize**: toggle on, audible micro-timing variation. Same seed twice → same jitter (deterministic).
7. **Octave + key**: change Bass to root D, octave +1 — heard transposition.
8. **Sound variants**: cycle kick variants — 808 → acoustic-thud → banana-thump audibly different.
9. **Quick actions**: Clear empties grid, Fill applies starter kit, RandMute mutes 1-3 tracks (visible button states).
10. **Tap tempo**: tap 4 times at ~120 BPM → BPM slider reads ~120.
11. **URL hash save**: hit Cmd+S, paste hash into new tab, state restores.
12. **Always-on idle stage**: open page, don't press play, wait 30s — critters cross, biome subtly shifts color, no errors.
13. **Phase progression**: press play, observe 8 bars — phase banner fades in/out at each phase change; biome cross-fades on travel; Banana King appears in boss phase.
14. **Class verbs visible** with all 8 tracks dense — gorilla ground crack + capuchin dual slashes + quetzal ribbon + etc.
15. **Element mapping**: bass on single note → elephant projectile color matches element table.
16. **CA formation**: same seed → identical enemy formation across reloads.
17. **Combo intensity**: 4 consecutive kick steps → Kiko's hit visuals get bigger + brighter without numerals.
18. **Mute/solo semantics**: solo Lead → only Sol fights, others silhouette, enemies funnel; mute Kick → Kiko prone, enemies path through slot.
19. **Reduced-motion**: enable in DevTools, reload — biome tints + static enemy silhouettes + phase banner remain readable; no projectiles, no shockwaves, no shake, no motion.
20. **No regressions**: pads, mixer, FX, presets, persistence still work.
21. **Performance**: at 140 BPM, all 8 dense, boss phase, frame time stays under 16ms (60 fps).

## Backup

Pre-v4 backup at `/tmp/banana-beats-v3-backup.html` (created during v3 work). Add a fresh backup before phase 1 starts.

## Out of scope (deferred)

- AI sprite atlas (asset-router still not connected; v4 stays procedural).
- Audio sweetener (boss roar SFX, wave-clear chime).
- Manual biome picker (auto-rotation locked).
- Mobile-touch optimizations (right-click + drag-velocity assume desktop; mobile may need long-press alternatives — flag for v5).
