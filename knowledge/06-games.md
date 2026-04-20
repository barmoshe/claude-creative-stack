# 06 — Game Development

## 6.1 Engines

| Engine | Version | npm | CDN |
|---|---|---|---|
| **Phaser 4** (recommended) | 4.0.0 GA | `phaser` | `https://cdn.jsdelivr.net/npm/phaser@4.0.0/dist/phaser.min.js` |
| Phaser 3 (legacy / migration only) | 3.90.0 "Tsugumi" (last v3) | `phaser@3` | `https://cdnjs.cloudflare.com/ajax/libs/phaser/3.90.0/phaser.min.js` |
| Pixi.js | v8.18.1 | `pixi.js` | `https://cdn.jsdelivr.net/npm/pixi.js@8.18.1/dist/pixi.min.mjs` |
| Three.js | r183 / 0.183.2 | `three` | import map + `three/addons/` |
| Three.js (artifacts) | r128 | — | `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js` |
| Babylon.js | 9.x (babylonjs@9.2.2) | `@babylonjs/core` / `babylonjs` | `https://cdn.babylonjs.com/babylon.js` |
| Kaplay (was Kaboom) | 3001.0.19 (stable), 4000.0.0-alpha | `kaplay` | `https://unpkg.com/kaplay@3001.0.19/dist/kaboom.mjs` |
| PlayCanvas | 2.x | `playcanvas` | `https://code.playcanvas.com/playcanvas-stable.min.js` |
| Excalibur | 0.32.0 | `excalibur` | `https://unpkg.com/excalibur@0.32.0/build/dist/excalibur.min.js` |
| melonJS | 17.4.0 (v18 beta) | `melonjs` | `https://cdn.jsdelivr.net/npm/melonjs@17.4.0/dist/melonjs.js` |
| LittleJS | latest | `littlejsengine` | tiny zero-dep |
| Cocos Creator | 3.x | — | IDE-driven, Web export |

Phaser 4 minimal:

```html
<script src="https://cdn.jsdelivr.net/npm/phaser@4.0.0/dist/phaser.min.js"></script>
<script>
const config = { type: Phaser.AUTO, width: 800, height: 600,
  physics: { default:'arcade', arcade: { gravity: { y: 300 }}},
  scene: { preload, create, update } };
new Phaser.Game(config);
function preload(){ this.load.spritesheet('dude','dude.png',{frameWidth:32,frameHeight:48}); }
function create(){
  this.player = this.physics.add.sprite(100,450,'dude').setBounce(0.2).setCollideWorldBounds(true);
  this.cursors = this.input.keyboard.createCursorKeys();
}
function update(){
  const s = this.cursors, p = this.player;
  p.setVelocityX(s.left.isDown ? -160 : s.right.isDown ? 160 : 0);
  if (s.up.isDown && p.body.touching.down) p.setVelocityY(-330);
}
</script>
```

**Why Phaser 4 over v3:**
- Ground-up rebuilt WebGL renderer (node-based), proper context-loss handling, significantly faster across the board.
- `SpriteGPULayer` — up to **1M sprites in a single draw call**, ~100× faster than v3 for heavy sprite loads.
- **Unified Filter system** — v3's separate FX + Masks merged. Apply Blur, Glow, Shadow, Pixelate, ColorMatrix, Bloom, Vignette, Wipe, ImageLight, GradientMap, Quantize, etc. to any game object *or* camera.
- New game objects: **Gradient**, **Noise** (Cell 2D/3D/4D, Simplex 2D/3D), **CaptureFrame**, **Stamp**.
- Simpler lighting: `sprite.setLighting(true)` with self-shadows and explicit light height, works across most game objects.
- Cleaner config-based Shader API with `#pragma` GLSL directives; TileSprite supports atlas frames and tile rotation.
- Tint is split into color + mode with 6 modes: `MULTIPLY, FILL, ADD, SCREEN, OVERLAY, HARD_LIGHT`.

**Migrating a v3 project:** standard-API projects usually port in a few hours — the common API surface (`Phaser.Game`, `Phaser.Scene`, `Phaser.AUTO`, arcade physics, `this.load.*`, `this.add.*`, keyboard input, `Phaser.Geom.Intersects.*`) is unchanged. Breaking changes to watch for:
- `setTintFill()` removed → use `setTint()` + `setTintMode()`.
- `Geom.Point` → `Vector2`.
- `Mesh`, `Plane`, `Camera3D`, `Layer3D` removed.
- Custom Phaser data structures replaced by native `Set` / `Map`.
- Custom v3 WebGL pipelines must be rewritten as render nodes.
- IE9 support dropped.

