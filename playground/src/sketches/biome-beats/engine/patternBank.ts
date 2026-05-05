import type { Pattern } from "./pattern";
import { createPattern } from "./pattern";

export const BANK_SIZE = 8;

export interface PatternBank {
  patterns: Pattern[];
  activeIndex: number;
}

export function createPatternBank(): PatternBank {
  return {
    patterns: Array.from({ length: BANK_SIZE }, () => createPattern("space")),
    activeIndex: 0,
  };
}

export function activePattern(bank: PatternBank): Pattern {
  return bank.patterns[bank.activeIndex];
}

export function setActiveIndex(bank: PatternBank, idx: number): PatternBank {
  const clamped = Math.max(0, Math.min(BANK_SIZE - 1, idx));
  if (clamped === bank.activeIndex) return bank;
  return { ...bank, activeIndex: clamped };
}

export function updatePattern(
  bank: PatternBank,
  idx: number,
  updater: (p: Pattern) => Pattern,
): PatternBank {
  if (idx < 0 || idx >= BANK_SIZE) return bank;
  const next = bank.patterns.slice();
  next[idx] = updater(bank.patterns[idx]);
  return { ...bank, patterns: next };
}
