# 04 — Animation (Comprehensive)

## 4.1 Modern CSS animation

| Feature | Syntax | Support (Apr 2026) |
|---|---|---|
| `@keyframes` + `animation` | classic | universal |
| `transition` / `transform` / `opacity` | classic | universal (composite-only) |
| View Transitions API (same-document) | `document.startViewTransition(() => dom())` | Chrome/Edge 111+, Firefox 133+, Safari 18+ (Baseline Newly Available Oct 2025) |
| View Transitions cross-document (MPA) | `@view-transition { navigation: auto; }` | Chrome/Edge 126+, Safari 18.2+. Not in Firefox. |
| Scroll-driven animations | `animation-timeline: scroll()` / `view()` | Chrome/Edge since 2024; Firefox 144+; Safari — polyfill (`flackr/scroll-timeline`) |
| `@starting-style` | initial-render transitions | ~86% |
| `@property` | typed custom props | ~97% |
| `interpolate-size: allow-keywords` | transition to `auto`/`min-content` | Chrome 129+ only |
| `transition-behavior: allow-discrete` | discrete `display` transitions | Chrome/Safari; Firefox partial |

Example — scroll-timeline view:

```css
@keyframes fade { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; } }
section { animation: fade linear both; animation-timeline: view(); animation-range: entry 0% cover 30%; }
```

Example — `@property` + animated gradient angle:

```css
@property --angle { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
.box { background: linear-gradient(var(--angle), red, blue); transition: --angle .6s; }
.box:hover { --angle: 180deg; }
```

Example — height auto transition:

```css
:root { interpolate-size: allow-keywords; }
details { transition: height .25s; height: 24px; }
details[open] { height: auto; }
```

## 4.2 JavaScript animation libraries (current versions)

| Library | Version | npm | Notes |
|---|---|---|---|
| GSAP | 3.14.2 | `gsap` | Free for commercial use since **Apr 30, 2025** (Webflow-owned). All plugins free. `@gsap/react` ships `useGSAP()`. |
| Motion (was Framer Motion) | 12.x (~12.38) | `motion` | Renamed from `framer-motion`. Import `motion/react`. Vue: `motion-v`. |
| Anime.js | 4.3.x | `animejs` | Full rewrite. ESM-first. ~10 KB gzip. API: `animate`, `createTimeline`, `createAnimation`, `createDraggable`, `utils`, `stagger`, `eases`, `spring`. |
| Popmotion | legacy (folded into Motion) | `popmotion` | Use Motion instead. |
| Lottie-web | 5.13.0 | `lottie-web` | Canonical AE/Bodymovin web runtime. |
| Theatre.js | 0.7.2 (stable; 1.0 in private dev) | `@theatre/core`, `@theatre/studio`, `@theatre/react` | Timeline-based; works with R3F via `@theatre/r3f`. |
| Rive | `@rive-app/canvas` 2.35.3; `@rive-app/react-canvas` 4.28.0; `@rive-app/react-canvas-lite` 4.25.3 | — | Canvas2D best perf; WebGL2 variant supports Rive Renderer. |

**GSAP 3.14 plugins (all free)**: ScrollTrigger, ScrollSmoother, ScrollToPlugin, SplitText (rewrite in 3.13), ScrambleText, TextPlugin, DrawSVG, MorphSVG, MotionPath, MotionPathHelper, Draggable, Inertia, Observer, Flip, Physics2D, PhysicsProps, CustomEase, CustomWiggle, CustomBounce, GSDevTools.

```js
// GSAP 3.14
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
gsap.to(".card", {
  y: -80, opacity: 1, stagger: 0.08, duration: 0.6, ease: "power3.out",
  scrollTrigger: { trigger: ".cards", start: "top 80%", end: "bottom 20%", scrub: true }
});
const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
tl.from(".hero h1", { yPercent: 100 }).from(".hero p", { opacity: 0, y: 20 }, "-=0.3");
```

