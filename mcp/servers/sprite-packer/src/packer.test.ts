import { describe, it, expect } from "vitest";
import { PNG } from "pngjs";
import { shelfPack, buildManifest } from "./packer.js";
import type { FrameSpec } from "./packer.js";

function makeFrame(name: string, w: number, h: number): FrameSpec {
  const png = new PNG({ width: w, height: h });
  png.data.fill(255);
  return { name, width: w, height: h, png };
}

describe("shelfPack", () => {
  it("places a single frame at origin", () => {
    const r = shelfPack([makeFrame("a", 32, 32)], 4096, 2);
    expect(r.placed).toHaveLength(1);
    expect(r.placed[0].x).toBe(0);
    expect(r.placed[0].y).toBe(0);
  });

  it("wraps to a new shelf when width is exceeded", () => {
    const frames = Array.from({ length: 5 }, (_, i) => makeFrame(`f${i}`, 100, 50));
    const r = shelfPack(frames, 220, 0);   // fits 2 per shelf
    const ys = new Set(r.placed.map(p => p.y));
    expect(ys.size).toBeGreaterThan(1);
  });

  it("returns a power-of-two atlas size", () => {
    const frames = Array.from({ length: 3 }, (_, i) => makeFrame(`f${i}`, 30, 30));
    const r = shelfPack(frames, 4096, 2);
    const isPow2 = (n: number) => (n & (n - 1)) === 0;
    expect(isPow2(r.width)).toBe(true);
    expect(isPow2(r.height)).toBe(true);
  });

  it("preserves all frames", () => {
    const frames = Array.from({ length: 17 }, (_, i) => makeFrame(`f${i}`, (i + 1) * 4, (i + 1) * 4));
    const r = shelfPack(frames, 256, 1);
    expect(r.placed).toHaveLength(17);
    expect(new Set(r.placed.map(p => p.name)).size).toBe(17);
  });
});

describe("buildManifest", () => {
  it("emits Phaser/Pixi-compatible shape", () => {
    const frames = [makeFrame("a", 32, 32), makeFrame("b", 16, 16)];
    const r = shelfPack(frames, 4096, 2);
    const m = buildManifest(r, 2, "atlas.png");
    expect(m.meta.image).toBe("atlas.png");
    expect(m.meta.size.w).toBe(r.width);
    expect(m.frames.a.frame.w).toBe(32);
    expect(m.frames.b.frame.w).toBe(16);
    expect(m.frames.a.pivot).toEqual({ x: 0.5, y: 1.0 });
  });
});
