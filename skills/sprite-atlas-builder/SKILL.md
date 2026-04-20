---
name: sprite-atlas-builder
description: Plan a sprite atlas — frame dimensions, animation list, layout, and JSON manifest — and optionally generate placeholder frames procedurally into a single exportable PNG. Use when the user asks for a sprite sheet, sprite atlas, character animation frames, tile atlas, or game-ready asset layout. Produces manifests compatible with Phaser 4 and Pixi v8 and documents the integration path.
license: MIT
---

# Sprite Atlas Builder

## When to trigger

- "Sprite sheet for my character"
- "Pack these frames into an atlas"
- "Placeholder art for a prototype"
- "Tile atlas for a tilemap"

## Atlas plan

Ask or infer:
- Frame size (32/48/64/128 px square is typical).
- Animation list (idle, run, jump, attack, hurt, die).
- Direction variants (single-facing, left/right, 8-direction).
- Target engine (Phaser / Pixi / custom Canvas / Three.js for billboards).

Then decide layout:
- Row-per-animation up to ~50 frames.
- Packer (MaxRects) beyond that — implement a rect-packer in-skill or call the `scripts/packer.js` helper if present.

## JSON manifest (Phaser 4 + Pixi v8 friendly)

```json
{
  "frames": {
    "player_idle_0": { "frame": { "x":0, "y":0, "w":32, "h":32 }, "pivot": { "x":0.5, "y":1.0 }, "duration": 100 },
    "player_idle_1": { "frame": { "x":32, "y":0, "w":32, "h":32 }, "pivot": { "x":0.5, "y":1.0 }, "duration": 100 }
  },
  "animations": {
    "idle": ["player_idle_0", "player_idle_1"],
    "run":  ["player_run_0","player_run_1","player_run_2","player_run_3"]
  },
  "meta": { "image": "atlas.png", "size": { "w":256, "h":128 }, "scale": "1" }
}
```

This format loads directly with `scene.load.atlas(key, imageUrl, jsonUrl)` in Phaser 4 and `Assets.load(jsonUrl)` in Pixi v8 (with a small adapter).

## Placeholder generation strategy

When the user has no art yet, produce a single HTML artifact that:
1. Creates an offscreen `<canvas>` at the atlas size.
2. Draws each frame with primitives — rectangles, arcs, simple transforms — parameterized by animation name and frame index.
3. Exports with `canvas.toDataURL("image/png")`.
4. Renders a preview grid that plays each animation at its tagged FPS.

Keep the PNG under 2 MB so it fits comfortably within the 20 MB `window.storage` per-artifact cap.

## Integration snippets

### Phaser 4
```js
this.load.atlas("player", "atlas.png", "atlas.json");
// in create:
this.anims.create({ key: "idle", frames: this.anims.generateFrameNames("player", { prefix:"player_idle_", start:0, end:1 }), frameRate: 10, repeat: -1 });
```

### Pixi v8
```js
import { Assets, AnimatedSprite } from "pixi.js";
const atlas = await Assets.load("atlas.json");
const sprite = new AnimatedSprite(atlas.animations.idle);
sprite.play();
```

## Output shape

1. **Atlas plan** — table of animations with frame counts and FPS.
2. **JSON manifest** fenced block.
3. **HTML generator artifact** fenced block (if placeholder art requested).
4. **Integration snippet** — Phaser 4 + Pixi v8.

## Further reading

- `knowledge/06-games.md` — engine APIs.
- `prompts/generate-sprite-sheet.md` — ready-to-paste scaffold.
