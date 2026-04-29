# ffmpeg mastering chains

Each chain targets one symptom. The audio-engineer skill picks the chain matching the measured deficit, applies it, and re-measures.

## Symptom: too quiet (integrated < target − 1 dB)

```
ffmpeg -i in.wav \
  -af "loudnorm=I=-14:LRA=11:TP=-1.0:print_format=summary" \
  out.mastered.wav
```

`loudnorm` is FFmpeg's BS.1770-compliant normaliser. Two-pass mode:

```
# Pass 1 — measure
ffmpeg -i in.wav -af "loudnorm=I=-14:LRA=11:TP=-1.0:print_format=json" -f null -

# Pass 2 — apply with measured values (paste from pass 1's JSON)
ffmpeg -i in.wav \
  -af "loudnorm=I=-14:LRA=11:TP=-1.0:measured_I=...:measured_LRA=...:measured_TP=...:measured_thresh=...:offset=...:linear=true:print_format=summary" \
  out.mastered.wav
```

Two-pass produces a more transparent result for content with wide dynamic range.

## Symptom: peaks clipping (true peak > −1.0 dBTP)

```
ffmpeg -i in.wav -af "alimiter=limit=-1.0dB:level=disabled" out.mastered.wav
```

Brick-wall ceiling at −1 dBTP. Use AFTER loudnorm if peaks still ride too high.

## Symptom: dynamic range too wide for streaming

```
ffmpeg -i in.wav -af "compand=attacks=0.05:decays=0.4:points=-80/-80|-30/-15|-20/-12|-5/-5|0/-3" out.mastered.wav
```

Mild bus compressor (≈ 2:1 above −20 dBFS). Use sparingly — too much makes the master tubby.

## Symptom: muddy low-mids

```
ffmpeg -i in.wav -af "highshelf=f=8000:g=2,highpass=f=30,equalizer=f=300:t=q:w=1.0:g=-2" out.mastered.wav
```

A 2 dB cut around 300 Hz cleans most of the build-up; a high-pass at 30 Hz removes inaudible rumble.

## Symptom: harsh highs

```
ffmpeg -i in.wav -af "equalizer=f=4000:t=q:w=1.5:g=-2.5" out.mastered.wav
```

Targeted dip at 4 kHz — where presence collapses into harshness on cheap monitoring.

## Symptom: pops at cut boundaries (despite render.py's 30 ms fades)

```
ffmpeg -i in.wav -af "deesser=i=0.5,adeclick=t=0.01,adeclip" out.mastered.wav
```

`adeclick` removes transient clicks; `adeclip` repairs hard-clipped samples. Run BEFORE the loudnorm pass.

## Combined safe master chain

When in doubt, this chain is safe for most music-tech content:

```
ffmpeg -i in.wav -af "highpass=f=30,loudnorm=I=-14:LRA=11:TP=-1.0,alimiter=limit=-1.0dB" out.mastered.wav
```

Always re-measure with `helpers/loudness.py` after applying any chain.
