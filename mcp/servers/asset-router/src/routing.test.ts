import { describe, it, expect } from "vitest";
import { pickRoute, unitCount } from "./routing.js";

describe("pickRoute", () => {
  it("photoreal image → Flux", () => {
    const r = pickRoute({ task: "image", style: "photoreal" });
    expect(r.provider).toBe("replicate");
    expect(r.model).toContain("flux");
  });

  it("vector image → Recraft SVG", () => {
    const r = pickRoute({ task: "image", style: "vector" });
    expect(r.model).toContain("recraft-v3-svg");
  });

  it("ideation image → cheap SDXL Lightning", () => {
    const r = pickRoute({ task: "image", style: "ideation" });
    expect(r.cost_cents_per_unit).toBeLessThan(1);
  });

  it("voice → ElevenLabs", () => {
    const r = pickRoute({ task: "voice" });
    expect(r.provider).toBe("elevenlabs");
  });

  it("instrumental music → Suno inst", () => {
    const r = pickRoute({ task: "music", instrumental: true });
    expect(r.model).toContain("inst");
  });

  it("vocal music → Suno main", () => {
    const r = pickRoute({ task: "music", instrumental: false });
    expect(r.provider).toBe("suno");
    expect(r.model).not.toContain("inst");
  });

  it("short video → Luma", () => {
    const r = pickRoute({ task: "video", duration_s: 4 });
    expect(r.provider).toBe("luma");
  });

  it("long video → Runway", () => {
    const r = pickRoute({ task: "video", duration_s: 10 });
    expect(r.provider).toBe("runway");
  });

  it("explicit provider overrides", () => {
    const r = pickRoute({ task: "image", provider: "replicate" });
    expect(r.provider).toBe("replicate");
  });
});

describe("unitCount", () => {
  it("counts images", () => {
    const r = pickRoute({ task: "image", style: "photoreal" });
    expect(unitCount({ task: "image", style: "photoreal" }, { count: 4 }, r)).toBe(4);
  });

  it("counts characters for voice", () => {
    const r = pickRoute({ task: "voice" });
    expect(unitCount({ task: "voice" }, { text: "hello world" }, r)).toBe(11);
  });

  it("counts seconds for video", () => {
    const r = pickRoute({ task: "video", duration_s: 10 });
    expect(unitCount({ task: "video" }, { duration_s: 10 }, r)).toBe(10);
  });

  it("counts songs for music", () => {
    const r = pickRoute({ task: "music", instrumental: true });
    expect(unitCount({ task: "music" }, { count: 2 }, r)).toBe(2);
  });
});