Official migration guide: https://phaser.io/news/2026/04/migrating-from-phaser-3-to-phaser-4-what-you-need-to-know

Pixi.js v8:

```js
import { Application, Assets, Sprite } from "pixi.js";
const app = new Application();
await app.init({ background:"#1099bb", resizeTo:window, preference:"webgpu" });
document.body.appendChild(app.canvas);
const tex = await Assets.load("https://pixijs.com/assets/bunny.png");
const bunny = new Sprite(tex); bunny.anchor.set(0.5);
bunny.position.set(app.screen.width/2, app.screen.height/2);
app.stage.addChild(bunny);
app.ticker.add(t => { bunny.rotation += 0.1 * t.deltaTime; });
```

Kaplay:

```js
import kaplay from "kaplay";
kaplay({ background: "#6d80fa" });
loadSprite("bean","https://play.kaplayjs.com/bean.png");
const player = add([ sprite("bean"), pos(100,200), area(), body(), health(5), "player" ]);
setGravity(1000);
onKeyPress("space", () => player.jump());
```

## 6.2 Core patterns

**Fixed timestep + accumulator** (Gaffer On Games):

```js
const STEP = 1/60;
let acc = 0, last = performance.now();
function frame(now){
  let ft = (now - last) / 1000; if (ft > 0.25) ft = 0.25;
  last = now; acc += ft;
  while (acc >= STEP){ prev = clone(cur); integrate(cur, STEP); acc -= STEP; }
  const alpha = acc / STEP;
  render(interpolate(prev, cur, alpha));
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
```

**ECS libraries (April 2026)**:

| Lib | npm | Style |
|---|---|---|
| bitECS | `bitecs` (v0.4) | TypedArray, fastest |
| Miniplex | `miniplex` (v2) | POJO entities, React bindings |
| Koota | `koota` | React-first |
| Becsy | `@lastolivegames/becsy` | Multi-threaded focus |

bitECS:

```js
import { createWorld, defineComponent, defineQuery, addEntity, addComponent, Types, pipe } from "bitecs";
const Pos = defineComponent({ x:Types.f32, y:Types.f32 });
const Vel = defineComponent({ x:Types.f32, y:Types.f32 });
const moveQ = defineQuery([Pos,Vel]);
const move = w => { for (const eid of moveQ(w)){ Pos.x[eid]+=Vel.x[eid]; Pos.y[eid]+=Vel.y[eid]; } return w; };
const world = createWorld();
const e = addEntity(world);
addComponent(world, Pos, e); addComponent(world, Vel, e);
Vel.x[e] = 1;
const step = pipe(move);
setInterval(() => step(world), 16);
```

**FSM**, **pub/sub**, **scene stack** — one-file trivial patterns, see genre section below.

## 6.3 2D techniques

- Sprite sheets: TexturePacker, Free Texture Packer, Aseprite export; JSON hash/array + PNG.
- Tilemaps: **Tiled Map Editor** (mapeditor.org). `.tmx` XML, `.tmj` JSON. Orthogonal/iso/hex, Wang/terrain sets, animated tiles.
- **AABB**: `a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y`.
- **Swept AABB**: avoid tunneling for high-velocity objects by computing entry/exit times per axis.
- **SAT**: for each edge normal of both convex polygons, project and test overlap; minimum-overlap axis is MTV.
- **Camera**: follow w/ framerate-independent lerp `x = lerp(x, target, 1 - Math.pow(0.001, dt))`, deadzone, bounds clamp, trauma-squared shake.
- **Parallax**: layer `speed` in [0,1]; draw back-to-front with `translate(-cam.x * speed, -cam.y * speed)`.

## 6.4 3D techniques

- **GLTF/GLB**: `GLTFLoader` + `DRACOLoader`; Babylon `BABYLON.SceneLoader.ImportMeshAsync`.
- **PBR**: `MeshStandardMaterial` (metalness/roughness/normal/ao + `envMap` from `PMREMGenerator`). `MeshPhysicalMaterial` adds clearcoat, sheen, transmission, iridescence.
- **Shadows**: `renderer.shadowMap.enabled=true; type=PCFSoftShadowMap;` DirectionalLight `castShadow`, `shadow.mapSize=2048`, `shadow.bias=-0.0005`.
- **Skeletal animation**: `AnimationMixer` with `clipAction(clip).fadeIn/fadeOut/play/crossFade`.
- **Instanced rendering**: `THREE.InstancedMesh(geom, mat, N)` for 10k+ duplicates.
- **Physics**: Rapier 3D (default), cannon-es, Jolt (`jolt-physics`), PhysX (`physx-js-webidl`), Ammo (maintenance).

