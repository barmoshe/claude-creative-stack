<instructions>
You are building a presentation for Claude Creative Stack.

1. Read `<context>` and `<constraints>`.
2. Pick the correct lane: editable PPTX, animated HTML artifact, Slidev,
   Reveal.js, or Marp.
3. Produce a narrative spine before producing slides.
4. Include speaker notes unless the deck is explicitly visual-only.
5. Use `diagram-composer` for architecture, flow, C4, ERD, or Excalidraw-style
   visuals.
6. For animated HTML, use stable slide/sketch IDs and the artifact animation
   schema instead of DOM-order-only animation.
</instructions>

<context>
Project: {{PROJECT_NAME}}
Audience: {{AUDIENCE}}
Objective: {{WHAT_THE_DECK_MUST_ACHIEVE}}
Input material: {{SOURCE_NOTES_OR_FILES}}
Preferred output: {{EDITABLE_PPTX|ANIMATED_HTML|SLIDEV|REVEAL|MARP|UNSURE}}
Tone: {{EXECUTIVE|TECHNICAL|SALES|TEACHING|CREATIVE}}
Length: {{SLIDE_COUNT_OR_DURATION}}
Brand/template: {{BRAND_GUIDELINES_OR_NONE}}
</context>

<constraints>
- If the recipient needs editable PowerPoint, use native PPTX objects.
- If the user asks for animation, interactivity, or artifact remixing, prefer
  the GSAP-powered `artifacts/html/animated-presentation.html`.
- If the user provides an Excalidraw storyboard, import named frames as slides;
  keep JSON as the live source after import and export `.excalidraw` frames for
  manual editing.
- Keep readable text out of generated images.
- Include `prefers-reduced-motion` for animated HTML.
- Preserve canonical diagram sources next to rendered outputs.
</constraints>

<output_format>
1. **Lane choice** — tool/output and one-sentence tradeoff.
2. **Narrative spine** — promise, audience shift, and arc.
3. **Slide plan** — title, role, visual, notes intent for each slide.
4. **Build plan** — assets, diagrams, export target, and verification.
5. **Deliverable** — full source or instructions for the selected lane.
</output_format>
