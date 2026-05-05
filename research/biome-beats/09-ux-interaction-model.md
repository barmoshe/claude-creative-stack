# UX & Interaction Model
> Status: draft
> Owner: general-purpose agent
> Last updated: 2026-05-05

## TL;DR (≤150 words)

BiomeBeats' radial layout inverts grid conventions: focus order on a circle isn't intuitive, slice targets shrink with ring count, and WAI-ARIA APG has no radial pattern ([APG](https://www.w3.org/WAI/ARIA/apg/patterns/)). R9 specifies pointer, keyboard, MIDI, and iPad-touch plus accessibility. Pointer is direct manipulation; keyboard linearises the ring (Tab/Arrow); ARIA wraps each slice as a `gridcell` inside `role="grid"`. Three tradeoffs stay open for [R10](10-synthesis-and-recommendations.md): focus-ring on a wedge under shader bloom, screen-reader pattern for 2D radial, and how aggressively to dampen the play-cursor pulse under `prefers-reduced-motion`.

## Scope & questions

R9 turns [R10](10-synthesis-and-recommendations.md)'s locks into a Figma-ready spec covering gestures, keyboard, MIDI, touch, and screen-reader nav. R9 surfaces tradeoffs; R10 picks.

## Findings (with inline citations)

### Primary interactions

- **Click empty slice** → arm default chord (root triad of biome scale).
- **Click armed slice** → unarm.
- **Drag radially** → `pitchDegree`; centre=down, edge=up. Clamps; wraps `octave` at boundary.
- **Shift+drag** → `octave` (-2..+2).
- **Right-click** → editor popover (`chordSize, inversion, voicing, velocity, microtiming, accent, tie, mute`); long-press on touch.
- **Hover** → tooltip: chord name (`Csus4/E`) + active flags.
- **Space / drag playhead** → play/stop, scrub.
- **Add ring** → `+` at centre. Remove: right-click ring label.
- **Change step count** → drag ring outer edge (3..42, [R1](01-beat-scholar-deep-dive.md)).
- **Swing slider** → bipolar -200..+200%.
- **Biome swap** → selector swaps palette + scale + BPM live.

### Keyboard map

| Action | Key | Notes |
|---|---|---|
| Next / previous slice | `Tab` / `Shift+Tab` | Linearised: ring 0 slices 0..N, ring 1 slices 0..N. |
| Adjacent slice | `→` / `←` | Clockwise / counter-clockwise within ring. |
| Pitch up / down | `↑` / `↓` | One scale-degree step. |
| Octave up / down | `Shift+↑` / `Shift+↓` | Matches Live's piano-roll convention. |
| Play / stop | `Space` | Forwarded from Live transport. |
| Mute | `M` | Toggle. |
| Accent | `A` | Toggle (also fires biome FX hit). |
| Tie | `T` | Toggle tie to previous slice. |
| Chord size | `1`–`5` | `1`=melody, `5`=pentachord. |
| Cycle inversion | `I` | `0→1→2→3→0`. |
| Cycle voicing | `V` | close → open → drop2 → spread → shell. |
| Cycle biome | `B` (`Shift+B` reverse) | |
| Open slice editor | `Enter` | |
| Arm focused | `0` | Default chord. |
| Help overlay | `?` | `Esc` closes. |

APG slider conventions adapted ([slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)). No collision with Live's reserved global shortcuts when device focused.

### MIDI-controller mapping

- **Pads (8×8)** — slices left-to-right top-to-bottom, ring-by-ring; press = arm/unarm.
- **Encoders** — encoder N → slice N `pitchDegree`; Push `Shift` remaps to `octave`.
- **Knobs** — global swing, BPM, biome morph.
- **Push 3** — grid forwards when `live.banks` declared; MPE flag enables expressive grid ([Ableton](https://help.ableton.com/hc/en-us/articles/8506527153308-Push-standalone-Max-for-Live-Device-compatibility), [CDM](https://cdm.link/making-max-for-live-devices-work-on-push-and-push-3-standalone/)). [Elektronauts](https://www.elektronauts.com/t/max-for-live-devices-that-work-with-push-3-standalone/198306) suggests standalone shows parameter strip only, not `jweb`. **Open.**

### Touch (iPad Live 12)

No native iPad Live 12 app ([Musician Wave](https://www.musicianwave.com/ableton-on-ipad/)); use mediated via PULL/Knobbler4 mirrors. Inside `jweb`, DOM `touchstart/move/end` fire on WebKit ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Multi-touch_interaction), [Apple](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html)). Map: drag=pitch, pinch=ring zoom, two-finger rotate=ring rotation. Apple HIG 44pt minimum ([HIG](https://developer.apple.com/design/human-interface-guidelines/accessibility)) — at 32 slices, inner-edge wedge falls below. **Open: latency on `jweb` mirror.**

### Accessibility

- **Focus ring.** WCAG 2.2 SC 2.4.13 ([Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)): ≥2 CSS-px perimeter, ≥3:1 contrast change. Spec: 3px arc-stroke in biome accent, drawn after bloom ([Soueidan](https://www.sarasoueidan.com/blog/focus-indicators/)).
- **Screen-reader.** No APG radial pattern. Closest: `role="grid"` on SVG, `role="row"` per ring, `role="gridcell"` per slice; `aria-label="ring 1, slice 5 of 8, C major triad, armed, accent"`; `aria-pressed` for arm. Slider role doesn't fit (categorical). `aria-live="polite"` announces playing slice each bar.
- **`prefers-reduced-motion`.** Halt bloom, rotation, particles, crossfade. Keep min-amplitude play pulse (4% scale, 200 ms) — removing entirely hides the cursor. MDN ([prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)) and [Accessibility Craft](https://accessibilitycraft.com/104-wcag-pause-stop-hide-prefers-reduced-motion-fallout-nuka-cola-quantum/): replace essential motion subtler, don't eliminate.
- **Colour-blindness.** Arm = fill + 1px white inner stroke; accent = outer-arc notch; tie = connector arc; mute = 50%-alpha desaturated. No hue-only signals.
- **Contrast.** Labels hit WCAG 2.2 AA every biome; Sea/Tundra need 60%-alpha black scrim.

### Onboarding

- **Default pattern** — Space, 8-slice ring, I-V-vi-IV; auto-plays once (4 bars).
- **Biome tour** — `B` cycles; each plays 4 bars on first activation.
- **Empty-ring hint** — faint `click to arm` label, fades on first arm.

## Implications for BiomeBeats

### Interaction-spec digest (Figma frame description)

- 5 biomes; `B`/selector swaps palette+scale+BPM.
- Concentric rings, 3..42 slices, grow via `+`.
- Pointer: click=arm, drag=pitch, shift+drag=octave, right-click=editor.
- Keyboard: Tab/Arrow nav; M/A/T flags; 1–5 chord; I/V cycles; B biome; ? help.
- MIDI: pads arm/unarm; encoders pitch/octave; knobs swing/BPM/biome.
- Touch: drag=pitch, pinch=zoom, two-finger rotate; 44pt min.
- First-run: Space, 8-slice I-V-vi-IV, auto-plays once.
- ARIA: `role="grid"` + `role="gridcell"` slices + `aria-pressed`.
- Focus ring: 3px arc-stroke, post-bloom.
- Reduced-motion: kill bloom/rotation/particles; keep min play pulse.
- Colour-blind: arm=fill+stroke, accent=notch, tie=arc, mute=desaturate.
- Text WCAG 2.2 AA all biomes (scrim on Sea/Tundra).
- Right-click popover hosts per-slice editor.
- `?` prints keyboard map.
- Biome tour on first `B`; empty-ring hint.

### Top 3 accessibility risks (R10 to lock)

1. **Focus ring on wedge under bloom.** A: post-bloom arc stroke. B: bounding-box rectangle. C: fill swap. Fidelity vs guaranteed visibility.
2. **Screen-reader pattern for 2D radial.** A: `role="grid"` linearisation. B: `role="application"` + managed focus + `aria-live`. C: hybrid. Convention vs metaphor.
3. **Reduced-motion play cursor.** A: static colour swap. B: 4%-scale pulse 200 ms. C: `aria-live` text only. Vestibular safety vs play legibility.

## Open questions

- Push 3: `jweb` UI rendered or only `live.banks`?
- iPad `jweb` touch latency in M4L 12.4.
- iPad right-click: long-press or two-finger?
- `Tab`: within ring or jump rings?
- `aria-live` verbosity: every focus or value-change?
- Does `jweb` swallow `Space` from Live transport?

## Sources

- W3C — [APG patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
- W3C — [Slider Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)
- W3C — [Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- W3C — [SC 2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- MDN — [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- MDN — [Multi-touch interaction](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Multi-touch_interaction)
- Apple — [Web Content: Handling Events](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html)
- Apple — [HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- Ableton — [Push standalone M4L](https://help.ableton.com/hc/en-us/articles/8506527153308-Push-standalone-Max-for-Live-Device-compatibility)
- Ableton — [iOS-control apps](https://help.ableton.com/hc/en-us/articles/209071989-Apps-for-controlling-Live-with-an-iOS-or-Android-device)
- Ableton — [Live 12 release notes](https://www.ableton.com/en/release-notes/live-12/)
- CDM — [M4L on Push 3](https://cdm.link/making-max-for-live-devices-work-on-push-and-push-3-standalone/)
- Elektronauts — [M4L on Push 3 Standalone](https://www.elektronauts.com/t/max-for-live-devices-that-work-with-push-3-standalone/198306)
- Soueidan — [Accessible focus indicators](https://www.sarasoueidan.com/blog/focus-indicators/)
- Accessibility Craft — [Reduced Motion](https://accessibilitycraft.com/104-wcag-pause-stop-hide-prefers-reduced-motion-fallout-nuka-cola-quantum/)
- Heydon Pickering — [Inclusive Menu Button](https://github.com/Heydon/inclusive-menu-button)
- Musician Wave — [Ableton on iPad (2026)](https://www.musicianwave.com/ableton-on-ipad/)
- Internal: [R1](01-beat-scholar-deep-dive.md), [R10](10-synthesis-and-recommendations.md), [knowledge/14-accessibility-performance.md](../../knowledge/14-accessibility-performance.md)
