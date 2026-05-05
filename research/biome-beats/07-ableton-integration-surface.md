# Ableton Integration Surface
> Status: draft
> Owner: general-purpose agent
> Last updated: 2026-05-05

## TL;DR (≤150 words)

BiomeBeats has nine integration needs (read tempo/transport/routing, write MIDI, persist patterns, drag-out clips, web↔host bridge, iPad touch, multi-instance). All nine map to Max for Live primitives via the Live Object Model — `live.observer`/`live.api` on `live_set`, `[js]` for note generation, `pattrstorage @parameter_enable 1 @paraminitmode 1` for state, `dragdrop` for clip export, `jweb` with `window.max.outlet`/`bindInlet` for the WebView UI. They map equally cleanly to JUCE 8: `AudioPlayHead::getPosition()` returns `Optional<PositionInfo>` exposing `getBpm`, `getPpqPosition`, `getIsPlaying`, `getTimeSignature`; `MidiBuffer::addEvent` is sample-accurate; `ValueTree`+`getStateInformation` persists; `DragAndDropContainer::performExternalDragDropOfFiles` covers DnD; `WebBrowserComponent` with `withResourceProvider`/`withNativeFunction` is the JS bridge. Three integration unknowns dominate risk and are spike-able in a day each.

## Scope & questions

Canonical mapping of each BiomeBeats integration need to (a) the M4L primitive Phase 1 will use and (b) the JUCE primitive Phase 2 will use. Expands the MCP daemon surface already in `knowledge/11-creative-connectors.md` §11.4 into the actual API calls a developer types into `.amxd` or `PluginProcessor.cpp`. **Stops at options** — verdicts are R10's job.

## Findings (with inline citations)

### Max for Live primitives

