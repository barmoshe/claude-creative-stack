# Audio Engine Capabilities
> Status: draft
> Owner: general-purpose agent
> Last updated: 2026-05-05

## TL;DR (≤150 words)

`knowledge/07-audio.md` covers Tone.js core, Web Audio, Howler, ZzFX, Bjorklund, scales, Markov music — **do not re-research**. Gaps for chord-on-rings: voicing (`@tonaljs/voicing`); `PolySynth` stealing config; per-slice timing under multiple Sequences; SMF export (`midi-writer-js@3.2.1`); the runtime clock differs per form factor. Phase 1 (M4L + `jweb`) most likely uses Live's transport for audio + Tone.Transport for visuals — `jweb` can't reach `plugsync~`, so MIDI emits from `[js]` driven by `live.observer beat_time` rather than hard-syncing Tone's clock to Live PPQ.

## Scope & questions

1. What's already in the repo to defer to?
2. What chord-aware capabilities are missing, and which libs fill them?
3. Which clock drives BiomeBeats in each form factor?

## Findings (with inline citations)

### What `knowledge/07-audio.md` already covers (defer to it)

The repo's audio knowledge file documents these primitives ([knowledge/07-audio.md](../../knowledge/07-audio.md)):

- **Tone.js ~15.5**: `Synth`, `PolySynth`, `MonoSynth`, `FMSynth`, `AMSynth`, `Sampler`, `Player`, `GrainPlayer`; effects (`Reverb`, `FeedbackDelay`, `Chorus`, `Distortion`, `BitCrusher`, `Filter`, `Compressor`, `PitchShift`); signals (`Signal`, `LFO`, `Envelope`); `Tone.start()` rule; `getTransport().bpm`; `Tone.Sequence` basic shape.
- **Web Audio**: `AudioContext`, `BufferSource`, ADSR ramps, `BiquadFilter`, `ConvolverNode`, `DelayNode`, `WaveShaperNode`, `AnalyserNode` FFT, `PannerNode` HRTF.
- **Howler 2.2.4** sprites + spatial extension.
- **SFX gen**: jsfxr, ZzFX, chiptune3.js, soundfont-player.
- **Procedural music**: scale arrays, `midiToFreq`, scale-degree helpers, progression chords, **Bjorklund `euclid(k,n)`**, Markov chains.

If a question maps onto any of those, R8 defers.

### Gaps for chord-aware sequencing

