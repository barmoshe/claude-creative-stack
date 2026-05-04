# 14 — Accessibility & Performance

> Creative output that ships ought to load fast on a mid-tier phone, respect motion preferences, and remain usable with a keyboard or screen reader. This file is the one place that rolls those three concerns into a checklist Claude can actually apply.

## 14.1 The May-2026 Web Vitals targets

| Metric | Target | What blows it |
|---|---|---|
| **INP** (Interaction to Next Paint) | **≤ 200 ms** at p75 | Heavy synchronous JS in event handlers — the new top INP killer is `framer-motion`/`motion` orchestration of complex variants on click. |
| **LCP** (Largest Contentful Paint) | ≤ 2.5 s | Hero images served full-resolution; render-blocking scripts; client-side hydration of the hero. |
| **CLS** (Cumulative Layout Shift) | ≤ 0.10 | Animated reveals that change `height`; web-font swap without `size-adjust`; ads/embeds without reserved space. |

Chrome DevTools → **Performance → Web Vitals** lane shows these per interaction. Use the **Web Vitals** library in production:

```js
import { onINP, onLCP, onCLS } from "web-vitals";
onINP(({ value, id, name }) => sendToAnalytics({ name, value, id }));
onLCP(({ value }) => sendToAnalytics({ name: "LCP", value }));
onCLS(({ value }) => sendToAnalytics({ name: "CLS", value }));
```

## 14.2 Compositor-only animation (the fast path)

GPU-accelerated, layout/paint-free properties:

- `transform` (translate / rotate / scale / skew / matrix)
- `opacity`
- `filter` (blur, hue-rotate, drop-shadow, etc.)
- `clip-path` (since 2024 across all majors)

Layout/paint-triggering — **avoid in animations**:

- `width`, `height`, `top/left/right/bottom`, `margin`, `padding`, `border`
- `background-position` (paint), `background-size` (layout in some cases)
- Anything that re-flows children: `display`, `flex-grow`, `grid-template-*`

Apply `will-change: transform` shortly before an animation starts; **remove it after** to free compositor resources. Don't blanket-apply.

## 14.3 `prefers-reduced-motion` — beyond the on/off toggle

WCAG 2.2 SC 2.3.3 ("Animation from Interactions") asks for *reduced amplitude*, not necessarily zero motion. Practically:

- **Cross-fade instead of slide.** Opacity transitions stay; translates flatten.
- **Drop parallax.** Disable scroll-driven secondary motion.
- **Cap velocity.** A 600 ms ease becomes a 150 ms cross-fade.
- **Disable autoplay.** Carousels, ambient loops, idle character motion — all gated.

CSS pattern:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
  /* Or — preferred — gate per-component: */
  .hero { transform: none !important; }
}
```

React hook (drop in any project):

```jsx
import { useEffect, useState } from "react";
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
```

GSAP / Motion / Anime hooks: every major lib supports gating timelines on this media query — call it once at orchestrator setup, not per-tween.

## 14.4 INP triage — what to do when interactions feel slow

Order of investigation (Chrome DevTools → Performance → record an interaction):

1. **Long task on the main thread** → break it up with `scheduler.yield()` (Baseline 2026) or `requestIdleCallback` for non-critical work:

   ```js
   async function processBatch(items) {
     for (const item of items) {
       work(item);
       if ("scheduler" in window && "yield" in scheduler) await scheduler.yield();
     }
   }
   ```

2. **Forced sync layout** in the handler → read all layout values up front, then write.
3. **Non-composited animation triggered by the handler** → confirm everything animated is `transform`/`opacity`/`filter`.
4. **Hydration / SSR thrash** → push hydration off-route or use Server Components / Islands.
5. **Heavy `useEffect` chains in React** → `useTransition` or `useDeferredValue` for low-priority updates.

Tier-down for low-spec devices:

```js
const lowEnd =
  navigator.hardwareConcurrency < 4 ||
  (navigator.deviceMemory && navigator.deviceMemory < 4);