**Tempo and transport.** Send `path live_set` into `live.path`, route the id into `live.observer`, then send `property tempo` (or `is_playing`, `current_song_time`, `song_position_in_quarters`). The observed value emits from the left outlet on every change ([Cycling74 docs](https://docs.cycling74.com/legacy/max8/refpages/live.observer); [maxcookbook](https://music.arts.uci.edu/dobrian/maxcookbook/keywords/livepath)). Internal PPQ is **480 ticks/quarter** ([Cycling74 forum](https://cycling74.com/forums/midi-beat-clock); [Ableton forum](https://forum.ableton.com/viewtopic.php?t=131410) — distinct from the 96 ppqn used for *exported* MIDI files).

**Track routing.** `live.api` traverses `live_set tracks N` for parent track properties; `mute`, `solo`, `arm`, `current_output_routing`, sends are all observable in the same shape as tempo ([Ableton help](https://help.ableton.com/hc/en-us/articles/5402681764242-Controlling-Live-using-Max-for-Live)).

**Write MIDI.** Generation lives in a `[js]` patcher: build a list, call `outlet(0, …)`, route to `[midiout]` or the device's note output ([Cycling74 forum](https://cycling74.com/forums/tutorial-using-the-javascript-live-api-in-max-for-live)). `[js]` runs on the low-priority queue — sample-accurate timing requires signal-rate primitives or `[transport]`-clocked delivery, not raw `[js]` outlet timing ([maxcookbook](https://music.arts.uci.edu/dobrian/maxcookbook/live-api-javascript)).

**Persist pattern data.** `pattrstorage @parameter_enable 1 @paraminitmode 1 @_parameter_initial_enable 1` serialises the device's snapshot state into the `.als`/`.amxd` directly — no sidecar JSON ([Cycling74 docs](https://docs.cycling74.com/userguide/pattr/); [Cycling74 forum](https://cycling74.com/forums/automation-of-pattrstorate-vs-parameter-mode-paraminitmode)). `Save/Reload` is generally reliable but forum reports flag intermittent int→float coercion ([Cycling74 forum](https://cycling74.com/forums/pattrstorage-presets-not-recalled-properly)). Alternative: a JS blob in a hidden `live.numbox` parameter.

**Drag-out a MIDI clip.** `dragdrop` initiates an OS-level drag of a file from a patcher region. Standard recipe: write a temp `.mid`, hand the path to `dragdrop`, user drags onto a Live track ([Ableton forum](https://forum.ableton.com/viewtopic.php?t=196843)). From inside `jweb` this is non-trivial — the HTML page can't directly call `dragdrop`, so `window.max.outlet("export-midi")` triggers the patcher-side write, and `dragdrop` sits invisibly over the `jweb` view.

**`jweb` ↔ Max bridge.** `window.max.outlet(name, …args)` sends to an outlet; `window.max.bindInlet(name, callback)` receives; `window.max.getDict`/`setDict` shares dictionaries ([Cycling74 docs](https://docs.cycling74.com/userguide/web_browser/); [Cycling74 docs](https://docs.cycling74.com/legacy/max8/vignettes/jwebcommunication)). `jweb` runs in a separate process; messages are async on the low-priority queue.

**Touch on iPad Live 12.** Live's desktop UI is single-touch ([Ableton forum](https://forum.ableton.com/viewtopic.php?t=220400)); iPad use is via controllers (Knobbler4, touchAble), not native M4L touch. `jweb` inherits Chromium pointer-events; multi-touch gestures are undocumented.

**Multi-instance.** Each device has unique signal-processing space; `---name` prefixes isolate s/r ([Cycling74 forum](https://cycling74.com/forums/multiple-max4live-instances)). Each `jweb` instance spawns its own Chromium process — 4+ devices = 4+ processes, with reported framerate degradation under WebGL/WebGPU ([Cycling74 forum](https://cycling74.com/forums/jweb-limitations-behavior-in-m4l)).

### JUCE primitives

1. **Tempo / position.** `AudioPlayHead::getPosition()` returns `Optional<PositionInfo>`. `PositionInfo` exposes `getBpm()`, `getPpqPosition()`, `getIsPlaying()`, `getTimeSignature()`, all returning `Optional<…>` because hosts may not provide every field ([JUCE docs](https://docs.juce.com/master/classAudioPlayHead.html); [JUCE forum](https://forum.juce.com/t/how-to-get-the-bpm-since-getcurrentposition-is-deprecated/52761)). `CurrentPositionInfo`/`getCurrentPosition()` are deprecated. Callable only inside `processBlock`.
2. **Write MIDI.** `MidiBuffer::addEvent(const MidiMessage&, int sampleNumber)` queues sample-accurate events; the buffer auto-sorts by timestamp ([JUCE docs](https://docs.juce.com/master/classMidiBuffer.html)). `processBlock(AudioBuffer<float>&, MidiBuffer&)` is the entry point.
3. **Persist.** Override `getStateInformation(MemoryBlock&)`/`setStateInformation`; idiomatic format is a `ValueTree` serialised to XML or binary.
4. **Drag-out MIDI clip.** `MidiFile::writeTo(OutputStream&, midiFileType=1)` ([JUCE docs](https://docs.juce.com/master/classMidiFile.html)) writes the temp file; `DragAndDropContainer::performExternalDragDropOfFiles(StringArray, canMoveFiles, sourceComponent, callback)` initiates the OS drag from `mouseDrag` ([JUCE docs](https://docs.juce.com/master/classDragAndDropContainer.html)). Cross-platform with known issues — forum threads report intermittent failure in Ableton and Studio One ([JUCE forum](https://forum.juce.com/t/performexternaldragdropoffiles-not-working-in-ableton/42675); [JUCE forum](https://forum.juce.com/t/performexternaldragdropoffiles-crashes-in-ableton-after-specific-ui-scenarios/65028/3)).
5. **WebView bridge.** `WebBrowserComponent::Options` with `withNativeIntegrationEnabled`, `withResourceProvider` (intercept resource URLs, serve from C++), `withNativeFunction("loadPreset", …)` (expose async C++ to JS), `withInitialisationData`, `withUserScript` ([JUCE blog](https://juce.com/blog/juce-8-feature-overview-webview-uis/)). JS calls `Juce.getNativeFunction("loadPreset")(45).then(…)`. Parameter binding via `WebSliderParameterAttachment`.
6. **AAX-specific.** Separate Avid agreement; Phase 2 may defer AAX.

### Mapping table — BiomeBeats need ↔ M4L ↔ JUCE

| BiomeBeats need | Max for Live primitive | JUCE primitive |
|---|---|---|
| Read tempo | `live.path path live_set` → `live.observer property tempo` | `getPosition()->getBpm()` (`Optional<double>`) |
| Read transport (play/position) | `live.observer` on `is_playing`, `current_song_time`, `song_position_in_quarters` (480 PPQ internal) | `PositionInfo::getIsPlaying()`, `getPpqPosition()`, `getTimeSignature()` |
| Read track routing | `live.api path live_set tracks N` for `current_output_routing`, sends, mute/solo/arm | `AudioProcessor::getBusesLayout()`; host-side routing is read-only in JUCE |
| Write MIDI notes | `[js]` builds list → `outlet 0` → device note output / `[midiout]` (low-priority queue) | `MidiBuffer::addEvent(MidiMessage, sampleNumber)` inside `processBlock` (sample-accurate) |
| Persist pattern data in set | `pattrstorage @parameter_enable 1 @paraminitmode 1 @_parameter_initial_enable 1` | `getStateInformation(MemoryBlock&)` + `ValueTree` serialised to XML |
| Drag-out MIDI clip | Temp `.mid` on disk → `dragdrop` object positioned over the patcher region | `MidiFile::writeTo` → `DragAndDropContainer::performExternalDragDropOfFiles` in `mouseDrag` |
| Web ↔ host bridge | `jweb` + `window.max.outlet` / `window.max.bindInlet` (async, low-priority queue) | `WebBrowserComponent::Options::withNativeFunction` / `withResourceProvider` (async Promise) |
| Touch on iPad Live 12 | `jweb` pointer events; multi-touch undocumented; Live desktop UI itself is single-touch | N/A — JUCE `WebBrowserComponent` inherits platform WebView pointer model |
| Multi-instance | Each `.amxd` instance is independent; `---name` for s/r isolation; per-instance `jweb` Chromium process | Each plugin instance is a separate `AudioProcessor`; per-instance `WebBrowserComponent` |

## Implications for BiomeBeats

Three integration unknowns gate Phase 1 and Phase 2.

**Unknown 1 — drag-out from inside `jweb`.** HTML can't directly drive `dragdrop`; the bridge ferries intent via `window.max.outlet`, then positions `dragdrop` invisibly over the `jweb` viewport so the OS drag starts from the right rectangle. No public reference. **1-day spike:** minimal `.amxd` — `jweb` page issues `outlet("export", notes)`, `[js]` writes temp `.mid`, overlaid `dragdrop` triggers; verify drop onto a Live track lands the correct clip on macOS *and* Windows.

**Unknown 2 — JUCE 8 WebView fps with THREE r128.** R6's visual references assume a 60fps WebGL canvas. `WebBrowserComponent` uses platform WebView (WKWebView/WebView2); a forum report flags WebView2 blocking the host UI thread under THREE.js ([JUCE forum](https://forum.juce.com/t/webview2-blocks-ui-when-showing-webgl-threejs-from-opengl-app/51299)). No public BiomeBeats-shaped benchmark. **1-day spike:** stub plugin with the planned THREE r128 scene at 800×600, log frame intervals while host runs 256 samples / 48 kHz with light DSP — pass = 60fps, soft-pass = 30fps.

**Unknown 3 — `.als` round-trip when the device is removed and re-added.** `pattrstorage` saves into the device, but forum reports note int→float coercion and intermittent reload bugs. Does the saved pattern survive remove → fresh-drag → reload? **1-day spike:** seed a 16-bar pattern, save the set, delete the device, drag a new instance, paste device-state, reload from disk — measure whether pitches/velocities/timings are bit-identical.

## Open questions

- Does `jweb` on Live 12 iPad expose pointer-events with sufficient fidelity for radial polyrhythm gestures (R4)?
- Can `withResourceProvider` serve a 5 MB sample bank fast enough on first paint, or do we need to inline-base64 critical assets?
- VST3 vs CLAP MIDI 2.0 polypressure: does either host swallow per-note expression in 2026?

## Sources

- `knowledge/11-creative-connectors.md` §11.4 (this repo) — Ableton MCP daemon tool surface
- [Cycling74 — live.observer reference (Max 8 legacy)](https://docs.cycling74.com/legacy/max8/refpages/live.observer)
- [Cycling74 — Live Object Model (Max 8 legacy)](https://docs.cycling74.com/legacy/max8/vignettes/live_object_model)
- [Cycling74 — pattrstorage / Saving State with pattr](https://docs.cycling74.com/userguide/pattr/)
- [Cycling74 — Web Browser and jweb userguide](https://docs.cycling74.com/userguide/web_browser/)
- [Cycling74 — Communicating with Max from within jweb (Max 8 legacy)](https://docs.cycling74.com/legacy/max8/vignettes/jwebcommunication)
- [Cycling74 forum — pattrstorage preset reliability](https://cycling74.com/forums/pattrstorage-presets-not-recalled-properly)
- [Cycling74 forum — pattrstorage parameter mode tutorial](https://cycling74.com/forums/automation-of-pattrstorate-vs-parameter-mode-paraminitmode)
- [Cycling74 forum — JS Live API tutorial](https://cycling74.com/forums/tutorial-using-the-javascript-live-api-in-max-for-live)
- [Cycling74 forum — multiple M4L instances](https://cycling74.com/forums/multiple-max4live-instances)
- [Cycling74 forum — jweb limitations / behaviour in M4L](https://cycling74.com/forums/jweb-limitations-behavior-in-m4l)
- [maxcookbook — live.path / Live API Javascript](https://music.arts.uci.edu/dobrian/maxcookbook/keywords/livepath)
- [Ableton help — Controlling Live using Max for Live](https://help.ableton.com/hc/en-us/articles/5402681764242-Controlling-Live-using-Max-for-Live)
- [Ableton forum — internal vs export PPQ](https://forum.ableton.com/viewtopic.php?t=131410)
- [Ableton forum — multiple Live instances on macOS](https://forum.ableton.com/viewtopic.php?t=220400)
- [Ableton forum — drag MIDI clip via export](https://forum.ableton.com/viewtopic.php?t=196843)
- [JUCE — AudioPlayHead class reference](https://docs.juce.com/master/classAudioPlayHead.html)
- [JUCE — MidiBuffer class reference](https://docs.juce.com/master/classMidiBuffer.html)
- [JUCE — MidiFile class reference](https://docs.juce.com/master/classMidiFile.html)
- [JUCE — DragAndDropContainer class reference](https://docs.juce.com/master/classDragAndDropContainer.html)
- [JUCE 8 blog — Feature Overview: WebView UIs](https://juce.com/blog/juce-8-feature-overview-webview-uis/)
- [JUCE forum — getBpm migration from getCurrentPosition](https://forum.juce.com/t/how-to-get-the-bpm-since-getcurrentposition-is-deprecated/52761)
- [JUCE forum — performExternalDragDropOfFiles in Ableton](https://forum.juce.com/t/performexternaldragdropoffiles-not-working-in-ableton/42675)
- [JUCE forum — performExternalDragDropOfFiles crashes in Ableton](https://forum.juce.com/t/performexternaldragdropoffiles-crashes-in-ableton-after-specific-ui-scenarios/65028/3)
- [JUCE forum — WebView2 blocks UI with THREE.js](https://forum.juce.com/t/webview2-blocks-ui-when-showing-webgl-threejs-from-opengl-app/51299)
