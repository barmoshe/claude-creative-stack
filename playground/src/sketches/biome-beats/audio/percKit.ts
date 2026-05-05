import * as Tone from "tone";
import type { BiomeId } from "../data/biomes";
import type { DrumSlot } from "../engine/sliceState";

export interface PercKit {
  play(slot: DrumSlot, time: number, velocity: number): void;
  dispose(): void;
}

export function createPercKit(biomeId: BiomeId): PercKit {
  const output = new Tone.Gain(0.7).toDestination();

  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.2 },
  });
  const snare = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0 },
  });
  const hat = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.4,
  });
  const perc1 = new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 2,
    envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.3 },
  });
  const perc2 = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
    harmonicity: 3.1,
    modulationIndex: 8,
    resonance: 2000,
    octaves: 0.8,
  });

  if (biomeId === "cyberpunk") {
    const distortion = new Tone.Distortion(0.4);
    [kick, snare, perc1].forEach((s) => s.chain(distortion, output));
    [hat, perc2].forEach((s) => s.connect(output));
  } else if (biomeId === "tundra") {
    const reverb = new Tone.Reverb({ decay: 4, wet: 0.5 });
    [kick, snare, hat, perc1, perc2].forEach((s) => s.chain(reverb, output));
  } else {
    [kick, snare, hat, perc1, perc2].forEach((s) => s.connect(output));
  }

  return {
    play(slot, time, velocity) {
      switch (slot) {
        case 0:
          kick.triggerAttackRelease("C2", "8n", time, velocity);
          break;
        case 1:
          snare.triggerAttackRelease("16n", time, velocity);
          break;
        case 2:
          hat.triggerAttackRelease("32n", time, velocity * 0.4);
          break;
        case 3:
          perc1.triggerAttackRelease("E3", "16n", time, velocity);
          break;
        case 4:
          perc2.triggerAttackRelease("32n", time, velocity * 0.5);
          break;
      }
    },
    dispose() {
      kick.dispose();
      snare.dispose();
      hat.dispose();
      perc1.dispose();
      perc2.dispose();
      output.dispose();
    },
  };
}
