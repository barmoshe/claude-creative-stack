import { describe, it, expect } from "vitest";
import { generateImage, generateVoice, generateMusic, generateVideo } from "./providers.js";

describe("stub mode (no env keys)", () => {
  const env = {} as NodeJS.ProcessEnv;

  it("generateImage returns deterministic stubs", async () => {
    const a = await generateImage({ prompt: "cozy farm", count: 3 }, "flux-1.1-pro", env);
    const b = await generateImage({ prompt: "cozy farm", count: 3 }, "flux-1.1-pro", env);
    expect(a).toHaveLength(3);
    expect(a.every(r => r.is_stub)).toBe(true);
    expect(a.map(r => r.seed)).toEqual(b.map(r => r.seed));
  });

  it("generateVoice returns a single stub", async () => {
    const r = await generateVoice({ text: "hello" }, "eleven_multilingual_v2", env);
    expect(r).toHaveLength(1);
    expect(r[0].is_stub).toBe(true);
  });

  it("generateMusic returns a stub", async () => {
    const r = await generateMusic({ prompt: "lo-fi", duration_s: 60, instrumental: true }, "v4.5-inst", env);
    expect(r[0].is_stub).toBe(true);
    expect(r[0].duration_s).toBe(60);
  });

  it("generateVideo returns a stub", async () => {
    const r = await generateVideo({ prompt: "a wave", duration_s: 5, ratio: "16:9" }, "ray-2", env);
    expect(r[0].is_stub).toBe(true);
    expect(r[0].duration_s).toBe(5);
  });
});
