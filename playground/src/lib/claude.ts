// Dev-only Claude API helper. In the artifact sandbox, api.anthropic.com/v1/messages
// is reachable with credentials supplied by the runtime. In the playground, proxy
// through a dev server or use a VITE_ANTHROPIC_API_KEY in .env.local.
//
// WARNING: Never bundle an API key into a production build. This helper is strictly
// for local prototyping and mirrors the artifact call shape for easy porting.

export type ClaudeCall = {
  system?: string;
  user: string;
  model?: string;
  maxTokens?: number;
};

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

export async function callClaude({ system, user, model = DEFAULT_MODEL, maxTokens = 1024 }: ClaudeCall): Promise<string> {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!key) throw new Error("VITE_ANTHROPIC_API_KEY is not set in .env.local");

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} — ${await r.text()}`);
  const data = await r.json() as { content: Array<{ type: string; text: string }> };
  return data.content[0]?.text ?? "";
}
