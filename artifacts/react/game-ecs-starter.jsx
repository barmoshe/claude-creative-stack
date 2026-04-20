import { useEffect, useRef, useState } from "react";

// -----------------------------------------------------------------------------
// Tiny ECS game — asteroid-dodger.
// - Fixed-timestep simulation, decoupled from render.
// - Inlined Miniplex-style world (id-based, arrays of components).
// - Trauma-based screen shake, hit-stop on hit.
// - No localStorage; React state stores highscore in memory.

function makeWorld(){
  let nextId = 1;
  const entities = new Map(); // id -> components
  return {
    create(components){
      const id = nextId++;
      entities.set(id, { id, ...components });
      return id;
    },
    destroy(id){ entities.delete(id); },
    get(id){ return entities.get(id); },
    each(fn){ for (const e of entities.values()) fn(e); },
    query(...names){
      const out = [];
      for (const e of entities.values()){
        if (names.every(n => n in e)) out.push(e);
      }
      return out;
    },
    size(){ return entities.size; },
  };
}

export default function GameEcsStarter(){
  const canvasRef = useRef(null);
  const [highscore, setHighscore] = useState(0);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const world = makeWorld();
    world.create({ tag: "player", pos: { x: W / 2, y: H - 40 }, vel: { x: 0, y: 0 }, radius: 10, color: "#f0c27b" });

    const keys = new Set();
    const onDown = e => keys.add(e.key);
    const onUp   = e => keys.delete(e.key);
    addEventListener("keydown", onDown);
    addEventListener("keyup", onUp);

    let trauma = 0, stopFrames = 0, spawnAcc = 0, survival = 0, running = true;

    function spawnRock(){
      world.create({
        tag: "rock",
        pos: { x: Math.random() * W, y: -20 },
        vel: { x: (Math.random() - 0.5) * 30, y: 80 + Math.random() * 120 },
        radius: 6 + Math.random() * 10, color: "#6b7280",
      });
    }

    function update(dt){
      if (stopFrames > 0){ stopFrames--; return; }
      survival += dt;

      spawnAcc += dt;
      const rate = 0.6 + Math.min(2, survival * 0.06);
      while (spawnAcc > 1 / rate){ spawnRock(); spawnAcc -= 1 / rate; }

      // player input
      const p = world.query("tag", "pos", "vel").find(e => e.tag === "player");
      if (p){
        const speed = 260;
        p.vel.x = (keys.has("ArrowLeft") || keys.has("a") ? -1 : 0) + (keys.has("ArrowRight") || keys.has("d") ? 1 : 0);
        p.vel.x *= speed;
        p.pos.x = Math.max(p.radius, Math.min(W - p.radius, p.pos.x + p.vel.x * dt));
      }

      // rocks
      for (const r of world.query("tag")){
        if (r.tag !== "rock") continue;
        r.pos.x += r.vel.x * dt;
        r.pos.y += r.vel.y * dt;
        if (r.pos.y > H + 20) { world.destroy(r.id); setScore(s => s + 1); }

        // collision with player
        if (p){
          const dx = r.pos.x - p.pos.x, dy = r.pos.y - p.pos.y;
          if (dx*dx + dy*dy < (r.radius + p.radius) ** 2){
            trauma = 1; stopFrames = 6; running = false;
            setOver(true);
            setHighscore(hs => { setScore(cur => { if (cur > hs) return cur; return cur; }); return Math.max(hs, score); });
          }
        }
      }
    }

    function render(){
      if (trauma > 0){
        const t = trauma * trauma;
        ctx.save();
        ctx.translate((Math.random()*2-1) * 12 * t, (Math.random()*2-1) * 12 * t);
        trauma = Math.max(0, trauma - 0.025);
      }
      ctx.fillStyle = "#0b0b14";
      ctx.fillRect(0, 0, W, H);

      for (const e of world.query("pos", "radius", "color")){
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(e.pos.x, e.pos.y, e.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#e4e4e7";
      ctx.font = "14px system-ui";
      ctx.fillText(`score ${score}`, 12, 20);
      if (highscore > 0) ctx.fillText(`best ${highscore}`, 12, 38);

      if (trauma > 0) ctx.restore();
    }

    let last = performance.now(), acc = 0, STEP = 1 / 60, raf;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      acc += (now - last) / 1000; last = now;
      if (acc > 0.25) acc = 0.25;
      while (running && acc >= STEP){ update(STEP); acc -= STEP; }
      render();
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("keydown", onDown);
      removeEventListener("keyup", onUp);
    };
  }, []); // one-shot mount

  function restart(){
    setHighscore(hs => Math.max(hs, score));
    setScore(0); setOver(false);
    // Force re-mount of game loop by remounting canvas via key
    canvasRef.current.dispatchEvent(new Event("_reset"));
    // Simplest reliable path: full reload of the effect via key change
    window.location.reload(); // fine for artifact — no external state
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col items-center justify-center font-sans p-6">
      <canvas ref={canvasRef} width={480} height={560} className="rounded-xl shadow-2xl" />
      <div className="mt-3 text-sm text-zinc-400">Arrow keys / A-D to dodge falling rocks.</div>
      {over && (
        <button onClick={restart} className="mt-4 px-4 py-2 rounded-md bg-zinc-100 text-zinc-900 font-medium">
          Game over — replay
        </button>
      )}
    </div>
  );
}
