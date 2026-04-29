# Brainstorm — OrbitSeq — 2026-04-29 (Framing B: animation IS the sequence)

**Status:** chosen framing locked. Ready for `/episode-new orbitseq` next.
**Stage:** idea (pre-strategy)
**Build slug:** `orbitseq`
**Episode slug (when published):** `001-orbitseq`

---

## Chosen framing — Animation IS the sequence

### Viewer promise

> "I built a sequencer where the animation isn't decoration — pause the animation and the music stops."

### Why someone clicks who doesn't know the channel

- "The visual IS the instrument" is an unusual premise; producers haven't seen it.
- Demo footage is built-in — every orbit motion visibly drives a hit, so the screen sells the sound at 1×.
- Strong on a 350 px thumbnail because orbit motion reads instantly without text.
- Sells the result first (Hard Rule 1) — no "I used Claude" in the headline.

### Final demo (the wow moment)

A demonstration of the binding, in 4 beats:

1. Orbits running smoothly → rock-solid groove (8 bars).
2. Drag the speed slider mid-pattern → music slows in lockstep (4 bars).
3. Pause → silence. Click resume from a different orbit angle → sequence picks up at that step (4 bars).
4. Deliberately glitch the GSAP timeline (`gsap.ticker.lagSmoothing(false)`) for 4 bars → music stutters musically.

End on a sub drop. ~30 seconds total.

### Build complexity

**Medium-Large.** GSAP timeline binds 1:1 to `Tone.Transport`; every animation tween is a Tone scheduled event. Tightest skill area is the time-mapping bridge between GSAP's frame-loop time and Tone's audio-context time. Estimated ~3 build sessions.

### Honest weakness

The gimmick has to land. If "motion-as-music" doesn't sound musical, you've made a cute clock. Pausing producing actual silence (not just looping silence) is a real engineering problem — Tone's scheduler has look-ahead, GSAP is frame-driven, getting them to genuinely halt-and-resume in lock-step is the load-bearing engineering bet.

---

## Stack pick (preliminary — `build-planner` finalises)

- HTML + JS, single-page, no framework.
- **Tone.js v15.5** from CDN (audio engine).
- **GSAP 3.12+** via CDN (`gsap.min.js` + `MotionPathPlugin`) — the master clock and the visual driver.
- **Canvas** (or SVG) for the orbit visualisation. Canvas wins if the orbit count grows past ~8; SVG is easier to debug.
- **Web MIDI API** for MIDI-out clock; `@tonejs/midi` for file export.
- Reference starter: `../../../artifacts/html/tone-procmusic.html` (Tone.js + Euclidean rhythm).
- Animation reference: shared `knowledge/04-animation.md` (GSAP patterns, MotionPath, ScrollTrigger discipline).
- Color/UX reference: the shared `palette-generator` skill for an oklch palette; `ui-design-kit` for component patterns; `channel-brain/sound-identity.md` for the channel's signature timbres.

## Architecture seed

```
┌──────────────── master clock ────────────────┐
│                                              │
│  gsap.timeline()  ◄──two-way bind──►  Tone.Transport
│         │                                    │
│         │ each orbit = one tween             │
│         │ orbit period = tween duration      │
│         │                                    │
│         ▼                                    │
│   onUpdate(progress)                         │
│         │                                    │
│         ▼                                    │
│   schedule Tone event at next dot crossing   │
│                                              │
└──────────────────────────────────────────────┘
```

- One canonical `gsap.timeline({ repeat: -1 })` is the master clock.
- Each orbit is a tween on that timeline; orbit period = tween duration.
- Hit events fire from a GSAP `onUpdate` callback that schedules `Tone.Transport` events at the precise audio-context time corresponding to the next "dot crossing".
- `timeline.pause()` ↔ `Tone.Transport.pause()` are two-way bound; UI surface for pause/resume is a single button.

## Leave for episode 2

- **JUCE/Ableton plugin port** — the producer-DAW native version. Builds on this episode's audience and gives Episode 2 a sequel hook.
- Sample playback / drum kits beyond synthesised hits.
- Multi-pattern song-mode (sequence of orbit configs).
- Effect chain (filter, delay, reverb).
- Drawing input modality (Framing C from the brainstorm).

## Risks (from `build-planner/references/risk-checklist.md`)

- **Browser autoplay gating** — the first click must unlock audio (`await Tone.start()` inside the click handler).
- **GSAP ↔ Tone time drift** on long sessions — reset both timelines on loop boundaries.
- **Tab-background AudioContext suspension** — listen for `visibilitychange` and resume.
- **Mobile touch precision** on orbit controls — clamp parameter sensitivity.
- **Loudness target** — master to −14 LUFS / −1.0 dBTP (Hard Rule 8). Demo's tempo + density needs to leave headroom.

## Next step

Run `/episode-new orbitseq` (or invoke the workflow manually from this studio session) to:

1. Spawn 3 parallel research subagents (trend, pain-point, benchmark).
2. Synthesise via `episode-strategist` → viewer promise + 5 titles + 3 thumbnail angles.
3. Pause for your plain-English approval.
4. Run `build-planner` to produce `build-notes.md` with the milestone breakdown.
5. Scaffold `workspace/playground/orbitseq/` from the build skeleton.
