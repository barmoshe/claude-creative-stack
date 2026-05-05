# Beat Scholar Deep Dive
> Status: draft
> Owner: general-purpose agent
> Last updated: 2026-05-05

## TL;DR (≤150 words)

Beat Scholar (Modalics, Sept 2022) is a circular step-sequencer built around per-row slice rings of **3..42 steps**; each row carries its own subdivision, so simultaneous rows yield true polyrhythms ([Loopy Pro Forum](https://forum.loopypro.com/discussion/comment/1215941/), [KVR](https://www.kvraudio.com/product/beat-scholar-by-modalics)). Swing is bipolar — **-200% to +200%** against 1/8, 1/4 or 1/2 references ([MusicRadar](https://www.musicradar.com/reviews/modalics-beat-scholar)). Patterns are sectioned, each section with its own time signature ([Audio Plugin Guy](https://www.audiopluginguy.com/review-beat-scholar-from-modalics/)). MIDI is drag-out-of-pad to DAW; up to 16 multi-out audio channels ([Audio Plugin Guy](https://www.audiopluginguy.com/review-beat-scholar-from-modalics/)). Big weakness: only **note and velocity** are host-automatable ([KVR reviews](https://www.kvraudio.com/product/beat-scholar-by-modalics/reviews)). $99 / $79 intro, free trial ([Synthtopia](https://www.synthtopia.com/content/2022/09/06/modalics-intros-beat-scholar-drum-machine-virtual-instrument-the-ultimate-rhythmic-playground/)).

## Scope & questions

What BiomeBeats must replicate to feel credible, what to skip, and where there's headroom to leapfrog. Focus: radial mechanic, swing/timing, pattern architecture, MIDI/audio I/O, automation, packaging.

## Findings (with inline citations)

**Circular UI mechanics.** Each row ("ring") is sliced into 3..42 steps, any drum on any slice ([CDM](https://cdm.link/modalics-beat-scholar-a-new-hyper-divisible-drum-machine-plug-in-made-of-pizzas/), [Audio Plugin Guy](https://www.audiopluginguy.com/review-beat-scholar-from-modalics/)). Critically, **subdivisions are per-row, not global** — different rows run different step counts simultaneously and realign vertically per cycle ([Loopy Pro Forum](https://forum.loopypro.com/discussion/comment/1215941/)). That's where polyrhythm comes from: a 5-step ring against a 4-step ring inside the same bar. No per-lane length, meter, or tempo controls; no polymeter inside one instance ([Loopy Pro Forum](https://forum.loopypro.com/discussion/comment/1215941/)).

**Swing.** Reference selectable as 1/8, 1/4 or 1/2 notes ([MusicRadar](https://www.musicradar.com/reviews/modalics-beat-scholar), [Loopy Pro Forum](https://forum.loopypro.com/discussion/comment/1215941/)). Slider runs **-200% to +200%**: positive pushes subdivisions later (relaxed shuffle), negative pushes earlier (rushed feel) ([MusicRadar](https://www.musicradar.com/reviews/modalics-beat-scholar)).

**Section / bar architecture.** Patterns are sequences of measures, "each of which can have its own time signature" ([Audio Plugin Guy](https://www.audiopluginguy.com/review-beat-scholar-from-modalics/)). Numerator 1..32; denominator restricted to 2, 4, 8, 16 ([Loopy Pro Forum](https://forum.loopypro.com/discussion/comment/1215941/)). Demos show 4/4↔7/8 switches mid-pattern ([Synthtopia](https://www.synthtopia.com/content/2022/09/06/modalics-intros-beat-scholar-drum-machine-virtual-instrument-the-ultimate-rhythmic-playground/)).

**MIDI semantics.** Drag a Pattern Pad straight onto the DAW timeline to drop a standard `.mid` clip; Shift+Drag is the documented variant ([manuals.plus](https://manuals.plus/modalics/beat-scholar-divisible-drum-machine-plug-manual)). MIDI-out routing to other instruments and hardware works ([Audio Plugin Guy](https://www.audiopluginguy.com/review-beat-scholar-from-modalics/)). **MPE: no source confirms** — open question.

**Sample handling & audio out.** ~250 factory samples plus drag-and-drop user samples ([Synthtopia](https://www.synthtopia.com/content/2022/09/06/modalics-intros-beat-scholar-drum-machine-virtual-instrument-the-ultimate-rhythmic-playground/)). Up to 16 drum slots per kit; kick and snare layer two samples each. Audio out is stereo or 16-track multi-out ([Audio Plugin Guy](https://www.audiopluginguy.com/review-beat-scholar-from-modalics/)).

**Effects rack.** Per-pad: transient, pitch, HPF, compressor, distortion, reverb, pan, level ([Audio Plugin Guy](https://www.audiopluginguy.com/review-beat-scholar-from-modalics/)). Master: cutoff, resonance, crush, compressor, level ([MusicRadar](https://www.musicradar.com/reviews/modalics-beat-scholar)). Chain order: sampler → per-pad FX → master.

**Automation surface.** Documented weak spot: only **note and velocity** are host-automatable; humanize, sample pitch, pan, reverse and the rest are not exposed ([KVR reviews](https://www.kvraudio.com/product/beat-scholar-by-modalics/reviews)).

**Latency & timing.** No published benchmarks. Forum reports describe tight DAW sync in Logic/Live/Reaper/Cubase/Pro Tools ([Synthtopia](https://www.synthtopia.com/content/2022/09/06/modalics-intros-beat-scholar-drum-machine-virtual-instrument-the-ultimate-rhythmic-playground/)).

**Pricing & licensing.** $99 regular, $79 intro, free trial ([Synthtopia](https://www.synthtopia.com/content/2022/09/06/modalics-intros-beat-scholar-drum-machine-virtual-instrument-the-ultimate-rhythmic-playground/)); KVR currently lists $69 ([KVR](https://www.kvraudio.com/product/beat-scholar-by-modalics)); periodic ~50% sales ([The Beat Community](https://thebeatcommunity.com/2025/03/27/beat-scholar-is-half-price-other-modalics-deals-2/)). $99 is the better-supported sticker.

**Plugin formats & platforms.** Standalone, VST, VST3, AU (macOS), AAX, 64-bit; macOS 10.13+ Apple Silicon native, Windows 10+; separate iOS app ([MusicRadar](https://www.musicradar.com/reviews/modalics-beat-scholar), [KVR](https://www.kvraudio.com/product/beat-scholar-by-modalics)). **CLAP: not listed.** **JUCE: not confirmed.** Both open questions.

## Implications for BiomeBeats

### Match (must replicate to be credible)
1. Per-row independent subdivisions in the 3..~42 range — the whole reason to draw a circle.
2. Bipolar swing (-200..+200%) with selectable 1/8, 1/4, 1/2 reference.
3. Per-section time-signature changes inside one pattern.
4. Drag-pattern-out-of-plugin onto the DAW timeline as a `.mid` clip.
5. Drag-and-drop user samples alongside a curated factory pack.
6. Multi-channel audio out (16 stereo channels is the industry shape).
7. Per-slot effect strip including HPF, compression, drive/distortion, reverb, pan.
8. Standalone + VST3 + AU + AAX, 64-bit, day one.

### Skip (deliberate omissions)
1. Polymeter inside one instance — Beat Scholar punts and nobody complains.
2. Per-lane independent length/tempo — "rows realign at cycle" is what keeps the radial UI legible.
3. CLAP at v1 — Beat Scholar still doesn't ship it; JUCE 9 makes it cheap to add later.

### Leapfrog (where BiomeBeats can innovate)
1. **Slices play chords, not hits.** Each slice carries a chord-mode (root + voicing + inversion) drawn from the active biome's scale — the biggest gap in a one-pad-one-note tool.
2. **Polyrhythmic chord progressions.** Two rings of different lengths each carrying chord events (5-chord ring against 4-bass ring) — genuinely new harmonic motion no drum-focused sequencer addresses.
3. **Full host-automation of every parameter** including humanize, voicing, biome morph, per-slot pitch — the documented Beat Scholar weakness is a free win.

## Open questions

- **MPE I/O:** no source confirms or denies. Verify against a current build.
- **JUCE:** heavily implied by format coverage but never stated.
- **CLAP:** not listed in any source through May 2026.
- **MIDI drag-out quantisation:** `.mid` confirmed, but does dragged content bake in humanize/swing, or stay grid-quantised?
- **Latency benchmarks:** no measured numbers, only qualitative "syncs fine" reports.
- **Per-row slice floor:** likely 3, but unverified — Loopy Pro Forum implies low single digits work but doesn't pin the floor.

## Sources

- https://www.musicradar.com/reviews/modalics-beat-scholar
- https://www.audiopluginguy.com/review-beat-scholar-from-modalics/
- https://www.synthtopia.com/content/2022/09/06/modalics-intros-beat-scholar-drum-machine-virtual-instrument-the-ultimate-rhythmic-playground/
- https://cdm.link/modalics-beat-scholar-a-new-hyper-divisible-drum-machine-plug-in-made-of-pizzas/
- https://www.kvraudio.com/product/beat-scholar-by-modalics
- https://www.kvraudio.com/product/beat-scholar-by-modalics/reviews
- https://www.kvraudio.com/forum/viewtopic.php?t=586200
- https://forum.loopypro.com/discussion/comment/1215941/
- https://manuals.plus/modalics/beat-scholar-divisible-drum-machine-plug-manual
- https://thebeatcommunity.com/2025/03/27/beat-scholar-is-half-price-other-modalics-deals-2/
