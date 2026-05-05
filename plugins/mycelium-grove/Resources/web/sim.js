// sim.js — generative mycelium simulation.
//
// Same rules as the original artifact (artifacts/html/mycelium-grove.html):
// trees, nodes, tips, bonds, a spatial hash for cross-tree proximity. The
// audio path is removed — when a spore is seeded or a bond forms, we call
// into the JUCE host via the imported bridge.

import { bridge } from "./bridge.js";

const seedSporeHost  = (h, x)                  => bridge.seedSpore(h, x, W);
const bondFormedHost = (hA, hB, x, thickness)  => bridge.bondFormed(hA, hB, x, W, thickness);

// Live params from the host. `bridge.params` is a single object that JUCE
// updates in place; reading it each frame is fine.
const params = bridge.params;

// ---------- canvas ----------
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

// ---------- world ----------
const trees = [];
const nodes = [];
const tips  = [];
const bonds = [];
let nextTreeId = 0;
const MAX_NODES = 9000;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

const seed = (x, y, hue) => {
  if (nodes.length > MAX_NODES) return;
  const treeId = nextTreeId++;
  const h = hue ?? Math.floor(Math.random() * 360);
  trees.push({ id: treeId, hue: h, lifeFlash: 1, lastBondAt: 0 });
  const rootIdx = nodes.length;
  nodes.push({ treeId, x, y, parent: -1, gen: 0, born: clock, dead: false });

  const n = 4 + Math.floor(Math.random() * 4);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
    const len = 22 + Math.random() * 16;
    spawnTip(rootIdx, a, len);
  }
  seedSporeHost(h, x);
  updateStats();
};

const spawnTip = (parentIdx, angle, length) => {
  const p = nodes[parentIdx];
  tips.push({
    parentIdx,
    treeId: p.treeId,
    angle,
    length,
    progress: 0,
    speed: 0.55 + Math.random() * 0.55,
    gen: p.gen + 1,
  });
};

// ---------- spatial hash for cross-tree proximity ----------
const CELL = 28;
const grid = new Map();
const key = (cx, cy) => cx * 100003 + cy;
const indexNode = (idx) => {
  const n = nodes[idx];
  const cx = Math.floor(n.x / CELL), cy = Math.floor(n.y / CELL);
  const k = key(cx, cy);
  let bucket = grid.get(k);
  if (!bucket) { bucket = []; grid.set(k, bucket); }
  bucket.push(idx);
};

const findCrossTreeNeighbour = (idx, radius) => {
  const n = nodes[idx];
  const cx = Math.floor(n.x / CELL), cy = Math.floor(n.y / CELL);
  let bestIdx = -1, bestD2 = radius * radius;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const bucket = grid.get(key(cx + dx, cy + dy));
      if (!bucket) continue;
      for (const j of bucket) {
        if (j === idx) continue;
        const m = nodes[j];
        if (m.treeId === n.treeId || m.dead) continue;
        const ddx = m.x - n.x, ddy = m.y - n.y;
        const d2 = ddx * ddx + ddy * ddy;
        if (d2 < bestD2) { bestD2 = d2; bestIdx = j; }
      }
    }
  }
  return bestIdx;
};

// ---------- bond formation ----------
const formBond = (a, b) => {
  bonds.push({ a, b, age: 0 });
  const na = nodes[a], nb = nodes[b];
  trees[na.treeId].lifeFlash = 1;
  trees[nb.treeId].lifeFlash = 1;
  trees[na.treeId].lastBondAt = clock;
  trees[nb.treeId].lastBondAt = clock;
  // Thickness proxy: lower gen = thicker = more "mass" delivered. Cap at 8 so
  // late-stage thin strands don't drive velocity to zero.
  const thickness = Math.max(0, (8 - na.gen) / 8) + Math.max(0, (8 - nb.gen) / 8);
  const midX = (na.x + nb.x) * 0.5;
  bondFormedHost(trees[na.treeId].hue, trees[nb.treeId].hue, midX, thickness);
  flashToast(`bond · ${bonds.length}`);
  updateStats();
};

// ---------- update / render ----------
let clock = 0;
let breath = 0;

const update = (dt) => {
  clock += dt;
  breath = 0.5 + 0.5 * Math.sin(clock * 0.6);

  const radius = params.bondRadius ?? 22;
  const branchProb = params.branchProb ?? 0.16;

  for (let i = tips.length - 1; i >= 0; i--) {
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

    const newIdx = nodes.length;
    nodes.push({ treeId: t.treeId, x: nx, y: ny, parent: t.parentIdx, gen: t.gen, born: clock, dead: false });
    indexNode(newIdx);

    const dieProb = Math.min(0.62, 0.04 + t.gen * 0.045);
    const r = Math.random();
    if (r < dieProb || t.length < 4.5) {
      // tip terminates
    } else if (r < dieProb + branchProb) {
      const j = (Math.PI / 4) * (0.45 + Math.random() * 0.6);
      spawnTip(newIdx, t.angle - j, t.length * (0.74 + Math.random() * 0.08));
      spawnTip(newIdx, t.angle + j, t.length * (0.74 + Math.random() * 0.08));
    } else {
      const dj = (Math.random() - 0.5) * 0.55;
      spawnTip(newIdx, t.angle + dj, t.length * (0.84 + Math.random() * 0.08));
    }

    const neighbour = findCrossTreeNeighbour(newIdx, radius);
    if (neighbour >= 0) formBond(newIdx, neighbour);

    tips.splice(i, 1);
  }

  for (const b of bonds) b.age += dt;
  for (const t of trees) t.lifeFlash *= Math.pow(0.18, dt);

  if (bonds.length > 500) bonds.splice(0, bonds.length - 500);
};

