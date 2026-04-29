# Short <N> spec — <slug>

**Source:** `workspace/exports/<NNN>-<slug>/<NNN>-<slug>-video.mp4`
**Output:** `workspace/exports/<NNN>-<slug>/<NNN>-<slug>-short-<N>.mp4`
**Length target:** 30–60 seconds
**Aspect:** 9:16 (1080×1920)

## Hook (first 2 seconds)

What plays / shows: <sound or visual surprise>
Caption: <≤ 6 words, sound-off readable>

## Body (next 25–55 seconds)

| Time | What's happening | Caption |
|---|---|---|
| 0:02–0:08 | <segment> | <caption> |
| 0:08–0:18 | <segment> | <caption> |
| ... | ... | ... |

## CTA (last 2–3 seconds)

Caption: "Full episode → link in bio" (or channel-specific phrasing)

## EDL (cut spec for render.py)

```json
{
  "source": "workspace/exports/<NNN>-<slug>/<NNN>-<slug>-video.mp4",
  "fps": 30,
  "segments": [
    {"start": <s>, "end": <e>}
  ],
  "overlays": [
    {"type": "subtitle", "path": "shorts/<N>.srt"}
  ]
}
```

Render with:

```bash
helpers/render.py --edl shorts/short-<N>.edl.json --vertical \
  -o workspace/exports/<NNN>-<slug>/<NNN>-<slug>-short-<N>.mp4
```

## Verification

- [ ] First 2 s = sound or visual surprise (no talking head).
- [ ] Every line captioned for sound-off viewing.
- [ ] Length ≤ 60 s.
- [ ] One core idea — not a feature highlight reel.
- [ ] Vertical framing: subject in centre 60% of frame, no pad bars.
