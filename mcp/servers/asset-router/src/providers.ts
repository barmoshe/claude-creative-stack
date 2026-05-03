/**
 * Provider proxies. Each function calls a real HTTP API when its env key is present;
 * otherwise it returns a deterministic stub that keeps recipes runnable offline.
 *
 * NOT exhaustive — each provider has many more knobs than this surface exposes.
 * The goal is the smallest set that covers the recipes in this repo.
 */
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";

export interface ProviderResult {
  url: string;                              // http(s):// or data: URI
  provider: string;
  model: string;
  seed?: number;
  duration_s?: number;
  cost_cents: number;
  license: string;
  is_stub: boolean;
  prompt: string;
}

function deterministicSeed(prompt: string, n = 0): number {
  const h = createHash("sha1").update(prompt + ":" + n).digest();
  return h.readUInt32BE(0);
}

// ---------------------------------------------------------------------------
// STUBS — deterministic outputs when API keys are missing.

function stubImage(prompt: string, model: string, count: number): ProviderResult[] {
  // 1×1 PNG of a hue derived from the prompt. Tiny payload; recipes can preview.
  return Array.from({ length: count }, (_, i) => {
    const seed = deterministicSeed(prompt, i);
    const hue = seed % 360;
    // Construct a 1×1 PNG manually so we have no extra deps.
    const data = Buffer.alloc(13 + 12 + 12 + 12, 0);
    // Use a data URL with an SVG instead — more visible than 1×1 PNG.
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='hsl(${hue} 70% 60%)'/><text x='32' y='34' text-anchor='middle' font-family='monospace' font-size='8' fill='white'>${seed.toString(16).slice(0,6)}</text></svg>`;
    return {
      url: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
      provider: "stub",
      model,
      seed,
      cost_cents: 0,
      license: "stub",
      is_stub: true,
      prompt,
    };
  });
}

function stubVoice(text: string, model: string): ProviderResult[] {
  // Empty WAV, base64-encoded.
  const wav = Buffer.from("UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=", "base64");
  return [{
    url: `data:audio/wav;base64,${wav.toString("base64")}`,
    provider: "stub",
    model,
    cost_cents: 0,
    license: "stub",
    is_stub: true,
    prompt: text,
  }];
}

function stubMusic(prompt: string, model: string, duration_s: number): ProviderResult[] {
  const wav = Buffer.from("UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=", "base64");
  return [{
    url: `data:audio/wav;base64,${wav.toString("base64")}`,
    provider: "stub",
    model,
    cost_cents: 0,
    license: "stub",
    is_stub: true,
    prompt,
    duration_s,
  }];
}

function stubVideo(prompt: string, model: string, duration_s: number): ProviderResult[] {
  // Tiny SVG-as-video placeholder. Real consumers should treat is_stub=true as "preview only".
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'><rect width='100%' height='100%' fill='black'/><text x='50%' y='50%' text-anchor='middle' fill='white' font-family='sans-serif' font-size='16'>video stub: ${prompt.slice(0,40)}</text></svg>`;
  return [{
    url: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
    provider: "stub",
    model,
    cost_cents: 0,
    license: "stub",
    is_stub: true,
    prompt,
    duration_s,
  }];
}

// ---------------------------------------------------------------------------
// REAL — minimal implementations; production callers should add proper retries / webhooks.

async function callReplicate(model: string, input: Record<string, unknown>, token: string): Promise<string[]> {
  const start = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: { "Authorization": `Token ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ version: model, input }),
  }).then(r => r.json() as Promise<{ id: string; status: string; output?: string[]; error?: string }>);
  let pred = start;
  for (let i = 0; i < 120 && (pred.status === "starting" || pred.status === "processing"); i++) {
    await new Promise(r => setTimeout(r, 1000));
    pred = await fetch(`https://api.replicate.com/v1/predictions/${start.id}`, {
      headers: { "Authorization": `Token ${token}` },
    }).then(r => r.json() as Promise<typeof start>);
  }
  if (pred.status !== "succeeded") throw new Error(pred.error || `replicate ${pred.status}`);
  return Array.isArray(pred.output) ? pred.output : [String(pred.output)];
}

async function callElevenLabs(text: string, voiceId: string, key: string): Promise<string> {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.30, use_speaker_boost: true },
    }),
  });
  if (!r.ok) throw new Error(`elevenlabs ${r.status} ${await r.text()}`);
  const buf = Buffer.from(await r.arrayBuffer());
  return `data:audio/mpeg;base64,${buf.toString("base64")}`;
}

// Suno / Luma / Runway omitted here — they use webhooks + auth flows we won't approximate well in
// a single file. The MCP exposes them via stub fallback; users can extend with real impls behind
// the same interface.

// ---------------------------------------------------------------------------
// Public API

export interface GenerateImageParams {
  prompt: string;
  count?: number;
  ratio?: string;
  seed?: number;
  model?: string;
}

export async function generateImage(params: GenerateImageParams, model: string, env: NodeJS.ProcessEnv): Promise<ProviderResult[]> {
  const count = params.count ?? 1;
  const token = env.REPLICATE_API_TOKEN;
  if (!token) return stubImage(params.prompt, model, count);
  try {
    const urls = await callReplicate(model, {
      prompt: params.prompt,
      aspect_ratio: params.ratio ?? "1:1",
      output_format: "png",
      num_outputs: count,
      seed: params.seed ?? deterministicSeed(params.prompt),
    }, token);
    return urls.map(url => ({
      url,
      provider: "replicate",
      model,
      seed: params.seed,
      cost_cents: 4,
      license: "see-replicate-model-page",
      is_stub: false,
      prompt: params.prompt,
    }));
  } catch (err) {
    // Soft-fail: surface the error in metadata, return a stub so the caller can keep going.
    const stub = stubImage(params.prompt, model, count);
    return stub.map(s => ({ ...s, license: `error: ${(err as Error).message}` }));
  }
}

export interface GenerateVoiceParams {
  text: string;
  voice_id?: string;
  model?: string;
}

export async function generateVoice(params: GenerateVoiceParams, model: string, env: NodeJS.ProcessEnv): Promise<ProviderResult[]> {
  const key = env.ELEVENLABS_API_KEY;
  const voiceId = params.voice_id ?? "21m00Tcm4TlvDq8ikWAM"; // "Rachel"
  if (!key) return stubVoice(params.text, model);
  try {
    const url = await callElevenLabs(params.text, voiceId, key);
    return [{
      url,
      provider: "elevenlabs",
      model,
      cost_cents: Math.ceil(params.text.length * 0.018),
      license: "see-elevenlabs-tos",
      is_stub: false,
      prompt: params.text,
    }];
  } catch (err) {
    const stub = stubVoice(params.text, model);
    return stub.map(s => ({ ...s, license: `error: ${(err as Error).message}` }));
  }
}

export interface GenerateMusicParams {
  prompt: string;
  duration_s?: number;
  instrumental?: boolean;
  model?: string;
}

export async function generateMusic(params: GenerateMusicParams, model: string, _env: NodeJS.ProcessEnv): Promise<ProviderResult[]> {
  // Real Suno / mcp-suno integration omitted — would require an OAuth handshake.
  return stubMusic(params.prompt, model, params.duration_s ?? 60);
}

export interface GenerateVideoParams {
  prompt: string;
  duration_s?: number;
  ratio?: string;
  model?: string;
}

export async function generateVideo(params: GenerateVideoParams, model: string, _env: NodeJS.ProcessEnv): Promise<ProviderResult[]> {
  return stubVideo(params.prompt, model, params.duration_s ?? 5);
}
