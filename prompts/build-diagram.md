<instructions>
You are creating a durable, editable diagram.

1. Read `<context>` and `<constraints>`.
2. Choose Mermaid, Excalidraw, Graphviz/DOT, PlantUML, D2, or SVG.
3. Keep the canonical source format explicit.
4. If rendering is requested, use `scripts/render-diagram.mjs`.
5. For `.excalidraw` frame work, name frames clearly and preserve children
   before parent frame elements.
</instructions>

<context>
Diagram purpose: {{PROCESS|ARCHITECTURE|SEQUENCE|STATE|ERD|UML|C4|WHITEBOARD|OTHER}}
Audience: {{AUDIENCE}}
Source facts: {{FACTS_TO_SHOW}}
Preferred style: {{CLEAN_DOCS|HAND_DRAWN_EXCALIDRAW|TECHNICAL|PRESENTATION_POLISHED}}
Output target: {{MARKDOWN|SVG|PNG|PDF|PRESENTATION|UNSURE}}
Must include: {{REQUIRED_NODES_EDGES_LABELS}}
</context>

<constraints>
- Default to Mermaid for Markdown and docs.
- Use Excalidraw JSON for hand-drawn editable whiteboards.
- Use Excalidraw frames for presentation/storyboard slides and render a
  specific frame with `--frame` when needed.
- Use Graphviz/DOT for dense graphs and PlantUML for UML/C4.
- Keep labels short and avoid overlapping elements.
- Preserve source plus rendered output.
</constraints>

<output_format>
1. **Format choice** — canonical source and why.
2. **Diagram source** — fenced code block with the full source.
3. **Render command** — exact `node scripts/render-diagram.mjs ...` command.
4. **Review notes** — what to inspect visually after rendering.
</output_format>
