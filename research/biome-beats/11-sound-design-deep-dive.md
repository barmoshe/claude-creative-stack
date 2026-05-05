# Sound Design Deep Dive
> Status: draft
> Owner: general-purpose agent
> Last updated: 2026-05-05

## TL;DR (≤150 words)

BiomeBeats inherits five fully-specified Tone.js patches from cosmic-chord-synth's `THEME_PRESETS` ([useAudioEngine.ts](https://github.com/barmoshe/cosmic-chord-synth/blob/main/src/components/biome-synth/hooks/useAudioEngine.ts) + `shared/constants.ts`). R11 keeps those recipes as the procedural baseline and proposes targeted upgrades for chord-mode play: raise `maxPolyphony` from Tone's default of 32 ([Tone.js source](https://github.com/Tonejs/Tone.js/blob/dev/Tone/instrument/PolySynth.ts)), tighten the lead envelope on Cyberpunk and Jungle so 5-note stacks don't smear, fatten Space and Tundra pads with a sub-octave layer, and add LFO modulation per biome (vibrato for Space, wobble cutoff for Cyberpunk, slow filter sweep for Sea/Tundra). Drum kits stay procedural — `default`, `tribal`, `aquatic` ship as-is; `neon` (909-style) and `glacial` (ice-shimmer) are new. FX chains lock per biome. Five timbre identities are stated below. Top risks: voice-stealing audibility on dense rings, CPU spikes from `fatsawtooth(spread:30,count:3)` × 5 voices, and frequency masking between ambient drone and lead in low-mid.

## Scope & questions

R11 answers *what BiomeBeats sounds like* — synthesis recipes, drum timbres, ambient strategy, FX, polyphony, lineage. Not a competitor survey ([R5](05-chord-melody-sequencer-patterns.md)) or visual references ([R6](06-visual-magnificence-references.md)). Frame: cosmic-chord-synth already ships per-biome Tone.js patches; BiomeBeats inherits them and adapts for chord-event playback (up to 5 simultaneous notes per slice). Phase 1 ships inside `jweb` ([R10](10-synthesis-and-recommendations.md)); Phase 2 ports the same JS into JUCE 8 WebView.

## Findings (with inline citations)

### Per-biome synthesis recipes

Each recipe extracts the existing per-biome voice from `THEME_PRESETS` ([constants.ts](https://github.com/barmoshe/cosmic-chord-synth/blob/main/src/components/biome-synth/shared/constants.ts)) and proposes the BiomeBeats delta for chord-event playback.

#### Space

```ts
// Source: THEME_PRESETS.space — pentatonic@94, lead=fatsawtooth(spread:20,count:2)
// Delta: PolySynth(Synth) → PolySynth(FMSynth) for shimmer; add vibrato LFO; sub layer.
const lead = new Tone.PolySynth(Tone.FMSynth, {
  maxPolyphony: 24,                              // 5 notes × 8 slices ring buffer; see §Polyphony
  voice: {
    oscillator: { type: "fatsawtooth", spread: 20, count: 2 },
    modulation: { type: "sine" },
    modulationIndex: 1.8,
    envelope: { attack: 0.05, decay: 0.25, sustain: 0.4, release: 0.35 },
    portamento: 0.02,
  },
});
const leadFilter = new Tone.Filter(4500, "lowpass");
leadFilter.Q.value = 0.7;
const vibrato = new Tone.LFO("4n", -8, 8).connect(lead.detune); // shimmer
vibrato.start();
const sub = new Tone.MonoSynth({                  // new — sub octave bed
  oscillator: { type: "sine" },
  envelope: { attack: 0.5, decay: 0.6, sustain: 0.6, release: 1.0 },
});
// Chain: lead → leadFilter → Chorus(0.14) → FeedbackDelay("8n.",0.4) → Reverb(6s, wet 0.3)
```

Reference: u-he Diva shimmer detune ([Diva](https://u-he.com/products/diva/)). cosmic-chord-synth ships this as a plain `Synth`; BiomeBeats swaps to `FMSynth` for harmonically richer chord stacks.

#### Jungle

```ts
// Source: THEME_PRESETS.jungle — pentatonic@108, lead=triangle, padOsc=fmsine
// Delta: tighten attack (0.005 → 0.003) so chord plucks don't smear at 108 BPM 16ths.
const lead = new Tone.PolySynth(Tone.Synth, {
  maxPolyphony: 24,
  voice: {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.003, decay: 0.35, sustain: 0.15, release: 0.5 },
  },
});
const leadFilter = new Tone.Filter(3200, "lowpass");
leadFilter.Q.value = 1.2;                        // slight resonance for organic bite
const wahLFO = new Tone.LFO("2n", 1800, 4200).connect(leadFilter.frequency);
wahLFO.start();                                  // slow auto-wah
// Chain: lead → leadFilter → AutoWah(50, 6, -30) → Chorus(0.05) → Reverb(2s, wet 0.18)
```

Reference: Output Arcade-style organic textures via slow filter modulation ([Output Arcade](https://output.com/products/arcade)).

#### Sea

```ts
// Source: THEME_PRESETS.sea — lydian@76, lead=sine, pad=amsine, leadEnv long (a:0.02 d:1.2 r:1.8)
// Delta: keep the soft sine lead but layer an AM pad for harmonic motion under chord stacks.
const lead = new Tone.PolySynth(Tone.AMSynth, {
  maxPolyphony: 16,                              // sparse, slow biome — fewer voices needed
  voice: {
    harmonicity: 1.5,
    oscillator: { type: "sine" },
    modulation: { type: "sine" },
    envelope: { attack: 0.02, decay: 1.2, sustain: 0.15, release: 1.8 },
    modulationEnvelope: { attack: 0.5, decay: 0.5, sustain: 1, release: 2 },
  },
});
const leadFilter = new Tone.Filter(5500, "lowpass");
const tideLFO = new Tone.LFO("1m", 2000, 5500).connect(leadFilter.frequency);
tideLFO.start();                                 // slow tidal sweep
// Chain: lead → leadFilter → Chorus(0.25) → Reverb(4s, wet 0.5, damp 2800)
```

Reference: NI Form / underwater morphing ([NI Form](https://www.native-instruments.com/en/products/komplete/synths/form/)).

#### Cyberpunk

```ts
// Source: THEME_PRESETS.cyberpunk — arabic@128, lead=fatsawtooth(spread:30,count:3)
// Delta: this is the most expensive patch — cap maxPolyphony to 12 to protect CPU.
const lead = new Tone.PolySynth(Tone.Synth, {
  maxPolyphony: 12,                              // 3-osc fatsaw × 5-note chord = 15 oscs/voice
  voice: {
    oscillator: { type: "fatsawtooth", spread: 30, count: 3 },
    envelope: { attack: 0.003, decay: 0.15, sustain: 0.5, release: 0.4 },
  },
});
const leadFilter = new Tone.Filter(5200, "lowpass");
leadFilter.Q.value = 4;                          // resonant for wobble
const wobble = new Tone.LFO("8n", 800, 5200).connect(leadFilter.frequency);
wobble.start();
// Chain: lead → leadFilter → BitCrusher(8) → Distortion(0.25) → FeedbackDelay("8n.",0.5) → Reverb(1.2s, wet 0.2)
```

Reference: Vital wavetable synth, common cyberpunk preset shape ([Vital](https://vital.audio/)).

#### Tundra

```ts
// Source: THEME_PRESETS.tundra — minor@68, lead=sine, padOsc=amsine (longest envelopes)
// Delta: layer sub octave; very long release; add ice-shimmer noise layer at -28dB.
const lead = new Tone.PolySynth(Tone.Synth, {
  maxPolyphony: 16,
  voice: {
    oscillator: { type: "sine" },
    envelope: { attack: 0.04, decay: 1.4, sustain: 0.2, release: 2.2 },
  },
});
const sub = new Tone.MonoSynth({
  oscillator: { type: "sine" },
  envelope: { attack: 1.6, decay: 1.8, sustain: 0.75, release: 3.0 },
});
const shimmer = new Tone.NoiseSynth({            // new — ice-crystal layer
  noise: { type: "pink" },
  envelope: { attack: 0.01, decay: 0.5, sustain: 0 },
  volume: -28,
}).connect(new Tone.AutoFilter("4n", 6000, 4).start());
// Chain: lead → Filter(5200, lp) → Chorus(0.18) → Reverb(8s, wet 0.42, damp 3200)
```

Reference: Spitfire LABS Frozen Strings / Albion V Tundra "super sul tasto" ([LABS Frozen Strings](https://labs.spitfireaudio.com/packs/frozen-strings)).

### Drum kit timbres (procedural)

All kits procedural ([R10](10-synthesis-and-recommendations.md)). First three inherited; `neon` and `glacial` are new.

| Biome | Kit | Kick (MembraneSynth) | Snare/Clap | Hat (MetalSynth) | Aux |
|---|---|---|---|---|---|
| Space | `default` | C1, pitchDecay 0.05, decay 0.25 | NoiseSynth @3000Hz, decay 0.13 | harm 5.1, res 4000 | sine pluck @"D5" |
| Jungle | `tribal` | A0, pitchDecay 0.08, decay 0.4 | NoiseSynth @1800Hz, decay 0.08 | harm 3.2, res 2200 | woodblock (MembraneSynth @"C4") |
| Sea | `aquatic` | G0, pitchDecay 0.1, decay 0.6 | NoiseSynth @800Hz, decay 0.2 | harm 8.0, res 6000 | bubble (PluckSynth) |
| Cyberpunk | `neon` (new) | C1, pitchDecay 0.04, decay 0.22 | NoiseSynth @2400Hz + clap layer @1800Hz | harm 7.0, res 5200, modIndex 32 | vinyl crackle (NoiseSynth pink, -32dB) |
| Tundra | `glacial` (new) | A0, pitchDecay 0.12, decay 0.55 | NoiseSynth @1100Hz, slow decay 0.18 | harm 9.2, res 6400, modIndex 48 | ice shimmer (MetalSynth high) + log thud (Membrane "F1") |

`neon` is 909-pattern: short kick, snappy clap, sizzly hat with high modulationIndex ([MetalSynth defaults](https://tonejs.github.io/docs/15.0.4/classes/MetalSynth.html); [TR-909 hi-hat lineage](https://www.musicradar.com/news/909-hi-hats)). `glacial` softens the snare and adds a high-MetalSynth shimmer at accents.

### Ambient layering strategy

cosmic-chord-synth ships ~30s `*.opus` / `*.ogg` loops at -18 to -22 dB ([R2](02-cosmic-chord-synth-asset-inventory.md)). BiomeBeats keeps the same files.

- **Loop**: `Tone.Player` with `loop:true`. Verify zero-crossing alignment per file (R2 confirmed paths, not seams).
- **Crossfade**: 2s `Tone.Volume.rampTo(-Infinity, 2)` matches `THEME_PRESETS.fadeIn:2`.
- **Ducking**: opt-in `Tone.Compressor` on ambient bus, sidechained off lead — duck −4 dB on accents.
- **Filter modulation**: ambient gets `AutoFilter("2m", 800, 2)` tracking the biome's tide LFO on Sea/Tundra; decoupled on Cyberpunk/Jungle.
- **Tundra placeholder**: propose procedural fallback — `NoiseSynth("pink") → AutoFilter("8m", 200, 800) → Reverb(10s)` baked offline. Or commission a CC0 arctic recording.

### Per-biome FX chains

| Biome | Chain | Justification |
|---|---|---|
| Space | lead → Chorus(0.14) → FeedbackDelay("8n.",0.4) → Reverb(6s, wet 0.3) | Long decay, sparse plucks ring out — Diva-style ([u-he](https://u-he.com/products/diva/)) |
| Jungle | lead → AutoWah(50,6,-30) → Chorus(0.05) → Reverb(2s, wet 0.18) | Mid-room, organic motion — Arcade-style ([Output](https://output.com/products/arcade)) |
| Sea | lead → Chorus(0.25) → AutoFilter LP → Reverb(4s, wet 0.5, damp 2800) | Watery filter sweep — Form-style ([NI Form](https://www.native-instruments.com/en/products/komplete/synths/form/)) |
| Cyberpunk | lead → BitCrusher(8) → Distortion(0.25) → FeedbackDelay("8n.",0.5) → Reverb(1.2s, wet 0.2) | Gritty, tight space — Vital cyberpunk preset shape ([Vital](https://vital.audio/)) |
| Tundra | lead → Chorus(0.18) → Reverb(8s, wet 0.42, damp 3200) | Ice-cave decay; optional `Convolver` IR for Phase 2 — LABS Frozen Strings ([Spitfire](https://labs.spitfireaudio.com/packs/frozen-strings)) |

Phase 1 implements all five in JS ([Tone.js v15.5](https://tonejs.github.io/)); Phase 2 may swap to JUCE-native FX if CPU dictates.

### Polyphony & voice-stealing for chord events

Tone.PolySynth's default `maxPolyphony` is **32** ([source](https://github.com/Tonejs/Tone.js/blob/dev/Tone/instrument/PolySynth.ts)). Phase 1 worst case: 8 slices × 5 notes = 40 simultaneous on one tick — over the default.

- **Per-biome cap** (above): Cyberpunk 12, Sea/Tundra 16, Space/Jungle 24. Overlap is bounded by `maxPolyphony × release / slice_duration`.
- **Voice-stealing**: Tone.js v15 steals the oldest voice when the cap is hit (earlier docs warned "Max polyphony exceeded. Note dropped"; current implementation steals).
- **Mitigation**: split Sea/Tundra into two PolySynths (low + high chord) so voice pools don't compete; shorten release where density is high.
- **Tradeoff**: low cap + steal preserves CPU but truncates long releases audibly; `fatsawtooth(spread:30,count:3)` × 30 voices risks dropouts on `jweb`'s single thread.

### Sound-design lineage references

1. **TAL-NoiseMaker** — analog warmth for Space pads ([TAL](https://tal-software.com/products/tal-noisemaker)).
2. **Vital** — Cyberpunk lead morphs ([Vital](https://vital.audio/)).
3. **Output Arcade** — Jungle organic textures ([Arcade](https://output.com/products/arcade)).
4. **NI Form** — Sea grain morphing ([Form](https://www.native-instruments.com/en/products/komplete/synths/form/)).
5. **Spitfire LABS Frozen Strings** — Tundra atmosphere ([LABS](https://labs.spitfireaudio.com/packs/frozen-strings)).
6. **Sonic Charge Synplant 2** — Space gestural patches ([Synplant 2](https://soniccharge.com/synplant)).
7. **u-he Diva** — analog warmth across biomes ([Diva](https://u-he.com/products/diva/)).
8. **Roland TR-909** — `neon` kit lineage ([MusicRadar](https://www.musicradar.com/news/909-hi-hats)).

## Implications for BiomeBeats

**Phase-1 sound-design ship list:**
- 5 procedural lead/pad voices with per-biome `maxPolyphony` caps applied.
- 5 procedural drum kits (`default`, `tribal`, `aquatic`, `neon`, `glacial`).
- 5 ambient drones (4 existing + 1 procedural Tundra fallback or CC0).
- 5 locked FX chains.
- Per-biome LFO modulation (vibrato/wobble/tide).
- No samples, no convolution IRs — defer to Phase 2.

**Per-biome timbre identity statements:**
- **Space** — slow shimmering FM pad, sparse chord plucks ringing out 6+ seconds, vibrato detune giving a starlight sparkle.
- **Jungle** — punchy triangle-wave plucks with auto-wah motion and tribal woodblock, mid-room, danceable at 108 BPM.
- **Sea** — soft AM-modulated sine chords drifting through a slow tidal filter sweep over 4-second watery reverb.
- **Cyberpunk** — gritty 3-oscillator fatsaw stacks bitcrushed and dotted-eighth delayed, neon hat sizzle, 128 BPM.
- **Tundra** — minimal sine chords with sub-octave bed and pink-noise ice shimmer, 8-second ice-cave reverb, breath-held tempo.

**Top 3 sound-design risks:**
1. **CPU spike on Cyberpunk** — `fatsawtooth(spread:30,count:3)` × cap 12 × full FX chain is the heaviest patch on `jweb`'s single thread ([R10](10-synthesis-and-recommendations.md)).
2. **Voice-stealing audibility on Tundra/Sea** — 2.2s/1.8s releases mean chord tails truncate when new chords steal voices; users will hear it.
3. **Frequency masking in Sea/Tundra low-mid** — ambient drone (~80–400 Hz) and chord lead overlap; without ducking the lead disappears in mono.

## Open questions

- Do existing `.opus`/`.ogg` ambients loop seamlessly? Open in DAW to verify seam alignment.
- Does Tone.js v15 voice-stealing still drop notes silently in edge cases? Issue [#939](https://github.com/Tonejs/Tone.js/issues/939) flags PluckSynth — verify PolySynth(Synth).
- `neon` vinyl crackle: kit layer or FX insert?
- Tundra fallback: procedural or commissioned CC0?
- Velocity-to-cutoff curve: linear or exponential?

## Sources

- [cosmic-chord-synth `useAudioEngine.ts`](https://github.com/barmoshe/cosmic-chord-synth/blob/main/src/components/biome-synth/hooks/useAudioEngine.ts)
- [cosmic-chord-synth `shared/constants.ts` (THEME_PRESETS)](https://github.com/barmoshe/cosmic-chord-synth/blob/main/src/components/biome-synth/shared/constants.ts)
- [Tone.js v15 PolySynth docs](https://tonejs.github.io/docs/15.0.4/classes/PolySynth.html)
- [Tone.js PolySynth source (maxPolyphony=32 default + voice stealing)](https://github.com/Tonejs/Tone.js/blob/dev/Tone/instrument/PolySynth.ts)
- [Tone.js MetalSynth docs](https://tonejs.github.io/docs/15.0.4/classes/MetalSynth.html)
- [Tone.js MembraneSynth docs](https://tonejs.github.io/docs/15.0.4/classes/MembraneSynth.html)
- [Tone.js homepage / v15.5 CDN](https://tonejs.github.io/)
- [Tone.js issue #939 — PluckSynth maxPolyphony note dropping](https://github.com/Tonejs/Tone.js/issues/939)
- [Vital wavetable synthesizer](https://vital.audio/)
- [TAL-NoiseMaker](https://tal-software.com/products/tal-noisemaker)
- [Output Arcade](https://output.com/products/arcade)
- [NI Form](https://www.native-instruments.com/en/products/komplete/synths/form/)
- [Spitfire LABS Frozen Strings](https://labs.spitfireaudio.com/packs/frozen-strings)
- [Sonic Charge Synplant 2](https://soniccharge.com/synplant)
- [u-he Diva](https://u-he.com/products/diva/)
- [MusicRadar — Atsushi Hoshiai on TR-909 hi-hats](https://www.musicradar.com/news/909-hi-hats)
- [ModeAudio — Massive Drum Design Part 3: Hi Hats](https://modeaudio.com/magazine/massive-drum-design-part-3-hi-hats)
- Internal: [R2 — cosmic-chord-synth asset inventory](02-cosmic-chord-synth-asset-inventory.md), [R10 — synthesis & recommendations](10-synthesis-and-recommendations.md), [`knowledge/07-audio.md`](../../knowledge/07-audio.md)
