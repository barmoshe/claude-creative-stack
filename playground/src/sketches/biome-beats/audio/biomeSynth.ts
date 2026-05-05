import * as Tone from "tone";
import type { BiomeId } from "../data/biomes";
import { BIOMES } from "../data/biomes";

export interface BiomeChordChain {
  poly: Tone.PolySynth;
  output: Tone.Gain;
  dispose: () => void;
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function createChordChain(biomeId: BiomeId): BiomeChordChain {
  const cap = BIOMES[biomeId].polyphonyCap;
  const output = new Tone.Gain(0.5).toDestination();

  switch (biomeId) {
    case "space": {
      const reverb = new Tone.Reverb({ decay: 5, preDelay: 0.05, wet: 0.55 });
      const delay = new Tone.FeedbackDelay({ delayTime: 0.32, feedback: 0.42, wet: 0.32 });
      const filter = new Tone.Filter({ type: "lowpass", frequency: 4200, Q: 0.6 });
      const poly = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.5, decay: 0.4, sustain: 0.4, release: 1.8 },
      });
      poly.maxPolyphony = cap;
      poly.chain(filter, delay, reverb, output);
      return {
        poly,
        output,
        dispose: () => {
          poly.dispose();
          filter.dispose();
          delay.dispose();
          reverb.dispose();
          output.dispose();
        },
      };
    }
    case "jungle": {
      const reverb = new Tone.Reverb({ decay: 2.4, preDelay: 0.02, wet: 0.32 });
      const chorus = new Tone.Chorus({
        frequency: 1.5,
        delayTime: 3,
        depth: 0.55,
        wet: 0.45,
      }).start();
      const filter = new Tone.Filter({ type: "lowpass", frequency: 5200, Q: 0.7 });
      const poly = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.06, decay: 0.5, sustain: 0.4, release: 1.0 },
      });
      poly.maxPolyphony = cap;
      poly.chain(filter, chorus, reverb, output);
      return {
        poly,
        output,
        dispose: () => {
          poly.dispose();
          filter.dispose();
          chorus.dispose();
          reverb.dispose();
          output.dispose();
        },
      };
    }
    case "sea": {
      const reverb = new Tone.Reverb({ decay: 6, preDelay: 0.08, wet: 0.5 });
      const tremolo = new Tone.Tremolo({ frequency: 0.4, depth: 0.3 }).start();
      const filter = new Tone.Filter({ type: "lowpass", frequency: 3600, Q: 0.5 });
      const lfo = new Tone.LFO({ frequency: 0.2, min: 2400, max: 4400 });
      lfo.connect(filter.frequency);
      lfo.start();
      const poly = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.35, decay: 0.6, sustain: 0.5, release: 2.2 },
      });
      poly.maxPolyphony = cap;
      poly.chain(filter, tremolo, reverb, output);
      return {
        poly,
        output,
        dispose: () => {
          poly.dispose();
          filter.dispose();
          tremolo.dispose();
          lfo.dispose();
          reverb.dispose();
          output.dispose();
        },
      };
    }
    case "cyberpunk": {
      const reverb = new Tone.Reverb({ decay: 1.4, preDelay: 0.01, wet: 0.22 });
      const distortion = new Tone.Distortion({ distortion: 0.45, wet: 0.7 });
      const filter = new Tone.Filter({ type: "lowpass", frequency: 3400, Q: 1.6 });
      const poly = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.015, decay: 0.25, sustain: 0.3, release: 0.45 },
      });
      poly.maxPolyphony = cap;
      poly.chain(filter, distortion, reverb, output);
      return {
        poly,
        output,
        dispose: () => {
          poly.dispose();
          filter.dispose();
          distortion.dispose();
          reverb.dispose();
          output.dispose();
        },
      };
    }
    case "tundra": {
      const reverb = new Tone.Reverb({ decay: 8, preDelay: 0.1, wet: 0.6 });
      const shimmer = new Tone.PitchShift({ pitch: 12, wet: 0.18 });
      const hp = new Tone.Filter({ type: "highpass", frequency: 220 });
      const poly = new Tone.PolySynth(Tone.AMSynth, {
        harmonicity: 2.5,
        oscillator: { type: "sine" },
        modulation: { type: "sine" },
        envelope: { attack: 0.5, decay: 0.5, sustain: 0.45, release: 2.4 },
        modulationEnvelope: {
          attack: 0.3,
          decay: 0.5,
          sustain: 0.3,
          release: 1.4,
        },
      });
      poly.maxPolyphony = cap;
      poly.chain(hp, shimmer, reverb, output);
      return {
        poly,
        output,
        dispose: () => {
          poly.dispose();
          hp.dispose();
          shimmer.dispose();
          reverb.dispose();
          output.dispose();
        },
      };
    }
  }
}
