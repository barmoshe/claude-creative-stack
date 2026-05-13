#!/usr/bin/env node
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { extname, resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";

const FORMATS = new Set(["svg", "png", "pdf"]);
const TYPES = new Set(["mermaid", "excalidraw", "graphviz", "plantuml", "d2"]);

function usage(exitCode = 0) {
  console.log(`Usage:
  node scripts/render-diagram.mjs --input path --output path [--type mermaid|excalidraw|graphviz|plantuml|d2] [--format svg|png|pdf] [--frame name-or-id]

Examples:
  node scripts/render-diagram.mjs --input docs/flow.mmd --output docs/flow.svg
  node scripts/render-diagram.mjs --input board.excalidraw --output board.png
  node scripts/render-diagram.mjs --input board.excalidraw --output frame.svg --frame "Slide 1"
  node scripts/render-diagram.mjs --input graph.dot --output graph.pdf --type graphviz`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === "--help" || token === "-h") usage(0);
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
    args[key] = value;
    i++;
  }
  if (!args.input || !args.output) usage(1);
  return args;
}

function inferType(input) {
  const ext = extname(input).toLowerCase();
  if (ext === ".mmd" || ext === ".mermaid") return "mermaid";
  if (ext === ".excalidraw") return "excalidraw";
  if (ext === ".dot" || ext === ".gv") return "graphviz";
  if (ext === ".puml" || ext === ".plantuml") return "plantuml";
  if (ext === ".d2") return "d2";
  throw new Error(`Cannot infer diagram type from extension "${ext}". Pass --type.`);
}

function inferFormat(output, explicit) {
  const format = explicit || extname(output).replace(".", "").toLowerCase();
  if (!FORMATS.has(format)) throw new Error(`Unsupported format "${format}". Use svg, png, or pdf.`);
  return format;
}

function run(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: "inherit", shell: false, ...options });
    child.on("error", reject);
    child.on("exit", code => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

function svgEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function decodeExcalidraw(input) {
  const parsed = JSON.parse(input);
  if (parsed.type === "excalidraw") return parsed;
  if (Array.isArray(parsed.elements)) return parsed;
  throw new Error("Invalid Excalidraw JSON: expected root type=excalidraw or elements[].");
}

function elementInsideFrame(el, frame) {
  const x = Number(el.x || 0);
  const y = Number(el.y || 0);
  const w = Number(el.width || 0);
  const h = Number(el.height || 0);
  return x >= Number(frame.x || 0)
    && y >= Number(frame.y || 0)
    && x + w <= Number(frame.x || 0) + Number(frame.width || 0)
    && y + h <= Number(frame.y || 0) + Number(frame.height || 0);
}

function frameBounds(frame) {
  return {
    minX: Number(frame.x || 0),
    minY: Number(frame.y || 0),
    maxX: Number(frame.x || 0) + Math.max(1, Number(frame.width || 1)),
    maxY: Number(frame.y || 0) + Math.max(1, Number(frame.height || 1))
  };
}

function selectExcalidrawFrame(json, frameRef) {
  if (!frameRef) return { json, bounds: null, sourceJson: json };
  const frames = (json.elements || []).filter(el => !el.isDeleted && el.type === "frame");
  const wanted = frames.find(frame => frame.id === frameRef || frame.name === frameRef);
  if (!wanted) {
    const names = frames.map(frame => frame.name || frame.id).join(", ") || "none";
    throw new Error(`Excalidraw frame "${frameRef}" not found. Available frames: ${names}`);
  }
  const children = (json.elements || []).filter(el => (
    !el.isDeleted
    && el.type !== "frame"
    && (el.frameId === wanted.id || (!el.frameId && elementInsideFrame(el, wanted)))
  ));
  const sourceJson = {
    ...json,
    elements: children,
    appState: {
      ...json.appState,
      exportingFrame: wanted
    }
  };
  return {
    json: sourceJson,
    bounds: frameBounds(wanted),
    sourceJson
  };
}

function boundsFor(elements) {
  const visible = elements.filter(el => !el.isDeleted);
  if (!visible.length) return { minX: 0, minY: 0, maxX: 1280, maxY: 720 };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const el of visible) {
    const x = Number(el.x || 0);
    const y = Number(el.y || 0);
    const w = Number(el.width || 0);
    const h = Number(el.height || 0);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + Math.max(1, w));
    maxY = Math.max(maxY, y + Math.max(1, h));
  }
  const pad = 48;
  return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad };
}

