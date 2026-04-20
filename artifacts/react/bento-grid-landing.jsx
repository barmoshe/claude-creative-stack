import { ArrowRight, Zap, Shield, Sparkles, Layers, Activity } from "lucide-react";

// -----------------------------------------------------------------------------
// Bento-grid landing hero — 2025-2026 design vibe. Oversized type on the left,
// card grid with mixed sizes on the right. Tailwind core utilities only.
// Neutral palette with one warm accent — intentionally avoiding the generic
// centered-purple-gradient look.

function Card({ children, className = "" }){
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}

function Stat({ value, label }){
  return (
    <div>
      <div className="text-4xl font-semibold tracking-tight text-zinc-50">{value}</div>
      <div className="text-xs mt-1 text-zinc-400 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function Pill({ children }){
  return <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs">{children}</span>;
}

export default function BentoGridLanding(){
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-900">
        <div className="flex items-center gap-2 font-semibold">
          <div className="w-6 h-6 rounded-md bg-amber-400" />
          Runway
        </div>
        <div className="flex items-center gap-6 text-sm text-zinc-300">
          <a href="#" className="hover:text-zinc-50">Product</a>
          <a href="#" className="hover:text-zinc-50">Pricing</a>
          <a href="#" className="hover:text-zinc-50">Docs</a>
          <a href="#" className="px-3 py-1.5 rounded-md bg-zinc-100 text-zinc-900 font-medium">Start free</a>
        </div>
      </nav>

      <main className="px-8 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col justify-between gap-8">
            <div>
              <Pill><Sparkles className="w-3 h-3" /> New — scheduled workflows</Pill>
              <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-tight leading-[1.02] text-zinc-50">
                Ship the interface <span className="text-amber-400">before</span> the deadline.
              </h1>
              <p className="mt-6 text-lg text-zinc-400 max-w-xl">
                A design surface and runtime for small product teams. Prototype in an afternoon, publish before Friday.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <a href="#" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-zinc-100 text-zinc-900 font-medium hover:bg-zinc-200">
                  Start building <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#" className="px-5 py-3 rounded-lg border border-zinc-800 text-zinc-200 hover:bg-zinc-900">
                  Watch a 90-sec tour
                </a>
              </div>
            </div>

            <Card className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 rounded-full bg-amber-300 border-2 border-zinc-900" />
                  <div className="w-8 h-8 rounded-full bg-emerald-300 border-2 border-zinc-900" />
                  <div className="w-8 h-8 rounded-full bg-sky-300 border-2 border-zinc-900" />
                  <div className="w-8 h-8 rounded-full bg-rose-300 border-2 border-zinc-900" />
                </div>
                <div className="text-sm text-zinc-300">Trusted by 4,200 teams</div>
              </div>
              <div className="text-xs text-zinc-500">SOC 2 · GDPR</div>
            </Card>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4 auto-rows-fr">
            <Card className="col-span-2 row-span-2">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-medium"><Layers className="w-4 h-4" /> Composable surface</div>
              <p className="mt-3 text-zinc-200 text-lg leading-snug">Drop in your data, your theme, your components — Runway wires them into a single runtime.</p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="h-10 rounded-md bg-zinc-800" />
                <div className="h-10 rounded-md bg-zinc-800" />
                <div className="h-10 rounded-md bg-amber-500/80" />
                <div className="h-10 rounded-md bg-zinc-800" />
                <div className="h-10 rounded-md bg-zinc-800 col-span-2" />
              </div>
            </Card>

            <Card><Stat value="38ms" label="p95 TTFB" /></Card>
            <Card><Stat value="0" label="lock-in" /></Card>

            <Card className="col-span-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-amber-500/10 text-amber-400"><Zap className="w-4 h-4" /></div>
                <div>
                  <div className="text-sm font-medium text-zinc-100">Edge-deployed by default</div>
                  <div className="text-xs text-zinc-400 mt-1">No spinner, no cold start, no config.</div>
                </div>
              </div>
            </Card>

            <Card className="col-span-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-zinc-800"><Shield className="w-4 h-4 text-zinc-300" /></div>
                <div>
                  <div className="text-sm font-medium text-zinc-100">Private by default</div>
                  <div className="text-xs text-zinc-400">Your data never leaves your cluster.</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-zinc-400 text-xs"><Activity className="w-3 h-3" /> 99.99%</div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
