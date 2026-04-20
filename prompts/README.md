# Prompt Scaffolds

Copy-paste-ready prompt templates for common creative tasks. Each file contains a complete prompt with `{{PLACEHOLDER}}` slots you fill in. Most assume you're in a Claude Project that has `knowledge/` loaded.

| File | Task |
|---|---|
| [`build-animation.md`](build-animation.md) | Build a scroll-driven or timeline animation (GSAP / Motion / CSS). |
| [`build-artifact-game.md`](build-artifact-game.md) | Build a single-file HTML/React artifact game. |
| [`build-shader.md`](build-shader.md) | Write a GLSL fragment shader for a visual effect. |
| [`build-dataviz.md`](build-dataviz.md) | Build a dashboard or explanatory chart. |
| [`build-landing-hero.md`](build-landing-hero.md) | Design a landing-page hero section. |
| [`generate-palette.md`](generate-palette.md) | Generate an accessible oklch color palette. |
| [`generate-sprite-sheet.md`](generate-sprite-sheet.md) | Plan and lay out a sprite atlas. |
| [`generate-ui-kit.md`](generate-ui-kit.md) | Build a themeable shadcn-style UI kit. |
| [`critique-and-refine.md`](critique-and-refine.md) | Self-critique loop for iterating on an output. |
| [`persona-voting.md`](persona-voting.md) | Multi-persona review of a creative deliverable. |

## How to use

1. Open the relevant file.
2. Copy the whole thing into a Claude chat (inside the project that has `knowledge/` loaded).
3. Fill in the `{{PLACEHOLDER}}` slots.
4. Send. Claude will follow the structured XML sections.

## Why XML tags?

Every scaffold wraps instructions, context, and examples in XML tags (`<instructions>`, `<context>`, `<constraints>`, `<examples>`, `<output_format>`). Claude is trained on XML-tagged data and produces more reliable structured output this way. See [`knowledge/09-prompting.md`](../knowledge/09-prompting.md).
