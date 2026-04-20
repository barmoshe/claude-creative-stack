// Minimal port of artifacts/react/dataviz-dashboard.jsx — run this with full HMR
// and Recharts v3. Strip the file extension comments before copying back.
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2026, i, 1).toLocaleString("en", { month: "short" }),
  revenue: Math.round(40 + i * 6 + Math.sin(i) * 10),
}));

export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-4">Revenue — 12 months</h1>
      <div className="h-80 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
        <ResponsiveContainer>
          <AreaChart data={data}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="#a1a1aa" />
            <YAxis stroke="#a1a1aa" />
            <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", color: "#e4e4e7" }} />
            <Area type="monotone" dataKey="revenue" stroke="#d37a52" fill="#d37a5233" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
