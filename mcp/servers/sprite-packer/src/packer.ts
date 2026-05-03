/**
 * Pure packing logic — exported for the MCP tool and for tests.
 * Mirrors skills/sprite-atlas-builder/scripts/pack.ts but works on in-memory
 * PNG buffers instead of reading from disk.
 */
import { PNG } from "pngjs";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, basename, extname, join } from "node:path";
import { Buffer } from "node:buffer";

export interface FrameSpec {
  name: string;
  width: number;
  height: number;
  png: PNG;
}

export interface PackedFrame extends FrameSpec {
  x: number;
  y: number;
}

export interface PackResult {
  width: number;
  height: number;
  placed: PackedFrame[];
}

export interface Manifest {
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

const pow2 = (n: number) => 1 << Math.ceil(Math.log2(Math.max(1, n)));

export function shelfPack(frames: FrameSpec[], maxWidth: number, padding: number): PackResult {
  const sorted = [...frames].sort((a, b) => b.height - a.height);
  const placed: PackedFrame[] = [];
  let x = 0, y = 0, shelfHeight = 0, atlasWidth = 0;

  for (const f of sorted) {
    if (x + f.width + padding > maxWidth) {
      x = 0;
      y += shelfHeight + padding;
      shelfHeight = 0;
    }
    placed.push({ ...f, x, y });
    x += f.width + padding;
    shelfHeight = Math.max(shelfHeight, f.height);
    atlasWidth = Math.max(atlasWidth, x);
  }
  return { width: pow2(atlasWidth), height: pow2(y + shelfHeight), placed };
}

export function blit(dst: PNG, src: PNG, dx: number, dy: number) {
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

export function buildManifest(packed: PackResult, padding: number, imageBasename: string): Manifest {
  return {
    frames: Object.fromEntries(packed.placed.map(p => [
      p.name,
      {
        frame: { x: p.x, y: p.y, w: p.width, h: p.height },
        pivot: { x: 0.5, y: 1.0 },
      },
    ])),
    meta: {
      image: imageBasename,
      size: { w: packed.width, h: packed.height },
      scale: "1",
      packed_at: new Date().toISOString(),
      padding,
    },
  };
}

export function readPngFromBuffer(buf: Buffer): Promise<PNG> {
  return new Promise((res, rej) => {
    new PNG().parse(buf, (err, data) => err ? rej(err) : res(data));
  });
}

export function pngToBuffer(png: PNG): Promise<Buffer> {
  return new Promise((res, rej) => {
    const chunks: Buffer[] = [];
    png.pack()
      .on("data", c => chunks.push(c as Buffer))
      .on("end", () => res(Buffer.concat(chunks)))
      .on("error", rej);
  });
}

export async function packDir(opts: {
  inDir: string;
  outPath: string;
  jsonPath: string;
  padding?: number;
  maxWidth?: number;
}): Promise<{ frames: number; width: number; height: number; manifestPath: string; atlasPath: string }> {
  const padding = opts.padding ?? 2;
  const maxWidth = opts.maxWidth ?? 4096;
  const entries = await readdir(opts.inDir);
  const pngs = entries.filter(e => extname(e).toLowerCase() === ".png").sort();
  if (pngs.length === 0) throw new Error(`no PNGs in ${opts.inDir}`);

  const frames: FrameSpec[] = [];
  for (const file of pngs) {
    const buf = await readFile(join(opts.inDir, file));
    const png = await readPngFromBuffer(buf);
    frames.push({ name: basename(file, ".png"), width: png.width, height: png.height, png });
  }

  const packed = shelfPack(frames, maxWidth, padding);
  const atlas = new PNG({ width: packed.width, height: packed.height });
  atlas.data.fill(0);
  for (const p of packed.placed) blit(atlas, p.png, p.x, p.y);

  await mkdir(dirname(opts.outPath), { recursive: true });
  await mkdir(dirname(opts.jsonPath), { recursive: true });
  await writeFile(opts.outPath, await pngToBuffer(atlas));

  const manifest = buildManifest(packed, padding, basename(opts.outPath));
  await writeFile(opts.jsonPath, JSON.stringify(manifest, null, 2));

  return {
    frames: packed.placed.length,
    width: packed.width,
    height: packed.height,
    atlasPath: opts.outPath,
    manifestPath: opts.jsonPath,
  };
}

export async function inspectAtlas(jsonPath: string): Promise<{
  frames: number;
  size: { w: number; h: number };
  image: string;
  packed_at: string;
  framelist: string[];
}> {
  const raw = await readFile(jsonPath, "utf8");
  const m = JSON.parse(raw) as Manifest;
  return {
    frames: Object.keys(m.frames).length,
    size: m.meta.size,
    image: m.meta.image,
    packed_at: m.meta.packed_at,
    framelist: Object.keys(m.frames).slice(0, 50),
  };
}
