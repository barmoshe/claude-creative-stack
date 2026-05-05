# Form Factor: Max for Live vs JUCE
> Status: draft
> Owner: general-purpose agent
> Last updated: 2026-05-05

## TL;DR (≤150 words)

BiomeBeats can ship as a **Max for Live device** (`.amxd`, runs in Live Suite, Chromium `jweb` for HTML/JS UI, drag-and-drop install) or a **JUCE plug-in** (VST3/AU/CLAP, native C++, OpenGL/Metal, host-agnostic, installer). M4L wins on time-to-MVP (~3–5 weeks), zero-friction install, and reuse of the `claude-creative-stack` artifact stack in `jweb`. JUCE wins on visual ceiling, sample-accurate MIDI, audience size (any DAW), and cross-DAW sovereignty. Beat Scholar — our UX reference — chose JUCE. The cost picture flipped on 20 Oct 2025 when Steinberg relicensed VST3 to MIT, removing the legal blocker to commercial JUCE distribution. R10 picks; this report supplies the matrix and tradeoffs.

## Scope & questions

Compare M4L and JUCE across runtime, dev, debug, MIDI-out, tempo, persistence, distribution, visual ceiling, time-to-MVP, cost/licence, repo-asset reuse. Score ≥10 axes and lay out tradeoffs — no binding pick (that's R10).

## Findings (with inline citations)

### Max for Live profile

- **Runtime / dev / debug.** Max patches + JS + HTML/JS in `jweb`, bundled with Live 12 Suite ([bundling](https://help.ableton.com/hc/en-us/articles/360000036850-Max-for-Live-bundled-in-Live)). Live edit, no compile; in-patcher watchpoints + Max Console; `jweb` has Chromium DevTools but the Max↔JS bridge is console-traced only ([Cycling '74](https://docs.cycling74.com/userguide/debugging_and_probing/)).
- **MIDI / tempo.** Max scheduler fires once per signal vector (~64 samples) — jitter floor; `plugsync~` reaches sample-accurate at low vectors ([thread](https://cycling74.com/forums/how-to-have-sample-accurate-syncing-from-live's-transport-plugsync~-seems-innacurate-and-inconsistent)). Tempo via `live.observer` on `live_set tempo`/`is_playing`/`current_song_time`; 480 ticks/quarter ([Dobrian](https://dobrian.github.io/cmp/topics/tempo-based-timing/2.tempo-relative-timing-in-max-and-self-quiz.html)).
- **Persistence / distribution.** `pattrstorage` (`@parameter_enable 1`/`@paraminitmode 1`) or blob parameter, saved in the `.als` ([pattr](https://cycling74.com/forums/is-it-possible-for-m4l-presets-to-be-saved-automatically-when-saving-the-live-set)). Single `.amxd`, drag onto track — no installer, no codesigning. Audience: Suite or Standard+M4L holders ([Buying M4L](https://help.ableton.com/hc/en-us/articles/206407124-Buying-Max-for-Live)).
- **Visual ceiling.** `jweb` Chromium with Canvas/WebGL/Three.js since Live 10.1.2 ([h1data](https://github.com/h1data/M4L-jweb-injection)). 60fps THREE r128 achievable; shares CPU with Live's UI.
- **Time-to-MVP.** **3–5 weeks** full-time reusing the artifact stack (estimate).
- **Cost / licence.** M4L bundled in Live 12 Suite ($749; [shop](https://www.ableton.com/en/shop/live/)); add-on for Standard ($439). Dev licence: $0 beyond Suite.
- **Reuse.** High — THREE r128, Tone.js, HTML/JS run in `jweb` essentially unchanged; `tone-procmusic.html`/`three-r128-scene.html` patterns transfer directly.

### JUCE profile

- **Runtime / dev / debug.** C++17/20 against JUCE; optional WebView with C++↔JS bindings ([JUCE 8 WebView](https://juce.com/blog/juce-8-feature-overview-webview-uis/)). Projucer/CMake → Xcode/VS/CLion; rebuilds in seconds-to-minutes; WebView hot-reloads served HTML. LLDB/VS/Instruments standard.
- **MIDI / tempo.** Plug-in emits MIDI in the host's `processBlock` — sample-accurate by construction. `AudioPlayHead::PositionInfo` exposes BPM, PPQ, time sig, transport, bar position per block.
- **Persistence.** `getStateInformation()` writes `ValueTree` (XML/binary) into the host project; round-trips across DAWs.
- **Distribution.** macOS Developer ID + notarisation; Windows EV/OV cert on HSM/cloud KMS ([Melatonin](https://melatonin.dev/blog/how-to-code-sign-and-notarize-macos-audio-plugins-in-ci/), [JUCE forum](https://forum.juce.com/t/code-signing-and-ov-ev-certificates/67030/1)). Pamplejuce automates this on CI ([Pamplejuce](https://github.com/tote-bag-labs/pamplejuce/)).
- **Visual ceiling.** OpenGL via `OpenGLContext`, Metal-backed on macOS. Vital ships its own shader GUI library ("Visage") on top of JUCE; OpenGL 3+ ([Matt Tytel](https://juce.com/made-with-juce/matt-tytel-from-vital-audio/), [Vital forum](https://forum.vital.audio/t/opengl-warning-and-black-screen-no-gui/908)). With WebView, ceiling = platform browser.
- **Time-to-MVP.** **10–14 weeks** first-time; one synth posting targeted v1 in ~12 weeks ([JUCE Jobs](https://forum.juce.com/t/paid-juce-audio-plugin-developer-needed-commercial-synth-plugin/67990)). WebView path shortens — UI reuses repo HTML/JS; C++ shell is MIDI/state/parameter glue.
- **Cost / licence.** JUCE Starter free (AGPLv3 source-open); closed-source needs Indie ($40/mo or $800 perpetual, ≤$300k rev) or Pro ($175/mo or $3,500 perpetual, uncapped) ([JUCE pricing](https://juce.com/get-juce/)). VST3 SDK now **MIT (20 Oct 2025)** ([The Audio Programmer](https://www.theaudioprogrammer.com/content/steinbergs-vst3-asio-sdks-go-open-source); [vst3sdk](https://github.com/steinbergmedia/vst3sdk)). AAX still needs Avid.
- **Reuse.** Medium-high via JUCE 8 WebView (HTML/JS transfers; replace host bridge); low for pure JUCE Components.

### Decision matrix

| Axis | M4L | JUCE | Notes |
|---|---|---|---|
| 1. Time-to-MVP | 5 | 2 | M4L 3–5 wk vs JUCE 10–14 wk (partly cited via [JUCE Jobs](https://forum.juce.com/t/paid-juce-audio-plugin-developer-needed-commercial-synth-plugin/67990)). |
| 2. Visual ceiling | 3 | 5 | JUCE OpenGL/Metal beats `jweb` for FFT-rate animation; both fine for 60fps THREE.js ([Vital/Visage](https://juce.com/made-with-juce/matt-tytel-from-vital-audio/)). |
| 3. Distribution friction | 5 | 1 | `.amxd` drag-drop vs codesign + notarise + EV cert + installer ([Melatonin](https://melatonin.dev/blog/how-to-code-sign-and-notarize-macos-audio-plugins-in-ci/)). |
| 4. Reuse of artifact code | 5 | 4 | `jweb` runs THREE/Tone as-is; JUCE 8 WebView nearly as good but adds host-bridge ([JUCE WebView](https://juce.com/blog/juce-8-feature-overview-webview-uis/)). |
| 5. Tempo / MIDI sample-accuracy | 3 | 5 | JUCE sample-accurate by construction; M4L has signal-vector jitter unless `plugsync~` ([sample-accurate](https://cycling74.com/forums/how-to-have-sample-accurate-syncing-from-live's-transport-plugsync~-seems-innacurate-and-inconsistent)). |
| 6. Persistence robustness | 4 | 5 | `ValueTree` more transparent than `pattrstorage` blobs ([pattr](https://cycling74.com/forums/is-it-possible-for-m4l-presets-to-be-saved-automatically-when-saving-the-live-set)). |
| 7. Debug / iteration loop | 5 | 3 | Max patcher edits live; JUCE rebuilds (WebView UI exempt) ([Max debugging](https://docs.cycling74.com/userguide/debugging_and_probing/)). |
| 8. User install audience size | 2 | 5 | M4L needs Suite or Standard+M4L ([Ableton](https://help.ableton.com/hc/en-us/articles/360000036850-Max-for-Live-bundled-in-Live)); JUCE works in any VST3/AU/CLAP host. |
| 9. Licence cost burden | 5 | 3 | M4L: $0 dev fees if you own Suite. JUCE Indie $40/mo or $800 perpetual once commercial ([JUCE pricing](https://juce.com/get-juce/)); VST3 SDK now free MIT ([Steinberg](https://www.theaudioprogrammer.com/content/steinbergs-vst3-asio-sdks-go-open-source)). |
| 10. Future-proofing (cross-DAW) | 1 | 5 | M4L locked to Live forever; JUCE compiles to VST3/AU/CLAP/AAX. |
| 11. MPE / MIDI 2.0 expressivity | 3 | 5 | JUCE has first-class MPE/MIDI 2.0; M4L MPE works but per-note expression routing is finicky. |
| 12. Accessibility hooks | 3 | 4 | Both can build accessible HTML UIs; JUCE Components have native a11y on macOS/Windows. |

(12 axes, 1–5 scale, rationale per cell.)

## Implications for BiomeBeats

**M4L ships:** a 5-week prototype — radial pizza, 5 biome shaders, MIDI-out, drag-out clip — artifact stack reused in `jweb`. Fastest iteration; no codesigning; `.als` persistence automatic.

**M4L blocks:** anyone without Live Suite/Standard+M4L (most FL Studio/Logic/Bitwig/Reaper/Cubase users). Chromium-bounded visual; harder sample-accurate MIDI; locked to Ableton's roadmap. No CLAP/AAX/standalone.

**JUCE ships:** a cross-DAW commercial plug-in (VST3/AU/CLAP) with sample-accurate MIDI, JUCE 8 WebView for the radial UI (THREE.js + Tone.js mostly transfer), AAX path. Vital-class ceiling. `ValueTree` persistence. Free starter + MIT VST3 SDK = $0 prototype.

**JUCE blocks:** the 5-week MVP. Realistic 10–14 weeks plus mandatory codesign/notarise and installers. First-time devs hit DSP/threading/parameter curves M4L hides.

**Three biggest M4L risks:** (1) audience cliff (non-Suite users can't try it); (2) visual-ceiling pinch (complexity beyond `jweb` = rewrite, not patch); (3) lock-in (bundling and MPE/MIDI 2.0 cadence dictated externally).

**Three biggest JUCE risks:** (1) time-to-first-feedback — 10–14 silent weeks risks building the wrong thing; (2) distribution overhead — Apple Developer ($99/yr), Windows EV cert ($200–600/yr), CI tax ([code signing](https://forum.juce.com/t/code-signing-and-ov-ev-certificates/67030/1)); (3) reuse leakage — WebView bridge isn't free; `localStorage`/`fetch` patterns rewrite to `withResourceProvider`/`withNativeFunction` ([JUCE WebView](https://juce.com/blog/juce-8-feature-overview-webview-uis/)).

**Fallback plans.** *M4L ceiling hit:* port `jweb` HTML/JS into JUCE 8 WebView, ship VST3/AU/CLAP — M4L becomes Phase-0 UX validation. *JUCE MVP slips:* strip visual ceiling (drop expensive shader pass, 3 biomes not 5), or fork — ship a parallel `.amxd` "Live Edition" on the same HTML/JS while JUCE matures.

## Open questions

- **JUCE 8 WebView fps vs `jweb`** — no public THREE r128 benchmark; 1-day spike needed.
- **M4L install audience size** — Ableton publishes no Suite-owner count ([Enlyft](https://enlyft.com/tech/products/ableton-live)).
- **Drag-out MIDI from `jweb`** — HTML→Max DnD bridge non-standard.
- **Time-to-MVP estimates** — Beat Scholar's actual timeline isn't public.
- **Touch input on iPad Live 12** — `jweb` touch story unclear.
- **M4L multi-instance** — `jweb` resource contention when 4+ load.
- **MPE in M4L** — fiddly; per-note expression test needed.
- **AAX from JUCE** — separate Avid agreement still required.

## Sources

- Ableton — [Max for Live bundled in Live](https://help.ableton.com/hc/en-us/articles/360000036850-Max-for-Live-bundled-in-Live)
- Ableton — [Buying Max for Live](https://help.ableton.com/hc/en-us/articles/206407124-Buying-Max-for-Live)
- Ableton — [Max for Live product page](https://www.ableton.com/en/live/max-for-live/)
- Ableton — [Live shop pricing](https://www.ableton.com/en/shop/live/)
- Cycling '74 — [Debugging and Probing](https://docs.cycling74.com/userguide/debugging_and_probing/)
- Cycling '74 — [pattrstorage persistence](https://cycling74.com/forums/is-it-possible-for-m4l-presets-to-be-saved-automatically-when-saving-the-live-set)
- Cycling '74 — [sample-accurate sync thread](https://cycling74.com/forums/how-to-have-sample-accurate-syncing-from-live's-transport-plugsync~-seems-innacurate-and-inconsistent)
- Dobrian — [Tempo-Relative Timing in Max](https://dobrian.github.io/cmp/topics/tempo-based-timing/2.tempo-relative-timing-in-max-and-self-quiz.html)
- h1data — [M4L jweb experimentation](https://github.com/h1data/M4L-jweb-injection)
- JUCE — [Get JUCE / pricing](https://juce.com/get-juce/)
- JUCE — [JUCE 8 WebView UIs blog](https://juce.com/blog/juce-8-feature-overview-webview-uis/)
- JUCE — [Made with JUCE: Matt Tytel / Vital](https://juce.com/made-with-juce/matt-tytel-from-vital-audio/)
- JUCE forum — [Code signing OV/EV certificates](https://forum.juce.com/t/code-signing-and-ov-ev-certificates/67030/1)
- JUCE Jobs — [Commercial synth plugin v1 timeline](https://forum.juce.com/t/paid-juce-audio-plugin-developer-needed-commercial-synth-plugin/67990)
- Melatonin — [Code-sign + notarize macOS plug-ins in CI](https://melatonin.dev/blog/how-to-code-sign-and-notarize-macos-audio-plugins-in-ci/)
- Pamplejuce — [JUCE plugin CI template](https://github.com/tote-bag-labs/pamplejuce/)
- The Audio Programmer — [Steinberg VST3 / ASIO go open-source](https://www.theaudioprogrammer.com/content/steinbergs-vst3-asio-sdks-go-open-source)
- Steinberg — [vst3sdk on GitHub (MIT)](https://github.com/steinbergmedia/vst3sdk)
- Vital forum — [OpenGL warning thread](https://forum.vital.audio/t/opengl-warning-and-black-screen-no-gui/908)
- Enlyft — [Ableton Live market share](https://enlyft.com/tech/products/ableton-live)
- `claude-creative-stack/knowledge/11-creative-connectors.md` §11.4 — Ableton MCP / LOM tool surface (the MCP daemon, not M4L itself)
