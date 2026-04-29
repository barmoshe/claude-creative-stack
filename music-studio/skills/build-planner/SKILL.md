---
name: build-planner
description: |
  Turns the episode strategy into a finishable music-app build plan. Use
  whenever the user is ready to scope the build. Stays MVP. Lists explicit
  "leave for episode 2" items. Prevents overbuilding.
allowed-tools: Read, Write
model: claude-sonnet-4-6
---

# Build Planner

## Inputs

- Episode strategy: viewer promise, final demo sketch, complexity intuition.
- Optional: existing `workspace/playground/<slug>/` if the build already started.

## Process

1. Identify the **smallest set of features** that can deliver the final demo. Anything not strictly required → "leave for episode 2".
2. Pick a **stack**. Default to browser-first (HTML/CSS/JS or React + Tone.js + Web Audio API) for the first 10 episodes. See `references/stack-defaults.md`.
3. Decompose into **3–6 build milestones**, each finishable in a single Claude Code session.
4. Identify **risk areas** — see `references/risk-checklist.md`. Common: audio scheduling, browser autoplay gating, MIDI permissions, latency.
5. List **explicit out-of-scope** items.

## Outputs

`workspace/playground/<build>/build-notes.md` with sections:

- **Goal** — one sentence (the viewer promise + how this build delivers it).
- **Stack** — language, framework, audio libs, run command.
- **MVP feature list** — bullet list, ranked by demo-criticality.
- **Milestones** — 3–6 sessions, each with a clear exit condition.
- **Risks** — from the checklist, plus build-specific.
- **Out of scope** — explicit "leave for episode 2".

## Hard Rules (skill-specific)

- **MVP only.** If a feature isn't audible in the final demo, it's out of scope.
- **Browser-first** for the first 10 episodes. Do not introduce VST/AU/AAX targets until at least 5 episodes have shipped (Spec 01 §8).
- **No DAW automation.** Out of scope until 5 episodes are live.
- **No AI-music-generation APIs** as a system feature. One-off use is fine; system feature is not.

## References

- `references/stack-defaults.md` — when to use Tone.js vs raw Web Audio, when to add Three.js, when a backend is justified.
- `references/risk-checklist.md` — common gotchas in browser audio.
- The shared knowledge base at `../../../knowledge/07-audio.md` (Tone.js v15.5 patterns, Web Audio constants, scales, Euclidean rhythms) — read this before picking a stack.
- The shared starter at `../../../artifacts/html/tone-procmusic.html` — the canonical browser-first audio reference.

## Anti-patterns

- Picking a heavyweight stack (full Next.js + database) for a single-page audio toy.
- Letting MVP creep — every "while we're at it" feature is a risk to shipping.
- Treating "the synth sounds bad" as a milestone. Sound design happens during the build, not as a milestone.
- Designing an architecture more sophisticated than the demo requires.
