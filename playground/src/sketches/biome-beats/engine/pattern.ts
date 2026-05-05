import type { Ring } from "./ring";
import { createRing } from "./ring";
import type { BiomeId } from "../data/biomes";
import { BIOMES } from "../data/biomes";

export type TimeSigDenominator = 2 | 4 | 8 | 16;

export interface Pattern {
  rings: Ring[];
  biomeId: BiomeId;
  timeSigNumerator: number;
  timeSigDenominator: TimeSigDenominator;
  bpm: number;
}

export const RING_COUNT = 4;

export function createPattern(biomeId: BiomeId = "space"): Pattern {
  return {
    rings: [
      createRing("chord", 8, true),
      createRing("bass", 6, false),
      createRing("melody", 7, false),
      createRing("perc", 8, false),
    ],
    biomeId,
    timeSigNumerator: 4,
    timeSigDenominator: 4,
    bpm: BIOMES[biomeId].defaultBpm,
  };
}

export function toggleSliceActive(
  pattern: Pattern,
  ringIdx: number,
  sliceIdx: number,
): Pattern {
  if (ringIdx < 0 || ringIdx >= pattern.rings.length) return pattern;
  const ring = pattern.rings[ringIdx];
  if (sliceIdx < 0 || sliceIdx >= ring.slices.length) return pattern;
  const nextRings = pattern.rings.slice();
  nextRings[ringIdx] = {
    ...ring,
    slices: ring.slices.map((s, si) =>
      si === sliceIdx ? { ...s, active: !s.active } : s,
    ),
  };
  return { ...pattern, rings: nextRings };
}

export function setSliceField<K extends string, V>(
  pattern: Pattern,
  ringIdx: number,
  sliceIdx: number,
  field: K,
  value: V,
): Pattern {
  if (ringIdx < 0 || ringIdx >= pattern.rings.length) return pattern;
  const ring = pattern.rings[ringIdx];
  if (sliceIdx < 0 || sliceIdx >= ring.slices.length) return pattern;
  const nextRings = pattern.rings.slice();
  nextRings[ringIdx] = {
    ...ring,
    slices: ring.slices.map((s, si) =>
      si === sliceIdx ? ({ ...s, [field]: value } as typeof s) : s,
    ),
  };
  return { ...pattern, rings: nextRings };
}
