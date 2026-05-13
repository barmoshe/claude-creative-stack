# Animated Presentation

Build a remixable GSAP-powered web presentation with Excalidraw-style graphics,
motion, notes, and export controls.

## Outcome

You end with one standalone HTML artifact based on
`artifacts/html/animated-presentation.html`. It uses GSAP from cdnjs for the
main animation path, opens in a browser, can be pasted into Claude as an
artifact, can be edited as data, and can be exported as stills or JSON.
It also imports and exports named `.excalidraw` frames for hand-drawn
storyboarding while keeping slide JSON as the runtime source of truth.

## Workflow

1. **Frame the talk.** Use `presentation-studio` to define audience, objective,
   narrative spine, slide list, visual system, and speaker notes.
2. **Plan diagrams.** Use `diagram-composer` for any process, architecture,
   state, ERD, or whiteboard scene. Keep Mermaid or `.excalidraw` sources.
3. **Customize the starter.** Edit the slide data in
   `artifacts/html/animated-presentation.html`: title, subtitle, body, notes,
   theme, and sketch elements.
4. **Tune motion.** Use each slide's `animation` block for stable-ID
   keyframes: `opacity`, `x`, `y`, `scale`, `rotation`, `drawProgress`, and
   optional `camera`. Respect reduced motion.
5. **Rehearse.** Check keyboard navigation, overview, notes, fullscreen, mobile
   fit, and color contrast.
6. **Export.** Use PNG export for stills, JSON export for source backup, and
   `.excalidraw` export for frame-based whiteboard editing. Use tour recording
   when the browser supports `MediaRecorder`.

## Good prompts

- "Turn this launch memo into an animated HTML presentation artifact with
  Excalidraw-style diagrams."
- "Create a five-slide technical explainer with sketch graphics, speaker notes,
  and one architecture diagram."
- "Convert this process into a Mermaid source and then adapt it into the
  animated presentation starter."
- "Import this `.excalidraw` storyboard as animated Barmoshe Builder slides,
  preserving each named frame as a slide."

## Acceptance checklist

- The first slide is visually complete without instructions.
- Every slide has a role in the narrative arc.
- Notes are useful for live delivery.
- GSAP motion adds clarity rather than decoration.
- Reduced-motion users can still understand every slide.
- Diagram source is preserved next to exported visuals.
- `.excalidraw` exports preserve children before frame elements.
- Frame import/export has been smoke-tested with
  `docs/examples/sketch-frames.excalidraw`.
