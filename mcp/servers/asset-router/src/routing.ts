/**
 * Provider routing rules. First matching rule wins.
 *
 * Each rule says: if the request looks like X, send it to provider Y on model Z.
 * Users can override by passing `provider` explicitly on the tool call.
 *
 * The cost numbers are MAY-2026 ballparks for capacity planning only.
 * `estimate_cost` always re-quotes from the provider when keys are present.
 */

export type Task = "image" | "voice" | "music" | "video";
export type Provider = "replicate" | "fal" | "elevenlabs" | "suno" | "luma" | "runway" | "stub";

export interface RouteRule {
  when: Partial<{
    task: Task;
    style: string;
    instrumental: boolean;
    duration_s_lte: number;
    duration_s_gt: number;
  }>;
  provider: Provider;
  model: string;
  cost_cents_per_unit: number;     // approximate
  unit: "image" | "char" | "second" | "song";
}

export const ROUTES: RouteRule[] = [
  // Images
  { when: { task: "image", style: "photoreal" }, provider: "replicate", model: "black-forest-labs/flux-1.1-pro", cost_cents_per_unit: 4,   unit: "image" },
  { when: { task: "image", style: "stylized"  }, provider: "replicate", model: "recraft-ai/recraft-v3",          cost_cents_per_unit: 4,   unit: "image" },
  { when: { task: "image", style: "vector"    }, provider: "replicate", model: "recraft-ai/recraft-v3-svg",      cost_cents_per_unit: 4,   unit: "image" },
  { when: { task: "image", style: "pixel"     }, provider: "replicate", model: "lucataco/sdxl-pixel-art",        cost_cents_per_unit: 1,   unit: "image" },
  { when: { task: "image", style: "ideation"  }, provider: "replicate", model: "bytedance/sdxl-lightning-4step", cost_cents_per_unit: 0.3, unit: "image" },
  { when: { task: "image"                     }, provider: "replicate", model: "black-forest-labs/flux-1.1-pro", cost_cents_per_unit: 4,   unit: "image" },

  // Voice
  { when: { task: "voice" }, provider: "elevenlabs", model: "eleven_multilingual_v2", cost_cents_per_unit: 0.018, unit: "char" },

  // Music
  { when: { task: "music", instrumental: true  }, provider: "suno", model: "v4.5-inst", cost_cents_per_unit: 20, unit: "song" },
  { when: { task: "music", instrumental: false }, provider: "suno", model: "v4.5",      cost_cents_per_unit: 20, unit: "song" },
  { when: { task: "music"                       }, provider: "suno", model: "v4.5",      cost_cents_per_unit: 20, unit: "song" },

  // Video
  { when: { task: "video", duration_s_lte: 5 }, provider: "luma",   model: "ray-2",                cost_cents_per_unit: 8, unit: "second" },
  { when: { task: "video", duration_s_gt: 5  }, provider: "runway", model: "gen-3-alpha-turbo",    cost_cents_per_unit: 5, unit: "second" },
  { when: { task: "video"                     }, provider: "luma",   model: "ray-2",                cost_cents_per_unit: 8, unit: "second" },
];

export interface RouteRequest {
  task: Task;
  style?: string;
  instrumental?: boolean;
  duration_s?: number;
  provider?: Provider;
}

export function pickRoute(req: RouteRequest): RouteRule {
  if (req.provider) {
    const explicit = ROUTES.find(r => r.provider === req.provider && r.when.task === req.task);
    if (explicit) return explicit;
  }
  const match = ROUTES.find(r => {
    const w = r.when;
    if (w.task && w.task !== req.task) return false;
    if (w.style && w.style !== req.style) return false;
    if (typeof w.instrumental === "boolean" && w.instrumental !== !!req.instrumental) return false;
    if (w.duration_s_lte !== undefined && !(req.duration_s !== undefined && req.duration_s <= w.duration_s_lte)) return false;
    if (w.duration_s_gt !== undefined && !(req.duration_s !== undefined && req.duration_s > w.duration_s_gt)) return false;
    return true;
  });
  if (!match) throw new Error(`no route for ${JSON.stringify(req)}`);
  return match;
}

export function unitCount(req: RouteRequest, params: { count?: number; text?: string; duration_s?: number }, route: RouteRule): number {
  switch (route.unit) {
    case "image": return params.count ?? 1;
    case "char":  return (params.text?.length ?? 0);
    case "second":return params.duration_s ?? req.duration_s ?? 5;
    case "song":  return params.count ?? 1;
  }
}
