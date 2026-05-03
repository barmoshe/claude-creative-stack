# Procgen — algorithm reference

Concrete, copy-paste-ready pseudocode and JS for every algorithm the parent SKILL.md mentions. Pulled out so the skill body stays under the "load me on every prompt" budget.

## Seed everything — `mulberry32`

```js
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(0xC0FFEE);   // print this seed in the artifact
```

## BSP dungeon

```js
function bsp({ width, height, minRoomSize = 5, maxDepth = 5, rng }) {
  const root = { x: 1, y: 1, w: width - 2, h: height - 2 };
  const leaves = split(root, maxDepth);
  const grid = Array.from({ length: height }, () => Array(width).fill(1));
  const rooms = leaves.map(L => carveRoom(grid, L));
  for (let i = 1; i < rooms.length; i++) connect(grid, rooms[i - 1], rooms[i]);
  return { grid, rooms };

  function split(node, depth) {
    if (depth === 0 || node.w < minRoomSize * 2 || node.h < minRoomSize * 2) return [node];
    const horiz = node.w / node.h < 1 + rng() * 0.4;
    if (horiz) {
      const split = Math.floor(node.h * (0.4 + rng() * 0.2));
      return [
        ...splitRecur({ ...node, h: split }, depth - 1),
        ...splitRecur({ ...node, y: node.y + split, h: node.h - split }, depth - 1),
      ];
    } else {
      const split = Math.floor(node.w * (0.4 + rng() * 0.2));
      return [
        ...splitRecur({ ...node, w: split }, depth - 1),
        ...splitRecur({ ...node, x: node.x + split, w: node.w - split }, depth - 1),
      ];
    }
  }
  function splitRecur(n, d) { return split(n, d); }

  function carveRoom(grid, L) {
    const w = Math.max(minRoomSize, Math.floor(L.w * (0.6 + rng() * 0.3)));
    const h = Math.max(minRoomSize, Math.floor(L.h * (0.6 + rng() * 0.3)));
    const x = L.x + Math.floor(rng() * (L.w - w));
    const y = L.y + Math.floor(rng() * (L.h - h));
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) grid[yy][xx] = 0;
    return { x, y, w, h, cx: x + (w >> 1), cy: y + (h >> 1) };
  }
  function connect(grid, a, b) {
    let { cx: x, cy: y } = a;
    const { cx: tx, cy: ty } = b;
    while (x !== tx) { grid[y][x] = 0; x += Math.sign(tx - x); }
    while (y !== ty) { grid[y][x] = 0; y += Math.sign(ty - y); }
  }
}
```

## Cellular automata caves

```js
function cellularCaves({ width, height, fill = 0.45, iterations = 5, rng }) {
  let grid = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) =>
      x === 0 || y === 0 || x === width - 1 || y === height - 1 || rng() < fill ? 1 : 0
    )
  );
  for (let i = 0; i < iterations; i++) grid = step(grid);
  return grid;

  function step(g) {
    return g.map((row, y) => row.map((cell, x) => {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const yy = y + dy, xx = x + dx;
        if (yy < 0 || yy >= g.length || xx < 0 || xx >= g[0].length) { n++; continue; }
        n += g[yy][xx];
      }
      return cell ? (n >= 4 ? 1 : 0) : (n >= 5 ? 1 : 0);
    }));
  }
}
```

## fBm with simplex noise

```js
import { createNoise2D } from "simplex-noise";   // npm i simplex-noise
import alea from "alea";                          // npm i alea

function makeFbm(seed) {
  const noise2D = createNoise2D(alea(seed));
  return function fbm(x, y, octaves = 5, persistence = 0.5, lacunarity = 2.0) {
    let amp = 1, freq = 1, sum = 0, max = 0;
    for (let i = 0; i < octaves; i++) {
      sum += amp * noise2D(x * freq, y * freq);
      max += amp;
      amp *= persistence;
      freq *= lacunarity;
    }
    return sum / max;     // ∈ [-1, 1]
  };
}
```

## Wave Function Collapse — overlapping model (sketch)

The full algorithm is too long for a snippet — we ship a thin wrapper around `wavefunctioncollapse` (npm). Use it like this:

```js
import wfc from "wavefunctioncollapse";

const sampleImage = await loadPixelArray("rooms-sample.png");
const out = wfc({
  type: "overlapping",
  data: sampleImage,
  N: 3,                    // pattern size
  width: 32,
  height: 32,
  periodicInput: true,
  periodicOutput: false,
  symmetry: 8,
  ground: 0,
  seed: 0xC0FFEE,
});
// out is a 1D RGBA Uint8Array; render to canvas.
```

