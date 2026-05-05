// sim.js — visual mycelium growth + creature rendering.
//
// All MIDI emission now lives in C++ (audio thread owns the graph + creatures
// so it stays BPM-synced and runs even when the WebView is closed). JS keeps
// its own parallel visual state for drawing only — every node / bond / creature
// is pushed across the bridge, and node indices are sequential on both sides
// so they line up by construction.

import { bridge } from "./bridge.js";
import { renderCreatures, advanceCreaturesVisual } from "./creatures.js";

const canvas = document.getElementById("cv");
const ctx = canvas.getContext("2d");
let DPR = Math.min(window.devicePixelRatio || 1, 2);
let W = 0, H = 0;
const resize = () => {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = canvas.clientWidth;
  H = canvas.clientHeight;
  canvas.width  = Math.floor(W * DPR);
  canvas.height = Math.floor(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = "#06050d";
  ctx.fillRect(0, 0, W, H);
};
window.addEventListener("resize", resize);

// ---------- world state (visual) -------------------------------------------
// nodes[i] = { treeId, x, y, hue, parent, gen, born, children:[] }
// Index in this array == C++ index (both sequential, both push in lockstep).
const trees = [];
const nodes = [];
const tips  = [];
const bonds = [];          // [{a,b,age}] — visual bonds
const creatures = [];      // visual ghosts of C++ creatures
let nextTreeId = 0;
const MAX_NODES = 4000;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- spatial hash for cross-tree bond detection (port from Grove) ---
const BOND_RADIUS = 22;
const CELL = 28;
const grid = new Map();
const gridKey = (cx, cy) => cx * 100003 + cy;
const indexNode = (idx) => {
  const n = nodes[idx];
  const cx = Math.floor(n.x / CELL), cy = Math.floor(n.y / CELL);
  const k = gridKey(cx, cy);
  let bucket = grid.get(k);
  if (!bucket) { bucket = []; grid.set(k, bucket); }
  bucket.push(idx);
};
const findCrossTreeNeighbour = (idx) => {
  const n = nodes[idx];
  const cx = Math.floor(n.x / CELL), cy = Math.floor(n.y / CELL);
  let bestIdx = -1, bestD2 = BOND_RADIUS * BOND_RADIUS;
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
    const bucket = grid.get(gridKey(cx + dx, cy + dy));
    if (!bucket) continue;
    for (const j of bucket) {
      if (j === idx) continue;
      const m = nodes[j];
      if (m.treeId === n.treeId) continue;
      const ddx = m.x - n.x, ddy = m.y - n.y;
      const d2 = ddx * ddx + ddy * ddy;
      if (d2 < bestD2) { bestD2 = d2; bestIdx = j; }
    }
  }
  return bestIdx;
};

// ---------- overlay state --------------------------------------------------
const overlayParams = { speed: 2 };

const $oct  = document.getElementById("ov-octave");
const $octV = document.getElementById("ov-octave-v");
const $spd  = document.getElementById("ov-speed");
const $spdV = document.getElementById("ov-speed-v");

const reflectOverlay = () => {
  $octV.textContent = String(bridge.params.octave | 0);
  $spdV.textContent = overlayParams.speed.toFixed(1);
};
bridge.onChange(() => reflectOverlay());

document.getElementById("ov-scale").addEventListener("change", (e) => bridge.setParam("scale", +e.target.value | 0));
document.getElementById("ov-root").addEventListener ("change", (e) => bridge.setParam("root",  +e.target.value | 0));
$oct.addEventListener("input", (e) => { bridge.setParam("octave", +e.target.value | 0); reflectOverlay(); });
$spd.addEventListener("input", (e) => { overlayParams.speed = +e.target.value; reflectOverlay(); });
reflectOverlay();

const $statTrees     = document.getElementById("stat-trees");
const $statNodes     = document.getElementById("stat-nodes");
const $statCreatures = document.getElementById("stat-creatures");
const updateStats = () => {
  $statTrees.textContent     = String(trees.length);
  $statNodes.textContent     = String(nodes.length);
  $statCreatures.textContent = String(creatures.length);
};

