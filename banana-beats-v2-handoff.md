# HANDOFF: Banana Beats v2 — Build Agent Handoff

> **You are a build agent.** This document is everything you need to perform a complete visual redesign of Banana Beats. The audio engine, reducer, and data model from v1 are **kept**. Everything visual — CSS, Canvas stage, React components, animation — is **rewritten from scratch**. Follow the steps in order; each has a checkpoint.

## Target

**File**: `artifacts/html/banana-beats.html` (overwrite existing v1)
**Type**: Single-file HTML artifact (Claude.ai compatible)
**LOC budget**: 1400–1800 lines
**Design direction**: "Tropical Boombox Toy" — warm, tactile, toy-like instrument with rubber-hose monkey character

## Stack & CDN (same as v1, no Phaser)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/tone@15.0.4/build/Tone.js"></script>
```

**No JSX transform** — use `const h = React.createElement;` throughout.
**No Phaser** — Canvas 2D for the monkey stage.

## Design Direction

### Visual Identity — "Tropical Fun" (light/warm palette)
- **Chassis**: warm creamy wood tones with beveled edges — like a bamboo toy
- **Display**: sunken vibrant green-tinted screen area — lush jungle on cream
- **Pads**: chunky 3D sequencer pads with press-down animation
- **Typography**: monospace, generous letter-spacing, uppercase labels
- **Accents**: bright banana-yellow glows, coral for actions, sky blue for cool states

### Monkey Character: "Rubber-Hose Style"
- Big round head with oversized expressive eyes
- Eye tracking (pupils follow beat), blink every 3-7s
- Body with squash/stretch on EVERY beat, spring physics
- 5-segment verlet tail with physics follow-through
- Ears that jiggle on snare hits (spring damping)
- Banana held in hand, thrown on accent beats with arc + spin

### Particle Systems (3 tiers)
1. Ambient leaves (8-10 slow-drifting)
2. Beat dust (burst from feet on snare)
3. Banana confetti (on accent steps)

### Atmospheric Effects
- Layered parallax jungle background (sky, hills, canopy, ground, fog)
- Warm moon glow with breathing pulse
- Hanging vines that sway with beat energy
- Scanlines overlay on display
- Trauma shake on kicks

## Acceptance Criteria

- Machine looks like a physical toy (layered shadows, beveled edges)
- Monkey feels alive even when idle (breathing, blinking, tail)
- Jungle atmosphere (sky, moon, hills, vines, leaves, fog)
- Pads feel tactile (press-down, glow, 3D depth)
- All v1 features work: play/stop, BPM, reroll, mute/solo, FX, presets, keyboard, persistence
- 60fps on mid-range hardware, < 100KB total
- `prefers-reduced-motion` respected
