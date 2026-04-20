import { useState } from "react";

// -----------------------------------------------------------------------------
// Claudeception — an artifact that calls the Claude API to critique its own state.
// The only fetch URL allowed inside a published artifact is api.anthropic.com/v1/messages.
// The artifact runtime injects credentials via the `x-api-key` header the user
// configured; inside the artifact we just POST and read the response.
//
// Model note: the artifact-pinned API model rotates silently (see knowledge/99-caveats.md).
// We default to claude-sonnet-4-20250514 because that's the observed artifact pin.

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

async function callClaude({ system, user, model = DEFAULT_MODEL }){
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} — ${await r.text()}`);
  const data = await r.json();
  return data.content[0].text;
}

function Pill({ children, color = "zinc" }){
  const palette = {
    zinc: "bg-zinc-800 text-zinc-300",
    amber: "bg-amber-500/15 text-amber-300",
    emerald: "bg-emerald-500/15 text-emerald-300",
    rose: "bg-rose-500/15 text-rose-300",
  }[color];
  return <span className={`inline-block text-xs px-2 py-1 rounded-full ${palette}`}>{children}</span>;
}

export default function ClaudeceptionCritic(){
  const [draft, setDraft] = useState(
`## Pricing page hypothesis
We should show 3 plans: Starter, Pro, Team. Annual billing toggle defaults to monthly. Enterprise is a contact-sales card.`);
  const [critique, setCritique] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error | done
  const [error, setError] = useState(null);

  async function critiqueIt(){
    setStatus("loading"); setError(null); setCritique("");
    try {
      const text = await callClaude({
        system: "You are a senior product reviewer. Be specific and concise. Return 3 strengths, 3 concerns, and 1 concrete recommendation. Use plain prose, no headers.",
        user: `Critique this draft:\n\n${draft}`,
      });
      setCritique(text);
      setStatus("done");
    } catch (e){
      setError(e.message);
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans p-8">
      <header className="max-w-3xl mx-auto mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Pill color="amber">Claudeception</Pill>
          <Pill>model: {DEFAULT_MODEL}</Pill>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-50">Self-review harness</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Paste a draft. The artifact calls <code className="px-1 py-0.5 bg-zinc-900 rounded">api.anthropic.com/v1/messages</code> directly and displays the critique.
        </p>
      </header>

      <main className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <label className="text-xs text-zinc-400 uppercase tracking-wider">Draft</label>
          <textarea
            className="mt-2 w-full h-64 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            onClick={critiqueIt}
            disabled={status === "loading"}
            className="mt-3 px-4 py-2 rounded-md bg-amber-400 text-zinc-950 font-medium disabled:opacity-60"
          >
            {status === "loading" ? "Thinking…" : "Critique this"}
          </button>
        </section>

        <section className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <label className="text-xs text-zinc-400 uppercase tracking-wider">Claude's critique</label>
          {status === "error" && <div className="mt-2 text-sm text-rose-300">Error: {error}</div>}
          {status === "idle" && <div className="mt-2 text-sm text-zinc-500">Run critique to see output.</div>}
          {status !== "error" && (
            <pre className="mt-2 text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">{critique || (status === "loading" ? "…" : "")}</pre>
          )}
        </section>
      </main>

      <footer className="max-w-3xl mx-auto mt-6 text-xs text-zinc-500">
        Only <code className="px-1 py-0.5 bg-zinc-900 rounded">api.anthropic.com/v1/messages</code> is reachable from a published artifact. All other network calls are blocked.
      </footer>
    </div>
  );
}
