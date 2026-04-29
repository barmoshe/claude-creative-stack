# Risk checklist — common browser-audio gotchas

Walk through this list when scoping a build. Risks not surfaced here become bugs that ate the recording day.

## Audio engine

- [ ] **Autoplay gating.** Audio cannot start until a user gesture. Forgetting this causes a silent first click.
- [ ] **AudioContext suspension on tab background.** Some browsers suspend; the build must handle resume on focus.
- [ ] **Sample rate mismatch.** Tone.js defaults to the device sample rate (44.1 or 48 kHz). Hardcoded buffer math breaks on the other.
- [ ] **Buffer underruns on slow machines.** Test on a 5-year-old laptop. If it crackles, lower polyphony or simplify the chain.

## Scheduling

- [ ] **Tone.Transport vs setTimeout.** Always Transport for musical timing.
- [ ] **Look-ahead vs draw-ahead.** Tone schedules audio ahead; UI updates need `Draw.schedule()` to stay in sync.
- [ ] **Time drift on long sessions.** Reset Transport at the end of long playback to avoid floating-point drift.

## MIDI

- [ ] **MIDI permission prompt.** Web MIDI requires HTTPS and user permission. Document this in the README.
- [ ] **No MIDI device connected.** Handle gracefully — fall back to on-screen keys.
- [ ] **Sysex denied.** Most builds don't need it; if they do, the prompt copy must explain why.

## Files and persistence

- [ ] **Artifact storage cap.** `window.storage` is 5 MB per key, 20 MB per artifact. Long sample libs won't fit.
- [ ] **Drag-and-drop file size.** A WAV file dragged in can be 50 MB+. Reject or stream.
- [ ] **CORS on external samples.** Loading samples from another domain requires CORS headers. Self-host or use approved CDNs.

## UI

- [ ] **Mobile touch.** Audio test on phone. Touch events differ from mouse. Slider precision is worse.
- [ ] **Knob ranges that produce ear-shredding output.** Filter resonance, feedback delay — clamp at safe values or build a soft-clipper into the chain.
- [ ] **Color contrast at 350 px.** The thumbnail must read; the live UI must be screenshot-able for that thumbnail.

## Recording

- [ ] **Tab audio capture.** OBS or QuickTime needs to capture browser audio cleanly. Test before episode day.
- [ ] **Latency-induced visual desync.** If the screen recorder has audio drift, lock the demo to a click for re-sync.
- [ ] **Loud demo masking commentary.** The voiceover and the demo can't be at the same level. Plan the duck-and-pop.

## Mastering targets (Hard Rule 8)

- Final video master: −14 LUFS integrated, ≤ −1.0 dBTP.
- Demo loop alone: anywhere louder; the master pass is what counts.

If the build can't hit −14 LUFS without distortion, the demo loop is too dynamic for streaming. Adjust at compose time, not in mastering.
