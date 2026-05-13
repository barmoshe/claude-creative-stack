# Prompt Scaffolds

Copy-paste-ready prompt templates for common creative tasks. Each file contains a complete prompt with `{{PLACEHOLDER}}` slots you fill in. Most assume you're in a Claude Project that has `knowledge/` loaded.

| File | Task | Tags |
|---|---|---|
| [`build-animation.md`](build-animation.md) | Build a scroll-driven or timeline animation (GSAP / Motion / CSS). | `#animation` `#code` |
| [`build-artifact-game.md`](build-artifact-game.md) | Build a single-file HTML/React artifact game. | `#game` `#code` `#artifact` |
| [`build-shader.md`](build-shader.md) | Write a GLSL fragment shader for a visual effect. | `#shader` `#code` |
| [`shader-critique.md`](shader-critique.md) | **Vision-grounded** critique of a running shader (image + code → critique). | `#shader` `#meta` `#vision` |
| [`build-dataviz.md`](build-dataviz.md) | Build a dashboard or explanatory chart. | `#data` `#code` |
| [`build-presentation.md`](build-presentation.md) | Build a deck, animated HTML presentation artifact, or presentation export workflow. | `#slides` `#deck` `#presentation` |
| [`build-diagram.md`](build-diagram.md) | Build Mermaid, Excalidraw, Graphviz, PlantUML, D2, or SVG diagrams. | `#diagram` `#excalidraw` `#architecture` |
| [`build-landing-hero.md`](build-landing-hero.md) | Design a landing-page hero section. | `#design` `#code` `#landing` |
| [`generate-palette.md`](generate-palette.md) | Generate an accessible oklch color palette. | `#design` `#tokens` |
| [`generate-sprite-sheet.md`](generate-sprite-sheet.md) | Plan and lay out a sprite atlas. | `#game` `#asset` |
| [`generate-ui-kit.md`](generate-ui-kit.md) | Build a themeable shadcn-style UI kit. | `#design` `#code` `#components` |
| [`critique-and-refine.md`](critique-and-refine.md) | Self-critique loop for iterating on an output. | `#meta` `#critique` |
| [`persona-voting.md`](persona-voting.md) | Multi-persona review of a creative deliverable. | `#meta` `#critique` |

## Filter by tag

- **`#animation`** — `build-animation.md`
- **`#game`** — `build-artifact-game.md`, `generate-sprite-sheet.md`
- **`#shader`** — `build-shader.md`, `shader-critique.md`
- **`#design`** — `build-landing-hero.md`, `generate-palette.md`, `generate-ui-kit.md`
- **`#data`** — `build-dataviz.md`
- **`#slides`** — `build-presentation.md`
- **`#diagram`** — `build-diagram.md`
- **`#meta`** (skill orchestration / critique) — `critique-and-refine.md`, `persona-voting.md`, `shader-critique.md`

## How to use

1. Open the relevant file.
2. Copy the whole thing into a Claude chat (inside the project that has `knowledge/` loaded).
3. Fill in the `{{PLACEHOLDER}}` slots.
4. Send. Claude will follow the structured XML sections.

## Why XML tags?

Every scaffold wraps instructions, context, and examples in XML tags (`<instructions>`, `<context>`, `<constraints>`, `<examples>`, `<output_format>`). Claude is trained on XML-tagged data and produces more reliable structured output this way. See [`knowledge/09-prompting.md`](../knowledge/09-prompting.md).
