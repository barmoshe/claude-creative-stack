export type ChordQuality = "auto" | "major" | "minor" | "dim" | "aug" | "sus2" | "sus4";
export type Voicing = "close" | "open" | "drop2" | "spread" | "shell";
export type DrumSlot = 0 | 1 | 2 | 3 | 4;
export type ChordSize = 1 | 2 | 3 | 4 | 5;
export type Inversion = 0 | 1 | 2 | 3;

export interface BaseSlice {
  active: boolean;
  velocity: number;
  microtiming: number;
  accent: boolean;
  tie: boolean;
  mute: boolean;
}

export interface ChordSlice extends BaseSlice {
  kind: "chord";
  pitchDegree: number;
  octave: number;
  chordSize: ChordSize;
  chordQuality: ChordQuality;
  inversion: Inversion;
  voicing: Voicing;
}

export interface NoteSlice extends BaseSlice {
  kind: "note";
  pitchDegree: number;
  octave: number;
}

export interface PercSlice extends BaseSlice {
  kind: "perc";
  drumSlot: DrumSlot;
}

export type Slice = ChordSlice | NoteSlice | PercSlice;

export function createChordSlice(): ChordSlice {
  return {
    kind: "chord",
    active: false,
    pitchDegree: 1,
    octave: 0,
    chordSize: 3,
    chordQuality: "auto",
    inversion: 0,
    voicing: "close",
    velocity: 100,
    microtiming: 0,
    accent: false,
    tie: false,
    mute: false,
  };
}

export function createNoteSlice(): NoteSlice {
  return {
    kind: "note",
    active: false,
    pitchDegree: 1,
    octave: 0,
    velocity: 100,
    microtiming: 0,
    accent: false,
    tie: false,
    mute: false,
  };
}

export function createPercSlice(slot: DrumSlot = 0): PercSlice {
  return {
    kind: "perc",
    active: false,
    drumSlot: slot,
    velocity: 100,
    microtiming: 0,
    accent: false,
    tie: false,
    mute: false,
  };
}
