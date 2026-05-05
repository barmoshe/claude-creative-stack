import type { Slice, DrumSlot } from "./sliceState";
import { createChordSlice, createNoteSlice, createPercSlice } from "./sliceState";

export type RingRole = "chord" | "bass" | "melody" | "perc";

export interface Ring {
  enabled: boolean;
  role: RingRole;
  length: number;
  slices: Slice[];
  gain: number;
}

export const MIN_LENGTH = 3;
export const MAX_LENGTH = 32;

function createSliceForRole(role: RingRole, idx: number): Slice {
  switch (role) {
    case "chord":
      return createChordSlice();
    case "bass":
    case "melody":
      return createNoteSlice();
    case "perc":
      return createPercSlice((idx % 3) as DrumSlot);
  }
}

export function createRing(role: RingRole, length: number = 8, enabled = false): Ring {
  const clamped = Math.max(MIN_LENGTH, Math.min(MAX_LENGTH, length));
  return {
    enabled,
    role,
    length: clamped,
    slices: Array.from({ length: clamped }, (_, i) => createSliceForRole(role, i)),
    gain: 0.8,
  };
}

export function resizeRing(ring: Ring, newLength: number): Ring {
  const clamped = Math.max(MIN_LENGTH, Math.min(MAX_LENGTH, newLength));
  if (clamped === ring.length) return ring;
  const slices: Slice[] = Array.from({ length: clamped }, (_, i) =>
    i < ring.slices.length ? ring.slices[i] : createSliceForRole(ring.role, i),
  );
  return { ...ring, length: clamped, slices };
}

export function ringSliceIndexAt(ring: Ring, barPhase: number): number {
  const phase = ((barPhase % 1) + 1) % 1;
  return Math.floor(phase * ring.length);
}

export function ringStepCrossed(
  ring: Ring,
  prevBarPhase: number,
  curBarPhase: number,
): number | null {
  if (!ring.enabled) return null;
  const prevIdx = ringSliceIndexAt(ring, prevBarPhase);
  const curIdx = ringSliceIndexAt(ring, curBarPhase);
  if (prevIdx === curIdx) return null;
  return curIdx;
}
