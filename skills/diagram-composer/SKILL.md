---
name: diagram-composer
description: Create, convert, validate, render, or improve diagrams across Mermaid, Excalidraw, Graphviz/DOT, PlantUML, D2, Kroki, SVG, and presentation-ready sketch graphics. Use when the user asks for diagrams, flowcharts, architecture maps, C4, ERD, UML, sequence diagrams, whiteboards, Excalidraw drawings, hand-drawn graphics, or diagram export to SVG/PNG/PDF.
license: MIT
---

# Diagram Composer

Turn structure into a diagram with a durable source file.

## When to trigger

- "Make a diagram / flowchart / architecture map"
- "Create an Excalidraw"
- "Convert this to Mermaid / PlantUML / Graphviz / D2"
- "Render this diagram to SVG / PNG / PDF"
- "Make a hand-drawn whiteboard style graphic"
- "Add a diagram to slides or a presentation artifact"

## Format router

| Need | Default format | Why |
|---|---|---|
| Docs, README, workflows, quick architecture | Mermaid | Markdown-native and easy to revise |
| Hand-drawn editable visual | Excalidraw JSON | Human-editable whiteboard source |
| Dense dependency graph or DAG | Graphviz/DOT | Strong automatic layout |
| UML, C4, component/class/sequence | PlantUML | Mature software-diagram grammar |
| Polished architecture poster | D2 | Presentation-friendly diagram styling |
| Many formats through one service | Kroki | Optional unified renderer |
| Custom one-off visual | SVG | Precise, portable, animatable |

Default to **Mermaid** unless the user asks for hand-drawn/manual editing,
then use **Excalidraw JSON**.

## Composition rules

1. **Name the diagram job.** Is it explaining a process, architecture,
   decision tree, data model, timeline, or state machine?
2. **Choose a canonical source.** Always keep the text/JSON source next to any
   rendered `.svg`, `.png`, or `.pdf`.
3. **Use stable IDs.** For Excalidraw and generated SVG, use predictable IDs
   so later edits can target nodes without redrawing the whole scene.
4. **Keep labels short.** Put details in notes, callouts, or surrounding prose.
5. **Render deterministically.** Use `node scripts/render-diagram.mjs` for local
   conversion when a file output is needed.
6. **Inspect the output.** Diagrams fail visually before they fail syntactically:
   check overlap, edge crossings, contrast, and mobile readability.

## Excalidraw guidance

- Keep `.excalidraw` as the editable source.
- Use frames for slide-sized scenes and named groups for important regions.
- For presentation storyboards, make each frame one slide-sized scene and name
  it with the slide title or frame role.
- When generating `.excalidraw`, place frame children before the parent `frame`
  element. This matches Excalidraw's frame ordering expectations and keeps
  frame-specific export reliable.
- Prefer a small vocabulary: rectangle, diamond, ellipse, arrow, line, text,
  freedraw accents, and callout frames.
- Export embedded-scene SVG when future re-import matters.
- Use stable element IDs when animation, later edits, or artifact import/export
  will target specific shapes.
- Keep animation metadata outside vanilla Excalidraw elements unless the user
  explicitly asks for an external Excalimate-style workflow. For the animated
  presentation artifact, store keyframes in slide JSON with `opacity`, `x`,
  `y`, `scale`, `rotation`, `drawProgress`, and optional `camera`.
- For text-to-whiteboard, draft the structure in Mermaid first, then convert or
  redraw into Excalidraw style.

## Rendering

Use the repo script:

```bash
node scripts/render-diagram.mjs --input docs/example.mmd --output docs/example.svg
node scripts/render-diagram.mjs --input sketch.excalidraw --output sketch.png
node scripts/render-diagram.mjs --input sketch.excalidraw --output slide-1.svg --frame "Slide 1"
node scripts/render-diagram.mjs --input graph.dot --output graph.svg --type graphviz
```

The script auto-detects by extension unless `--type` is provided. Optional
external renderers are used for Mermaid, Graphviz, PlantUML, and D2. Excalidraw
JSON has a built-in fallback renderer for common shapes and can render a named
frame with `--frame`.

## Output checklist

- [ ] Canonical source format is clear.
- [ ] Render target is named (`svg`, `png`, or `pdf`).
- [ ] Labels are readable at slide and mobile sizes.
- [ ] Hand-drawn diagrams keep editable `.excalidraw` source.
- [ ] Mermaid/PlantUML/DOT/D2 syntax validates or renders cleanly.

## Further reading

- `knowledge/17-presentations-diagrams.md` — routing and export limits.
- `docs/diagram.md` — existing Mermaid stack diagram.
- `prompts/build-diagram.md` — structured prompt scaffold.