const render = () => {
  ctx.fillStyle = "rgba(6, 5, 13, 0.10)";
  ctx.fillRect(0, 0, W, H);
  ctx.lineCap = "round";

  for (let i = 1; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.parent < 0) continue;
    const p = nodes[n.parent];
    const tree = trees[n.treeId];
    const age = clock - n.born;
    const alpha = Math.max(0, 1 - age / 60);
    if (alpha < 0.02) continue;
    const flash = tree.lifeFlash;
    const L = 0.62 + flash * 0.20 + breath * 0.04;
    const C = 0.16 + flash * 0.10;
    ctx.strokeStyle = `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${tree.hue} / ${alpha.toFixed(3)})`;
    ctx.lineWidth = Math.max(0.45, 2.4 - n.gen * 0.13);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(n.x, n.y);
    ctx.stroke();
  }

  ctx.globalCompositeOperation = "lighter";
  for (const t of tips) {
    const p = nodes[t.parentIdx];
    const x = p.x + Math.cos(t.angle) * t.length * t.progress;
    const y = p.y + Math.sin(t.angle) * t.length * t.progress;
    const tree = trees[t.treeId];
    ctx.fillStyle = `oklch(0.94 0.28 ${tree.hue} / 0.85)`;
    ctx.beginPath();
    ctx.arc(x, y, 1.7, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const b of bonds) {
    const a = nodes[b.a], c = nodes[b.b];
    const ta = trees[a.treeId], tb = trees[c.treeId];
    const flash = Math.max(0, 1 - b.age / 6);
    const hue = ((ta.hue + tb.hue) / 2 + 360) % 360;
    ctx.strokeStyle = `oklch(${(0.86 + flash * 0.08).toFixed(3)} ${(0.22 + flash * 0.10).toFixed(3)} ${hue} / ${(0.32 + 0.55 * flash).toFixed(3)})`;
    ctx.lineWidth = 0.9 + flash * 1.4;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y);
    ctx.stroke();
    if (flash > 0.1) {
      ctx.fillStyle = `oklch(0.96 0.32 ${hue} / ${(flash * 0.8).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(a.x, a.y, 2.4 + flash * 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(c.x, c.y, 2.4 + flash * 2, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalCompositeOperation = "source-over";
};

// ---------- stats / toast ----------
const $spores = document.getElementById("stat-spores");
const $bonds  = document.getElementById("stat-bonds");
const updateStats = () => {
  $spores.textContent = trees.length.toString();
  $bonds.textContent  = bonds.length.toString();
};

let toastTimer = 0;
const $toast = document.getElementById("toast");
const flashToast = (msg) => {
  $toast.textContent = msg;
  $toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $toast.classList.remove("show"), 1100);
};

// ---------- pointer ----------
canvas.addEventListener("pointerdown", (e) => {
  const rect = canvas.getBoundingClientRect();
  seed(e.clientX - rect.left, e.clientY - rect.top);
});

// ---------- in-canvas overlay (writes back to host via setParam) ----------
const setParam = bridge?.setParam ?? (() => {});

const $scale  = document.getElementById("ov-scale");
const $root   = document.getElementById("ov-root");
const $oct    = document.getElementById("ov-octave");
const $octV   = document.getElementById("ov-octave-v");
const $branch = document.getElementById("ov-branch");
const $rain   = document.getElementById("ov-rain");

// Pull initial state from bridge, then subscribe so DAW automation reflects here too.
const reflect = (p) => {
  if ($scale.value !== String(p.scale))            $scale.value  = String(p.scale ?? 0);
  if ($root.value  !== String(p.root))             $root.value   = String(p.root ?? 0);
  if (Number($oct.value) !== (p.octave ?? 4))      $oct.value    = String(p.octave ?? 4);
  $octV.textContent = String(p.octave ?? 4);
  if (Number($branch.value).toFixed(3) !== (p.branchProb ?? 0.16).toFixed(3))
    $branch.value = String(p.branchProb ?? 0.16);
  if ($rain.checked !== !!p.rainOn)                $rain.checked = !!p.rainOn;
};
bridge?.onChange?.(reflect);

$scale.addEventListener ("change", () => setParam("scale",      Number($scale.value) | 0));
$root.addEventListener  ("change", () => setParam("root",       Number($root.value)  | 0));
$oct.addEventListener   ("input",  () => { $octV.textContent = $oct.value; setParam("octave", Number($oct.value) | 0); });
$branch.addEventListener("input",  () => setParam("branchProb", Number($branch.value)));
$rain.addEventListener  ("change", () => setParam("rainOn",     $rain.checked));

document.getElementById("reset-btn").addEventListener("click", () => {
  trees.length = 0;
  nodes.length = 0;
  tips.length = 0;
  bonds.length = 0;
  grid.clear();
  nextTreeId = 0;
  ctx.fillStyle = "#06050d";
  ctx.fillRect(0, 0, W, H);
  updateStats();
  flashToast("forgotten");
});

// ---------- main loop ----------
let lastT = performance.now();
let rainTimer = 0;
const tick = (now) => {
  requestAnimationFrame(tick);
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;

  if (params.rainOn) {
    rainTimer += dt;
    const rate = Math.max(0.1, params.rainRate ?? 1.4); // Hz
    const period = 1 / rate;
    if (rainTimer > (reduced ? period * 2 : period)) {
      rainTimer = 0;
      seed(Math.random() * W, Math.random() * H);
    }
  }

  update(reduced ? dt * 0.5 : dt);
  render();
};

resize();
requestAnimationFrame(tick);
