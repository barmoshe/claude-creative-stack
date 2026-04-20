---
name: animation-composer
description: Route animation tasks to the smallest correct tool — plain CSS, Web Animations API, Motion v12, GSAP 3.14, Theatre.js, Rive, or Lottie — and produce composite-only implementations that respect prefers-reduced-motion. Use when the user asks to animate something on the web, build a scroll story, sequence an intro, design motion systems, or port design-tool timelines to code. This is an orchestrator skill — it delegates engine-specific deep work to greensock/gsap-skills and freshtechbro/claudedesignskills where available.
license: MIT
---

# Animation Composer

An **orchestrator**, not a GSAP tutorial. Its main job is picking the right tool and enforcing performance hygiene.

## When to trigger

- "Animate the hero section"
- "Scroll-driven story"
- "Onboarding sequence"
- "Port this After Effects animation"
- "Make this feel alive"

## Tool-selection ladder (smallest first)

| Need | Use |
|---|---|
| Single property, enter/leave, `:hover`, `@media(hover)` feedback | Plain CSS `transition` / `@keyframes` |
| Scroll-linked single element, no runtime JS budget | CSS `animation-timeline: scroll()` / `view()` (with polyfill on Safari — `flackr/scroll-timeline`) |
| Imperative control, spring physics, React | Motion v12 (`motion/react`) |
| Complex timelines, ScrollTrigger, MorphSVG, FLIP, Observer | GSAP 3.14 (+ `@gsap/react`) — delegate to `greensock/gsap-skills` |
| After Effects / designer-authored | Lottie (`lottie-web`) |
| Interactive state-machine / character | Rive Web v2 |
| Designer + code shared timeline | Theatre.js 0.7 (avoid 1.0 pre-release) |
| 3D scene animation | Three.js r128 + `AnimationMixer` (artifact) or R3F (playground) |

## Performance guardrails (enforce)

From `knowledge/04-animation.md` and `knowledge/99-caveats.md`:
- Animate `transform`, `opacity`, `filter` only. Never `width/height/top/left/margin/padding` on a hot element.
- One layer promotion strategy per scene — don't scatter `will-change: transform` on every element.
- Respect `@media (prefers-reduced-motion: reduce)` → disable or replace with fades.
- `ScrollTrigger.normalizeScroll(true)` for iOS momentum parity — but check bundle cost.
- Use FLIP (First / Last / Invert / Play) for layout transitions — never interpolate `width`.

## Delegation rules

- For any sequence with >3 timeline tracks, ScrollTrigger, or FLIP: hand off to `greensock/gsap-skills` if installed. Call its scaffolds; do not re-implement GSAP patterns here.
- For Rive / Lottie / Theatre / R3F deep work: hand off to `freshtechbro/claudedesignskills` if installed. Those skills cover engine APIs in depth.
- This skill only owns: tool selection, composition across tools, and the performance checklist.

## Standard output shape

1. **Tool choice** — 1 sentence + the 1–2 alternatives you considered.
2. **Implementation** — single HTML or JSX artifact, fenced.
3. **Reduced-motion fallback** — shown inline, not as an afterthought.
4. **What to tweak** — 3 bullets mapping user-facing intent to the right knob (duration, easing curve, stagger, trigger boundary).

## Snippets

### Motion v12 (React)
```jsx
import { motion } from "motion/react";
export default () => (
  <motion.div initial={{ y:24, opacity:0 }} animate={{ y:0, opacity:1 }}
    transition={{ type:"spring", stiffness:160, damping:18 }}>
    Hello
  </motion.div>
);
```

### GSAP ScrollTrigger (handoff pattern)
```js
// If gsap-skills present: call its scroll-story template.
// Otherwise this minimal form.
gsap.registerPlugin(ScrollTrigger);
gsap.to(".panel", {
  xPercent: -300, ease: "none",
  scrollTrigger: { trigger:".wrap", scrub:1, pin:true, end:"+=2000" }
});
```

### CSS scroll-driven animation (with fallback)
```css
@media (prefers-reduced-motion: no-preference) {
  .title { animation: reveal linear both; animation-timeline: view(); animation-range: entry 0% cover 40%; }
  @keyframes reveal { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform:none; } }
}
```

## Further reading

- `knowledge/04-animation.md` — full library matrix, easing, orchestration.
- `knowledge/99-caveats.md` — scroll-timeline polyfill, Theatre 1.0 status, R3F v10 status.
- `prompts/build-animation.md` — ready-to-paste scaffold.
