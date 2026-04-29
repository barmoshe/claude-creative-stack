---
name: thumbnail-packager
description: |
  Generates 3 thumbnail concepts for music-tech episodes, runs a blind
  reviewer subagent, and presents the picks. Use whenever the user asks
  for a thumbnail, mocks, A/B variants, or "what should the thumbnail
  look like". Always invoke the music-studio orchestrator first — this
  skill assumes context (episode slug, viewer promise, app screenshot
  path) is already established.
allowed-tools: Read, Write, Bash, Task
model: claude-opus-4-7
---

# Thumbnail Packager

## Inputs (must be present in context)

- Episode viewer promise (one sentence).
- Final app screenshot at `workspace/video-projects/<slug>/screenshots/`.
- Channel visual identity:
  - `@../../channel-brain/sound-identity.md` (when added to channel-brain — until then, fall back to `identity.md`)
  - `@../../channel-brain/conventions.md` (when added — until then, fall back to `packaging.md`)
- Channel packaging formulas: `@../../channel-brain/packaging.md`.

If any input is missing, ask before generating.

## Process

1. **Generate 3 distinct thumbnail concepts in parallel** via the Task
   tool. Each subagent gets a self-contained prompt with:
   - Absolute output path: `workspace/video-projects/<slug>/thumb-mocks/v<N>.png`.
   - Exact dimensions: 1280×720 px.
   - Font path and size.
   - Palette as RGB tuples.
   - Anti-list: "no crowded code, no tiny plugin controls, max one core
     idea, no more than 4 words of headline text".
   - "Do not ask questions. If anything is ambiguous, pick the most
     obvious interpretation and proceed."

2. **Render each at 350 px preview width** via
   `helpers/thumbnail_render.py --preview 350`.

3. **Squint test.** Open each preview at 350 px. If the headline isn't
   readable in one second, regenerate that variant with bigger text.

4. **Spawn the blind reviewer subagent** (`agents/reviewer.md`) with no
   prior context about the channel or the user's taste. Give it the
   three previews and ask it to pick the strongest on:
   - One-second readability.
   - Curiosity gap.
   - Clarity of the app screenshot.
   Return the reviewer's reasoning verbatim.

5. **Present all three plus the blind reviewer's pick.** Wait for the
   user's selection before any further action.

## Hard Rules (skill-specific)

- One core idea per thumbnail. No exceptions.
- 2–4 word headline.
- Mobile-readable at 350 px (Hard Rule 3 from `hard-rules.md`).
- App screenshot must be visible and recognizable.
- No promises the episode doesn't deliver.

## References

- `references/thumbnail-formulas.md` — patterns by episode type.
- `references/good-vs-bad-examples.md` — what works and what doesn't.
- `@../../channel-brain/packaging.md`.

## Anti-patterns

- More than one core idea per thumbnail.
- Code screenshots as the dominant visual.
- Tiny plugin controls.
- Generic AI-art aesthetics.
- Promises not in the title or video (clickbait).
