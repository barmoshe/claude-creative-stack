import type { ChordQuality, ChordSize, Inversion, Voicing } from "./sliceState";

export interface ChordResolverInput {
  degree: number;
  octaveOffset: number;
  chordSize: ChordSize;
  chordQuality: ChordQuality;
  inversion: Inversion;
  voicing: Voicing;
  scaleRoot: number;
  scaleIntervals: readonly number[];
}

const QUALITY_INTERVALS: Record<Exclude<ChordQuality, "auto">, readonly number[]> = {
  major: [0, 4, 7, 11, 14],
  minor: [0, 3, 7, 10, 14],
  dim:   [0, 3, 6, 9, 12],
  aug:   [0, 4, 8, 11, 14],
  sus2:  [0, 2, 7, 11, 14],
  sus4:  [0, 5, 7, 11, 14],
};

export function scaleNoteAt(
  scaleRoot: number,
  scaleIntervals: readonly number[],
  degreeZeroIndexed: number,
): number {
  const len = scaleIntervals.length;
  const octaveShift = Math.floor(degreeZeroIndexed / len);
  const within = ((degreeZeroIndexed % len) + len) % len;
  return scaleRoot + scaleIntervals[within] + 12 * octaveShift;
}

function diatonicStack(
  scaleRoot: number,
  scaleIntervals: readonly number[],
  degreeZeroIndexed: number,
  size: number,
): number[] {
  return Array.from({ length: size }, (_, i) =>
    scaleNoteAt(scaleRoot, scaleIntervals, degreeZeroIndexed + i * 2),
  );
}

function fixedQualityChord(
  rootMidi: number,
  quality: Exclude<ChordQuality, "auto">,
  size: number,
): number[] {
  const intervals = QUALITY_INTERVALS[quality];
  return Array.from({ length: size }, (_, i) => rootMidi + intervals[i]);
}

function applyInversion(notes: number[], inversion: number): number[] {
  if (inversion === 0 || notes.length < 2) return notes.slice();
  const out = notes.slice();
  for (let i = 0; i < inversion && i < out.length - 1; i++) {
    out[i] = out[i] + 12;
  }
  return out.sort((a, b) => a - b);
}

function applyVoicing(notes: number[], voicing: Voicing): number[] {
  if (notes.length < 2) return notes.slice();
  const sorted = notes.slice().sort((a, b) => a - b);
  const computed: number[] = (() => {
    switch (voicing) {
      case "close":
        return sorted;
      case "open":
        return sorted.map((n, i) => (i % 2 === 1 ? n + 12 : n));
      case "drop2": {
        const dropIdx = sorted.length - 2;
        return sorted.map((n, i) => (i === dropIdx ? n - 12 : n));
      }
      case "spread":
        return sorted.map((n, i) => n + i * 5);
      case "shell":
        if (sorted.length <= 2) return sorted;
        return [sorted[0], sorted[Math.floor(sorted.length / 2)], sorted[sorted.length - 1]];
    }
  })();
  return computed.slice().sort((a, b) => a - b);
}

export function resolveChord(input: ChordResolverInput): number[] {
  const {
    degree,
    octaveOffset,
    chordSize,
    chordQuality,
    inversion,
    voicing,
    scaleRoot,
    scaleIntervals,
  } = input;
  const degreeZero = degree - 1;
  const baseRoot = scaleNoteAt(scaleRoot, scaleIntervals, degreeZero);
  const raw =
    chordQuality === "auto"
      ? diatonicStack(scaleRoot, scaleIntervals, degreeZero, chordSize)
      : fixedQualityChord(baseRoot, chordQuality, chordSize);
  return applyVoicing(applyInversion(raw, inversion), voicing).map(
    (n) => n + octaveOffset * 12,
  );
}

export function resolveNote(
  scaleRoot: number,
  scaleIntervals: readonly number[],
  degree: number,
  octaveOffset: number,
): number {
  return scaleNoteAt(scaleRoot, scaleIntervals, degree - 1) + octaveOffset * 12;
}
