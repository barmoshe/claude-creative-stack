# 17 — Presentations & Diagrams

This file routes slide, deck, whiteboard, and diagram work. It pairs with
`presentation-studio`, `diagram-composer`, and the animated presentation
artifact starter.

## 17.1 Presentation lanes

| User wants | Use | Export reality |
|---|---|---|
| Editable client deck | Native PPTX | Text, shapes, notes, charts stay editable |
| Animated artifact deck | GSAP + `artifacts/html/animated-presentation.html` | Interactive HTML; export stills/video from browser |
| Markdown developer deck | Slidev | PDF/PNG/PPTX export; PPTX is image-based |
| Classic HTML slides | Reveal.js | Strong presenter/PDF path; no native PPTX lane |
| Simple Markdown handout | Marp | Fast PDF/HTML/PPTX/image exports; PPTX usually image-based |

Rule of thumb: if the recipient must edit it in PowerPoint, build native PPTX.
If the experience matters more than editability, build HTML.

## 17.2 Diagram lanes

| Diagram job | Default source | Notes |
|---|---|---|
| README/workflow/process | Mermaid | Best default for Markdown docs |
| Hand-drawn/editable whiteboard | Excalidraw JSON | Save `.excalidraw` next to exports |
| Dense graph/DAG | Graphviz/DOT | Best automatic layout |
| UML/C4/component/class | PlantUML | Mature software modeling grammar |
| Polished architecture poster | D2 | Good visual defaults when installed |
| Multi-format service | Kroki | Prefer self-hosted for private work |

Keep canonical source files. Rendered `.svg`, `.png`, and `.pdf` are outputs,
not the durable source of truth.

## 17.3 Animated HTML presentation artifact

The flagship starter is `artifacts/html/animated-presentation.html`.
It is intentionally a GSAP-powered deck, not a plain slide shell. GSAP is loaded
from `cdnjs.cloudflare.com`, which matches the repo's artifact CDN convention.
The file keeps a native CSS fallback only for reduced-motion users or failed CDN
loading.

Use it when the deck should feel like a live artifact:

- animated slide transitions and object reveals
- Excalidraw-style sketch graphics
- GSAP timelines for staged copy and SVG line drawing
- keyboard controls, overview, notes, fullscreen
- JSON import/export for remixing
- `.excalidraw` frame import/export for hand-drawn storyboard interchange
- embedded-scene SVG export for Excalidraw round trips
- current-slide PNG export
- reduced-motion fallback

Implementation constraints:

- one HTML file
- no `localStorage`; use `window.storage` when available
- no arbitrary network fetches
- GSAP runtime from cdnjs for the flagship animation path
- composite-friendly animation: `transform`, `opacity`, `filter`, SVG stroke
  values, and canvas recording only when supported
- slide JSON is the live runtime source after any import
- `.excalidraw` is an authoring/export lane, not the artifact runtime model

Third-party runtime guidance:

- **GSAP:** default for the animated presentation artifact.
- **Excalimate:** optional external workflow for timeline-heavy Excalidraw
  animations and exports such as MP4/WebM/GIF/Lottie/animated SVG.
- **excalidraw-animate:** useful reference pattern for simple element-order
  animation from `.excalidraw`, but not a required dependency.
- **Reveal.js:** use when you want a standard HTML presentation framework with
  fragments, overview, notes, and print-to-PDF.
- **Slidev:** use outside single-file artifact mode for Markdown/component decks.
- **Rough.js:** useful for deeper sketch rendering; the starter currently uses
  built-in SVG sketch primitives to stay easy to patch.

## 17.4 Excalidraw frames and animation

Excalidraw frames are real container elements. Use them when a whiteboard needs
to become slides, a slide needs to return to manual sketch editing, or a
specific region needs frame-specific export.

Frame rules:

- name frames with slide titles or presentation roles
- keep child elements before the parent `frame` element when generating JSON
- use `frameId` for children whenever possible
- export embedded-scene SVG when future Excalidraw re-import matters
- use `node scripts/render-diagram.mjs --frame "Frame Name"` for frame-specific
  SVG/PNG/PDF rendering

Artifact animation schema:

- `animation.elements[stableId]` stores per-element keyframes
- supported keyframe values: `opacity`, `x`, `y`, `scale`, `rotation`,
  `drawProgress`, and `ease`
- `animation.camera` stores pan/zoom/focus moments for the sketch layer
- `animation.clipRange` can mark the useful capture window for recording/export
- reduced-motion mode must show completed slides with no staged hiding, camera
  movement, or long draw effects

Use Excalimate externally when the deliverable is a full animation export from
an Excalidraw source. Use the artifact engine when the deliverable is an
interactive Barmoshe Builder deck with GSAP, notes, controls, and JSON state.

## 17.5 Export notes

- **Editable PPTX:** use native PowerPoint objects, not screenshots.
- **Slidev PPTX:** useful for sharing, but slides are image-based.
- **Reveal.js PDF:** use Chromium/Chrome print flow.
- **Marp:** strong for simple Markdown decks; editable PPTX is not the default.
- **Excalidraw SVG:** embed scene data when re-import matters.
- **PNG export:** use SVG/canvas rasterization or Playwright screenshots.
- **Video export:** use `MediaRecorder` and `canvas.captureStream()` when the
  browser supports the chosen MIME type.

## 17.6 Local rendering

Use `scripts/render-diagram.mjs`:

```bash
node scripts/render-diagram.mjs --input flow.mmd --output flow.svg
node scripts/render-diagram.mjs --input board.excalidraw --output board.png
node scripts/render-diagram.mjs --input board.excalidraw --output frame.svg --frame "Slide 1"
node scripts/render-diagram.mjs --input graph.dot --output graph.pdf --type graphviz
```

Detection defaults:

- `.mmd`, `.mermaid` → Mermaid
- `.excalidraw` → Excalidraw JSON
- `.dot`, `.gv` → Graphviz
- `.puml`, `.plantuml` → PlantUML
- `.d2` → D2

External CLIs may be required for Mermaid, Graphviz, PlantUML, and D2. The
Excalidraw path includes a built-in renderer for common shapes.

## 17.7 Verification checklist

- Render at slide size and mobile preview size.
- Check text overlap, edge crossings, and contrast.
- For PPTX, confirm text and notes are editable.
- For HTML artifacts, test keyboard navigation and reduced motion.
- For diagrams, preserve source plus rendered output.

## 17.8 See also

- `skills/presentation-studio/SKILL.md`
- `skills/diagram-composer/SKILL.md`
- `prompts/build-presentation.md`
- `prompts/build-diagram.md`
- `recipes/animated-presentation.md`
- `knowledge/15-export-recording.md`
