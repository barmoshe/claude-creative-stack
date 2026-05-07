# R6 — Output EDL and Renderer

> Status: draft
> Owner: Wave-3 agent  Last updated: 2026-05-07

## TL;DR (≤150 words)

The EDL is a JSON timeline of `{scene_id, in, out, place_at, visual_treatment, source_orientation, broll | graphic}` segments plus one voiceover track, propagating R4's licence envelope `{source, clip_id, license, attribution, downloaded_at}` per broll item ([R4 §License-traceability](./04-background-video-sourcing.md)). Four render targets were weighed (FFmpeg `concat`+`filter_complex`, MoviePy v2.2.1, Remotion, FCPXML hand-off). Default pick: **Remotion** — the only renderer that natively composites both broll `<Video>` clips and the React graphic templates already chosen by R-graphics in one pass ([R-graphics](./00c-scene-types-and-graphic-templates.md), [remotion.dev/docs/composition](https://www.remotion.dev/docs/composition)). Remotion CLI ingests the EDL via `--props=./edl.json` ([remotion.dev/docs/passing-props](https://www.remotion.dev/docs/passing-props)). FFmpeg is the broll-only fallback; FCPXML is an editor-handoff flag. Canvas: **1080×1920, 30 fps, H.264 high, AAC 192 kbps, yuv420p, faststart**. R9 locks.

## Scope & questions

EDL JSON shape; four render-target options against the mixed-treatment timeline; default pick + reasoning; vertical canvas + per-clip normaliser; FFmpeg fallback command; licence-metadata propagation; FCPXML mapping. R9 picks; this report ends at "options + soft pick" per [HANDOFF.md §2](./HANDOFF.md).

## Findings

### EDL JSON shape (paste-ready example)

Top-level: `{version, canvas, audio, scenes[]}`. Each scene mirrors R2's scene shape ([R2](./02-scene-and-keyword-schema.md)) plus realised render fields (`place_at`; resolved `broll.clip` or `graphic.template`+`props`). Voiceover lives once at top level; every `place_at` shares the audio clock.

```json
{
  "version": "edl/1",
  "canvas": { "width": 1080, "height": 1920, "fps": 30, "background": "oklch(0.15 0 0)" },
  "audio": { "src": "voiceover.wav", "start_s": 0.0, "duration_s": 110.4, "loudness_lufs": -16 },
  "scenes": [
    { "scene_id": 1, "in": 0.0, "out": 6.2, "place_at": 0.0,
      "visual_treatment": "broll", "source_orientation": "vertical",
      "broll": { "clip": "cache/pexels_8796.mp4", "in": 0.5, "out": 6.7,
                 "source": "pexels", "clip_id": "8796", "license": "pexels-free",
                 "attribution": "Pexels / Anna Tarazevich",
                 "downloaded_at": "2026-05-07T08:14:02Z" },
      "graphic": null },
    { "scene_id": 2, "in": 6.2, "out": 12.0, "place_at": 6.2,
      "visual_treatment": "graphic_table", "source_orientation": null,
      "broll": null,
      "graphic": { "template": "graphic_table",
                   "props": { "title": "טמפרטורות מחר", "dir": "rtl",
                              "rows": [{"city":"תל אביב","value":"24°"},
                                       {"city":"חיפה","value":"22°"},
                                       {"city":"ירושלים","value":"20°"}] } } },
    { "scene_id": 3, "in": 12.0, "out": 18.4, "place_at": 12.0,
      "visual_treatment": "broll", "source_orientation": "horizontal",
      "broll": { "clip": "cache/pixabay_44210.mp4", "in": 0.0, "out": 6.4,
                 "source": "pixabay", "clip_id": "44210", "license": "pixabay-content",
                 "attribution": "Pixabay / Free-Footage",
                 "downloaded_at": "2026-05-07T08:14:11Z",
                 "normalise": "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1" },
      "graphic": null },
    { "scene_id": 4, "in": 18.4, "out": 22.0, "place_at": 18.4,
      "visual_treatment": "lower_third", "source_orientation": null,
      "broll": null,
      "graphic": { "template": "lower_third",
                   "props": { "line1": "מקור", "line2": "השירות המטאורולוגי", "dir": "rtl" } } }
  ]
}
```

The shape is a superset of OpenTimelineIO's clip envelope, so converting to `.otio` or FCPXML is a field rename, not a restructuring.

### Four render-target options