## 6.5 Game feel / juice (Nijman, Vlambeer)

Trauma-based shake (Squirrel Eiserloh):

```js
let trauma = 0;
function addTrauma(t){ trauma = Math.min(1, trauma + t); }
function shake(){ const s = trauma*trauma;
  return { x:(Math.random()*2-1)*12*s, y:(Math.random()*2-1)*12*s, r:(Math.random()*2-1)*0.08*s };
}
// decay: trauma = Math.max(0, trauma - dt*1.5);
```

Hit-stop:

```js
function hitStop(ms=80){ frozen = true; setTimeout(()=>frozen=false, ms); }
// in loop: if (!frozen) update(dt); but render every frame
```

Squash & stretch on jump/land, particle pooling (preallocated), SFX layering (2–4 sounds per impact with pitch ±10% / volume ±15%), screen flash (`rgba(255,255,255,α)` overlay decaying per frame), brief camera zoom/tilt on impact, tween everything.

Nijman checklist (abbreviated): more particles, more shake, permanent destruction remnants, sound variety, more animation frames, hitstops, slow-motion, post-FX flashes, palette swap on hit.

## 6.6 Procedural generation

- **simplex-noise** v4 (`simplex-noise`, factory API) + `alea` PRNG:

```js
import { createNoise2D } from "simplex-noise";
import alea from "alea";
const noise = createNoise2D(alea("seed"));
function fbm(x,y, oct=5){ let v=0, amp=1, f=1, max=0;
  for (let i=0;i<oct;i++){ v += amp*noise(x*f,y*f); max += amp; amp*=0.5; f*=2; } return v/max; }
```

- **Wave Function Collapse**: `wavefunctioncollapse` npm (Gumin port) — sample image → coherent tilings.
- **L-systems**: string rewrite then turtle interpret (`F=forward, +/-=rotate, []=push/pop`).
- **Dungeons**: BSP trees (split rectangles, carve rooms, connect siblings); drunkard's walk; cellular automata (45% fill → walls≥5 neighbors = wall, 4–5 iters) for caves; marching squares for contours.
- **Mazes**: recursive backtracker (long corridors), Prim's or Kruskal's (short corridors).
- Reference: **redblobgames.com**.
- **rot.js** (`rot-js`): ROT.Map.Digger, ROT.Map.Cellular, ROT.Map.DividedMaze, ROT.Map.EllerMaze; ROT.FOV.{DiscreteShadowcasting, PreciseShadowcasting, RecursiveShadowcasting}; ROT.Path.AStar.

## 6.7 Pathfinding

A* (Manhattan heuristic for 4-dir, octile for 8-dir):

```js
function astar(start, goal, neighbors, cost, h){
  const open = new MinHeap((a,b)=>a.f-b.f);
  const g = new Map([[key(start),0]]);
  const came = new Map();
  open.push({ n:start, f:h(start,goal) });
  while (open.size){
    const { n } = open.pop();
    if (equal(n,goal)) return reconstruct(came,n);
    for (const m of neighbors(n)){
      const t = g.get(key(n)) + cost(n,m);
      if (t < (g.get(key(m)) ?? Infinity)){
        came.set(key(m), n); g.set(key(m), t);
        open.push({ n:m, f: t + h(m,goal) });
      }
    }
  }
}
```

Dijkstra: A* with `h = 0`. Flow field: single Dijkstra from goal, each cell stores direction to lower-cost neighbor (cheap per-agent lookups).

Libraries: **pathfinding** npm (A*, JPS, BiA*), **yuka** (navmesh + steering + FSM), **recast-navigation-js** / `@recast-navigation/core`.

## 6.8 Game AI

- **FSM**: per-state `enter/update/exit`.
- **Behavior tree**: `Sequence` (AND), `Selector` (OR), `Parallel`, `Inverter`, `Repeater`, `UntilFail`, `Cooldown`. Library: **mistreevous** (TS, active).
- **GOAP**: A* over world states; actions = {preconditions, effects, cost}.
- **Steering behaviors** (Reynolds): seek, flee, arrive, wander, pursue, evade, plus flocking (separation + alignment + cohesion). Production: **yuka** (`npm i yuka`).
- **Utility AI**: axes → curves → weighted sum → top action wins. Good for emergent sims.

## 6.9 Multiplayer

