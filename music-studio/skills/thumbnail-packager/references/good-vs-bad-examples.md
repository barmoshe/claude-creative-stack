# Thumbnail good-vs-bad

Replace these with screenshots of actual benchmarks from `channel-brain/packaging.md` once you have them. Until then, this is the calibration set.

## What good looks like

- **One core idea, immediately legible.** If a viewer scrolling at 1× speed on a phone can't tell what the video is in 0.5 s, it fails.
- **App screenshot recognisable.** The viewer should be able to tell "oh that's a sequencer" / "oh that's a synth" / "oh that's a sampler" from the shape alone.
- **Headline complements, doesn't repeat.** If the title says "I built a sequencer that writes impossible patterns", the thumbnail headline should NOT say "Impossible Sequencer". It should say something like "WHAT". Or the thumbnail headline reads first; the title fills in the detail.
- **Authentic > polished.** Hand-drawn arrows beat clean Adobe arrows on this channel. The audience reads polish as marketing.
- **One pop color against a muted background.** Contrast carries the eye.

## What bad looks like

- **Code editor as the dominant visual.** Viewers do not want code; they want music.
- **Plugin GUI at default zoom.** Illegible at 350 px. Crop to one knob if you must.
- **All-caps red banner stretching across the image.** Indistinguishable from MrBeast/Linus thumbs and reads as low-effort.
- **AI-art generic aesthetics.** The audience can spot stable-diffusion synth illustrations; they read as "this person didn't make the thing".
- **Six elements competing for attention.** App screenshot + headline + face + arrow + emoji + logo = no focal point.
- **A headline the video doesn't deliver.** "INFINITE FREE SAMPLES" when the video is about 4 sample packs. Punished by retention drop and unsubscribes.

## Common mistakes generators make

- **Headline > 4 words.** Cut it. Always. Even if the line "feels too short", it isn't.
- **Multiple core ideas.** "Look at the cool app AND the cool sound AND the cool reaction" — pick one.
- **Headline placed over the app screenshot's busiest area.** Move the screenshot, or move the headline.
- **Font weight too light.** Anything below `font-weight: 800` melts at 350 px.
- **Color outside the channel palette.** Consistency builds recognition; novelty per-thumbnail kills it.

## Squint-test discipline

After generating, open the preview at 350 px width. Squint until the image is blurry. The headline should still be readable. The dominant visual should still be recognisable. If either fails, regenerate.