```jsx
// Motion (motion/react) v12
import { motion, useScroll, useTransform } from "motion/react";
function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, -120]);
  return <motion.h1
    style={{ y }}
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 260, damping: 30 }}
  >Hello</motion.h1>;
}
```

```js
// Anime.js v4
import { animate, createTimeline, stagger, eases } from "animejs";
animate(".box", { translateX: [0, 200], rotate: 360, duration: 800, ease: "out(2)", loop: true, alternate: true });

const tl = createTimeline({ defaults: { duration: 500, ease: "out(3)" } });
tl.add(".a", { opacity: [0,1], translateY: [20,0] })
  .add(".b", { scale: [0,1], delay: stagger(80) }, "-=300");
```

```js
// Lottie
import lottie from "lottie-web";
lottie.loadAnimation({ container: document.getElementById("lot"), renderer: "svg", loop: true, autoplay: true, path: "/data.json" });
```

## 4.3 SVG animation

**SMIL** (use for simple looping motion; caution on Chromium deprecation history — still supported):

```xml
<circle cx="20" cy="20" r="8">
  <animate attributeName="cx" from="20" to="200" dur="2s" repeatCount="indefinite"/>
  <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="3s" repeatCount="indefinite"/>
</circle>
```

**Path morphing**: GSAP MorphSVG (path→path), or `flubber` npm (`interpolate(fromPath, toPath)`).

**SVG filters for motion FX**:

```xml
<filter id="warp">
  <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="1">
    <animate attributeName="baseFrequency" values="0.012;0.04;0.012" dur="4s" repeatCount="indefinite"/>
  </feTurbulence>
  <feDisplacementMap in="SourceGraphic" scale="20"/>
</filter>
```

## 4.4 Canvas 2D animation patterns

Particle pool + verlet integration:

```js
class P { constructor(x,y){ this.x=x; this.y=y; this.px=x; this.py=y; } }
function verlet(p, ax, ay, dt){
  const vx = (p.x - p.px) * 0.99;
  const vy = (p.y - p.py) * 0.99;
  p.px = p.x; p.py = p.y;
  p.x += vx + ax*dt*dt;
  p.y += vy + ay*dt*dt;
}
```

Procedural: `y = amp * Math.sin(t*freq + phase)`; `x += noise2D(i*0.1, t*0.2)*speed`.

## 4.5 WebGL / Three.js / React Three Fiber

| Package | Version | npm |
|---|---|---|
| three (standalone) | ~0.183.2 (r183) | `three` |
| three (artifacts only) | r128 | — |
| @react-three/fiber | 9.6.0 | `@react-three/fiber` |
| @react-three/drei | 10.7.7 | `@react-three/drei` |
| @react-three/postprocessing | 3.0.4 | `@react-three/postprocessing` |
| postprocessing | latest | `postprocessing` |

Three.js r171+ ships a production `WebGPURenderer`:

```js
import { WebGPURenderer } from "three/webgpu";
const renderer = new WebGPURenderer({ antialias: true });
await renderer.init();
```

R3F + Drei example:

```jsx
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
function Box(){
  const ref = React.useRef();
  useFrame((_, dt) => { ref.current.rotation.y += dt; });
  return <mesh ref={ref}><boxGeometry/><meshStandardMaterial color="hotpink"/></mesh>;
}
export default () => <Canvas camera={{ position:[3,3,3] }}>
  <ambientLight intensity={0.3}/><directionalLight position={[5,5,5]}/>
  <Box/><Environment preset="city"/><OrbitControls/>
</Canvas>;
```

**GLSL shader cheat sheet**:
- Vertex: outputs `gl_Position` (clip-space vec4). Inputs: `attribute` (per-vertex), `uniform` (global).
- Fragment: outputs `gl_FragColor` (WebGL1) or `out vec4` (GLSL 300 es).
- `varying` (100) / `in`/`out` (300 es) interpolate vertex→fragment.

