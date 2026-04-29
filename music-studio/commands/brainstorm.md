---
description: |
  Refine a rough music-tech idea into 2-3 variant framings before
  scaffolding. Use whenever the user has a fuzzy idea but isn't sure
  about the angle, the demo, or the build complexity.
allowed-tools: Read, Write, WebSearch, Skill
---

# Brainstorm: $ARGUMENTS

Invoke the `music-studio:episode-strategist` skill in exploration mode
(do not yet scaffold any folder).

For the topic "$ARGUMENTS", produce 2–3 variant framings. Each variant
must include:

- Viewer promise (one sentence, "I built X that does Y").
- Why someone clicks if they don't know the channel.
- Final demo idea (the wow moment).
- Build complexity estimate (small / medium / large).
- Honest weakness or risk.

After presenting all variants, ask the user which to pursue or whether
to combine elements.

Save the chosen framing to
`workspace/episode-ideas/brainstorm-<YYYY-MM-DD>-<short-slug>.md`.

Do not run `/episode-new` automatically. Wait for explicit instruction.