const $toast = document.getElementById("toast");
let toastTimer = 0;
const flashToast = (msg) => {
  $toast.textContent = msg;
  $toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $toast.classList.remove("show"), 1100);
};

// ---------- seed / grow ----------------------------------------------------
const addNode = (treeId, parentIdx, x, y, hue) => {
  if (nodes.length >= MAX_NODES) return -1;
  const idx = nodes.length;
  nodes.push({ treeId, x, y, hue, parent: parentIdx, gen: parentIdx < 0 ? 0 : nodes[parentIdx].gen + 1, born: clock, children: [] });
  if (parentIdx >= 0) nodes[parentIdx].children.push(idx);
  indexNode(idx);
  bridge.pushNode(parentIdx, treeId, x, y, hue);

  // Bond detection: any cross-tree neighbour within radius?
  const partner = findCrossTreeNeighbour(idx);
  if (partner >= 0) {
    bonds.push({ a: idx, b: partner, age: 0 });
    bridge.pushBond(idx, partner);
  }
  return idx;
};

const seed = (x, y) => {
  if (nodes.length >= MAX_NODES) return;
  const treeId = nextTreeId++;
  const hue = 100 + Math.floor(Math.random() * 80);
  const rootIdx = addNode(treeId, -1, x, y, hue);
  trees.push({ id: treeId, hue, rootIdx, lastNodeIdx: rootIdx });

  const n = 5 + Math.floor(Math.random() * 4);
  for (let i = 0; i < n; ++i) {
    const baseAngle = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const len = 28 + Math.random() * 22;
    spawnTip(rootIdx, baseAngle, len, hue);
  }
  updateStats();
};

const spawnTip = (parentIdx, angle, length, hue) => {
  tips.push({
    parentIdx,
    treeId: nodes[parentIdx].treeId,
    angle, length,
    progress: 0,
    speed: 0.7 + Math.random() * 0.5,
    gen: nodes[parentIdx].gen + 1,
    hue,
  });
};

// ---------- update / render -----------------------------------------------
let clock = 0;
let breath = 0;

const update = (dt) => {
  clock += dt;
  breath = 0.5 + 0.5 * Math.sin(clock * 0.6);

  for (let i = tips.length - 1; i >= 0; --i) {
    const t = tips[i];
    t.progress += t.speed * dt;
    if (t.progress < 1) continue;

    const p = nodes[t.parentIdx];
    const nx = p.x + Math.cos(t.angle) * t.length;
    const ny = p.y + Math.sin(t.angle) * t.length;

    if (nx < -10 || nx > W + 10 || ny < -10 || ny > H + 10) {
      tips.splice(i, 1);
      continue;
    }

    const nodeHue = (t.hue + (Math.random() - 0.5) * 18 + 360) % 360;
    const newIdx = addNode(p.treeId, t.parentIdx, nx, ny, nodeHue);
    if (newIdx < 0) { tips.splice(i, 1); continue; }
    trees[p.treeId].lastNodeIdx = newIdx;

    const dieProb = Math.min(0.6, 0.05 + t.gen * 0.05);
    const branchProb = 0.18;
    const r = Math.random();
    if (r < dieProb || t.length < 4) {
      // tip terminates
    } else if (r < dieProb + branchProb) {
      const j = (Math.PI / 4) * (0.4 + Math.random() * 0.6);
      spawnTip(newIdx, t.angle - j, t.length * (0.78 + Math.random() * 0.08), nodeHue);
      spawnTip(newIdx, t.angle + j, t.length * (0.78 + Math.random() * 0.08), nodeHue);
    } else {
      const dj = (Math.random() - 0.5) * 0.45;
      spawnTip(newIdx, t.angle + dj, t.length * (0.86 + Math.random() * 0.08), nodeHue);
    }

    tips.splice(i, 1);
  }

  for (const b of bonds) b.age += dt;
  while (bonds.length > 800) bonds.shift();

  // Visual creatures advance at the same rate as their C++ counterparts (assumes
  // ~120 BPM internal pace; small drift at other tempos until F2.5 polish).
  advanceCreaturesVisual(creatures, nodes, dt, overlayParams);
  updateStats();
};

