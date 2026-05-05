# Radial / Polyrhythmic Sequencer Prior Art
> Status: draft
> Owner: general-purpose agent
> Last updated: 2026-05-05

## TL;DR (≤150 words)

Three camps. **Drum-radial** (Beat Scholar, isotonik's Euclidean modes) owns the pizza-slice idiom but stays drum-only ([Ableton](https://www.ableton.com/en/blog/geometric-sequencing/)). **Generative grid/Cartesian** (Reaktor Newscool, Make Noise René) does polyrhythm via cellular or Cartesian rules, not as a circle ([alijamieson.co.uk](https://alijamieson.co.uk/2016/05/25/reaktors-newscool/), [Make Noise](https://www.makenoisemusic.com/modules/rene/)). **Modern radial-polyphonic** is essentially one product: NI **Circular** (2024) — polyrhythmic, polymetric, chord-capable, but tied to its Kontakt library and not biome-themed ([MusicRadar](https://www.musicradar.com/music-tech/circular-begins-with-a-single-note-but-it-never-stays-there-native-instruments-releases-multitimbral-polyphonic-sequencer-for-kontakt)). Hardware Euclidean (Pamela's NEW Workout) and community M4L (Sidewinder) cover polyrhythm but not chord motion ([busycircuits](https://busycircuits.com/pages/alm017), [GitHub](https://github.com/robenkleene/sidewinder)). Polyend Tracker, often cited as polyrhythmic, isn't natively ([Polyend Backstage](https://backstage.polyend.com/t/polyrhythm-different-track-length-in-a-pattern/8047)).

## Scope & questions

What radial and/or polyrhythmic sequencers already exist, what each gets right, and which corners of the design space are still unclaimed. Focus: layout, harmonic capability, polyrhythm, scale-awareness, MIDI-out.

## Findings (with inline citations)

### Capsule survey

**Reaktor Newscool** (Native Instruments, free user-library ensemble). A Conway's Game of Life groove box: a 2D cell grid evolves and triggers eight tone generators, so polyrhythm emerges from the automaton, not from per-row step counts. Notable: **X-Wrap / Y-Wrap** remap grid regions to different generators, yielding eight voices from one pattern ([alijamieson.co.uk](https://alijamieson.co.uk/2016/05/25/reaktors-newscool/), [NI Blog](https://blog.native-instruments.com/best-future-sounds-from-the-reaktor-user-library/)).

**Polyend Tracker / Tracker+** (Polyend, hardware tracker). Modern tracker with sampling and synth engines ([Polyend](https://polyend.com/tracker/), [Sound on Sound](https://www.soundonsound.com/reviews/polyend-tracker-plus)). All tracks share one pattern length, so true polyrhythm needs LCM math or the `m` micro-move effect ([Polyend Backstage](https://backstage.polyend.com/t/polyrhythm-different-track-length-in-a-pattern/8047)). Notable: fill-conditions distribute notes across patterns to keep loops evolving ([Noisegate](https://noisegate.com.au/polyend-tracker-plus-a-beginners-look-at-the-modern-tracker-workflow/)).

**Native Instruments Circular** (Kontakt instrument, 2024). Closest direct precedent: a **radial Play page**, four sound layers, each with its own step length and pattern length, supporting polyrhythmic, polymetric, probability and Euclidean modes ([NI](https://www.native-instruments.com/en/products/komplete/cinematic/circular/), [MusicRadar](https://www.musicradar.com/music-tech/circular-begins-with-a-single-note-but-it-never-stays-there-native-instruments-releases-multitimbral-polyphonic-sequencer-for-kontakt)). Polyphonic, chord-capable. Notable: per-step control over sample, filter, envelope and effects ([MusicTech](https://musictech.com/news/gear/meet-circular-a-native-instruments-polyphonic-sequencer-designed-for-breathtaking-rhythmic-soundscapes/)). Tied to its own ~160-source library.

**Make Noise René** (Eurorack, 2018 revision). A 3D Cartesian sequencer: X/Y clocks plus a Z-axis stack of up to 64 patterns, switchable via Z-CV ([Make Noise](https://www.makenoisemusic.com/modules/rene/), [Perfect Circuit](https://www.perfectcircuit.com/make-noise-rene-2018.html)). CV/gate only. Notable: relative X/Y clock rates produce non-repeating polyrhythmic snakes from a 4×4 grid ([Sweetwater](https://www.sweetwater.com/store/detail/Rene2--make-noise-rene2-cartesian-sequencer-eurorack-module)).

**ALM Pamela's NEW Workout** (Eurorack, since superseded by Pamela's PRO). Eight clocked outputs, each with independent divisor (/512 to ×48, non-integer factors), Euclidean step-skipping, and `ERot` rotation ([busycircuits.com](https://busycircuits.com/pages/alm017), [Perfect Circuit](https://www.perfectcircuit.com/signal/pams-new-workout-euclidean-sequencing)). Clock/gate; MIDI only via expander. Notable: per-output AND/OR/XOR logic combines streams in-module ([MusicTech](https://musictech.com/reviews/pamelas-new-workout-review/)).

**Sidewinder** (Roben Kleene, free Max for Live device). Four-track Euclidean MIDI effect, vertical strip layout, per-track MIDI channel ([GitHub](https://github.com/robenkleene/sidewinder)). Polyrhythm via independent step counts. Notable: an **Auto/Set toggle** — Auto regenerates on each parameter change, Set lets users hand-edit and shift sequences without losing edits.

**Patatap** (Jono Brandel + Lullatone, 2014; UX context, not a sequencer). 26 keyboard-triggered sound+animation pairs; palettes swap on spacebar ([Wikipedia](https://en.wikipedia.org/wiki/Patatap), [Creative Applications](https://www.creativeapplications.net/project/patatap-portable-animation-and-sound-kit-by-jonobr1-and-lullatone/)). Notable: 13 melodic + 13 rhythmic sounds, deliberately balanced so random input stays legible. Precedent for *bundled audiovisual palettes* — what BiomeBeats calls a biome.

### Tag matrix

| Device | Layout | Genre | Polyrhythm | Scale-aware | MIDI-out |
|---|---|---|---|---|---|
| Reaktor Newscool | Grid (cellular) | Both | Yes (emergent) | No | Internal only |
| Polyend Tracker / Tracker+ | Grid (tracker) | Both | No (workarounds only) | Yes (per-track scale) | Yes |
| NI Circular | Radial (Play page) + grid (Sequencer page) | Melodic / chord | Yes | Partial (built-in palette) | Internal Kontakt sounds |
| Make Noise René | Cartesian (4×4 + Z) | Melodic | Yes | No (raw CV) | No (CV/gate) |
| Pamela's NEW Workout | Strip (8 outputs) | Drum / clock | Yes | No | Via expander only |
| Sidewinder (M4L) | Strip (4 tracks) | Both | Yes (Euclidean) | No | Yes |

## Implications for BiomeBeats

Three unmet niches; framed as options, not picks.

**Niche 1 — Radial *chord* progressions.** Beat Scholar, isotonik's Push:Euclidean Mode and most M4L Euclidean devices are drum-only; melodic radial sequencers (NI Circular, Mass) lean on per-step single notes and bundled libraries, not chord events drag-routable to any instrument ([Ableton](https://www.ableton.com/en/blog/geometric-sequencing/), [isotonik](https://isotonikstudios.com/product/pusheuclidean-mode-by-mark-towers/), [MusicRadar](https://www.musicradar.com/music-tech/circular-begins-with-a-single-note-but-it-never-stays-there-native-instruments-releases-multitimbral-polyphonic-sequencer-for-kontakt)). Gap: *radial chord-event sequencing as a MIDI effect*; BiomeBeats *could* fill it.

**Niche 2 — Biome-bundled scale + palette + timbre.** No surveyed competitor ships one selectable theme that constrains scale, recolors UI, and recommends a timbre family. Polyend exposes scales but not as a theme ([Polyend](https://backstage.polyend.com/t/polymetric-features/13091)); NI Circular bundles sources but isn't world-themed ([NI](https://www.native-instruments.com/en/products/komplete/cinematic/circular/)); Patatap shows palette-swap-as-gesture works ([Wikipedia](https://en.wikipedia.org/wiki/Patatap)). Gap: *ecosystem-as-preset*; BiomeBeats *could* fill it.

**Niche 3 — Polyrhythmic *harmonic* motion.** Existing polyrhythmic devices (Pamela's, Sidewinder, René) carry triggers or single notes; NI Circular's layers are mono-per-layer ([MusicTech](https://musictech.com/products/native-instruments-circular-plugin/), [GitHub](https://github.com/robenkleene/sidewinder)). Different-length rings carrying *chord* events — a 5-step IV–V against a 7-step I–vi — is unexplored. Gap: *polyrhythmic chord motion*; BiomeBeats *could* fill it.

## Open questions

- NI Circular: accepts external MIDI chord input, or drives only built-in sources? Vendor page returned 403; needs hands-on ([NI](https://www.native-instruments.com/en/products/komplete/cinematic/circular/)).
- Loopy Pro's loops-as-circles canvas: UX prior art, or disqualified by lack of step-grid? ([Loopy Pro Wiki](https://wiki.loopypro.com/Introduction_to_Loopy_Pro)).
- Mass (Tom Ward) — physics-based radial MIDI sequencer, in beta; revisit at v1.0 ([forum](https://forum.loopypro.com/discussion/61493/updated-v0-9-2-mass-new-sequencer-and-modulator-open-for-beta-testing)).
- VCV Rack / Bitwig Grid radial modules: not surveyed.

## Sources

- Ableton — [Geometric Sequencing (Euclidean M4L)](https://www.ableton.com/en/blog/geometric-sequencing/)
- Ali Jamieson — [Reaktor's Newscool](https://alijamieson.co.uk/2016/05/25/reaktors-newscool/)
- ALM / Busy Circuits — [Pamela's NEW Workout](https://busycircuits.com/pages/alm017)
- Creative Applications — [Patatap](https://www.creativeapplications.net/project/patatap-portable-animation-and-sound-kit-by-jonobr1-and-lullatone/)
- GitHub — [robenkleene/sidewinder](https://github.com/robenkleene/sidewinder)
- Isotonik — [Push:Euclidean Mode](https://isotonikstudios.com/product/pusheuclidean-mode-by-mark-towers/)
- Loopy Pro Forum — [Mass beta thread](https://forum.loopypro.com/discussion/61493/updated-v0-9-2-mass-new-sequencer-and-modulator-open-for-beta-testing)
- Loopy Pro Wiki — [Introduction to Loopy Pro](https://wiki.loopypro.com/Introduction_to_Loopy_Pro)
- Make Noise — [René](https://www.makenoisemusic.com/modules/rene/)
- MusicRadar — [NI Circular release coverage](https://www.musicradar.com/music-tech/circular-begins-with-a-single-note-but-it-never-stays-there-native-instruments-releases-multitimbral-polyphonic-sequencer-for-kontakt)
- MusicTech — [Meet Circular](https://musictech.com/news/gear/meet-circular-a-native-instruments-polyphonic-sequencer-designed-for-breathtaking-rhythmic-soundscapes/)
- MusicTech — [NI Circular product page](https://musictech.com/products/native-instruments-circular-plugin/)
- MusicTech — [Pamela's New Workout review](https://musictech.com/reviews/pamelas-new-workout-review/)
- Native Instruments — [Circular product page](https://www.native-instruments.com/en/products/komplete/cinematic/circular/)
- Native Instruments Blog — [Best future sounds Reaktor library](https://blog.native-instruments.com/best-future-sounds-from-the-reaktor-user-library/)
- Noisegate — [Polyend Tracker+ beginner's look](https://noisegate.com.au/polyend-tracker-plus-a-beginners-look-at-the-modern-tracker-workflow/)
- Perfect Circuit — [Make Noise René 2018](https://www.perfectcircuit.com/make-noise-rene-2018.html)
- Perfect Circuit — [Euclidean Sequencing with Pamela's](https://www.perfectcircuit.com/signal/pams-new-workout-euclidean-sequencing)
- Polyend — [Tracker product page](https://polyend.com/tracker/)
- Polyend Backstage — [Polymetric features](https://backstage.polyend.com/t/polymetric-features/13091)
- Polyend Backstage — [Polyrhythm / different track length](https://backstage.polyend.com/t/polyrhythm-different-track-length-in-a-pattern/8047)
- Sound on Sound — [Polyend Tracker+ review](https://www.soundonsound.com/reviews/polyend-tracker-plus)
- Sweetwater — [Make Noise René2](https://www.sweetwater.com/store/detail/Rene2--make-noise-rene2-cartesian-sequencer-eurorack-module)
- Wikipedia — [Patatap](https://en.wikipedia.org/wiki/Patatap)
