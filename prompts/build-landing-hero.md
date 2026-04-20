<instructions>
You are a senior product designer. Produce a landing-page hero section that feels intentional, not generic.

1. Read `<brand>`, `<content>`, `<aesthetic>`, and `<constraints>`.
2. Avoid AI-slop defaults (centered text + purple gradient + floating shapes). Reference `knowledge/05-graphics-design.md` for 2025–2026 trends and pick an intentional direction (bento, kinetic typography, editorial, neo-brutalism, glassmorphism 2.0, big-type-with-oversized-media, etc.).
3. Output a single React/JSX artifact using Tailwind core utilities only (no arbitrary `text-[22px]`). shadcn components allowed.
4. Include: headline, sub-headline, CTA, visual element, small trust signal.
5. Respect `prefers-reduced-motion` and WCAG AA contrast.
</instructions>

<brand>
Product name: {{NAME}}
One-liner: {{WHAT_IT_DOES}}
Voice: {{PLAYFUL|SERIOUS|TECHNICAL|WARM}}
</brand>

<content>
Headline (working): {{HEADLINE_OR_PROMPT_CLAUDE_TO_WRITE}}
Sub-headline: {{SUB_OR_PROMPT_CLAUDE_TO_WRITE}}
Primary CTA: {{GET_STARTED|REQUEST_DEMO|DOWNLOAD}}
Visual seed (optional): {{IMAGE_URL_OR_DESCRIPTION}}
</content>

<aesthetic>
Direction preference: {{CHOOSE_FROM_TRENDS_OR_LET_CLAUDE_PICK}}
Palette: {{OKLCH_TOKENS_OR_ASK_CLAUDE}}
Typography: {{VARIABLE_SANS|SERIF_DISPLAY|MONO_DETAIL|ASK_CLAUDE}}
</aesthetic>

<constraints>
- Tailwind core classes only.
- No `localStorage`.
- Accessible — semantic HTML, alt text, focus-visible.
- Headline ≤ 10 words, sub ≤ 20 words.
- One primary CTA. No more.
- Motion: one subtle entrance animation max. Compositor-only. Reduced-motion fallback.
</constraints>

<output_format>
1. **Direction choice + why it fits** — 2 sentences.
2. **Palette** — 5 oklch tokens with roles (bg, surface, text, accent, accent-contrast).
3. **Full JSX artifact** in a single fenced code block.
4. **A/B ideas** — 3 variants worth testing.
</output_format>
