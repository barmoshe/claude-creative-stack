# Claude prompts for <slug>

Paste these into a separate Claude Code session running with this folder
as the working directory. Run them in order.

The `claude-prompt-writer` skill (deferred to a later expansion — see
README) will generate these from `build-notes.md` automatically. Until
it ships, fill in this file by hand.

## 1. Scaffold prompt

> Set up a static-page music-tech project in this folder. Single
> `index.html` plus `src/audio.js`, `src/ui.js`, `src/state.js`. Use
> Tone.js v15.5 from CDN. Wire one button that, on click, starts
> Tone.Transport and plays a 1-bar kick pattern. Browser autoplay must
> be honored — audio cannot start before the user click.

## 2. Architecture prompt

> Separate the audio engine (`audio.js`) from the UI (`ui.js`). State
> is a plain object in `state.js` with two getters/setters per field.
> No framework yet.

## 3. Feature prompts (one per milestone)

> _Fill in from `build-notes.md` milestones._

## 4. Debug prompt template

> _Fill in:_
>
> The error is: `<paste error>`
> What I expected: `<...>`
> What's happening instead: `<...>`
> The relevant file is: `<path>`. Suspect line: `<n>`.
>
> Diagnose the root cause. Don't bypass the symptom.

## 5. Polish prompt

> Pass over UX, naming, comments. Remove dead code. Verify autoplay
> gating still works after this pass. The viewer must hear sound
> within 1 click of opening the page.