- WebSockets: `ws`, `socket.io`, `uWebSockets.js` (fast).
- **Authoritative server** + **client prediction** + **server reconciliation**: buffer client inputs keyed by seq; on snapshot, set state to server, re-apply inputs with seq > last processed.
- Render other entities ~100 ms in the past; interpolate between 2 snapshots.
- **Rollback netcode** (GGPO): both clients simulate optimistically, roll back on mismatch; requires deterministic fixed-step sim.

Frameworks:

| Framework | npm / install | Notes |
|---|---|---|
| Colyseus | `npm create colyseus-app` | v0.17 (Apr 2026). Schema binary delta sync. Client `colyseus.js`. |
| Nakama | `@heroiclabs/nakama-js` | MMO-scale, auth/leaderboards/matchmaking/storage. |
| PlayroomKit | `playroomkit` | Local + online, voice, Discord Activities. |
| Geckos.io | `@geckos.io/server`, `@geckos.io/client` | UDP via WebRTC DataChannels. |
| PartyKit | `partykit` | Cloudflare Durable Objects wrapper. |

Colyseus sketch:

```ts
class State extends Schema { @type({map:Player}) players = new MapSchema<Player>(); }
class MyRoom extends Room<State> {
  onCreate(){ this.setState(new State());
    this.onMessage("move", (c,d) => { /* authoritative sim */ }); }
  onJoin(c){ this.state.players.set(c.sessionId, new Player()); }
}
```

## 6.10 Genre patterns

**Platformers** — coyote time, jump buffer, variable height, one-way, wall slide/jump:

```js
if (grounded) coyote = 0.12; else coyote -= dt;
if (jumpPressed) jumpBuf = 0.15;
jumpBuf -= dt;
if (jumpBuf > 0 && coyote > 0){ vy = -JUMP; jumpBuf = 0; coyote = 0; }
if (!jumpHeld && vy < -JUMP*0.5) vy = -JUMP*0.5;            // variable height
if (vy > 0 && prevFeetY <= platformTopY) resolveCollision(); // one-way
if (touchWall && vy > 0) vy = Math.min(vy, 60);              // wall slide
if (jumpPressed && touchWall){ vy = -JUMP; vx = -wallDir*KICK; }
```

**Puzzle / match-3** — flood fill for matches ≥3, undo stack pushing cloned states.

**Shmups / danmaku** — ring pattern, spiral, aimed; pool 5000 bullets:

```js
function ring(cx,cy,count=24,speed=200,phase=0){
  for (let i=0;i<count;i++){
    const a = i/count*Math.PI*2 + phase;
    spawnBullet(cx,cy, Math.cos(a)*speed, Math.sin(a)*speed);
  }
}
```

**RPGs** — stats (STR/DEX/CON/INT/WIS/CHA), grid inventory `Map<{x,y}, item>`, dialog trees via **Twine** (Harlowe/SugarCube) or **Ink by Inkle** (`inkjs`), quest registry with `{id, steps, objectives, rewards}` listening to event bus.

```js
import { Story } from "inkjs";
const story = new Story(compiledJson);
while (story.canContinue) print(story.Continue());
story.currentChoices.forEach((c,i)=>print(i, c.text));
story.ChooseChoiceIndex(0);
```

**Card games** — Fisher–Yates shuffle (seedable via alea).

**Idle/incremental** — cost `= base * mul^owned` (mul~1.15); offline progress capped; prestige `= floor(sqrt(total / 1e10))`.

**Roguelikes** — rot.js scheduler, FOV (PreciseShadowcasting / RecursiveShadowcasting), turn-based loop, permadeath.

**Rhythm games** — use `AudioContext.currentTime` (not `setTimeout`); song position = `ctx.currentTime - songStart`; judge: `|dt| < 0.025 → perfect`, `< 0.05 → great`, `< 0.1 → good`, else miss.

## 6.11 Input handling

- Keyboard: prefer `event.code` (physical key) over `event.key` (layout-dependent). Prevent default for `Space`, arrow keys.
- Gamepad API: poll in rAF; read `pad.axes[0..3]` with deadzone ~0.15; buttons `[0]=A, [1]=B, [6]=LT, [7]=RT` (standard mapping).
- Pointer events: `pointerdown/move/up`, `setPointerCapture(pointerId)` for drag outside canvas; track multi-touch by `pointerId` in a Map.
- Virtual joysticks: **nipplejs** (`nipplejs@1.0.1`):

```js
const stick = nipplejs.create({ zone, mode:"static", position:{ left:"20%", bottom:"20%" }, size:120 });
stick.on("move", (e,d)=>{ player.vx = d.vector.x*S; player.vy = -d.vector.y*S; });
stick.on("end",  ()=>{ player.vx=0; player.vy=0; });
```
