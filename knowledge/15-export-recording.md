# 15 — Export, Recording & Capture

> Generating an animation, game, or visualization is half the job — shipping it usually means *exporting* a still, GIF, video, or asset bundle. This file covers the canvas/DOM → file conversion paths that work in May 2026.

## 15.1 Quick decision matrix

| You want… | Best tool | Notes |
|---|---|---|
| A still PNG of a `<canvas>` | `canvas.toBlob` | Synchronous blob; works on offscreen canvases too. |
| A GIF loop (≤ 30 s) | `gif.js` (worker-based) or `gifenc` (faster) | GIFs are not great in 2026 — prefer WebM/MP4 unless target environment requires GIF. |
| WebM / VP9 / AV1 video | `MediaRecorder` + `canvas.captureStream()` | Native, no deps, ~real-time encode. |
| MP4 / H.264 video | `MediaRecorder` (`mimeType: "video/mp4"`) on Chromium 117+ / Safari 17+ | Wider compatibility than WebM. |
| Per-frame deterministic export | `OffscreenCanvas` + `WebCodecs` `VideoEncoder` | Frame-by-frame, no realtime constraint. |
| Trim, transcode, concat | `ffmpeg.wasm` (`@ffmpeg/ffmpeg`) | Heavy (~30 MB). Spawn in a worker. |
| Screenshot a DOM tree (not canvas) | `html-to-image` or `dom-to-image-more` | Plays well with web fonts, CSS filters. |
| A stitched sprite sheet | `mcp/servers/sprite-packer` (this repo) | Or hand-roll with `canvas` + a binary packer. |
| Video → GIF | `ffmpeg.wasm` palette + dither pass | Two-pass for quality. |

Inside an artifact: **`MediaRecorder` and `canvas.captureStream()` work**; `WebCodecs` and `OffscreenCanvas` work but Worker spawning is blocked, so encoding stays on the main thread. `ffmpeg.wasm` works only in `playground/` (large download + worker requirement).

## 15.2 `canvas.toBlob` — the still

```js
canvas.toBlob(blob => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `frame_${Date.now()}.png`;
  a.click();
  URL.revokeObjectURL(a.href);
}, "image/png");
```

For HiDPI: render to `canvas.width * dpr × canvas.height * dpr` and downsample for display, but export the raw bitmap.

## 15.3 `MediaRecorder` — realtime canvas video

Pattern (works in any modern browser, including artifacts):

```js
const stream = canvas.captureStream(60);     // 60 fps source
const mime =
  MediaRecorder.isTypeSupported("video/mp4;codecs=avc1.42E01E")  ? "video/mp4;codecs=avc1.42E01E" :
  MediaRecorder.isTypeSupported("video/webm;codecs=vp9")         ? "video/webm;codecs=vp9" :
                                                                   "video/webm;codecs=vp8";
const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
const chunks = [];
rec.ondataavailable = e => e.data.size && chunks.push(e.data);
rec.onstop = () => {
  const blob = new Blob(chunks, { type: mime });
  const url = URL.createObjectURL(blob);
  // download or attach to a <video src=url>
};
rec.start(/* timeslice ms */ 1000);
// later:
rec.stop();
```

Add audio: `canvas.captureStream(60).addTrack(audioStream.getAudioTracks()[0])`.

Pitfalls:

- `captureStream()` runs at the canvas's actual frame rate, not the requested rate. If your render loop dips to 45 fps, the recording does too.
- MP4 in `MediaRecorder` is Chromium 117+ / Safari 17+. Feature-detect.
- For demos that need to record *faster than realtime*, switch to `WebCodecs` (§15.5).

## 15.4 `gif.js` / `gifenc` — when GIF is mandatory

