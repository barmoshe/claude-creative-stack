# Chord/Melody Sequencer Patterns
> Status: draft
> Owner: general-purpose agent
> Last updated: 2026-05-05

## TL;DR (≤150 words)

Chord/melody plug-ins cluster around two postures: **assistant** (Scaler 3, RapidComposer, Reason Chord Sequencer) — pick-a-scale, suggest-next-chord, drag-to-DAW; and **trigger-and-arp** (Cthulhu, Captain Chords, Riffer 3) — store chords on pads/steps and sequence them rhythmically. All converge on the same atoms: **(scale + root) → (chord with size + voicing + inversion) → (rhythmic event with duration/velocity)**. They diverge on *whose job* scale-enforcement is and *where* the chord lives (per-pad, per-step, per-clip lane). For BiomeBeats, a per-slice chord shape is the right primitive, but **per-biome voicing palettes** and **polyrhythmic chord rings** are unmet niches: every surveyed tool ships voicings and progressions, none ties them to a thematic palette nor lets independent-length rings carry chord events on misaligned grids.

## Scope & questions

Which patterns dominate chord/melody plug-in design today; what data shape does a "slice that plays a chord" need; where are the white-space affordances BiomeBeats can claim. Five plug-ins surveyed (Scaler 3, Captain Chords 5, Cthulhu, RapidComposer, Riffer 3) plus one supplementary (Reason Chord Sequencer) for breadth. Six axes per tool: (a) scale picking, (b) note constraint, (c) chord-per-step model, (d) inversions/voicings, (e) progression suggestions, (f) MIDI export.

## Findings (with inline citations)

### Per-plugin capsules

