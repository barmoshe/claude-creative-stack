import * as Tone from "tone";
import type { BiomeId } from "../data/biomes";

export interface BassVoice {
  play(freqHz: number, duration: string, time: number, velocity: number): void;
  dispose(): void;
}

export function createBassVoice(biomeId: BiomeId): BassVoice {
  const output = new Tone.Gain(0.7).toDestination();
  const synth = new Tone.MonoSynth({
    oscillator: { type: biomeId === "cyberpunk" ? "sawtooth" : "triangle" },
    filter: { Q: 2, frequency: biomeId === "cyberpunk" ? 1200 : 700, type: "lowpass" },
    envelope: { attack: 0.04, decay: 0.3, sustain: 0.35, release: 0.5 },
    filterEnvelope: {
      attack: 0.02,
      decay: 0.2,
      sustain: 0.3,
      release: 0.4,
      baseFrequency: 80,
      octaves: 2.5,
    },
  });
  synth.connect(output);

  return {
    play(freq, duration, time, velocity) {
      synth.triggerAttackRelease(freq, duration, time, velocity);
    },
    dispose() {
      synth.dispose();
      output.dispose();
    },
  };
}
