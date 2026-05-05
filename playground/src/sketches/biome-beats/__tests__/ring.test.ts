import { describe, it, expect } from "vitest";
import {
  createRing,
  ringSliceIndexAt,
  ringStepCrossed,
  resizeRing,
  MIN_LENGTH,
  MAX_LENGTH,
} from "../engine/ring";

describe("createRing", () => {
  it("creates a ring with the right number of slices", () => {
    const ring = createRing("chord", 8);
    expect(ring.length).toBe(8);
    expect(ring.slices.length).toBe(8);
    expect(ring.role).toBe("chord");
    expect(ring.enabled).toBe(false);
  });

  it("clamps length to MIN/MAX", () => {
    expect(createRing("bass", 1).length).toBe(MIN_LENGTH);
    expect(createRing("bass", 999).length).toBe(MAX_LENGTH);
  });

  it("creates kind-appropriate slices per role", () => {
    expect(createRing("chord", 4).slices[0].kind).toBe("chord");
    expect(createRing("bass", 4).slices[0].kind).toBe("note");
    expect(createRing("melody", 4).slices[0].kind).toBe("note");
    expect(createRing("perc", 4).slices[0].kind).toBe("perc");
  });
});

describe("ringSliceIndexAt", () => {
  it("returns 0 at phase 0", () => {
    expect(ringSliceIndexAt(createRing("chord", 8), 0)).toBe(0);
  });

  it("returns last slice just before bar end", () => {
    expect(ringSliceIndexAt(createRing("chord", 8), 0.999)).toBe(7);
  });

  it("wraps phases >= 1", () => {
    expect(ringSliceIndexAt(createRing("chord", 8), 1.0)).toBe(0);
    expect(ringSliceIndexAt(createRing("chord", 8), 1.5)).toBe(4);
  });

  it("polyrhythmic ring lengths produce different indices at the same phase", () => {
    const r5 = createRing("chord", 5);
    const r4 = createRing("bass", 4);
    expect(ringSliceIndexAt(r5, 0.625)).toBe(3);
    expect(ringSliceIndexAt(r4, 0.625)).toBe(2);
  });
});

describe("ringStepCrossed", () => {
  it("returns null when no crossing", () => {
    const ring = { ...createRing("chord", 8), enabled: true };
    expect(ringStepCrossed(ring, 0.0, 0.1)).toBe(null);
  });

  it("returns new index on crossing", () => {
    const ring = { ...createRing("chord", 8), enabled: true };
    expect(ringStepCrossed(ring, 0.12, 0.13)).toBe(1);
  });

  it("returns null if disabled", () => {
    const ring = { ...createRing("chord", 8), enabled: false };
    expect(ringStepCrossed(ring, 0.12, 0.13)).toBe(null);
  });
});

describe("resizeRing", () => {
  it("returns same ring if length unchanged", () => {
    const ring = createRing("chord", 8);
    expect(resizeRing(ring, 8)).toBe(ring);
  });

  it("clamps to MIN/MAX", () => {
    expect(resizeRing(createRing("chord", 8), 1).length).toBe(MIN_LENGTH);
    expect(resizeRing(createRing("chord", 8), 999).length).toBe(MAX_LENGTH);
  });

  it("preserves existing slices when growing", () => {
    const ring = createRing("chord", 4);
    const slice0 = ring.slices[0];
    if (slice0.kind === "chord") slice0.active = true;
    const grown = resizeRing(ring, 6);
    expect(grown.slices.length).toBe(6);
    expect(grown.slices[0].active).toBe(true);
    expect(grown.slices[4].active).toBe(false);
  });

  it("truncates when shrinking", () => {
    const shrunk = resizeRing(createRing("chord", 8), 4);
    expect(shrunk.length).toBe(4);
    expect(shrunk.slices.length).toBe(4);
  });
});
