import { Link, Route, Routes } from "react-router-dom";
import Dashboard from "./sketches/Dashboard";
import Kinetic from "./sketches/Kinetic";

const sketches = [
  { path: "/dashboard", name: "Dataviz dashboard", el: <Dashboard /> },
  { path: "/kinetic",   name: "Kinetic typography", el: <Kinetic /> },
];

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <nav className="flex items-center gap-4 px-6 py-4 border-b border-zinc-900">
        <Link to="/" className="font-semibold">Playground</Link>
        {sketches.map(s => (
          <Link key={s.path} to={s.path} className="text-sm text-zinc-300 hover:text-zinc-50">
            {s.name}
          </Link>
        ))}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        {sketches.map(s => <Route key={s.path} path={s.path} element={s.el} />)}
      </Routes>
    </div>
  );
}

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-2">Claude Creative Stack — Playground</h1>
      <p className="text-zinc-400 max-w-xl">
        Iterate on artifacts outside the sandbox. Pick a sketch from the nav. Drop new files into <code className="px-1 py-0.5 bg-zinc-900 rounded">src/sketches/</code> and wire them up in <code className="px-1 py-0.5 bg-zinc-900 rounded">App.tsx</code>.
      </p>
    </div>
  );
}
