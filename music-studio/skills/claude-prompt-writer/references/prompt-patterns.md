# Prompt patterns

Canonical structure for each prompt type. Adapt the slots; don't deviate from the shape.

## Scaffold prompt

```
You're inside a fresh project folder at `<absolute-path>/`. Build the
following:

- A single `index.html` that loads Tone.js v15.5 from
  https://unpkg.com/tone@15.5/build/Tone.js.
- `src/audio.js`, `src/ui.js`, `src/state.js`. No framework yet.
- One button. On click, do `await Tone.start()` then play one
  bar of a kick drum at 120 BPM via `Tone.Transport`.
- Open at <http://localhost:5173> via `npx vite` or by
  `python -m http.server 5173` if Vite isn't preferred.

Browser autoplay must be respected — audio cannot start before the
first user gesture. Include a comment in `audio.js` explaining the
gating.

Don't add features beyond this. Don't introduce React. Don't add a
build step besides what's strictly required.

When done, stop and print: "scaffold ready, run with: <command>".
```

## Architecture prompt

```
The current scaffold runs but is monolithic. Refactor:

- `src/audio.js` exports a class `AudioEngine` with `start()`,
  `stop()`, and `set(name, value)` for parameter changes.
- `src/ui.js` only does DOM event wiring; never imports Tone.js.
- `src/state.js` is a plain object; one getter/setter per parameter.
- `audio.js` listens to state changes and applies them.

No framework yet. Plain modules. Verify the existing kick still plays
after the refactor.

When done, list every parameter exposed via state, with min/max
ranges.
```

## Feature prompt (one per milestone)

```
Milestone N: <milestone name from build-notes.md>

Exit condition: <one sentence — what audible / visible behavior proves
this milestone is done>

Pre-warnings (from audio-pitfalls.md):
- <relevant pitfalls for this milestone>

Implement only this milestone. Don't touch anything outside the files
named below:
- <files this milestone modifies>

When done, demonstrate it by:
1. Showing the diff.
2. Running the project.
3. Describing what the user should hear/see.
```

## Debug prompt template

```
Something's broken. Here's what I have:

- The error (if any): `<paste>`
- The behaviour I expected: <one sentence>
- The behaviour I'm getting: <one sentence>
- The relevant file is `<path>`. The suspect lines are around line
  <N>.

Diagnose the root cause. Don't bypass the symptom. If the cause is
unclear, ask exactly one clarifying question — don't speculate.

Don't propose a fix until you've named the cause.
```

## Polish prompt

```
The build works. Final pass:

1. Audit naming — every variable/function/file should describe what it
   does, not how it's implemented.
2. Remove any dead code, console.logs, TODOs.
3. Verify autoplay gating still works (first click unlocks audio).
4. Add a one-line comment ONLY where the WHY isn't obvious from the
   names.
5. Check that the README's "How to run" still matches reality.

Don't add features. Don't introduce abstractions. If you're tempted
to refactor something for "future flexibility", stop.

When done, list anything you removed and anything you renamed.
```

## Why this structure

- Self-contained: every prompt could be the only thing in the build
  session's context.
- Specific: paths, file names, libraries, versions, exit conditions.
- Bounded: tells Claude what NOT to do as much as what to do.
- Verifiable: every prompt ends with a concrete "show me this works"
  request.
