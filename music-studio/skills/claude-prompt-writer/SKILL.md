---
name: claude-prompt-writer
description: |
  Writes the actual prompts the user will paste into Claude Code inside
  /workspace/playground/<build>/. Use whenever the user asks for "the
  initial scaffold prompt", "a debug prompt", "a refactor prompt", or is
  about to start a build session.
allowed-tools: Read, Write
model: claude-sonnet-4-6
---

# Claude Prompt Writer

## Inputs

- `workspace/playground/<build>/build-notes.md` (or the equivalent
  scope summary).
- The build's stack pick from `references/stack-defaults.md` (in
  `build-planner/references/`).
- Optional: existing `claude-prompts.md` (if iterating).

## Process

Generate five prompt sections, in this order, into a single
`claude-prompts.md`:

1. **Scaffold prompt** — sets up project structure, dependencies, and a
   runnable hello-world. Forces autoplay-gating so the first click
   produces sound.
2. **Architecture prompt** — establishes the audio engine and UI
   separation (`src/audio.js` ↔ `src/ui.js`, plain-object state).
3. **Feature prompts** — one per milestone from `build-notes.md`.
   Each names the milestone, the exit condition, and the audio-pitfall
   pre-warnings that apply (per `references/audio-pitfalls.md`).
4. **Debug prompt template** — a fill-in-the-blanks prompt for "this
   isn't working, here's the error". Asks Claude to diagnose root
   cause, not bypass.
5. **Polish prompt** — final pass for UX, naming, comments. Verifies
   autoplay still works.

## Output format

`workspace/playground/<build>/claude-prompts.md`, sectioned by
milestone, each section has a "Paste this into a new session" callout.

Each prompt follows the canonical structure in
`references/prompt-patterns.md`.

## Hard Rules (skill-specific)

- **Every prompt names the working directory.** "Inside this folder
  (`workspace/playground/<build>/`), do X." The session that runs
  these prompts is a separate Claude Code session, not the studio
  session — the prompts must be self-contained.
- **Every prompt that touches audio includes the autoplay-gating
  reminder.** Forgetting it produces a "first click does nothing"
  bug.
- **No prompt asks Claude to install dependencies it can pick.** Pin
  versions: Tone.js v15.5, Three.js r128, etc. (See `99-caveats.md`
  in the shared knowledge base.)

## References

- `references/prompt-patterns.md` — canonical structure for each prompt
  type.
- `references/audio-pitfalls.md` — gotchas to pre-warn the build session
  about.

## Anti-patterns

- Generic prompts. "Build a music app" is not a prompt; "Build a
  4-step Euclidean rhythm sequencer using Tone.js v15.5 from CDN, with
  one button that calls `await Tone.start()` before scheduling, in a
  single `index.html` plus `src/audio.js` and `src/ui.js`" is.
- Prompts that ask Claude to make architectural decisions when
  `build-notes.md` has already made them.
- Skipping the autoplay reminder. It costs 12 words and saves an
  hour of debugging.
- Putting all five prompts into one giant prompt to paste once. Five
  separate prompts is the contract — the build session pastes one,
  iterates, then pastes the next.