**Scaler 3** detects key/scale from MIDI or audio input, serves >1,000 chord sets, and uses **rule-based** suggestion (Circle of Fifths plus a Modulation Suggestions engine with Progression / Secondary Scale / Modal Interchange / Mediants / Neo-Riemannian pathways) ([scalermusic.com](https://scalermusic.com/products/scaler-3/)). Voicing palette includes drop and guitar voicings; voice-leading is automatic ([Plugin Boutique help](https://help.pluginboutique.com/hc/en-us/articles/35864679857684-What-s-new-in-Scaler-3)). MIDI exports via drag-to-DAW lane and External MIDI Out. $99 ([MusicTech review](https://www.musictech.com/reviews/plug-ins/scaler-3-review/)).

**Captain Chords 5 (Epic)** treats chord-building as a canvas of "Magic Buttons" dropped into a clip in a chosen key, then customised by inversions, substitutions, passing tones, and chord flavours (triads, sus, 7ths, 9ths, custom) ([mixedinkey.com](https://mixedinkey.com/captain-plugins/captain-chords/)). Ships hit-song progression presets and genre-sorted rhythm presets. MIDI export by drag-out; "Captain Play" triggers in-key chords from a MIDI keyboard.

**Cthulhu** (Xfer Records) pairs two engines: a chord memorizer (8 voice slots per pad, 150+ factory presets, triggered by incoming MIDI) and an arpeggiator with 8 tabs each running on **independent length** for polymetric arps ([xferrecords.com](https://xferrecords.com/products/cthulhu); [KVR](https://www.kvraudio.com/product/cthulhu-by-xfer-records)). Inversion-aware; per-degree pitch-graph transposition lets a chord change "flavour" without moving root or fifth. MIDI routes out via host MIDI buses ([Chillout with Beats tutorial](https://chilloutwithbeats.com/en/xfer-records-cthulhu-tutorial1/)).

**RapidComposer** (MusicDevelopments) is the most comprehensive: a phrase-based environment with a master chord timeline (absolute or function-based) that all phrases auto-conform to ([musicdevelopments.com](https://www.musicdevelopments.com/)). Tonnetz and Circle-of-Fifths pickers; rule-based suggestions (borrowed chords, substitutions, pivot, mediants); per-track voicing editor; melody generation and harmonisation; MIDI drag-and-drop. $199 ([KVR](https://www.kvraudio.com/product/rapidcomposer-by-musicdevelopments)).

**Audiomodern Riffer 3** is a generative single-line MIDI sequencer: 53 scales (custom-saveable), pattern-complexity / steps / motion controls, Density Mode splitting a step into 2–8 hits ([audiomodern.com](https://audiomodern.com/shop/plugins/riffer/)). Version 3.0's Polyphonic Mode runs **4 independent piano rolls to one MIDI destination** — polyphony by stacked lanes, not per-step chord objects ([Plugin Boutique](https://www.pluginboutique.com/product/2-Effects/24-Sequencer/4758-Audiomodern-Riffer-Generator/)). Drag-out MIDI. ~$54 ([Producer Spot](https://www.producerspot.com/audiomodern-riffer-3-0-major-update-available-now/)).

**Reason Chord Sequencer Player** (supplementary) ships **13 voicing types with inversions and root-less options**, auto-generates progressions per scale, and uses a green-shade "appropriateness" gradient on chord pads to guide the next pick ([Reason Studios](https://www.reasonstudios.com/shop/rack-extension/chord-sequencer/); [MusicRadar review](https://www.musicradar.com/reviews/reason-studios-chord-sequencer)). Confirms the assistant pattern outside the Plugin Boutique ecosystem.

### Comparison matrix

| Plug-in | (a) Scale picking | (b) Note constraint | (c) Chord per step/pad | (d) Inversions / voicings | (e) Progression suggestions | (f) MIDI export |
|---|---|---|---|---|---|---|
| Scaler 3 | Drop-down + auto-detect from MIDI/audio | Suggests in-key chords; drag-to-snap | Per-clip lane (chord, melody, bass, phrases) | Drop, guitar, voice grouping; auto voice-leading | Rule-based: Circle-of-5ths + 5 modulation pathways | Drag to DAW + External MIDI Out |
| Captain Chords 5 | Drop-down (key + scale) | Constrained "in-key" canvas | Per-step on a chord canvas + Magic Buttons | Inversions, substitutions, sus/7/9/custom | Preset hit-song progressions library | Drag-out MIDI clip |
| Cthulhu | Per-degree pitch-graph; no global scale lock | Pad-routes MIDI through stored chord; root-aware | Per-pad chord (8 voice slots) + per-step in 8 polymetric arp tabs | Inversion analysis on input; voice-graph per degree | — (presets only; no rule-based suggestion) | Routed to downstream instrument via host MIDI bus |
| RapidComposer | Tonnetz + Circle-of-5ths + drop-down | Phrases auto-conform to master chord/scale | Per-clip on master timeline; phrases follow | Dedicated voicing editor; per-track/phrase/master | Rule-based: borrowed chords, substitutions, pivot, mediants | Drag-out MIDI to DAW; standalone + plug-in |
| Riffer 3 | Drop-down (53 scales + custom) | Scale-locks individual notes/steps | Per-step single note; polyphony via 4 stacked lanes | — (single-note per lane; no chord object) | — (generative random within scale; no harmonic logic) | Drag-out MIDI; Performance Mode transpose |
| Reason Chord Sequencer | Drop-down | Constrained chord pads | Per-pad chord; sequence steps trigger pads | 13 voicing types incl. root-less + inversions | "Appropriateness" gradient on next-pad picks | Export MIDI to track in DAW |

## Implications for BiomeBeats

### Per-slice data shape (union of features observed)

```ts
type BiomeBeatsSlice = {
  // ── Pitch ──────────────────────────────────────────
  pitchDegree: number;        // 1..7 (or 0 = rest); scale-degree in active biome scale
  octave: number;             // -3..+3 from biome default
  // ── Chord body ─────────────────────────────────────
  chordSize: 1 | 3 | 4 | 5;   // 1=single note, 3=triad, 4=7th, 5=9th
  chordQuality?: "diatonic" | "sus2" | "sus4" | "shell" | "no3";
  inversion: 0 | 1 | 2 | 3;   // root-pos / 1st / 2nd / 3rd
  voicing: "close" | "open" | "drop2" | "drop3" | "spread" | "rootless";
  // ── Performance ────────────────────────────────────
  velocity: number;           // 1..127
  microtiming: number;        // -50..+50% of step (Beat Scholar-style)
  accent: boolean;            // boost vel + add ghost-of-octave
  tie: boolean;               // hold into next slice
  mute: boolean;
  // ── Biome hooks (BiomeBeats-specific) ──────────────
  biomeVoicingOverride?: string;  // e.g. "sea-9th-spread" key into per-biome palette
};
```

The shape is the **union** across the survey — Cthulhu's per-degree transposition folds into `chordQuality` + `voicing`, Reason contributes root-less, Scaler contributes drop voicings (a separate `voiceLead: "auto" | "off"` belongs on the *ring*, not the slice). `tie`, `mute`, `microtiming`, and `accent` are universal in step sequencers and align with R1's Beat Scholar findings.

### Affordance options no surveyed competitor offers

1. **Per-biome voicing palette as a first-class object.** Every tool ships voicings as a global menu (Scaler's drop/guitar, Reason's 13 types, RapidComposer's voicing editor). None binds voicings to a *theme*: e.g. **Sea = sparse 5ths + 9ths**, **Cyberpunk = sus4 + maj7 shell**, **Tundra = open-fifths + drop3**, **Jungle = stacked 4ths**, **Space = root-less 9ths spread two octaves**. Switching biomes would re-skin the voicing menu and re-voice existing slices. *Tradeoff:* surprise on biome-switch; mitigated by a "lock voicings" toggle.

2. **Polyrhythmic chord rings carrying chord events on misaligned grids.** Cthulhu's 8 polymetric tabs arpeggiate a *single* held chord; Riffer's 4 lanes are each monophonic. No surveyed tool carries **independent-length rings of full chord objects** the way BiomeBeats's pizza-rings imply (e.g., a 7-step chord ring against a 5-step bass ring). *Tradeoff:* harmonic clashes when ring-LCMs are long; mitigations include scale-lock enforcement and an optional voice-leading pass (Scaler's auto voice-leading is precedent).

R10 picks; this report stops at options.

## Open questions

- Progression *suggester* (Scaler/Reason) or strictly **user-driven** (Cthulhu/Riffer)? PLAN.md leans user-driven; reconfirm in R10.
- Per-slice voicing override vs. ring-level voicing? Cthulhu's per-degree pitch-graph suggests yes for power users.
- Cross-biome voicing transitions: hard cut, crossfade re-voicing, or modulation-pathway (Scaler-style)?

## Sources

- Scaler 3 — [scalermusic.com](https://scalermusic.com/products/scaler-3/), [Plugin Boutique help](https://help.pluginboutique.com/hc/en-us/articles/35864679857684-What-s-new-in-Scaler-3), [MusicTech review](https://www.musictech.com/reviews/plug-ins/scaler-3-review/), [Plugin Boutique listing](https://www.pluginboutique.com/product/3-Studio-Tools/93-Music-Theory-Tools/14563-Scaler-3)
- Captain Chords 5 — [mixedinkey.com](https://mixedinkey.com/captain-plugins/captain-chords/), [Mixed In Key chord generator](https://mixedinkey.com/captain-plugins/chord-generator/)
- Cthulhu — [xferrecords.com](https://xferrecords.com/products/cthulhu), [KVR listing](https://www.kvraudio.com/product/cthulhu-by-xfer-records), [Chillout with Beats tutorial](https://chilloutwithbeats.com/en/xfer-records-cthulhu-tutorial1/)
- RapidComposer — [musicdevelopments.com](https://www.musicdevelopments.com/), [KVR listing](https://www.kvraudio.com/product/rapidcomposer-by-musicdevelopments), [MusicRadar review](https://www.musicradar.com/reviews/tech/musicdevelopments-rapidcomposer-543269)
- Audiomodern Riffer 3 — [audiomodern.com](https://audiomodern.com/shop/plugins/riffer/), [Plugin Boutique listing](https://www.pluginboutique.com/product/2-Effects/24-Sequencer/4758-Audiomodern-Riffer-Generator/), [Producer Spot 3.0 update](https://www.producerspot.com/audiomodern-riffer-3-0-major-update-available-now/)
- Reason Chord Sequencer — [Reason Studios](https://www.reasonstudios.com/shop/rack-extension/chord-sequencer/), [MusicRadar review](https://www.musicradar.com/reviews/reason-studios-chord-sequencer)