**Gap 1 — Voicing.** No voicing API in 07. **`tonal@6.4.3`** (Feb 2026) provides `@tonaljs/voicing` with `Voicing.search(chord, range, dictionary)` and voice-leading `Voicing.get`; `@tonaljs/voicing-dictionary` ships `lefthand`, `triads`, `all`. Drop-2 / shell / spread are interval-stack templates as custom dictionary entries ([tonal](https://github.com/tonaljs/tonal); [voicing](https://github.com/tonaljs/tonal/tree/main/packages/voicing)).

**Gap 2 — Polyphony.** `Tone.PolySynth` exposes `maxPolyphony` and `activeVoices`; `triggerAttackRelease(["C4","E4","G4"], 1)` is the chord path. Docs don't specify the steal algorithm (likely oldest-voice), so set `maxPolyphony` explicitly (e.g. 16 for 8 slices) ([Tone.PolySynth](https://tonejs.github.io/docs/15.0.4/classes/PolySynth.html)).

**Gap 3 — Timing.** Tone schedules via Web Worker with `lookAhead` 0.1 s atop `AudioContext.currentTime` ([Performance wiki](https://github.com/Tonejs/Tone.js/wiki/Performance)). Always use the callback's `time` arg. Drop `lookAhead` for lower latency; `latencyHint: "playback"` for stability.

**Gap 4 — Polyrhythms.** `Tone.Sequence` nested arrays subdivide (`["C4", ["E4","D4","E4"], "G4"]` = triplet vs. quarter) ([Tone.Sequence](https://tonejs.github.io/docs/15.0.4/classes/Sequence.html)). Two Sequences on one Transport phase-lock at bar boundaries via shared `Transport.position`.

**Gap 5 — MIDI export.** Not covered. **`midi-writer-js@3.2.1`** writes Type-1 multi-track SMF with chords, tempo, controllers, drum channel ([MidiWriterJS](https://github.com/grimmdude/MidiWriterJS)).

**Gap 6 — Swing.** Global: `Transport.swing` + `swingSubdivision`. Per-slice nudge: schedule with `time + offsetSeconds` — no drift.

### Runtime clock per form factor

| Form factor | Runtime clock | Why |
|---|---|---|
| Standalone artifact (testbed) | `Tone.Transport` | Fully self-hosted; default 0.1 s `lookAhead` is fine ([07-audio.md](../../knowledge/07-audio.md)). |
| Phase 1 — M4L `.amxd` + `jweb` | Live transport via `live.observer beat_time`, bridged to `jweb` over a `[js]` → `jweb` message channel; **MIDI emitted from `[js]`**, Tone.Transport drives only the radial-sequencer visuals | LiveAPI `start_playing` has 20–50 ms variable latency; only `plugsync~` gives sample-accurate sync, and `jweb` cannot reach `plugsync~`. So we accept a ~5–10 ms visual offset and let Live's own scheduler handle audio ([Cycling '74 forum on tight M4L sync](https://cycling74.com/forums/best-method-for-tight-syncing-to-live-transport-in-m4l); [Live API JS](https://adammurray.link/max-for-live/js-in-live/live-api/)). |
| Phase 2 — JUCE 8 + WebView | Host `processBlock` PPQ; WebView only renders | Audio thread is the JUCE C++ side; WebView is a UI-only client and posts user gestures back via the JUCE WebView bridge. |

## Implications for BiomeBeats

**Library shortlist (May 2026, beyond Tone.js + THREE.js):**

1. **`tonal@6.4.3`** — chord/scale theory + `Voicing.search` for close/drop2/shell.
2. **`midi-writer-js@3.2.1`** — Type-1 SMF for "Drag MIDI to Live" handoff.
3. **`@tonaljs/voicing-dictionary`** — preset voicings; extendable for drop-2/spread.
4. *(opt)* **`@tonaljs/midi`** — note-number conversion if not pulling full `tonal`.
5. *(opt)* **`tonejs-midi`** — round-trip parse/write if MIDI import is needed.

**Clock decision per form factor (options, R10 picks):**

- **Standalone artifact** — Tone.Transport, no contest.
- **Phase 1 (M4L)** — most likely *Live's transport for audio + Tone.Transport for visuals* because `jweb` can't reach `plugsync~` and users expect MIDI on Live's grid; fallback is *all-Tone.js → dummy MIDI track* if visual/audio drift becomes audible at low BPM.
- **Phase 2 (JUCE 8)** — most likely *host PPQ via `processBlock`*; WebView render-only. Fallback: a `juce::AudioPlayHead`-driven scheduler if `processBlock` PPQ is unstable across hosts.

## Open questions

1. `[js]` → `jweb` `postMessage` round-trip in M4L 12 — is <10 ms achievable?
2. Does `Voicing.search` need a custom dictionary for "spread triad" or is `lefthand` close enough?
3. Phase 2: can Tone.js run inside the WebView as preview-only while JUCE handles audio?

## Sources

- [knowledge/07-audio.md](../../knowledge/07-audio.md) — repo's existing audio coverage
- [Tone.js PolySynth docs (15.0.4)](https://tonejs.github.io/docs/15.0.4/classes/PolySynth.html)
- [Tone.js Sequence docs (15.0.4)](https://tonejs.github.io/docs/15.0.4/classes/Sequence.html)
- [Tone.js Performance wiki](https://github.com/Tonejs/Tone.js/wiki/Performance)
- [tonaljs/tonal on GitHub](https://github.com/tonaljs/tonal)
- [@tonaljs/voicing source dir](https://github.com/tonaljs/tonal/tree/main/packages/voicing)
- [tonal on npm](https://www.npmjs.com/package/tonal)
- [grimmdude/MidiWriterJS](https://github.com/grimmdude/MidiWriterJS)
- [Cycling '74 — Best method for tight M4L sync](https://cycling74.com/forums/best-method-for-tight-syncing-to-live-transport-in-m4l)
- [Adam Murray — JS in Ableton Live: The Live API](https://adammurray.link/max-for-live/js-in-live/live-api/)
- [Cycling '74 — jweb + Max 4 Live](https://cycling74.com/forums/jweb-max-4-live)
- [live.observer reference](https://docs.cycling74.com/max5/refpages/m4l-ref/live.observer.html)
