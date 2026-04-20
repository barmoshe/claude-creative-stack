# Recipe — Animated marketing landing

**Goal:** a landing page with an opinionated hero, two scroll-driven moments, and accessible motion.

## Session 1 — Palette + hero shape (1 hour)

1. Run `prompts/generate-palette.md` with `Product: Runway / Mood: warm, confident, composed / Industry: B2B SaaS`. Get 9 tokens light + dark.
2. If `palette-oklch` MCP is wired, skip the prompt and call `generate_palette({ hue: 45, mode: "light" })` directly.
3. Run `prompts/build-landing-hero.md`. Tell Claude the palette + direction: *"Bento grid with oversized left-column headline. One amber accent. Avoid generic centered purple gradient."*

Output: `artifacts/react/bento-grid-landing.jsx`-style file, themed to your tokens.

## Session 2 — Scroll moments (1–2 hours)

Use `skills/animation-composer`:
- **Moment 1:** kinetic typography on section headers — `artifacts/react/kinetic-typography.jsx` pattern. Word stagger + variable-weight "breathing" headline.
- **Moment 2:** horizontal-pin scroll story — `artifacts/html/gsap-scroll-story.html` pattern, ported into React.

The orchestrator skill picks Motion for the stagger (React, imperative control) and delegates GSAP ScrollTrigger to `greensock/gsap-skills` if installed (otherwise uses the scaffold in `knowledge/04-animation.md`).

Performance checklist (from the skill):
- Transforms + opacity only. Audit with DevTools Performance → Layers panel.
- `@media (prefers-reduced-motion: reduce)` disables both moments.
- Scroll-driven CSS option tested in Safari — polyfill via `flackr/scroll-timeline` if you ship it.

## Session 3 — Componentize (1 hour)

Run `prompts/generate-ui-kit.md`. Claude produces Button, Card, Badge, Dialog, Tabs themed to your oklch tokens.

Drop the primitives into the landing page. Swap the ad-hoc elements in the bento grid for typed components. Run `skills/ui-design-kit` contrast checks — automatic AA verification.

## Session 4 — Review (30 min)

Run `prompts/persona-voting.md` against the page. Four reviewers (UX / Brand / Perf / Skeptic) weigh in. Merge the top three action items.

Typical outcomes:
- **Skeptic:** "The bento card pattern is 2024-heavy — add one asymmetric breakout for intentional imperfection."
- **Perf engineer:** "Lucide import is tree-shaken — confirm bundle stays <60 kB gzipped."
- **UX:** "Primary CTA contrast is 4.6:1 — fine, but hover state drops to 3.8. Nudge hover token L by 0.05."

## Ship

- Static export (Next / Astro / plain HTML) — the component kit is Tailwind-core-only, so any build pipeline works.
- Monitor Web Vitals. LCP should be under 2.5s on a landing page this simple.

## What earned its keep

- `knowledge/05-graphics-design.md` — the 2025-2026 design trend notes kept the page from defaulting to generic SaaS.
- `knowledge/04-animation.md` + `animation-composer` — picked the right tool per moment, didn't reach for GSAP where CSS suffices.
- `prompts/persona-voting.md` — caught the bento-heavy critique before the dev handoff.
