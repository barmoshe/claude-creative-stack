import { describe, it, expect } from "vitest";
import {
  createPatternBank,
  activePattern,
  setActiveIndex,
  updatePattern,
  BANK_SIZE,
} from "../engine/patternBank";

describe("createPatternBank", () => {
  it("creates 8 patterns with active=0", () => {
    const bank = createPatternBank();
    expect(bank.patterns.length).toBe(BANK_SIZE);
    expect(bank.activeIndex).toBe(0);
  });

  it("each pattern has 4 rings", () => {
    const bank = createPatternBank();
    for (const p of bank.patterns) {
      expect(p.rings.length).toBe(4);
    }
  });
});

describe("setActiveIndex", () => {
  it("changes active index", () => {
    const bank = setActiveIndex(createPatternBank(), 3);
    expect(bank.activeIndex).toBe(3);
  });

  it("clamps to range", () => {
    expect(setActiveIndex(createPatternBank(), 100).activeIndex).toBe(BANK_SIZE - 1);
    expect(setActiveIndex(createPatternBank(), -1).activeIndex).toBe(0);
  });

  it("returns same bank if index unchanged", () => {
    const bank = createPatternBank();
    expect(setActiveIndex(bank, 0)).toBe(bank);
  });
});

describe("updatePattern", () => {
  it("updates one pattern, preserves others", () => {
    const bank = createPatternBank();
    const next = updatePattern(bank, 2, (p) => ({ ...p, bpm: 200 }));
    expect(next.patterns[2].bpm).toBe(200);
    expect(next.patterns[0].bpm).not.toBe(200);
    expect(next.patterns[2]).not.toBe(bank.patterns[2]);
    expect(next.patterns[0]).toBe(bank.patterns[0]);
  });

  it("ignores out-of-range index", () => {
    const bank = createPatternBank();
    expect(updatePattern(bank, 100, (p) => p)).toBe(bank);
    expect(updatePattern(bank, -1, (p) => p)).toBe(bank);
  });
});

describe("activePattern", () => {
  it("returns the pattern at activeIndex", () => {
    let bank = createPatternBank();
    bank = updatePattern(bank, 1, (p) => ({ ...p, bpm: 150 }));
    bank = setActiveIndex(bank, 1);
    expect(activePattern(bank).bpm).toBe(150);
  });
});