function styleFor(el) {
  const stroke = el.strokeColor || "#1e1e1e";
  const fill = el.backgroundColor && el.backgroundColor !== "transparent"
    ? el.backgroundColor
    : "none";
  const width = Math.max(1, Number(el.strokeWidth || 2));
  const dash = el.strokeStyle === "dashed" ? `stroke-dasharray="${width * 4} ${width * 3}"` : "";
  return `fill="${svgEscape(fill)}" stroke="${svgEscape(stroke)}" stroke-width="${width}" ${dash} stroke-linecap="round" stroke-linejoin="round"`;
}

function arrowHead(x1, y1, x2, y2, color, width) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = Math.max(10, width * 5);
  const a1 = angle + Math.PI * 0.82;
  const a2 = angle - Math.PI * 0.82;
  const p1 = [x2 + Math.cos(a1) * size, y2 + Math.sin(a1) * size];
  const p2 = [x2 + Math.cos(a2) * size, y2 + Math.sin(a2) * size];
  return `<path d="M ${p1[0]} ${p1[1]} L ${x2} ${y2} L ${p2[0]} ${p2[1]}" fill="none" stroke="${svgEscape(color)}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function pointsPath(points, x, y) {
  return points.map((point, i) => `${i ? "L" : "M"} ${x + point[0]} ${y + point[1]}`).join(" ");
}

function renderExcalidrawElement(el) {
  const x = Number(el.x || 0);
  const y = Number(el.y || 0);
  const w = Number(el.width || 0);
  const h = Number(el.height || 0);
  const style = styleFor(el);
  const stroke = el.strokeColor || "#1e1e1e";
  const strokeWidth = Math.max(1, Number(el.strokeWidth || 2));

  if (el.type === "rectangle" || el.type === "frame") {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" ${style}/>`;
  }
  if (el.type === "diamond") {
    const points = `${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`;
    return `<polygon points="${points}" ${style}/>`;
  }
  if (el.type === "ellipse") {
    return `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${Math.abs(w / 2)}" ry="${Math.abs(h / 2)}" ${style}/>`;
  }
  if (el.type === "line" || el.type === "arrow") {
    const points = Array.isArray(el.points) && el.points.length ? el.points : [[0, 0], [w, h]];
    const d = pointsPath(points, x, y);
    const end = points[points.length - 1];
    const prev = points[points.length - 2] || points[0];
    const head = el.type === "arrow" ? arrowHead(x + prev[0], y + prev[1], x + end[0], y + end[1], stroke, strokeWidth) : "";
    return `<path d="${d}" ${style} fill="none"/>${head}`;
  }
  if (el.type === "freedraw") {
    const points = Array.isArray(el.points) ? el.points : [];
    return `<path d="${pointsPath(points, x, y)}" ${style} fill="none"/>`;
  }
  if (el.type === "text") {
    const fontSize = Number(el.fontSize || 24);
    const family = svgEscape(String(el.fontFamily || "Virgil, Segoe Print, Comic Sans MS, cursive"));
    const lines = String(el.text || "").split("\n");
    return `<text x="${x}" y="${y + fontSize}" fill="${svgEscape(stroke)}" font-size="${fontSize}" font-family="${family}" font-weight="600">${
      lines.map((line, i) => `<tspan x="${x}" dy="${i ? fontSize * 1.18 : 0}">${svgEscape(line)}</tspan>`).join("")
    }</text>`;
  }
  return `<!-- Unsupported Excalidraw element: ${svgEscape(el.type)} -->`;
}