if (lowEnd) {
  disableParticles();
  reduceShadowMapResolution();
  drop3DLayer();
}
```

## 14.5 FPS / memory profiling for games

Three.js:

```js
import Stats from "three/examples/jsm/libs/stats.module";
// In the artifact sandbox: replace with the standalone `stats.js` CDN bundle.
const stats = new Stats(); document.body.appendChild(stats.dom);
function loop(){ stats.begin(); render(); stats.end(); requestAnimationFrame(loop); }
```

WebGL frame inspection: **spector.js** (extension or `<script src=…>` bundle). Click the camera icon, pick a frame, see every draw call with its program/uniforms/state.

WebGPU frame inspection: Chrome DevTools → **Frame** view (since Chrome 124+). Expand each render pass; uniforms and bindings show inline.

Memory:

- `performance.memory.usedJSHeapSize` (Chromium only) for a quick gut-check.
- Three.js: `renderer.info.memory.{geometries, textures}` and `renderer.info.render.{calls, triangles}`.
- Watch for **per-frame allocations** — the new (Three r184, Mar 2026) renderer fix eliminates 240k–500k object allocations per second on 1000-mesh scenes; older revisions still leak. Use the Chrome Memory tab → Allocation timeline.

Targets:

- 60 fps on mid-tier laptop (2023 M2 Air baseline).
- 30 fps on mid-tier phone (2022 Pixel 6a baseline) for *responsive* (touch-driven) experiences.
- < 32 ms input-to-render for any drag/twist interaction.

## 14.6 Keyboard, focus, screen reader

For canvas / WebGL games and animations, the platform doesn't help — you must implement focus & screen-reader affordances by hand:

- **Make the canvas focusable**: `<canvas tabindex="0" role="application" aria-label="Endless runner — use space to jump, arrow keys to move">`.
- **Provide an alternative input** — every gameplay action mapped to a keyboard key, not just mouse/touch.
- **Announce state changes** with an off-screen `aria-live="polite"` region (or `assertive` for hits/deaths).
- **Pause on focus loss** (`document.hidden`, `visibilitychange`) — long autoplay loops drain battery on backgrounded tabs.
- **Captions for audio**: use `<track kind="captions">` for `<video>`. For game-internal audio, render a captions HUD layer toggleable in settings.

For SVG illustrations and dataviz:

- `<svg role="img" aria-labelledby="title desc">` with `<title>` and `<desc>` children.
- Decorative-only SVGs: `aria-hidden="true"` to keep them off the AT tree.
- Charts: provide a "data table" toggle (`aria-controls` from a button to a tabular fallback). Visx / Recharts both support this with a few lines.

## 14.7 Color & contrast

- WCAG 2.2: 4.5:1 (body), 3:1 (large text / UI controls). Tools: VS Code "Color Highlight," Figma "Stark," and `color.js`'s contrast helpers.
- WCAG 3 (in development) replaces the ratio with **APCA**. Tooling exists but the spec is still draft; for new work targeting May 2026 audiences, hit WCAG 2.2 first and document APCA-Lc 60+ aspirationally.
- Use `oklch()` and `light-dark()` (Baseline 2026) for theme-correct color pairs:

  ```css
  :root { color-scheme: light dark; }
  body {
    color: light-dark(oklch(0.18 0 0), oklch(0.95 0 0));
    background: light-dark(oklch(0.98 0 0), oklch(0.12 0 0));
  }
  ```

- Avoid color-only signaling — pair every "red = error" with text or icons.

## 14.8 Tooling cheat sheet

| Goal | Tool |
|---|---|
| Lighthouse audit | `npx lighthouse <url>` or DevTools → Lighthouse panel. |
| Field RUM | `web-vitals` npm + your analytics pipe. |
| Three.js profiling | `stats.js` + `renderer.info` + spector.js. |
| WebGPU profiling | DevTools → Performance + Frame views. |
| INP debugging | DevTools → Performance → Web Vitals lane + `event-timing` API entries. |
| A11y lint (CI) | `eslint-plugin-jsx-a11y`, `axe-core` (`@axe-core/react` for runtime DEV checks). |
| Color contrast | Stark (Figma), VS Code Color Highlight, `apca-w3` lib. |
| Reduced motion preview | DevTools → Rendering panel → "Emulate CSS media feature `prefers-reduced-motion`". |

## 14.9 See also

- `knowledge/04-animation.md` §4.7 — composite-only properties, FLIP.
- `knowledge/05-graphics-design.md` — color systems, `oklch()`, `light-dark()`.
- `knowledge/06-games.md` §6.5–§6.11 — game feel, inputs, where these targets apply.
- `knowledge/15-export-recording.md` — capturing video for reports / regression demos without dropping frames.