| Option | Mixed scenes? | Cost | Verdict |
|---|---|---|---|
| **FFmpeg `concat` + `filter_complex`** | Broll only — graphic scenes must first rasterise to PNG sequences then composite with `overlay` ([ffmpeg.org/ffmpeg-formats.html — concat demuxer](https://ffmpeg.org/ffmpeg-formats.html), [Cloudinary FFmpeg concat guide](https://cloudinary.com/guides/video-effects/ffmpeg-concat)). | Cheapest, no Node, no UI. | Fallback |
| **MoviePy v2.2.1** | Yes via `CompositeVideoClip([...], size=(1080,1920))`, but graphic scenes must be Python-drawn (Pillow) — duplicates R-graphics' Remotion templates. v2 renames `set_*` → `with_*`; pin v2 explicitly ([MoviePy v2 migration](https://zulko.github.io/moviepy/getting_started/updating_to_v2.html)). | Single-maintainer risk ([PRE-RESEARCH §7.3](./PRE-RESEARCH.md)). | Same-machine Python escape hatch |
| **Remotion** | **Yes — broll `<Video>` and graphic React templates compose in one `<Composition width={1080} height={1920} fps={30}>`** ([remotion.dev/docs/composition](https://www.remotion.dev/docs/composition), [remotion.dev/docs/sequence](https://www.remotion.dev/docs/sequence)). | Node 18+, longer cold-start, more deps. | **Default** |
| **FCPXML / Premiere XML / OTIO** | Doesn't render — hand-off to a human editor. | Highest editorial control. | Flag (`--emit fcpxml`) |

### Default renderer pick: Remotion (R9 locks)

**Why.** Mixed scene composition is the deciding factor. R-graphics already picked Remotion React for `graphic_table`, `graphic_map`, `graphic_chart`, `lower_third`, `title_card` ([R-graphics](./00c-scene-types-and-graphic-templates.md)). If R6 picked FFmpeg or MoviePy, every graphic scene would need a second render pass to produce a PNG/MP4 to feed back. Remotion handles both treatment classes in one pass.

**Production model.** A single `Root.tsx` registers one master `<Composition id="edl" component={Timeline} width={1080} height={1920} fps={30} />`. CLI: `npx remotion render edl out.mp4 --props=./edl.json` — `--props` accepts an inline JSON string or a path ([remotion.dev/docs/passing-props](https://www.remotion.dev/docs/passing-props), [remotion.dev/docs/cli/render](https://www.remotion.dev/docs/cli/render)). Inside `Timeline`, `getInputProps()` returns the EDL; `scenes.map` emits one `<Sequence from={place_at*fps} durationInFrames={(out-in)*fps}>` per scene ([remotion.dev/docs/sequence](https://www.remotion.dev/docs/sequence)) wrapping either `<OffthreadVideo src={broll.clip} startFrom={broll.in*fps} />` or the React template with `props` spread. One `<Audio src={audio.src} />` sits outside the loop. **Costs:** Node 18+, ~10–20 s headless-Chromium cold-start, ~400 MB npm install.

### Vertical canvas + per-clip normaliser

Canvas everywhere: **1080×1920, 30 fps, H.264 high, AAC 192 kbps, yuv420p, faststart** ([PRE-RESEARCH §5](./PRE-RESEARCH.md)).

- **FFmpeg:** `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1` — fill height, centre-crop to 1080 wide ([RenderIO](https://renderio.dev/blogs/ffmpeg-resize-video), [Shotstack](https://shotstack.io/learn/crop-resize-videos-ffmpeg/)). Apply only when `source_orientation === "horizontal"`.
- **Remotion:** `<Composition width={1080} height={1920} fps={30}>`; broll → `<Sequence from={...}><OffthreadVideo src={...} style={{ height:'100%', width:'100%', objectFit:'cover' }} /></Sequence>` (CSS `object-fit:cover` mimics FFmpeg fill+crop); graphic → `<Sequence from={...}><GraphicTable {...props} /></Sequence>`; one `<Audio src="voiceover.wav" />` over the whole comp.
- **MoviePy v2:** `CompositeVideoClip([clip.resized(height=1920).cropped(x_center=clip.w/2, width=1080) for clip in clips], size=(1080,1920)).with_audio(AudioFileClip("voiceover.wav"))` — v2 renames `set_*` → `with_*`, plus `resized()` / `cropped()` ([MoviePy v2 migration](https://zulko.github.io/moviepy/getting_started/updating_to_v2.html)).

### Reference FFmpeg fallback command

For broll-only days or when Remotion is unavailable. Pre-condition: graphic scenes already rasterised to PNG sequences in `graphics/<scene_id>/%04d.png` (Remotion `renderFrames()` or Playwright per [R-graphics](./00c-scene-types-and-graphic-templates.md)). Normalise, concat, mux voiceover:

```bash
ffmpeg \
  -i scenes/s1.mp4 -framerate 30 -i graphics/s2/%04d.png \
  -i scenes/s3.mp4 -framerate 30 -i graphics/s4/%04d.png \
  -i voiceover.wav \
  -filter_complex "\
   [0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30[v0];\
   [1:v]scale=1080:1920,setsar=1,fps=30[v1];\
   [2:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30[v2];\
   [3:v]scale=1080:1920,setsar=1,fps=30[v3];\
   [v0][v1][v2][v3]concat=n=4:v=1:a=0[vout]" \
  -map "[vout]" -map 4:a \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 192k -ac 2 \
  -movflags +faststart -shortest out.mp4
```

`-movflags +faststart` puts the moov atom up front so Reels/TikTok stream before download finishes ([Cloudinary](https://cloudinary.com/guides/video-effects/ffmpeg-concat), [Mux](https://www.mux.com/articles/stitch-multiple-videos-together-with-ffmpeg)).

### Licence-metadata propagation

Every `scenes[].broll` carries the full R4 envelope verbatim — `{source, clip_id, license, attribution, downloaded_at, prompt?}` ([R4](./04-background-video-sourcing.md)). The renderer is the choke point that must not strip these fields: Remotion's `Timeline` writes a sidecar `<out>.licenses.json` next to the MP4; the FFmpeg fallback writes the same sidecar from a pre-render pass. R8's pre-cut gate (Pixabay face/brand screen, broadcast → Storyblocks-Business+) reads this sidecar.

### FCPXML hand-off flag

When the editor wants the timeline in Premiere / DaVinci / Final Cut instead of a rendered MP4, run `kx render --emit fcpxml`. An `xml.etree.ElementTree` writer maps:

| EDL field | FCPXML element |
|---|---|
| `canvas.{width,height,fps}` | `<format>` (frameDuration, width, height) |
| `scenes[]` | `<spine>` of `<asset-clip>` (broll) and `<video>`+`<title>` (graphic) |
| `scenes[i].place_at` | `<asset-clip offset="…s">` |
| `scenes[i].in / out` | `<asset-clip start="…" duration="…">` |
| `audio.src` | `<asset-clip>` on lane −1, `format=audioOnly` |
| `broll.{license, attribution}` | `<note>` on the clip |

R7 scaffolds the converter Skill. The schema is already FCPXML-compatible — every required FCPXML field has a one-to-one EDL source.

## Implications for keyword-extractor-voiceover

- Default = Remotion; FFmpeg = fallback; FCPXML = `--emit` flag (R9 locks).
- The EDL is the single source of truth — Remotion, FFmpeg fallback, FCPXML writer all read the same JSON.
- Renderer pre-flight: validate every `source_orientation`, monotonic `place_at`, non-empty licence envelope on every broll clip.
- R7 owns: `<Timeline>` component, `Root.tsx` registering the master composition + R-graphics templates, `kx render` CLI wrapper.

## Open questions

- Does `<OffthreadVideo>` stay frame-accurate when source clips are 25 fps (Pixabay) or 23.976 fps (Storyblocks)?
- Per-scene Ken-Burns for static-feeling broll — Remotion `interpolate` vs FFmpeg `zoompan`. Phase 2.
- Crossfade vs hard-cut between scenes — R-graphics templates assume hard-cut; broll-to-broll may want a 6-frame dissolve.
- Audio ducking under `lower_third` reveal — fixed 3 dB or RMS-aware?
- Does the FFmpeg fallback want the `concat` *demuxer* (copy-mode, faster) when all scenes are pre-normalised broll?

## Sources

- [Remotion — `<Composition>`](https://www.remotion.dev/docs/composition)
- [Remotion — `<Sequence>`](https://www.remotion.dev/docs/sequence)
- [Remotion — passing props](https://www.remotion.dev/docs/passing-props)
- [Remotion — CLI render](https://www.remotion.dev/docs/cli/render)
- [Remotion — getInputProps()](https://www.remotion.dev/docs/get-input-props)
- [Remotion — renderFrames()](https://www.remotion.dev/docs/renderer/render-frames)
- [FFmpeg formats — concat demuxer](https://ffmpeg.org/ffmpeg-formats.html)
- [FFmpeg filters reference](https://ffmpeg.org/ffmpeg-filters.html)
- [Cloudinary — FFmpeg concat guide](https://cloudinary.com/guides/video-effects/ffmpeg-concat)
- [Mux — FFmpeg concat](https://www.mux.com/articles/stitch-multiple-videos-together-with-ffmpeg)
- [Shotstack — FFmpeg crop](https://shotstack.io/learn/crop-resize-videos-ffmpeg/)
- [RenderIO — FFmpeg resize: scale, crop, pad](https://renderio.dev/blogs/ffmpeg-resize-video)
- [MoviePy v1 → v2 migration guide](https://zulko.github.io/moviepy/getting_started/updating_to_v2.html)
- [MoviePy on PyPI](https://pypi.org/project/moviepy/)
- `research/keyword-extractor-voiceover/PRE-RESEARCH.md` §4 R6, §5, §7.3
- `research/keyword-extractor-voiceover/HANDOFF.md` §3, §4
- `research/keyword-extractor-voiceover/00c-scene-types-and-graphic-templates.md`
- `research/keyword-extractor-voiceover/02-scene-and-keyword-schema.md`
- `research/keyword-extractor-voiceover/04-background-video-sourcing.md`
