# Cut craft

## Where to cut

- **On silence ≥ 400 ms.** Below that, audio splices produce micro-pops
  even with the 30 ms fade rule. Surface the audio gap by listening to
  the packed transcript phrase boundaries.
- **On sentence ends, not mid-sentence.** "I built this. <CUT> Then I
  realised…" beats "I built this and then <CUT> I realised…".
- **On reaction frames.** A laugh, a head-shake, a deliberate pause is
  a natural cut point.
- **Never on a vowel.** The 30 ms fade can't hide a mid-vowel cut.

## Where NOT to cut

- Mid-word.
- Mid-musical-bar during the final demo.
- During an ongoing audio cue (a filter sweep, a build-up).
- Where the next take starts with a different ambient noise floor — the
  hum jump is more distracting than the time saving.

## How to handle long takes

- A take longer than 90 s without a cut, zoom, or caption is dragging.
  Either insert a B-roll moment (the app responding) or split into two
  takes with a hard cut on silence.

## Silence-gap detection

The `takes_packed.md` view from `pack_takes.py` already breaks on
silence ≥ 0.5 s. For tighter cuts (down to 400 ms), call
`timeline_view.py` and read the waveform.

## Padding

- Leave 100 ms of room-tone before the first word of each cut. Otherwise
  it sounds clipped, even with the fade.
- Trim trailing room-tone aggressively — long tails feel slow.

## Audio-first reasoning

The cut decision is made on the audio, not the video. If the audio
splice works, the visual will work; the inverse isn't true. When
script-writer and edit-director disagree about a beat, audio wins.
