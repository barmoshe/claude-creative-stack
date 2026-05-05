import * as Tone from "tone";
import type { Pattern } from "../engine/pattern";
import { ringStepCrossed } from "../engine/ring";
import { resolveChord, resolveNote } from "../engine/chordResolver";
import { BIOMES } from "../data/biomes";
import { onBarPhase } from "./transport";
import { createChordChain, midiToFreq, type BiomeChordChain } from "./biomeSynth";
import { createBassVoice, type BassVoice } from "./bassVoice";
import { createMelodyVoice, type MelodyVoice } from "./melodyVoice";
import { createPercKit, type PercKit } from "./percKit";
import type { BiomeId } from "../data/biomes";

export type ActiveStepListener = (ringIdx: number, sliceIdx: number) => void;

export interface AudioOrchestrator {
  setPattern(p: Pattern): void;
  dispose(): void;
}

interface VoiceBundle {
  chord: BiomeChordChain;
  bass: BassVoice;
  melody: MelodyVoice;
  perc: PercKit;
  biome: BiomeId;
}

export function createOrchestrator(
  initial: Pattern,
  onActiveStep?: ActiveStepListener,
): AudioOrchestrator {
  let pattern = initial;
  let voices: VoiceBundle | null = null;

  function ensureVoices(): VoiceBundle {
    if (voices && voices.biome === pattern.biomeId) return voices;
    voices?.chord.dispose();
    voices?.bass.dispose();
    voices?.melody.dispose();
    voices?.perc.dispose();
    voices = {
      chord: createChordChain(pattern.biomeId),
      bass: createBassVoice(pattern.biomeId),
      melody: createMelodyVoice(pattern.biomeId),
      perc: createPercKit(pattern.biomeId),
      biome: pattern.biomeId,
    };
    return voices;
  }

  const unsubscribe = onBarPhase((cur, prev, time) => {
    const biome = BIOMES[pattern.biomeId];
    const v = ensureVoices();

    pattern.rings.forEach((ring, ringIdx) => {
      const crossed = ringStepCrossed(ring, prev, cur);
      if (crossed === null) return;
      const slice = ring.slices[crossed];

      const triggerTime = time + slice.microtiming / 1000;

      if (onActiveStep) {
        Tone.Draw.schedule(() => {
          onActiveStep(ringIdx, crossed);
        }, triggerTime);
      }

      if (!slice.active || slice.mute) return;

      const accentMul = slice.accent ? 1.2 : 1.0;
      const velocity = Math.min(1, (slice.velocity / 127) * accentMul);
      const duration = slice.tie ? "2n" : "8n";

      if (slice.kind === "chord" && ring.role === "chord") {
        const notes = resolveChord({
          degree: slice.pitchDegree,
          octaveOffset: slice.octave,
          chordSize: slice.chordSize,
          chordQuality: slice.chordQuality,
          inversion: slice.inversion,
          voicing: slice.voicing,
          scaleRoot: biome.scaleRoot,
          scaleIntervals: biome.scaleIntervals,
        });
        v.chord.poly.triggerAttackRelease(
          notes.map(midiToFreq),
          duration,
          triggerTime,
          velocity,
        );
      } else if (slice.kind === "note" && ring.role === "bass") {
        const note = resolveNote(
          biome.scaleRoot - 24,
          biome.scaleIntervals,
          slice.pitchDegree,
          slice.octave,
        );
        v.bass.play(midiToFreq(note), duration, triggerTime, velocity);
      } else if (slice.kind === "note" && ring.role === "melody") {
        const note = resolveNote(
          biome.scaleRoot + 12,
          biome.scaleIntervals,
          slice.pitchDegree,
          slice.octave,
        );
        v.melody.play(midiToFreq(note), duration, triggerTime, velocity);
      } else if (slice.kind === "perc" && ring.role === "perc") {
        v.perc.play(slice.drumSlot, triggerTime, velocity);
      }
    });
  });

  return {
    setPattern(p) {
      pattern = p;
    },
    dispose() {
      unsubscribe();
      voices?.chord.dispose();
      voices?.bass.dispose();
      voices?.melody.dispose();
      voices?.perc.dispose();
      voices = null;
    },
  };
}
