# Stack defaults

Browser-first for the first 10 episodes. The viewer should be able to try the live app from the description link.

## Default stack

**HTML + JS + Tone.js**, served as a single static page. No build step until needed.

```
index.html
src/
  audio.js    # Tone.js engine
  ui.js       # DOM event wiring
  state.js    # plain object, no framework
```

Add Vite + React only when the UI grows past ~5 controls or the state needs to live across components. The shared starter at `artifacts/html/tone-procmusic.html` is a good reference.

## When to use what

| Need | Use | Don't use |
|---|---|---|
| Synth voice, drum hit, scheduled events | Tone.js v15.5 | Raw Web Audio (verbose), Howler (no scheduling) |
| Sample playback, one-shots | `Tone.Player` or `Tone.Sampler` | Howler (no transport sync) |
| Spatial audio | Tone.js panner / `PannerNode` | Howler.js (limited) |
| MIDI in browser | Web MIDI API directly | A library — too small a surface |
| 3D visuals | Three.js r128 (per CLAUDE.md) | r150+ (sandbox constraints) |
| Persistence in artifact | `window.storage` | `localStorage` (blocked) |
| Procedural music | Markov / Euclidean / scales from `knowledge/07-audio.md` | An AI music API |
| MIDI file export | Tone.js `Midi` (jsMidgen) | A backend |

## Browser autoplay

All audio must be gated behind a user gesture:

```js
button.addEventListener("click", async () => {
  await Tone.start();
  // now audio is unlocked
});
```

This is non-negotiable. Forgetting it produces a "first click does nothing" bug that kills the demo.

## Latency targets

| Use case | Target | Notes |
|---|---|---|
| UI feedback (button → sound) | < 30 ms | Below perceived latency |
| Sequenced playback | < 5 ms jitter | Tone.Transport handles this |
| MIDI in → sound out | < 15 ms | Use Web MIDI's high-resolution timestamps |

## When to add a backend

Only if:
- The build needs persistent storage across users (a shared sample library).
- The build does cloud rendering (offline render to WAV, large file).
- The build calls an external API that requires a secret key.

Otherwise: don't. A static page is faster to ship and viewers can fork it.

## Three.js note

If 3D is in the build: r128 only. No `OrbitControls` from `three/examples/jsm/*`. Use the inline polyfill or CDN alternative documented in the repo's `artifacts/html/three-r128-scene.html`.