Minimal fragment shader:

```glsl
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  gl_FragColor = vec4(0.5+0.5*cos(u_time+uv.xyx+vec3(0,2,4)), 1.0);
}
```

Shader libraries: **lygia** (`patriciogonzalezvivo/lygia`) — noise, SDF, math, color, space, lighting; `#include "lygia/generative/snoise.glsl"`. **glsl-noise** — `#pragma glslify: snoise = require(glsl-noise/simplex/3d)`. Learning: **thebookofshaders.com**, Shadertoy.

## 4.6 Physics engines

| Engine | Version | Install | Space | Notes |
|---|---|---|---|---|
| Rapier 2D | 0.19.3 | `@dimforge/rapier2d` (+ `-simd`, `-deterministic`, `-compat`) | 2D | SIMD build 2–5× faster |
| Rapier 3D | 0.19.3 | `@dimforge/rapier3d` (+ variants) | 3D | Sparse voxel colliders; dynamic BVH |
| cannon-es | 0.20.0 | `cannon-es` | 3D | Pmndrs fork; pair with `@react-three/cannon` (worker) |
| matter-js | 0.20.0 | `matter-js` | 2D | Still standard rigid-body 2D |
| planck.js | 1.4.3 | `planck` (was `planck-js`) | 2D | TS rewrite of Box2D |
| p2.js | — | `p2` | 2D | Maintenance mode |

Rapier 3D:

```js
import RAPIER from "@dimforge/rapier3d-compat";
await RAPIER.init();
const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
const ball = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 10, 0));
world.createCollider(RAPIER.ColliderDesc.ball(1), ball);
function tick(){ world.step(); const p = ball.translation(); mesh.position.set(p.x, p.y, p.z); }
```

Matter.js:

```js
const { Engine, World, Bodies, Runner } = Matter;
const engine = Engine.create();
World.add(engine.world, [Bodies.rectangle(400, 580, 800, 40, { isStatic:true }), Bodies.circle(200, 100, 20)]);
Runner.run(Runner.create(), engine);
```

## 4.7 Performance

- **Composite-only** props: `transform`, `opacity`, `filter` (GPU). Everything else triggers layout/paint.
- `will-change: transform` — apply shortly before animation; remove after. Do not blanket-apply.
- Use `requestAnimationFrame(t => ...)` for timing; never `setTimeout` for 60 fps work.
- **FLIP** (First, Last, Invert, Play) for layout transitions:

  ```js
  const first = el.getBoundingClientRect();
  mutate();                                      // perform the actual DOM change
  const last = el.getBoundingClientRect();
  const dx = first.left - last.left, dy = first.top - last.top;
  el.animate([{ transform:`translate(${dx}px,${dy}px)` }, { transform:"none" }], { duration:300, easing:"cubic-bezier(.2,.8,.2,1)" });
  ```

- Budgets: **16.67 ms / frame @60 fps**, **8.33 ms @120 fps**.
- Avoid layout thrashing: read all layout values, then write all.

## 4.8 Easing and orchestration

| Easing | Cubic-bezier |
|---|---|
| ease-in-out | `cubic-bezier(0.42, 0, 0.58, 1)` |
| power2.out (GSAP) | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| expo.out | `cubic-bezier(0.19, 1, 0.22, 1)` |
| back.out(1.7) | `cubic-bezier(0.34, 1.56, 0.64, 1)` |

Spring physics parameters: `stiffness` 100–500 (higher = snappier), `damping` 10–40 (higher = less oscillation), `mass` 1. Motion/GSAP/Anime all expose spring configs.

Stagger: Motion — `transition={{ staggerChildren:0.05 }}` on parent variants. GSAP — `stagger: 0.05` or `{ amount:0.6, from:"center" }`. Anime — `delay: stagger(80, { from:"center" })`.

Reference: **easings.net** for standard cubic-bezier catalog.
