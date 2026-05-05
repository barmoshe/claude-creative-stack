# Art Design System
> Status: draft
> Owner: general-purpose agent
> Last updated: 2026-05-05

## TL;DR (≤150 words)

A design-system layer above R6's shaders: tokens, type, icons, slice-state visuals, motion, a11y. Recommend **oklch tokens per biome** (R2's hex converted), plus a shared neutral set for the hub, dialogs, tooltips. Type pairings per biome from Google Fonts (variable axes preferred): Space Grotesk + JetBrains Mono (Space), Frank Ruhl + Nunito (Jungle), Lora + IBM Plex (Sea), VT323 + Oswald (Cyberpunk), Playfair + Manrope (Tundra). Slice-state language is **shape-first, color-second** (colorblind-safe by construction). Motion engine: **Motion (motion.dev)** for built-in `prefers-reduced-motion` and a ≈18 KB core. Icons: **Lucide**, tree-shaken. Phase-1 ships eight token groups, slice-state primitives, and four motion primitives. Working name: lean **BiomeBeats**; alternates *Pizzascale*, *RingScribe* surfaced for R10. Top risks: Cyberpunk contrast, font payload, focus-ring rendering on curved slices.

## Scope & questions

What does BiomeBeats look like as a product — typography, icons, slice states, motion, color tokens, branding, a11y — above R6's per-biome shaders?

In scope: design-system primitives and brand. Out of scope: shaders (R6), sound (R11), interaction (R9), engine (R10). Stop point where R10 must pick (working name, palette strategy) — options with tradeoffs.

## Findings (with inline citations)

### Color tokens (oklch + per-biome palettes)

