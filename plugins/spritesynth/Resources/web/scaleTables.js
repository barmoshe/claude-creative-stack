// scaleTables.js — JS port of Source/ScaleTables.h.
// hue (0..360) + root (0..11) + octave (1..6) + scale enum → MIDI note (0..127).

const SCALES = [
  /* PentMaj  */ [0, 2, 4, 7, 9],
  /* PentMin  */ [0, 3, 5, 7, 10],
  /* Dorian   */ [0, 2, 3, 5, 7, 9, 10],
  /* Phrygian */ [0, 1, 3, 5, 7, 8, 10],
  /* Lydian   */ [0, 2, 4, 6, 7, 9, 11],
  /* Major    */ [0, 2, 4, 5, 7, 9, 11],
  /* Minor    */ [0, 2, 3, 5, 7, 8, 10],
  /* Chromatic*/ [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
];

export const hueToMidi = (hue, rootPc = 0, octave = 4, scaleIdx = 0) => {
  const sc = SCALES[Math.max(0, Math.min(SCALES.length - 1, scaleIdx | 0))];
  const normHue = ((hue % 360) + 360) % 360;
  let idx = Math.floor((normHue / 360) * sc.length);
  if (idx < 0) idx = 0;
  if (idx >= sc.length) idx = sc.length - 1;
  const pitch = (octave * 12) + (rootPc | 0) + sc[idx];
  return Math.max(0, Math.min(127, pitch));
};
