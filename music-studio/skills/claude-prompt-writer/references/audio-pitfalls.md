# Audio pitfalls — pre-warn the build session

Each pitfall has a one-line warning to copy into the relevant feature prompt. These prevent ~80% of the bugs that cost a recording day.

## Browser autoplay

> **Pre-warning:** All audio must be gated behind a user gesture.
> `await Tone.start()` (or `audioContext.resume()` for raw Web Audio)
> must run inside a `click` / `touch` / `keypress` handler, not in
> top-level code. Test by reloading: the first click should produce
> sound.

When to include: any feature that schedules or plays audio.

## AudioContext suspension on tab background

> **Pre-warning:** Some browsers suspend the AudioContext when the tab
> goes to background. Add a `visibilitychange` listener that resumes
> the context on focus.

When to include: any feature that uses `Tone.Transport` or schedules
events more than a few seconds ahead.

## Sample-rate mismatch

> **Pre-warning:** Tone.js defaults to the device sample rate (44.1
> or 48 kHz). Don't hardcode buffer sizes that assume one. Use
> `Tone.context.sampleRate` if you need the value.

When to include: any feature that processes raw samples (FFT, wave-
shapers, custom AudioWorklets).

## Tone.Transport vs setTimeout

> **Pre-warning:** Use `Tone.Transport` for all musical timing — never
> `setTimeout`/`setInterval`. The transport's look-ahead scheduler
> handles drift; setTimeout doesn't.

When to include: any feature that loops or sequences events.

## UI sync via Tone.Draw

> **Pre-warning:** Tone schedules audio ahead of time. UI updates that
> need to align with audio events must be scheduled via
> `Tone.Draw.schedule(callback, time)` — not directly in the audio
> callback.

When to include: any UI that animates in sync with playback (step
indicators, playhead markers).

## Web MIDI gotchas

> **Pre-warning:** Web MIDI requires HTTPS (or localhost) and an
> explicit user permission prompt. Sysex requires a separate flag.
> Handle "no MIDI device connected" by falling back to on-screen keys.

When to include: any feature that uses Web MIDI.

## CORS on external samples

> **Pre-warning:** Loading samples from another domain requires CORS
> headers on the response. Self-host samples in `public/` or use the
> approved CDNs documented in `knowledge/07-audio.md`.

When to include: any feature that loads `.wav`/`.mp3` files at runtime.

## window.storage cap

> **Pre-warning:** Inside a Claude artifact, persistence uses
> `window.storage` (not `localStorage`). Cap is 5 MB per key, 20 MB
> per artifact. Don't dump entire sample libraries into it.

When to include: any feature that persists user state in an artifact.

## Knob ranges that produce ear-shredding output

> **Pre-warning:** Filter resonance, feedback delay, and distortion
> drive can hit deafening levels at full range. Either clamp at safe
> values OR add a soft-clipper (`Tone.Limiter` at -1 dB) at the end
> of the chain.

When to include: any feature that exposes filter Q, feedback, gain,
or distortion as a user control.

## Mobile touch

> **Pre-warning:** Mobile uses `touchstart`, not `mousedown`. Bind
> both. Slider precision is worse on touch — clamp the parameter
> sensitivity. Test on phone before recording.

When to include: any feature with custom (non-`<input>`) controls.

## Recording capture

> **Pre-warning:** When recording the demo, `OBS` / `QuickTime` need
> to capture browser audio cleanly. Test the capture chain BEFORE
> the recording session.

When to include: never in a feature prompt — this is a recording-day
discipline note. Surface in `build-notes.md` "Risks".