GIF is rarely the right choice in 2026 (palette banding, worse compression than WebM at all sizes, no audio). Use only when the consumer is something old (Slack, Discord embeds, GitHub READMEs that don't auto-play video).

`gifenc` (smaller, faster, quantize-aware):

```js
import { GIFEncoder, quantize, applyPalette } from "gifenc";
const gif = GIFEncoder();
for (const imageData of frames) {
  const palette = quantize(imageData.data, 256);
  const indexed = applyPalette(imageData.data, palette);
  gif.writeFrame(indexed, imageData.width, imageData.height, { palette, delay: 1000/30 });
}
gif.finish();
const blob = new Blob([gif.bytes()], { type: "image/gif" });
```

For long captures, encode in a worker (or use `MediaRecorder` → MP4 → `ffmpeg.wasm` palette pass — better quality than direct GIF encoding).

## 15.5 `WebCodecs` — frame-accurate, off-realtime

WebCodecs lets you encode at any speed (faster than realtime is the win). Useful for deterministic trailers, "render N seconds at 60 fps even if the page can only hit 30."

```js
const encoder = new VideoEncoder({
  output: chunk => chunks.push(chunk),
  error: e => console.error(e),
});
encoder.configure({ codec: "avc1.42E01E", width, height, bitrate: 8_000_000, framerate: 60 });

for (let i = 0; i < totalFrames; i++) {
  drawFrame(i / 60);                                       // your render
  const frame = new VideoFrame(canvas, { timestamp: (i * 1_000_000) / 60 });
  encoder.encode(frame, { keyFrame: i % 60 === 0 });
  frame.close();
}
await encoder.flush();
// chunks → Blob via an MP4 muxer like mp4-muxer or @ffmpeg/util.
```

Mux the encoded chunks with **`mp4-muxer`** (`npm i mp4-muxer`) to get a real `.mp4` without `ffmpeg.wasm`.

## 15.6 `ffmpeg.wasm` — when you need transcode / trim / concat

```js
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const ff = new FFmpeg();
await ff.load({
  coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
  wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm",
});

await ff.writeFile("input.webm", await fetchFile(blob));
await ff.exec(["-i", "input.webm", "-vf", "fps=24,scale=480:-2:flags=lanczos", "-c:v", "libx264", "-crf", "20", "output.mp4"]);
const out = await ff.readFile("output.mp4");
const url = URL.createObjectURL(new Blob([out], { type: "video/mp4" }));
```

Useful one-liners:

- **WebM → MP4**: `["-i","in.webm","-c:v","libx264","-c:a","aac","out.mp4"]`
- **High-quality GIF (two-pass)**:
  - `["-i","in.mp4","-vf","fps=24,scale=480:-2:flags=lanczos,palettegen","palette.png"]`
  - `["-i","in.mp4","-i","palette.png","-filter_complex","fps=24,scale=480:-2:flags=lanczos[x];[x][1:v]paletteuse","out.gif"]`
- **Trim**: `["-ss","00:00:02","-t","00:00:05","-i","in.mp4","-c","copy","out.mp4"]` (no re-encode)

`ffmpeg.wasm` is ~30 MB total payload and requires SharedArrayBuffer (COOP/COEP). **Won't work in a published artifact**; works fine in `playground/` or your own host.

## 15.7 `html-to-image` — DOM → PNG

For UI components, marketing screenshots, or charts where canvas isn't an option:

```js
import { toPng, toBlob } from "html-to-image";
const dataUrl = await toPng(document.querySelector("#chart"), { pixelRatio: 2 });
```

Web fonts must be loaded before capture (`document.fonts.ready`). Cross-origin images need `crossorigin="anonymous"` and a CORS-friendly host.

## 15.8 Sprite sheet packing

Three options in this repo:

- **`skills/sprite-atlas-builder`** — runs locally with `npx tsx scripts/pack.ts assets/*.png`. Outputs PNG + JSON manifest.
- **`mcp/servers/sprite-packer`** — same logic, exposed as an MCP tool so it can be called from Claude Code or a recipe.
- **Hand-roll** — for one-offs:

```js
function pack(images, padding = 2) {
  const sizes = images.map(i => ({ w: i.width, h: i.height }));
  // Naive shelf packer; replace with maxrects for production.
  const cols = Math.ceil(Math.sqrt(sizes.length));
  const cellW = Math.max(...sizes.map(s => s.w)) + padding;
  const cellH = Math.max(...sizes.map(s => s.h)) + padding;
  const out = new OffscreenCanvas(cols * cellW, Math.ceil(images.length / cols) * cellH);
  const ctx = out.getContext("2d");
  const frames = images.map((img, i) => {
    const x = (i % cols) * cellW, y = Math.floor(i / cols) * cellH;
    ctx.drawImage(img, x, y);
    return { name: img.name, frame: { x, y, w: img.width, h: img.height } };
  });
  return { canvas: out, manifest: { frames } };
}
```

For production: prefer the MaxRects bin packing algorithm (`maxrects-packer` npm) — it produces denser atlases.

## 15.9 Pitfalls

- **`captureStream()` and CORS-tainted canvases**: drawing a cross-origin image without `crossorigin="anonymous"` taints the canvas — `toBlob`/`captureStream` then throw `SecurityError`.
- **Recording before render is ready**: `canvas.captureStream()` before the WebGL context is initialized produces a black video. Initialize first, render once, then start the recorder.
- **Audio + video sync**: when you mix an `AudioContext` source into a `MediaRecorder`, both streams must be `playing` at `.start()` time. Tone.js: call `await Tone.start()` before recording.
- **Worker-based encoders inside artifacts**: blocked. Keep encoders on the main thread; if perf is a problem, lower the framerate or move the work to `playground/`.
- **WebGPU + `captureStream`**: WebGPU canvases can be captured since Chrome 121+, but Safari only added it in 26.1. Feature-detect.
- **Memory when capturing long clips**: `MediaRecorder` chunks accumulate. For multi-minute records, periodically flush chunks to disk via the File System Access API or stream to a server.

## 15.10 See also

- `knowledge/04-animation.md` — animation pipelines that produce the frames you'll capture.
- `knowledge/06-games.md` — game loops and timestep concerns.
- `knowledge/14-accessibility-performance.md` — capture without dropping fps.
- `mcp/servers/sprite-packer/` — the MCP version of the sprite packer (W4).
- `skills/sprite-atlas-builder/` — the local-script version (W3).