function renderExcalidrawSvg(json, sourceText, options = {}) {
  const elements = (json.elements || []).filter(el => !el.isDeleted);
  const { minX, minY, maxX, maxY } = options.bounds || boundsFor(elements);
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  const bg = json.appState?.viewBackgroundColor || "#ffffff";
  const metadata = Buffer.from(sourceText).toString("base64");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX} ${minY} ${width} ${height}" role="img">
  <metadata id="excalidraw-source">${metadata}</metadata>
  <rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="${svgEscape(bg)}"/>
  <g>
    ${elements.map(renderExcalidrawElement).join("\n    ")}
  </g>
</svg>`;
}

async function rasterizeSvg(svg, output, format) {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    throw new Error("PNG/PDF rasterization requires Playwright. Run npm install in the repo.");
  }
  const dir = await mkdtemp(join(tmpdir(), "diagram-render-"));
  const svgPath = join(dir, "diagram.svg");
  const htmlPath = join(dir, "diagram.html");
  await writeFile(svgPath, svg);
  await writeFile(htmlPath, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:white}svg{display:block}</style>${svg}`);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`);
    const box = await page.locator("svg").boundingBox();
    await page.setViewportSize({
      width: Math.ceil(box?.width || 1280),
      height: Math.ceil(box?.height || 720),
    });
    if (format === "png") {
      await page.screenshot({ path: output, omitBackground: false });
    } else {
      await page.pdf({ path: output, printBackground: true, width: `${Math.ceil(box?.width || 1280)}px`, height: `${Math.ceil(box?.height || 720)}px` });
    }
  } finally {
    await browser.close();
    await rm(dir, { recursive: true, force: true });
  }
}

async function renderExcalidraw(input, output, format, options = {}) {
  const sourceText = await readFile(input, "utf8");
  const json = decodeExcalidraw(sourceText);
  const selected = selectExcalidrawFrame(json, options.frame);
  const selectedSource = options.frame ? JSON.stringify(selected.sourceJson, null, 2) : sourceText;
  const svg = renderExcalidrawSvg(selected.json, selectedSource, { bounds: selected.bounds });
  if (format === "svg") {
    await writeFile(output, svg);
  } else {
    await rasterizeSvg(svg, output, format);
  }
}

async function renderWithCli(type, input, output, format) {
  if (type === "mermaid") {
    await run("npx", ["-y", "@mermaid-js/mermaid-cli", "-i", input, "-o", output, "-b", "transparent"]);
    return;
  }
  if (type === "graphviz") {
    await run("dot", [`-T${format}`, input, "-o", output]);
    return;
  }
  if (type === "plantuml") {
    const flag = format === "svg" ? "-tsvg" : format === "png" ? "-tpng" : "-tpdf";
    const dir = await mkdtemp(join(tmpdir(), "plantuml-render-"));
    const copy = join(dir, `diagram${extname(input) || ".puml"}`);
    await writeFile(copy, await readFile(input));
    await run("plantuml", [flag, copy]);
    const produced = copy.replace(extname(copy), `.${format}`);
    await writeFile(output, await readFile(produced));
    await rm(dir, { recursive: true, force: true });
    return;
  }
  if (type === "d2") {
    await run("d2", [input, output]);
    return;
  }
  throw new Error(`No CLI renderer configured for ${type}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const input = resolve(args.input);
  const output = resolve(args.output);
  const type = args.type || inferType(input);
  const format = inferFormat(output, args.format);

  if (!TYPES.has(type)) throw new Error(`Unsupported type "${type}".`);

  if (type === "excalidraw") {
    await renderExcalidraw(input, output, format, { frame: args.frame });
  } else {
    await renderWithCli(type, input, output, format);
  }

  const hash = createHash("sha256").update(await readFile(output)).digest("hex").slice(0, 10);
  console.log(`Rendered ${type} -> ${format}: ${output} (${hash})`);
}

main().catch(err => {
  console.error(`render-diagram: ${err.message}`);
  process.exit(1);
});
