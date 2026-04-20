---
name: artifact-game-builder
description: Build a complete single-file playable game that runs as a Claude artifact. Use when the user wants a mini-game, game prototype, jam entry, playable demo, or interactive toy that must live in one HTML or React artifact. Handles engine selection (Canvas 2D, Phaser 3 via CDN, Pixi v8, Kaplay), fixed-timestep loop, input, state persistence via window.storage, and game-feel (hit-stop, screen shake). Do NOT use for full multi-file game projects or engine-specific deep-dives; use the engine's dedicated skills marketplaces for that.
license: MIT
---

# Artifact Game Builder

Produces one file. That file runs. That is the whole deliverable.

## When to trigger

Clear triggers:
- "Build me a platformer / shooter / puzzle / roguelike"
- "Make a playable artifact"
- "Can you prototype this game idea"
- "Game jam entry"

Not this skill:
- Multi-file Vite / Next.js game projects → point to `playground/` or `freshtechbro/claudedesignskills`.
- Full Godot/Unity/Bevy work.
- Asset generation only → use `sprite-atlas-builder`.

## Core recipe

1. **Clarify scope (one question, not three).** Genre, controls, win condition.
2. **Pick an engine by scope:**
   - Micro (<200 LOC goal) → vanilla Canvas 2D.
   - Small 2D with physics / tilemaps → Phaser 3 via CDN.
   - High-perf 2D sprites / particles → Pixi v8 via CDN.
   - Fast, opinionated, tiny-API → Kaplay via CDN.
   - 3D → Three.js r128 (sandbox-pinned).
3. **Scaffold the file.** Single `<script>` (HTML artifact) or one default-export React component (JSX artifact).
4. **Fixed-timestep loop.** Simulate at a fixed dt, render at animation frame. See `knowledge/06-games.md`.
5. **Add feel.** One of: trauma-based screen shake, hit-stop on impact, squash-and-stretch on jump, particle burst on pickup.
6. **Persist state.** `window.storage.set("game_state", {...}, { shared:false })` on publish; React state during preview.
7. **Document.** 2 lines for controls, 3 bullets for extension.

## Sandbox rules (non-negotiable)

From `knowledge/03-artifacts.md` and `knowledge/99-caveats.md`:
- No `localStorage` / `sessionStorage` / `indexedDB`. Use `window.storage`.
- Three.js r128; no `three/examples/jsm/*` imports — inline-polyfill controls or use a CDN `<script>`.
- Tailwind core utilities only. No arbitrary values like `text-[22px]`.
- No `fetch` except to `https://api.anthropic.com/v1/messages` (Claudeception).
- No `<form type="submit">` inside React artifacts — use `onClick`.

## Engine snippets

### Canvas 2D micro loop
```js
let last = performance.now(), acc = 0, STEP = 1/60;
function frame(now){
  acc += (now - last) / 1000; last = now;
  while (acc >= STEP){ update(STEP); acc -= STEP; }
  render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
```

### Phaser 3 via CDN (HTML artifact)
```html
<script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
<script>
  new Phaser.Game({
    type: Phaser.AUTO, width: 800, height: 600,
    physics: { default:"arcade", arcade:{ gravity:{ y:800 } } },
    scene: { preload, create, update }
  });
</script>
```

### Trauma-based screen shake
```js
let trauma = 0;
function addTrauma(amount){ trauma = Math.min(1, trauma + amount); }
function shake(ctx){
  const t = trauma * trauma; // quadratic
  ctx.translate((Math.random()*2-1)*12*t, (Math.random()*2-1)*12*t);
  trauma = Math.max(0, trauma - 0.02);
}
```

### Hit-stop
```js
let stopFrames = 0;
function hit(){ stopFrames = 6; /* 100 ms at 60fps */ }
function update(dt){ if (stopFrames-- > 0) return; /* ...sim... */ }
```

## Output checklist

- [ ] Single file, runs when pasted into a Claude chat as an artifact.
- [ ] Win + lose states implemented, not just infinite loop.
- [ ] Controls printed on screen.
- [ ] One moment of juice.
- [ ] `window.storage` key scoped (e.g. `gs:<slug>:highscore`).
- [ ] `prefers-reduced-motion` respected for ambient motion.

## Further reading

- `knowledge/06-games.md` — engines, ECS, procgen, game AI.
- `knowledge/03-artifacts.md` — sandbox details.
- `recipes/game-jam.md` — full narrative walkthrough.
