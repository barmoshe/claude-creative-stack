// creatures.js — VISUAL ghosts of the C++ creatures.
//
// MIDI emission lives in C++ now (audio thread, BPM-synced, window-close-proof).
// JS keeps a parallel visual creature so users can SEE the playhead. They walk
// at roughly the same rate (drift acceptable for MVP — F2.5 will tighten).

const pickVisualNext = (creature, nodes) => {
  const here = nodes[creature.currentNode];
  if (!here) return creature.currentNode;

  // Collect unvisited candidates: in-tree children + cross-tree neighbours via
  // bonds. (Bond traversal is approximated visually; the real C++ creature has
  // its own bond list per node.) For simplicity we let JS visit any sibling
  // node within the BOND_RADIUS — this keeps the visual ghost at least roughly
  // aligned with C++ behaviour.
  const children = here.children || [];
  const visited = creature.visited;

  const cands = [];
  for (const child of children)
    if (!visited.has(child)) cands.push(child);

  // Approximate bond-walking: any node from a different tree within radius.
  // (We don't keep an exact JS bond list — sim.js's spatial hash handles
  // bond DETECTION on growth, but we don't store the bonds back into nodes.
  // For the visual ghost this approximation is fine.)
  // Skip bond-following on the visual side for v0 — C++ does the real walk;
  // JS just walks within tree which still looks alive.

  if (cands.length > 0) {
    const next = cands[Math.floor(Math.random() * cands.length)];
    visited.add(next);
    return next;
  }
  // Backtrack toward parent
  if (here.parent >= 0 && here.parent !== creature.lastNode) return here.parent;

  // Fallback
  if (children.length > 0) {
    creature.visited = new Set();
    return children[Math.floor(Math.random() * children.length)];
  }
  return creature.currentNode;
};

export const advanceCreaturesVisual = (creatures, nodes, dt, params) => {
  if (creatures.length === 0) return;
  const speed = params.speed || 2;   // visual steps/sec at speed=1 → 1/sec
  for (let i = creatures.length - 1; i >= 0; --i) {
    const c = creatures[i];
    if (!nodes[c.targetNode]) {
      creatures.splice(i, 1);
      continue;
    }
    if (c.targetNode === c.currentNode) {
      // first tick — pick a real target
      c.targetNode = pickVisualNext(c, nodes);
      c.t = 0;
      continue;
    }
    c.t += dt * speed * c.speed;
    c.sinceFire += dt;
    if (c.t >= 1.0) {
      c.lastNode = c.currentNode;
      c.currentNode = c.targetNode;
      c.t = 0;
      c.sinceFire = 0;   // visual flash only — actual MIDI fires from C++
      c.targetNode = pickVisualNext(c, nodes);
    }
  }
};

// ----- procedural sprite ---------------------------------------------------
const drawSnail = (ctx, x, y, dirRad, hue, t01) => {
  const breathe = 1 + 0.04 * Math.sin(t01 * Math.PI * 2);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(dirRad);
  ctx.scale(breathe, breathe);

  ctx.fillStyle = `oklch(0.6 0.12 ${hue} / 0.95)`;
  ctx.beginPath();
  ctx.ellipse(-2, 1.2, 7, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(1.5, -1.5);
  ctx.fillStyle = `oklch(0.74 0.18 ${hue})`;
  ctx.beginPath();
  ctx.arc(0, 0, 5.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `oklch(0.4 0.14 ${hue} / 0.9)`;
  ctx.lineWidth = 0.7;
  for (let r = 4.6; r > 1.0; r -= 1.2) {
    ctx.beginPath();
    ctx.arc(0.4, 0, r, -0.2, Math.PI * 1.2);
    ctx.stroke();
  }

  ctx.translate(-3.0, 1.2);
  ctx.strokeStyle = `oklch(0.5 0.1 ${hue})`;
  ctx.lineWidth = 0.6;
  for (const ay of [-0.6, 0.6]) {
    ctx.beginPath();
    ctx.moveTo(-1, ay);
    ctx.lineTo(-3.5, ay - 1.2);
    ctx.stroke();
  }
  ctx.restore();
};

export const renderCreatures = (ctx, creatures, nodes, t01) => {
  for (const c of creatures) {
    const a = nodes[c.currentNode];
    const b = nodes[c.targetNode];
    if (!a || !b) continue;
    const x = a.x + (b.x - a.x) * c.t;
    const y = a.y + (b.y - a.y) * c.t;
    const dir = Math.atan2(b.y - a.y, b.x - a.x);
    const hue = b.hue;

    // Trail
    c.trail.push({ x, y, age: 0 });
    if (c.trail.length > 32) c.trail.shift();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = `oklch(0.7 0.06 ${hue} / 0.18)`;
    ctx.beginPath();
    for (let i = 0; i < c.trail.length; ++i) {
      const p = c.trail[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    // Glow on visual step
    if (c.sinceFire < 0.18) {
      const flash = 1 - c.sinceFire / 0.18;
      ctx.fillStyle = `oklch(0.92 0.28 ${hue} / ${(0.55 * flash).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, 3 + flash * 6, 0, Math.PI * 2);
      ctx.fill();
    }

    drawSnail(ctx, x, y, dir, hue, t01);
  }
  for (const c of creatures) for (const p of c.trail) p.age += 1;
};