CLAUDE.md mandates oklch and WCAG contrast checks. oklch is the cylindrical form of Oklab — `L` 0–1, `C` 0–0.4, `h` 0–360 — perceptually uniform, so equal numerical changes look like equal perceptual changes ([MDN oklch()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch); [oklch.com](https://oklch.com/)). R2's literals converted via [oklch.com](https://oklch.com/) and [openreplay hex→oklch](https://openreplay.com/tools/hex-to-oklch/). Notation: `oklch(L C h)`.

| Biome | bg | bg-subtle | surface | accent | accent-strong | text | text-muted | border |
|---|---|---|---|---|---|---|---|---|
| Space | `oklch(0.10 0.04 260)` | `oklch(0.16 0.05 260)` | `oklch(0.22 0.03 260)` | `oklch(0.85 0.13 90)` (gold) | `oklch(0.92 0.15 200)` (cyan-tint) | `oklch(0.97 0.01 260)` | `oklch(0.72 0.02 260)` | `oklch(0.30 0.02 260)` |
| Jungle | `oklch(0.18 0.05 150)` (#0a1f14) | `oklch(0.30 0.07 150)` (#143d28) | `oklch(0.22 0.06 150)` | `oklch(0.78 0.16 145)` (fern) | `oklch(0.80 0.17 75)` (sun #f59e0b) | `oklch(0.95 0.01 150)` | `oklch(0.70 0.02 150)` | `oklch(0.34 0.04 150)` |
| Sea | `oklch(0.16 0.06 240)` (#0a1f2e) | `oklch(0.34 0.08 230)` (#1a4d6e) | `oklch(0.20 0.07 240)` | `oklch(0.88 0.12 165)` (rays #a8e6cf) | `oklch(0.55 0.13 230)` | `oklch(0.96 0.01 230)` | `oklch(0.74 0.02 230)` | `oklch(0.32 0.05 230)` |
| Cyberpunk | `oklch(0.10 0.10 290)` (#07021a) | `oklch(0.18 0.16 305)` (#2a0a3f) | `oklch(0.14 0.13 295)` | `oklch(0.65 0.30 340)` (hot pink) | `oklch(0.80 0.18 215)` (cyan #21e7ff) | `oklch(0.97 0.01 295)` | `oklch(0.72 0.03 320)` | `oklch(0.30 0.10 305)` |
| Tundra | `oklch(0.97 0.02 230)` (#eaf8ff) | `oklch(0.93 0.04 225)` (#c3e4f7) | `oklch(0.99 0.01 230)` | `oklch(0.74 0.10 225)` (glacier shadow) | `oklch(0.90 0.05 95)` (sun-glow warm) | `oklch(0.20 0.04 230)` | `oklch(0.45 0.04 230)` | `oklch(0.85 0.04 225)` |

WCAG 2.2 AA: ≥ 4.5:1 for normal text, ≥ 3:1 for large ([W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/); [SC 1.4.3](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)). All `text` on `bg` pairings above pass (Space/Jungle/Sea/Cyberpunk near-white-on-dark > 13:1; Tundra near-black on near-white ≈ 14:1). Cyberpunk pink-on-cyan accent-on-accent-strong is ≈ 1.4:1 and **fails for text** — that pairing is reserved for shape fills only.

**Shared neutral tokens** (biome-agnostic — hub, dialogs, focus rings):

```
--surface-glass:        oklch(1 0 0 / 0.08)
--surface-glass-strong: oklch(1 0 0 / 0.16)
--shadow-deep:          oklch(0 0 0 / 0.55)
--focus-ring:           oklch(1 0 0 / 0.85)
--scrim:                oklch(0 0 0 / 0.40)
```

**Stop point for R10 — palette strategy.** (1) Single global `PAL` plus per-biome backgrounds (R2's pattern, minimal surface, but accent reads identical across biomes). (2) Per-biome palette tables (above; each biome distinct, but 5× tokens). **Recommend option 2** — chrome occupies ~70% of the screen, so it must feel biome-aligned for immersion.

### Typography

`jweb` ships fonts inline or via CDN — variable fonts preferred (one file, multiple weights) ([Inter](https://fonts.google.com/specimen/Inter); [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)).

| Biome | Display / heading | UI / body | Variable axes | Notes |
|---|---|---|---|---|
| Space | **Space Grotesk** (variable, weights 300–700) | **JetBrains Mono** (variable) | both | Space Grotesk derives from Colophon's Space Mono, geometric and futurist; JetBrains Mono is the default coder mono ([Space Grotesk on Google Fonts](https://fonts.google.com/specimen/Space+Grotesk); [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)) |
| Jungle | **Frank Ruhl Libre** (organic display serif) | **Nunito** (humanist sans, variable) | Nunito | Warm, hand-drawn feel against jungle greens |
| Sea | **Lora** (variable serif, italic axis) | **IBM Plex Sans** (variable) | both | Lora's flowing curves echo water; Plex is calm and neutral |
| Cyberpunk | **VT323** (CRT-bitmap monospace, regular only) | **Oswald** (variable condensed sans) | Oswald | VT323 is a faithful DEC VT320 terminal recreation; pairs with billboard-tight condensed sans ([VT323](https://fonts.google.com/specimen/VT323)) |
| Tundra | **Playfair Display** (variable Didone) | **Manrope** (variable geometric sans) | both | Editorial cool — high contrast Didone over a clean grotesque |

**Type scale.** Modular **1.2 (Minor Third)** is the sweet spot for dense UI ([Liminfo Type Scale Calculator](https://www.liminfo.com/tools/typescalecalc); [Imperavi — Modular Scale](https://imperavi.com/books/ui-typography/principles/modular-scale/)). Base 14 px → **caption 11.7, ui-label 12, body 14, h2 16.8, h1 20.2, hero 24.3**, tuned to a 480×480→1024×768 plug-in range. Six of ten faces are variable; VT323 is intentionally static (display use only).

### Iconography & slice states

Seven states. **Shape carries state; color carries biome** — colorblind-safe by construction ([Smashing: Designing for Colorblindness](https://www.smashingmagazine.com/2024/02/designing-for-colorblindness/); [colorblindguide.com](https://www.colorblindguide.com/post/colorblind-friendly-design-3)).

| State | Visual | Reference | Biome-specific? |
|---|---|---|---|
| Empty | 1 px outline at 30% opacity, no fill | Push 3 gray "no note" pad ([Push 3 Manual](https://www.ableton.com/en/push/manual/)) | Neutral shape; biome-tinted outline |
| Armed | Solid radial fill in `accent` | Maschine MK3 RGB pad colored to a group ([Native Instruments MK3](https://www.thomannmusic.com/native_instruments_maschine_mk3_black.htm)) | Color biome, shape neutral |
| Playing | Armed + 2 px inner glow ring + 80 ms scale pulse | Push 3's "moving green pad during playback" ([Push 3 Manual](https://www.ableton.com/en/push/manual/)) | Glow color biome-driven |
| Muted | Armed silhouette + 45° diagonal slash, 70% desaturation | Push 3 "darker version of track color = muted" ([Push 3 Manual](https://www.ableton.com/en/push/manual/)) | Slash neutral |
| Accent | Armed + small chevron at outer edge | Beat Scholar's accented "pizza slice" emphasis ([Modalics Beat Scholar](https://www.modalics.com/beatscholar)) | Chevron neutral white |
| Tied | Armed + arc connector to previous slice | Step-sequencer "tied note" convention | Connector neutral |
| Focused | 3 px outer outline using `--focus-ring` (white 85%) | Apple HIG focus visibility ([Apple HIG Focus and Selection](https://developer.apple.com/design/human-interface-guidelines/focus-and-selection)) | Neutral; biome-agnostic |

**Toolbar icons: [Lucide](https://lucide.dev/) v0.x.** 1600+ MIT icons, tree-shaken — only imports ship, critical for `jweb` ([Lucide guide](https://lucide.dev/guide/); [tree-shaking issue #1733](https://github.com/lucide-icons/lucide/issues/1733)). Initial nine: `play`, `pause`, `square`, `globe-2`, `settings-2`, `circle-help`, `volume-2`, `circle-dot`, `slash`.

### Motion language

Composite-only props (`transform`, `opacity`, `filter`) and `prefers-reduced-motion` are mandates from CLAUDE.md.

| Behaviour | Spec | Reduced-motion fallback |
|---|---|---|
| Slice activation | 200 ms ease-out, scale 0.85 → 1.0 + opacity 0 → 1 | Instant fill change, no scale |
| Playhead | Continuous outer-ring rotation, bar-locked | Discrete step-jump indicator (no rotation) |
| Biome transition | 600 ms cross-fade of bg + 90° wheel rotation | Instant cross-cut, no rotation |
| Slice pulse on hit | 80 ms scale 1.0 → 1.15 → 1.0 + 100 ms `filter: brightness(1.5)` flash | Single 100 ms brightness flash, no scale |

**Library: [Motion (motion.dev)](https://motion.dev/docs/gsap-vs-motion).** Built-in `prefers-reduced-motion` fallback (GSAP needs manual `gsap.matchMedia()` wiring — [GSAP a11y](https://gsap.com/resources/a11y/)); ≈18 KB core vs GSAP's 23 KB or Anime.js' ≈75 KB ([LogRocket 2026](https://blog.logrocket.com/best-react-animation-libraries/)); ESM-friendly so runs in `jweb` without polyfills. Tradeoff: GSAP's timeline orchestration is richer; BiomeBeats' four primitives don't need it.

### Layout & spacing

**Window range.** Min **480 × 480** (must read split with Live's session view), max **1024 × 768**, default **720 × 720**.

**Spacing.** **4-pt base** with 8-pt rhythm for major gutters — Material Design 3 standardises on 4 dp ([M3 Layout Spacing](https://m3.material.io/foundations/layout/understanding-layout/spacing)); 4 pt gives slice-edge label granularity, 8 pt holds page rhythm ([Spec.fm 8-Point Grid](https://spec.fm/specifics/8-pt-grid)). Tokens: `space-1..8` = 4, 8, 12, 16, 24, 32, 48, 64.

**Radial hub.** Inner **40% diameter** reserved for transport, biome selector, bar status. At 720 × 720 default, a 288 px hub fits a 56 px play button (Apple HIG: 44 × 44 minimum touch — [Apple HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)) plus biome glyph and BPM readout.

### Branding & marketing direction

Working-name candidates (stop at options for R10):

| Name | Pros | Cons |
|---|---|---|
| **BiomeBeats** | Descriptive, alliterative, trademark-clear | "Beats" reads drum-leaning; plug-in is chord/melody-first |
| **Pizzascale** | Nods to Beat Scholar's "Pizza" lineage, evokes slicing + scales | Niche jargon; doesn't say "biome" |
| **RingScribe** | Radial-inscription metaphor; calligraphic, not derivative | Less playful; "scribe" may not parse |

Lean **BiomeBeats** — clearest signal of "five worlds, sequenced rhythm".

**Logo.** Wordmark + radial mark (one slice highlighted in `accent`). References: Vital's clean wordmark + curved-N glyph ([Vital](https://vital.audio/)); Output's heavy uppercase wordmark on dark chrome.

**Hero screenshot.** Full window, **Cyberpunk active** (highest energy), playhead mid-bar, two rings at misaligned counts (e.g. inner 7, outer 12) to show the polyrhythm. **Social sizes**: 1080×1080 (IG), 1200×630 (Twitter card), 1920×1080 (demo video) — exported via R15's recording pipeline.

### Accessibility design choices

Visual-layer a11y; complements R9's interaction layer.

- **Focus rings on slices.** Curved outlines render unevenly via CSS `outline`. Render the focus indicator as a separate SVG `<path>` along the slice's arc + radial edges, stroked at 3 px with `--focus-ring` (white 85%) — biome-neutral, reads on any bg ([Apple HIG Focus and Selection](https://developer.apple.com/design/human-interface-guidelines/focus-and-selection)).
- **Colour-blind safe.** Armed vs muted differs by **shape** (solid vs slashed fill), accent vs armed by chevron presence — never by hue alone ([Smashing — Designing for Colorblindness](https://www.smashingmagazine.com/2024/02/designing-for-colorblindness/)).
- **Contrast.** All `text` on `bg` pass AA 4.5:1; `accent`-on-`accent-strong` is shape-fill only, never text.
- **Reduced motion.** Shader bloom freezes on a representative frame; playhead becomes a step-jump indicator; biome cross-fade replaces the 90° wheel rotation.

## Implications for BiomeBeats

### Phase-1 ship list

1. Color tokens — 8 per biome × 5 + 5 shared neutrals (45 oklch tokens).
2. Type — 1 display + 1 ui per biome (10 faces, 6 variable); 6-step scale at ratio 1.2.
3. Spacing — 8 steps on a 4-pt base.
4. Slice-state primitives — 7 states.
5. Motion primitives — 4, with reduced-motion fallbacks.
6. Icons — 9 Lucide imports, tree-shaken.
7. Logo — wordmark + radial-slice mark.
8. Focus-ring spec — SVG path stroke, 3 px, neutral white 85%.

### Working-name decision frame

R10 picks. Three candidates above. Lean **BiomeBeats**; alternates *Pizzascale* (Beat Scholar lineage) and *RingScribe* (inscription metaphor).

### Top 3 risks

1. **Cyberpunk contrast.** High-saturation magenta on purple is the AA failure mode. Mitigation: `accent`-on-`accent-strong` is shape-only, never text; surface text sits over `bg` or `--surface-glass-strong`.
2. **Font payload.** Ten faces, even variable, bloat `jweb`. Mitigation: subset to Latin + digits + punctuation; reject any face whose subset exceeds 80 KB woff2.
3. **Curved focus rings.** Browsers render `outline` as a bounding rectangle, not a curve-following stroke. Mitigation: SVG `<path>` along the slice arc, opacity-only animation.

## Open questions

1. Does Max for Live's `jweb` honour OS `prefers-reduced-motion`? Confirm before locking Motion.
2. Cyberpunk's hot-pink-on-purple is the most fragile pair. Lock a global "no decorative text over high-saturation gradients" rule?
3. Ten type faces may be too many for v1. Fallback: **one shared UI sans (Inter)** + 5 biome display faces.
4. Tundra is the only light-mode biome. Should plug-in chrome auto-invert on Tundra, or stay dark?

## Sources

- [MDN — oklch() CSS function](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch)
- [oklch.com — picker & converter](https://oklch.com/)
- [oklch.fyi — picker, generator, converter](https://oklch.fyi/)
- [openreplay — hex to oklch tool](https://openreplay.com/tools/hex-to-oklch/)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C — Understanding SC 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [WebAIM — Contrast and Color Accessibility](https://webaim.org/articles/contrast/)
- [Material Design 3 — Layout Spacing](https://m3.material.io/foundations/layout/understanding-layout/spacing)
- [Spec.fm — 8-Point Grid](https://spec.fm/specifics/8-pt-grid)
- [Apple HIG — Focus and Selection](https://developer.apple.com/design/human-interface-guidelines/focus-and-selection)
- [Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Smashing Magazine — A Practical Guide To Designing For Colorblind People](https://www.smashingmagazine.com/2024/02/designing-for-colorblindness/)
- [Colorblindguide.com — Colorblind-Friendly Design](https://www.colorblindguide.com/post/colorblind-friendly-design-3)
- [Lucide Icons](https://lucide.dev/)
- [Lucide guide](https://lucide.dev/guide/)
- [Lucide issue #1733 — tree-shaking imports](https://github.com/lucide-icons/lucide/issues/1733)
- [Motion (motion.dev) — GSAP vs Motion](https://motion.dev/docs/gsap-vs-motion)
- [GSAP — Accessible Animation](https://gsap.com/resources/a11y/)
- [LogRocket — Best React animation libraries for 2026](https://blog.logrocket.com/best-react-animation-libraries/)
- [Google Fonts — Inter](https://fonts.google.com/specimen/Inter)
- [Google Fonts — Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)
- [Google Fonts — JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
- [Google Fonts — VT323](https://fonts.google.com/specimen/VT323)
- [Google Fonts — Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)
- [Liminfo — Type Scale Calculator](https://www.liminfo.com/tools/typescalecalc)
- [Imperavi — Modular Scale (UI Typography)](https://imperavi.com/books/ui-typography/principles/modular-scale/)
- [Modalics — Beat Scholar product page](https://www.modalics.com/beatscholar)
- [Native Instruments Maschine MK3 (Thomann listing, RGB pad spec)](https://www.thomannmusic.com/native_instruments_maschine_mk3_black.htm)
- [Ableton Push 3 Manual](https://www.ableton.com/en/push/manual/)
- [Vital — wavetable synth (UI/wordmark reference)](https://vital.audio/)
- [R2 — cosmic-chord-synth Asset Inventory](./02-cosmic-chord-synth-asset-inventory.md)
