import * as Tone from "tone";
import type { BiomeId } from "../data/biomes";

export interface MelodyVoice {
  play(freqHz: number, duration: string, time: number, velocity: number): void;
  dispose(): void;
}

const TIMBRES: Record<BiomeId, OscillatorType> = {
  space: "sine",
  jungle: "triangle",
  sea: "sine",
  cyberpunk: "sawtooth",
  tundra: "square",
};

export function createMelodyVoice(biomeId: BiomeId): MelodyVoice {
  const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 });
  const output = new Tone.Gain(0.55).toDestination();
  const synth = new Tone.MonoSynth({
    oscillator: { type: TIMBRES[biomeId] },
    filter: { Q: 1.2, frequency: 2400, type: "lowpass" },
    envelope: { attack: 0.02, decay: 0.4, sustain: 0.5, release: 0.7 },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.4,
      release: 0.5,
      baseFrequency: 600,
      octaves: 2,
    },
  });
  synth.chain(reverb, output);

  return {
    play(freq, duration, time, velocity) {
      synth.triggerAttackRelease(freq, duration, time, velocity);
    },
    dispose() {
      synth.dispose();
      reverb.dispose();
      output.dispose();
    },
  };
}
