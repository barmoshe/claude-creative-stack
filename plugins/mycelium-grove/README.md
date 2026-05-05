# Mycelium Grove — JUCE 8 MIDI plugin

A generative MIDI device that turns the [`mycelium-grove`](../../artifacts/html/mycelium-grove.html)
artifact into a sample-accurate VST3/AU plugin. Click the canvas in the plugin
window to seed a spore, watch hyphae unfurl, and when two networks meet a bond
forms — and a MIDI note flies out the plugin onto whatever instrument you've
routed to it in your DAW.

The visual sim runs unchanged in a WebView; a thin C++ shell schedules MIDI on
the audio thread.

## Build

Requires:

- CMake ≥ 3.22
- A C++17 compiler (Xcode 15+ on macOS, MSVC 2022 on Windows)
- Internet (CMake will fetch JUCE 8.0.4 on first configure)

```bash
cmake -B build -G Ninja          # or "Xcode" / "Visual Studio 17 2022"
cmake --build build --config Release
```

`COPY_PLUGIN_AFTER_BUILD` is on, so on a successful build the VST3 + AU drop
into the system plugin folders automatically.

## Use it in Ableton

VST3 has no native "MIDI effect" category, so Mycelium Grove is registered
as an **instrument** that emits silence + MIDI. The standard Ableton recipe
for MIDI-generating plugins applies:

1. Open Ableton Live 12. `Settings → Plug-Ins → Rescan` (or restart Live).
2. In the browser, find **Mycelium Grove** under **Plug-Ins → VST3** (or AU).
   It appears as an instrument, not a MIDI effect.
3. Drop it on a MIDI track. The track now hosts the plugin in its instrument
   slot; the audio output is silence by design.
4. Add a **second** MIDI track. On its **MIDI From** pop-up choose
   `1-Mycelium Grove · Post FX` (or whatever the source track is named).
   Arm the second track. Drop any instrument on it — Operator, Wavetable,
   third-party VSTs, drum racks.
5. Open the Mycelium Grove device on track 1, click the canvas. Hyphae grow
   and bonds light up; the second track's instrument plays the notes.
6. Toggle **Rain** for ambient density. Automate `bondRadius`, `branchProb`,
   `scale`, `root`, `octave` from clip envelopes.

If you've previously seen **"This VST3 plug-in could not be opened"**, that
was an earlier build registered as a MIDI effect — VST3 doesn't have that
category and Ableton's loader rejects such plugins. The current build fixes
this by declaring as an instrument. You may need to delete Ableton's plugin
database cache (`~/Library/Caches/Ableton/Live Database/`) and rescan if the
old failure is sticky.

## Architecture in two paragraphs

The plugin is a JUCE `AudioProcessor` configured as a MIDI effect
(`IS_MIDI_EFFECT = TRUE`, `NEEDS_MIDI_OUTPUT = TRUE`). All parameters live in
an `AudioProcessorValueTreeState`. The editor is a `WebBrowserComponent` that
loads `Resources/web/index.html` (bundled as binary data via
`juce_add_binary_data`) through a `juce::` URL scheme so relative `<script>`
tags resolve.

The HTML/JS side is a refactor of the original artifact: same canvas sim, same
spatial hash, same bond-formation logic — the only changes are that Tone.js is
gone and the two events that used to call `audio.thump()` / `audio.chime()`
now call `window.juce.seedSpore(hue)` / `window.juce.bondFormed(hueA, hueB)`.
Those native functions push timestamped events into a lock-free queue
(`MidiScheduler`); each `processBlock` drains entries due before the block end
and writes `noteOn` / `noteOff` into the buffer with sample-accurate offsets.

## File map

| Path | Purpose |
|---|---|
| `CMakeLists.txt` | JUCE 8 plugin config — VST3 + AU + Standalone |
| `Source/PluginProcessor.*` | `AudioProcessor`, APVTS, drains the scheduler in `processBlock` |
| `Source/PluginEditor.*` | Hosts `WebBrowserComponent`, registers native functions |
| `Source/MidiScheduler.*` | Lock-free queue: JS events → sample-accurate MIDI |
| `Source/ScaleTables.h` | Pitch-class sets (PentMaj, PentMin, Dorian, Phrygian, Lydian, Major, Minor, Chromatic) |
| `Resources/web/index.html` | Plugin UI; mounts the canvas |
| `Resources/web/sim.js` | The simulation — ported from the artifact, audio stripped |
| `Resources/web/bridge.js` | `window.juce` glue (native fn calls + parameter subscriptions) |
| `Resources/web/styles.css` | Same look as the artifact |

## Ableton + cross-host caveats

- **Windows** users need the WebView2 Evergreen Runtime — preinstalled on
  Windows 11 and recent Win10. If absent, the plugin window stays blank;
  the JUCE `WebBrowserComponent` will surface the error.
- **CLAP** isn't supported by Ableton yet (Live 12), so we ship VST3 + AU only.
- The VST3 also loads cleanly in Bitwig and Reaper; the AU loads in Logic
  Pro. The bridge is host-agnostic.
- DPR / `devicePixelRatio` differs between WebKit and WebView2 — `sim.js`
  pins it to `min(devicePixelRatio, 2)` exactly as the original artifact did.
