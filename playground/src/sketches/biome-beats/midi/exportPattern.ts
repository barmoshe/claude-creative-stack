import MidiWriter, { Track as MidiTrack } from "midi-writer-js";
import type { Pattern } from "../engine/pattern";
import { resolveChord, resolveNote } from "../engine/chordResolver";
import { BIOMES } from "../data/biomes";

const PPQ = 128;
const GM_DRUMS = [36, 38, 42, 39, 41];

export function exportPatternAsMidi(pattern: Pattern, filename = "biomebeats-pattern"): void {
  const biome = BIOMES[pattern.biomeId];
  const ticksPerBar = pattern.timeSigNumerator * PPQ;
  const ticksPerMs = (pattern.bpm * PPQ) / 60000;

  const tracks: MidiTrack[] = [];

  pattern.rings.forEach((ring) => {
    if (!ring.enabled) return;

    const track = new MidiWriter.Track();
    track.setTempo(pattern.bpm);
    track.setTimeSignature(pattern.timeSigNumerator, pattern.timeSigDenominator);
    track.addTrackName(`BiomeBeats ${ring.role}`);

    const ticksPerSlice = ticksPerBar / ring.length;

    ring.slices.forEach((slice, sliceIdx) => {
      if (!slice.active || slice.mute) return;

      const baseTick = Math.round(sliceIdx * ticksPerSlice);
      const microOffsetTicks = Math.round(slice.microtiming * ticksPerMs);
      const startTick = Math.max(0, baseTick + microOffsetTicks);

      const accentMul = slice.accent ? 1.2 : 1.0;
      const velocity = Math.min(127, Math.round(slice.velocity * accentMul));

      let pitches: number[] = [];
      if (slice.kind === "chord" && ring.role === "chord") {
        pitches = resolveChord({
          degree: slice.pitchDegree,
          octaveOffset: slice.octave,
          chordSize: slice.chordSize,
          chordQuality: slice.chordQuality,
          inversion: slice.inversion,
          voicing: slice.voicing,
          scaleRoot: biome.scaleRoot,
          scaleIntervals: biome.scaleIntervals,
        });
      } else if (slice.kind === "note" && ring.role === "bass") {
        pitches = [
          resolveNote(biome.scaleRoot - 24, biome.scaleIntervals, slice.pitchDegree, slice.octave),
        ];
      } else if (slice.kind === "note" && ring.role === "melody") {
        pitches = [
          resolveNote(biome.scaleRoot + 12, biome.scaleIntervals, slice.pitchDegree, slice.octave),
        ];
      } else if (slice.kind === "perc" && ring.role === "perc") {
        pitches = [GM_DRUMS[slice.drumSlot]];
      }

      if (pitches.length === 0) return;

      const duration = slice.tie ? "2" : "8";
      const event = new MidiWriter.NoteEvent({
        pitch: pitches as unknown as number[],
        duration,
        velocity,
        startTick,
        channel: ring.role === "perc" ? 10 : 1,
      });
      track.addEvent(event);
    });

    tracks.push(track);
  });

  if (tracks.length === 0) return;

  const writer = new MidiWriter.Writer(tracks);
  const dataUri = writer.dataUri();

  const a = document.createElement("a");
  a.href = dataUri;
  a.download = `${filename}.mid`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
