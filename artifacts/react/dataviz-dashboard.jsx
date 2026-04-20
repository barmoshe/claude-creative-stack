import { useMemo, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Legend, AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";

// -----------------------------------------------------------------------------
// oklch chart palette — 5 categorical colors, chroma-matched for colorblind safety.
// Rendered as sRGB hex so Recharts picks them up everywhere.
const PALETTE = ["#d37a52", "#2da67a", "#4f89c8", "#d5a24b", "#b15bb4"];

// -----------------------------------------------------------------------------
// Synthetic dataset — replace with real data. Seeded so preview is stable.
function seededRandom(seed){ let s = seed; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function genData(){
  const rng = seededRandom(42);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return months.map((m, i) => ({
    month: m,
    revenue: Math.round(40 + i * 6 + rng() * 30),
    churn:   +(2 + rng() * 2.2).toFixed(2),
    signups: Math.round(80 + i * 10 + rng() * 40),
    active:  Math.round(500 + i * 35 + rng() * 60),
  }));
}
const SEG = [
  { name: "Enterprise", value: 42 },
  { name: "Mid-market", value: 31 },
  { name: "SMB",        value: 19 },
  { name: "Self-serve", value: 8 },
];

// -----------------------------------------------------------------------------
function KPI({ label, value, delta }){
  const positive = delta >= 0;
  return (
    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
      <div className="text-xs uppercase tracking-wider text-zinc-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-zinc-100">{value}</div>
      <div className={`mt-1 text-xs ${positive ? "text-emerald-400" : "text-rose-400"}`}>
        {positive ? "▲" : "▼"} {Math.abs(delta)}% vs prev month
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }){
  return (
    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
        <p className="text-xs text-zinc-400">{subtitle}</p>
      </div>
      <div className="h-64">{children}</div>
    </div>
  );
}

export default function DatavizDashboard(){
  const data = useMemo(genData, []);
  const [metric, setMetric] = useState("revenue");

  const latest = data[data.length - 1];
  const prev   = data[data.length - 2];
  const pct = (a, b) => Math.round((a - b) / b * 100);

  const tooltipStyle = { background: "#18181b", border: "1px solid #27272a", color: "#e4e4e7", borderRadius: 8 };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 p-6 font-sans">
      <header className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Growth — 12-month view</h1>
          <p className="text-sm text-zinc-400">Revenue, churn, signups, and segment mix.</p>
        </div>
        <div className="flex gap-2 text-xs">
          {["revenue","signups","active"].map(m => (
            <button key={m} onClick={() => setMetric(m)}
              className={`px-3 py-1.5 rounded-md border ${metric === m ? "bg-zinc-100 text-zinc-900 border-zinc-100" : "bg-zinc-900 text-zinc-300 border-zinc-800"}`}>
              {m}
            </button>
          ))}
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPI label="Revenue (Dec)" value={`$${latest.revenue}k`} delta={pct(latest.revenue, prev.revenue)} />
        <KPI label="Signups"       value={latest.signups}       delta={pct(latest.signups, prev.signups)} />
        <KPI label="Active users"  value={latest.active}        delta={pct(latest.active, prev.active)} />
        <KPI label="Churn"         value={`${latest.churn}%`}   delta={-pct(latest.churn, prev.churn)} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Trend" subtitle={`${metric} over time`}>
          <ResponsiveContainer>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor={PALETTE[0]} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={PALETTE[0]} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#a1a1aa" />
              <YAxis stroke="#a1a1aa" />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey={metric} stroke={PALETTE[0]} strokeWidth={2} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Signups vs active" subtitle="Monthly">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#a1a1aa" />
              <YAxis stroke="#a1a1aa" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: "#e4e4e7" }} />
              <Bar dataKey="signups" fill={PALETTE[1]} />
              <Bar dataKey="active"  fill={PALETTE[2]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Churn rate" subtitle="%">
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#a1a1aa" />
              <YAxis stroke="#a1a1aa" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="churn" stroke={PALETTE[3]} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Segment mix" subtitle="% of revenue">
          <ResponsiveContainer>
            <PieChart>
              <Tooltip contentStyle={tooltipStyle} />
              <Pie data={SEG} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={3}>
                {SEG.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Legend wrapperStyle={{ color: "#e4e4e7" }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </section>
    </div>
  );
}
