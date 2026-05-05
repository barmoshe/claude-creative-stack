import { describe, it, expect } from "vitest";
import { resolveChord, resolveNote, scaleNoteAt } from "../engine/chordResolver";
import { BIOMES } from "../data/biomes";

const SPACE = BIOMES.space;

describe("scaleNoteAt", () => {
  it("returns root for degree 0", () => {
    expect(scaleNoteAt(60, [0, 2, 4, 7, 9], 0)).toBe(60);
  });

  it("walks up the scale", () => {
    expect(scaleNoteAt(60, [0, 2, 4, 7, 9], 1)).toBe(62);
    expect(scaleNoteAt(60, [0, 2, 4, 7, 9], 4)).toBe(69);
  });

  it("wraps to next octave at scale length", () => {
    expect(scaleNoteAt(60, [0, 2, 4, 7, 9], 5)).toBe(72);
    expect(scaleNoteAt(60, [0, 2, 4, 7, 9], 7)).toBe(76);
  });

  it("handles negative indices", () => {
    expect(scaleNoteAt(60, [0, 2, 4, 7, 9], -1)).toBe(57);
  });
});

describe("resolveChord", () => {
  it("auto diatonic 3-note triad on Space pent degree 1", () => {
    const notes = resolveChord({
      degree: 1,
      octaveOffset: 0,
      chordSize: 3,
      chordQuality: "auto",
      inversion: 0,
      voicing: "close",
      scaleRoot: SPACE.scaleRoot,
      scaleIntervals: SPACE.scaleIntervals,
    });
    expect(notes).toEqual([69, 73, 78]);
  });

  it("respects octaveOffset", () => {
    const notes = resolveChord({
      degree: 1,
      octaveOffset: -1,
      chordSize: 1,
      chordQuality: "auto",
      inversion: 0,
      voicing: "close",
      scaleRoot: 60,
      scaleIntervals: [0, 4, 7],
    });
    expect(notes).toEqual([48]);
  });

  it("forces major quality regardless of scale", () => {
    const notes = resolveChord({
      degree: 1,
      octaveOffset: 0,
      chordSize: 3,
      chordQuality: "major",
      inversion: 0,
      voicing: "close",
      scaleRoot: 60,
      scaleIntervals: [0, 2, 3, 5, 7, 8, 10],
    });
    expect(notes).toEqual([60, 64, 67]);
  });

  it("first inversion moves root up an octave", () => {
    const notes = resolveChord({
      degree: 1,
      octaveOffset: 0,
      chordSize: 3,
      chordQuality: "major",
      inversion: 1,
      voicing: "close",
      scaleRoot: 60,
      scaleIntervals: [0, 4, 7],
    });
    expect(notes).toEqual([64, 67, 72]);
  });

  it("drop2 voicing drops 2nd-from-top by an octave", () => {
    const notes = resolveChord({
      degree: 1,
      octaveOffset: 0,
      chordSize: 4,
      chordQuality: "major",
      inversion: 0,
      voicing: "drop2",
      scaleRoot: 60,
      scaleIntervals: [0, 4, 7],
    });
    expect(notes).toEqual([55, 60, 64, 71]);
  });

  it("size=1 returns a single note", () => {
    const notes = resolveChord({
      degree: 1,
      octaveOffset: 0,
      chordSize: 1,
      chordQuality: "major",
      inversion: 0,
      voicing: "close",
      scaleRoot: 60,
      scaleIntervals: [0, 4, 7],
    });
    expect(notes).toEqual([60]);
  });

  it("shell voicing yields 3 notes from a 4-note chord", () => {
    const notes = resolveChord({
      degree: 1,
      octaveOffset: 0,
      chordSize: 4,
      chordQuality: "major",
      inversion: 0,
      voicing: "shell",
      scaleRoot: 60,
      scaleIntervals: [0, 4, 7],
    });
    expect(notes.length).toBe(3);
  });
});

describe("resolveNote", () => {
  it("returns the degree note in the scale", () => {
    expect(resolveNote(60, [0, 2, 4, 5, 7, 9, 11], 5, 0)).toBe(67);
  });

  it("respects octaveOffset", () => {
    expect(resolveNote(60, [0, 2, 4, 5, 7, 9, 11], 1, 1)).toBe(72);
  });
});