Tips:

- **Start with the smallest possible sample** that contains every adjacency you care about.
- `N=3` is the usual sweet spot. `N=2` over-generalizes; `N>=4` gets very slow.
- WFC can fail mid-collapse (contradictions). Wrap in a retry loop with up to 3 reseeds before surfacing the failure.

## L-system — turtle graphics

```js
function lsystem({ axiom, rules, iterations }) {
  let s = axiom;
  for (let i = 0; i < iterations; i++) {
    s = [...s].map(c => rules[c] ?? c).join("");
  }
  return s;
}

function turtle(commands, ctx, { len = 5, angle = Math.PI / 8 } = {}) {
  const stack = [];
  let x = ctx.canvas.width / 2, y = ctx.canvas.height - 10, a = -Math.PI / 2;
  ctx.beginPath();
  for (const c of commands) {
    if (c === "F") {
      const nx = x + Math.cos(a) * len, ny = y + Math.sin(a) * len;
      ctx.moveTo(x, y); ctx.lineTo(nx, ny);
      x = nx; y = ny;
    } else if (c === "+") a += angle;
    else if (c === "-") a -= angle;
    else if (c === "[") stack.push({ x, y, a });
    else if (c === "]") ({ x, y, a } = stack.pop());
  }
  ctx.stroke();
}

// Fractal plant — Lindenmayer's classic.
const plant = lsystem({
  axiom: "X",
  rules: { X: "F+[[X]-X]-F[-FX]+X", F: "FF" },
  iterations: 5,
});
turtle(plant, ctx, { len: 3, angle: Math.PI / 7 });
```

## Poisson disk sampling — Bridson

```js
function poissonDisk({ width, height, radius, k = 30, rng }) {
  const cell = radius / Math.SQRT2;
  const cols = Math.ceil(width / cell), rows = Math.ceil(height / cell);
  const grid = new Array(cols * rows).fill(null);
  const points = [], active = [];

  function fits(p) {
    const gx = Math.floor(p.x / cell), gy = Math.floor(p.y / cell);
    for (let y = Math.max(0, gy - 2); y <= Math.min(rows - 1, gy + 2); y++) {
      for (let x = Math.max(0, gx - 2); x <= Math.min(cols - 1, gx + 2); x++) {
        const q = grid[y * cols + x];
        if (q && (q.x - p.x) ** 2 + (q.y - p.y) ** 2 < radius * radius) return false;
      }
    }
    return true;
  }
  function add(p) {
    points.push(p);
    active.push(p);
    grid[Math.floor(p.y / cell) * cols + Math.floor(p.x / cell)] = p;
  }

  add({ x: rng() * width, y: rng() * height });
  while (active.length) {
    const i = Math.floor(rng() * active.length);
    const p = active[i];
    let placed = false;
    for (let n = 0; n < k; n++) {
      const r = radius * (1 + rng()), a = 2 * Math.PI * rng();
      const c = { x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r };
      if (c.x >= 0 && c.x < width && c.y >= 0 && c.y < height && fits(c)) {
        add(c); placed = true; break;
      }
    }
    if (!placed) active.splice(i, 1);
  }
  return points;
}
```

## Drunkard's walk

```js
function drunkardsWalk({ width, height, steps, rng }) {
  const grid = Array.from({ length: height }, () => Array(width).fill(1));
  let x = width >> 1, y = height >> 1;
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  for (let i = 0; i < steps; i++) {
    grid[y][x] = 0;
    const [dx, dy] = dirs[Math.floor(rng() * 4)];
    x = Math.min(width - 2, Math.max(1, x + dx));
    y = Math.min(height - 2, Math.max(1, y + dy));
  }
  return grid;
}
```

## When to use which

| Need | Reach for |
|---|---|
| Discrete rooms + corridors | BSP |
| Organic caves | Cellular automata |
| Connected paths fast | Drunkard's walk |
| Stylized / hand-authored constraints | WFC over a sample tilemap |
| Heightmaps, terrain, clouds | fBm noise |
| Vegetation / branching | L-system |
| Even-but-natural placement | Poisson disk |
| Mazes | Recursive backtracker (long corridors) or Prim/Kruskal (short) |

## Live demos

- `artifacts/html/procgen-dungeon.html` — BSP (canonical).
- The skill body shows how to swap in any of the others.
