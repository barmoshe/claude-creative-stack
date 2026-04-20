# Recipe — Weekend game jam

**Goal:** ship a playable single-file artifact game by Sunday evening.

## Prep (Friday night)

1. Pick a theme. Constrain scope — one mechanic, one screen, one win state.
2. Load the knowledge base into your Claude Project. Confirm `artifact-game-builder` and `sprite-atlas-builder` skills are available.

## Session 1 — Core loop (2–3 hours)

Start with `prompts/build-artifact-game.md`. Fill in the spec:

```
Genre: Runner
Core loop: Dodge falling rocks while collecting shiny gems.
Win condition: Survive 60 seconds.
Controls: A/D or left/right.
Aesthetic: Flat vector, oklch night palette.
Scope target: small 20 min.
```

Claude picks vanilla Canvas 2D (right call — single-screen, no physics library needed). You get a working artifact with fixed timestep, spawn logic, and a naive collision check.

**Verify before refining:**
- Paste into a Claude chat as an artifact. Does it run?
- Does the game loop handle tab-backgrounding? (It should cap `dt` at 250 ms.)
- Is score persistent? (If published, `window.storage` works; in preview, React state is fine.)

## Session 2 — Feel (2 hours)

Ask Claude: *"Add trauma-based screen shake on collision and hit-stop for 100 ms. Show me the diff only."*

Then: *"Replace the grey rocks with a sprite atlas. Use `sprite-atlas-builder` — 4 animation frames, 32×32, 'rock' tumble."*

The skill produces a generator artifact that draws frames to canvas, exports a base64 PNG, and returns a Phaser/Pixi-compatible JSON atlas. You paste the PNG + JSON strings back into your game artifact.

## Session 3 — Juice + menu (2 hours)

- Start/pause/end screens — React state machine: `menu | playing | gameover`.
- Audio: invoke `tone-procmusic.html` pattern for an 8-bar loop + a 3-param ZzFX beep on pickup.
- Title card — call `build-landing-hero.md` but ask for a "tiny 4:3 panel, pixel-bold font".

## Session 4 — Polish + publish (1–2 hours)

Run `prompts/critique-and-refine.md` against the whole artifact. Claude flags:
- `<form type="submit">` inside your React artifact (breaks artifact rules — replace with `onClick`).
- Missing `prefers-reduced-motion` fallback on the ambient star-field.
- `localStorage.setItem("hs", score)` — swap for `window.storage.set("hs", score, { shared:false })`.

Fix, then publish. Share the artifact link.

## What earned its keep

- `knowledge/03-artifacts.md` + `99-caveats.md` — caught the form-submit and localStorage issues in critique.
- `skills/artifact-game-builder` — turned "make a game" into a concrete scaffold in one message.
- `prompts/critique-and-refine.md` — caught polish issues before publishing.
- `skills/sprite-atlas-builder` — removed the "I don't have art" blocker.

## Variations

- **3D jam** → swap engine to Three.js r128, use `skills/shader-smith` for a custom sky shader.
- **Narrative jam** → pair `build-artifact-game.md` with `build-animation.md` for between-beat transitions.
- **Multiplayer jam** → out of scope for artifacts. Move to `playground/` and integrate Colyseus 0.17.