const render = () => {
  ctx.fillStyle = "rgba(6, 5, 13, 0.10)";
  ctx.fillRect(0, 0, W, H);
  ctx.lineCap = "round";

  // Edges
  for (let i = 1; i < nodes.length; ++i) {
    const n = nodes[i];
    if (n.parent < 0) continue;
    const p = nodes[n.parent];
    const age = clock - n.born;
    const alpha = Math.max(0.15, 1 - age / 90);
    const L = 0.55 + breath * 0.05;
    const C = 0.1 + Math.max(0, 1 - n.gen * 0.05) * 0.06;
    ctx.strokeStyle = `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${n.hue} / ${alpha.toFixed(3)})`;
    ctx.lineWidth = Math.max(0.5, 1.8 - n.gen * 0.1);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(n.x, n.y);
    ctx.stroke();
  }

  // Bonds (cross-tree edges) — drawn lighter
  for (const b of bonds) {
    const a = nodes[b.a], c = nodes[b.b];
    if (!a || !c) continue;
    const flash = Math.max(0, 1 - b.age / 6);
    const hue = ((a.hue + c.hue) / 2 + 360) % 360;
    ctx.strokeStyle = `oklch(${(0.85 + flash * 0.08).toFixed(3)} ${(0.22 + flash * 0.1).toFixed(3)} ${hue} / ${(0.32 + 0.55 * flash).toFixed(3)})`;
    ctx.lineWidth = 0.9 + flash * 1.2;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y);
    ctx.stroke();
  }

  // Growing tip dots
  ctx.globalCompositeOperation = "lighter";
  for (const t of tips) {
    const p = nodes[t.parentIdx];
    const x = p.x + Math.cos(t.angle) * t.length * t.progress;
    const y = p.y + Math.sin(t.angle) * t.length * t.progress;
    ctx.fillStyle = `oklch(0.92 0.24 ${t.hue} / 0.7)`;
    ctx.beginPath();
    ctx.arc(x, y, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";

  renderCreatures(ctx, creatures, nodes, breath);
};

// ---------- pointer + buttons ---------------------------------------------
canvas.addEventListener("pointerdown", (e) => {
  const rect = canvas.getBoundingClientRect();
  seed(e.clientX - rect.left, e.clientY - rect.top);
  flashToast("seed planted");
});

const beatsPerStepFromSpeed = (speed) => {
  // speed slider 0.5..6 maps to beatsPerStep 1.0..0.083 (slow → fast)
  return Math.max(0.0625, Math.min(2.0, 1.0 / Math.max(0.5, speed)));
};

const addSnail = () => {
  if (trees.length === 0) {
    flashToast("plant a seed first");
    return;
  }
  const last = trees[trees.length - 1];
  const channel = 1 + (creatures.length % 16);
  const beats = beatsPerStepFromSpeed(overlayParams.speed);

  // Push the real one to C++ (audio thread does the MIDI)
  bridge.pushCreature(last.rootIdx, channel, beats);

  // Visual ghost
  creatures.push({
    type: "snail",
    currentNode: last.rootIdx,
    targetNode: last.rootIdx,    // creatures.js advance picks a real target on first tick
    lastNode: -1,
    t: 0,
    speed: 1.0 / beats,
    channel,
    visited: new Set([last.rootIdx]),
    trail: [],
    sinceFire: 0.5,
  });
  flashToast(`snail #${creatures.length}`);
  updateStats();
};

document.getElementById("add-snail").addEventListener("click", addSnail);
document.getElementById("reset-btn").addEventListener("click", () => {
  trees.length = 0;
  nodes.length = 0;
  tips.length = 0;
  bonds.length = 0;
  creatures.length = 0;
  grid.clear();
  nextTreeId = 0;
  bridge.resetGraph();
  ctx.fillStyle = "#06050d";
  ctx.fillRect(0, 0, W, H);
  updateStats();
  flashToast("forgotten");
});

window.addEventListener("keydown", (e) => {
  if (e.key === "s" || e.key === "S") addSnail();
});

// ---------- main loop ------------------------------------------------------
let lastT = performance.now();
const tick = (now) => {
  requestAnimationFrame(tick);
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;
  update(reduced ? dt * 0.5 : dt);
  render();
};

resize();
requestAnimationFrame(tick);
