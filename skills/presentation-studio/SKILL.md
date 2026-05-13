---
name: presentation-studio
description: Create, plan, improve, or export presentations across editable PPTX, Slidev, Reveal.js, Marp, and animated HTML artifacts. Use when the user asks for a deck, slides, presentation, pitch deck, speaker notes, animated slides, client-ready PowerPoint, web deck, or presentation artifact. Routes between native PPTX, Markdown/web slides, and the animated-presentation HTML starter.
license: MIT
---

# Presentation Studio

Build the right kind of deck, not just a pile of slides.

## When to trigger

- "Make a deck / presentation / slides / pitch deck"
- "Create a PowerPoint / PPTX"
- "Turn this into speaker notes"
- "Build animated slides / a web presentation"
- "Make an HTML presentation artifact"
- "Export this as PDF / PPTX / PNG slides"

## First decision

Choose the lane by the user's delivery need:

| Need | Lane | Default tool |
|---|---|---|
| Client-editable PowerPoint | Native PPTX | PptxGenJS or the runtime PowerPoint skill |
| Animated or interactive presentation | HTML artifact | GSAP + `artifacts/html/animated-presentation.html` |
| Markdown-first developer deck | Web deck | Slidev |
| Classic custom HTML slides | Web deck | Reveal.js |
| Simple Markdown handout deck | Markdown export | Marp |
| Fast PDF/PNG from web slides | Browser capture | Playwright or the deck tool's exporter |

Default to **editable PPTX** for business/client decks. Default to the
**animated HTML artifact** when the user asks for motion, interactivity,
Excalidraw-style visuals, live presentation controls, or a remixable artifact.

## Deck recipe

1. **Clarify only what changes the deck.** Audience, objective, output format,
   source material, brand/template, and deadline.
2. **Write the narrative spine.** One sentence for the deck promise, then a
   slide list with title, role, evidence, visual, and speaker-note intent.
3. **Pick a visual system.** Typography, palette, rhythm, diagram style,
   image style, and density. Use `palette-generator` for tokens when needed.
4. **Separate editable text from visuals.** Slide words, labels, numbers,
   charts, and notes stay editable whenever the output is PPTX.
5. **Use diagrams intentionally.** Hand off architecture, flow, C4, ERD,
   timeline, and whiteboard visuals to `diagram-composer`.
6. **Verify the result.** Render screenshots or previews, inspect notes, and
   confirm the chosen export format matches the user's editability needs.

## Lane guidance

### Editable PPTX

- Use native text boxes, shapes, charts, tables, and speaker notes.
- Do not export image-only slides when editability matters.
- Use generated images only for text-free visual plates.
- Verify by checking that slide text and notes are editable, not baked into
  screenshots.

### Animated HTML artifact

- Start from `artifacts/html/animated-presentation.html`.
- Use GSAP from `cdnjs.cloudflare.com` for the flagship animation layer.
- Keep a reduced-motion/native fallback for CDN failures and accessibility.
- Use `window.storage` for saved state; never use `localStorage`.
- Use the artifact's internal keyframe schema for stable per-element motion:
  `opacity`, `x`, `y`, `scale`, `rotation`, `drawProgress`, optional `camera`,
  and optional `clipRange`.
- Use GSAP as the runtime for slide entrances, text staging, SVG stroke
  drawing, overview reveals, and presenter-mode polish. Animate `transform`,
  `opacity`, `filter`, and SVG stroke values; avoid layout properties.
- Include keyboard controls, overview, notes, fullscreen, JSON import/export,
  and slide-image export when useful.
- Treat slide JSON as the live source of truth after import. `.excalidraw`
  frames are an interchange lane for sketch authoring, frame-based slides, and
  embedded-scene SVG export.
- Use Excalimate externally only for advanced video/Lottie/GIF pipelines that
  need full timeline authoring. Do not require Excalimate or
  `excalidraw-animate` at artifact runtime.

### Excalidraw frame decks

- Import named `.excalidraw` frames when the user already has a whiteboard
  storyboard. Each named frame becomes one slide.
- Export artifact slides as `.excalidraw` frames when the user wants manual
  editing, whiteboard review, or frame-specific still exports.
- Preserve frame ordering when generating files: child elements first, parent
  `frame` element after its children.
- Name frames with presentation-readable labels, not generic IDs.
- Keep animation metadata in slide JSON. Excalidraw receives structure and
  visual editability; GSAP/keyframes remain the artifact motion source.

### Slidev / Reveal.js / Marp

- Slidev: use for Markdown plus components, presenter tooling, and PDF/PNG or
  image-based PPTX exports.
- Reveal.js: use for hand-authored HTML decks, nested slides, speaker notes,
  and Chrome print-to-PDF.
- Marp: use for simple Markdown decks and quick export workflows.
- Warn when PPTX output is image-based and not truly editable.

## Output checklist

- [ ] Audience and objective are explicit.
- [ ] Slide list has a coherent arc, not interchangeable bullets.
- [ ] Output lane is named with the editability/export tradeoff.
- [ ] Speaker notes are included when presenting live.
- [ ] Diagrams have canonical source (`.mmd`, `.excalidraw`, `.dot`, etc.).
- [ ] Motion respects reduced-motion settings.
- [ ] Final export or artifact has been smoke-tested.

## Further reading

- `knowledge/17-presentations-diagrams.md` — presentation and diagram routing.
- `knowledge/15-export-recording.md` — capture, PNG, WebM, MP4, PDF.
- `skills/diagram-composer/SKILL.md` — diagram source and render choices.
- `prompts/build-presentation.md` — structured prompt scaffold.
