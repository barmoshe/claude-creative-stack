---
name: procgen-toolkit
description: Generate procedural content — dungeons (BSP), cave maps (cellular automata), tilemaps (Wave Function Collapse), terrain (noise), and name/loot/level tables. Use when the user asks for procedural generation, dungeon generator, map generator, procgen, WFC, BSP, roguelike level, or procedural terrain. Produces seeded, reproducible algorithms and a visual artifact to inspect the output.
license: MIT
---

# Procgen Toolkit

## When to trigger

- "Generate a dungeon"
- "Procedural cave map"
- "WFC tilemap"
- "Terrain heightmap"
- "Procedural loot table"

## Always seed

Use a PRNG you can re-seed — `mulberry32` or `sfc32`. Print the seed in the artifact so results are reproducible.

```js
function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
```

## Algorithm menu

| Algorithm | Best for | Notes |
|---|---|---|
| **BSP** (binary space partitioning) | Rooms + corridors dungeons | Split recursively, place rooms in leaves, carve corridors between siblings. |
| **Cellular automata** | Organic caves, islands, vegetation | Start with 45% fill; apply "B5678/S345678" rule for 4–6 iterations. |
| **Drunkard's walk** | Caves, rivers, paths | Biased random walk. Simple; tune bias + step count. |
| **Poisson disk sampling** | Even-but-not-grid placement | Bridson's algorithm; k=30. |
| **Wave Function Collapse** | Tile-based maps with constraints | Model.js / WaveFunctionCollapse.js patterns — pick the overlapping or tiled model. |
| **Perlin / Simplex noise** | Heightmaps, clouds, gradients | Use `simplex-noise` npm or ported JS. Layer octaves for fBm. |
| **L-system** | Plants, branching structures | Rewrite axiom N times, interpret as turtle graphics. |

## Output patterns

### BSP dungeon (returned grid)
```js
function bsp({ width, height, minRoom=5, depth=5, rng }){
  const root = { x:1,y:1,w:width-2,h:height-2 };
  const leaves = splitRecursive(root, depth, rng);
  const grid = Array.from({length:height}, ()=>Array(width).fill(1)); // 1 = wall
  leaves.forEach(L => carveRoom(grid, L, minRoom, rng));
  connectSiblings(grid, leaves, rng);
  return { grid, rooms: leaves };
}
```

### Cellular automata step
```js
function caStep(grid){
  const h = grid.length, w = grid[0].length, next = grid.map(r=>r.slice());
  for (let y=1; y<h-1; y++) for (let x=1; x<w-1; x++){
    let n = 0;
    for (let dy=-1; dy<=1; dy++) for (let dx=-1; dx<=1; dx++)
      if (!(dx===0 && dy===0)) n += grid[y+dy][x+dx];
    next[y][x] = (grid[y][x] ? (n >= 4 ? 1 : 0) : (n >= 5 ? 1 : 0));
  }
  return next;
}
```

## Deliverable shape

1. **Algorithm choice** + 1-sentence justification.
2. **Seeded generator** code block.
3. **Visual artifact** — HTML or JSX that renders the grid/map on a canvas, with a "Regenerate" button and editable seed input.
4. **Extension notes** — how to add room decorations, enemy placement, item spawns.

## Further reading

- `knowledge/06-games.md` — procgen section, A* pathfinding, game AI.
- `artifacts/html/procgen-dungeon.html` — working BSP dungeon artifact.
