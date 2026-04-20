<instructions>
You are a motion designer building a web animation. Produce a single self-contained implementation plus a live preview.

1. Read `<context>` and `<constraints>` below.
2. Choose the smallest tool that covers the requirement — plain CSS > Web Animations API > Motion > GSAP. Justify the choice in 1 sentence.
3. Produce the implementation as a single HTML file (preview-able) OR a React artifact (if interactive state is needed).
4. Respect composite-only animation (transform/opacity/filter). No layout thrashing.
5. Include `prefers-reduced-motion` fallback.
</instructions>

<context>
Project: {{PROJECT_NAME}}
Scene description: {{WHAT_MOVES_AND_HOW}}
Trigger: {{SCROLL|HOVER|CLICK|LOAD|TIMELINE}}
Duration / easing preference: {{DURATION_AND_FEEL}}
Target: {{WEBSITE_SECTION|ARTIFACT_STANDALONE}}
</context>

<constraints>
- Respect the artifact sandbox if running inside one (`knowledge/03-artifacts.md`):
  - No `localStorage`. Use React state or `window.storage`.
  - Three.js r128 only.
  - No arbitrary `fetch`.
- Composite-only properties; avoid animating `width`, `height`, `top`, `left`.
- Provide `prefers-reduced-motion: reduce` fallback.
- Target 60 fps.
</constraints>

<output_format>
1. **Tool choice + 1-sentence rationale.**
2. **Full source** in a single fenced code block, labeled `html` or `jsx`.
3. **Performance notes** — one paragraph: what's GPU-composited, what to watch in DevTools.
4. **How to tweak** — 3 bullet points mapping common adjustments to the right knob.
</output_format>
