#!/usr/bin/env npx tsx
/**
 * Sprite atlas packer.
 *
 * Usage:
 *   npx tsx scripts/pack.ts --in assets/frames --out atlas.png --json atlas.json [--padding 2] [--max 4096]
 *
 * Reads PNGs from --in, packs them into a single atlas using a MaxRects-style
 * shelf packer, writes the atlas PNG and a Phaser/Pixi-compatible JSON manifest.
 *
 * The output JSON shape matches `skills/sprite-atlas-builder/SKILL.md`.
 */

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, basename, extname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { Buffer } from "node:buffer";

// We rely on `pngjs` for decoding/encoding — it's a single small dep that runs in plain Node
// without canvas bindings. Install with `npm i pngjs`.
import { PNG } from "pngjs";

interface FrameSpec {
  name: string;
  width: number;
  height: number;
  png: PNG;
}

interface PackedFrame extends FrameSpec {
  x: number;
  y: number;
}

interface Manifest {
  frames: Record<string, {
    frame: { x: number; y: number; w: number; h: number };
    pivot?: { x: number; y: number };
    duration?: number;
  }>;
  animations?: Record<string, string[]>;
  meta: {
    image: string;
    size: { w: number; h: number };
    scale: string;
    packed_at: string;
    padding: number;
  };
}

async function readPng(path: string): Promise<PNG> {
  const buf = await readFile(path);
  return new Promise((resolveP, reject) => {
    new PNG().parse(buf, (err, data) => err ? reject(err) : resolveP(data));
  });
}

function shelfPack(frames: FrameSpec[], maxWidth: number, padding: number): { width: number; height: number; placed: PackedFrame[] } {
  // Sort by descending height for shelf packing.
  const sorted = [...frames].sort((a, b) => b.height - a.height);
  const placed: PackedFrame[] = [];
  let x = 0, y = 0, shelfHeight = 0, atlasWidth = 0;

  for (const f of sorted) {
    if (x + f.width + padding > maxWidth) {
      // New shelf.
      x = 0;
      y += shelfHeight + padding;
      shelfHeight = 0;
    }
    placed.push({ ...f, x, y });
    x += f.width + padding;
    shelfHeight = Math.max(shelfHeight, f.height);
    atlasWidth = Math.max(atlasWidth, x);
  }
  const atlasHeight = y + shelfHeight;
  // Round up to power-of-two for older GPUs / mip-friendly textures.
  const pow2 = (n: number) => 1 << Math.ceil(Math.log2(Math.max(1, n)));
  return { width: pow2(atlasWidth), height: pow2(atlasHeight), placed };
}

function blit(dst: PNG, src: PNG, dx: number, dy: number) {
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      const si = (y * src.width + x) << 2;
      const di = ((dy + y) * dst.width + (dx + x)) << 2;
      dst.data[di]     = src.data[si];
      dst.data[di + 1] = src.data[si + 1];
      dst.data[di + 2] = src.data[si + 2];
      dst.data[di + 3] = src.data[si + 3];
    }
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      in:      { type: "string", short: "i" },
      out:     { type: "string", short: "o" },
      json:    { type: "string", short: "j" },
      padding: { type: "string", default: "2" },
      max:     { type: "string", default: "4096" },
    },
  });
  if (!values.in || !values.out || !values.json) {
    console.error("usage: pack.ts --in <dir> --out <atlas.png> --json <atlas.json> [--padding N] [--max N]");
    process.exit(2);
  }
  const inDir = resolve(values.in);
  const outPath = resolve(values.out);
  const jsonPath = resolve(values.json);
  const padding = parseInt(values.padding!, 10);
  const maxWidth = parseInt(values.max!, 10);

  const entries = await readdir(inDir);
  const pngs = entries.filter(e => extname(e).toLowerCase() === ".png").sort();
  if (pngs.length === 0) {
    console.error(`no PNGs in ${inDir}`);
    process.exit(1);
  }

  const frames: FrameSpec[] = [];
  for (const file of pngs) {
    const png = await readPng(join(inDir, file));
    frames.push({
      name: basename(file, ".png"),
      width: png.width,
      height: png.height,
      png,
    });
  }

  const { width, height, placed } = shelfPack(frames, maxWidth, padding);
  const atlas = new PNG({ width, height });
  // Transparent fill.
  atlas.data.fill(0);
  for (const p of placed) blit(atlas, p.png, p.x, p.y);

  await mkdir(dirname(outPath), { recursive: true });
  await mkdir(dirname(jsonPath), { recursive: true });

  const buf: Buffer = await new Promise((res, rej) => {
    const chunks: Buffer[] = [];
    atlas.pack()
      .on("data", c => chunks.push(c as Buffer))
      .on("end", () => res(Buffer.concat(chunks)))
      .on("error", rej);
  });
  await writeFile(outPath, buf);

  const manifest: Manifest = {
    frames: Object.fromEntries(placed.map(p => [
      p.name,
      {
        frame: { x: p.x, y: p.y, w: p.width, h: p.height },
        pivot: { x: 0.5, y: 1.0 },
      },
    ])),
    meta: {
      image: basename(outPath),
      size: { w: width, h: height },
      scale: "1",
      packed_at: new Date().toISOString(),
      padding,
    },
  };
  await writeFile(jsonPath, JSON.stringify(manifest, null, 2));

  console.log(`packed ${placed.length} frame(s) → ${outPath} (${width}×${height}) + ${jsonPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
