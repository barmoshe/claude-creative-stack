# 03 — Artifacts (Advanced Usage)

## 3.1 Artifact types

| Type | MIME | Use |
|---|---|---|
| HTML | `text/html` | Full pages, Three.js scenes, games, tools |
| React/JSX | `application/vnd.ant.react` | Stateful UIs, data apps |
| SVG | `image/svg+xml` | Icons, diagrams, infographics |
| Mermaid | `application/vnd.ant.mermaid` | Flowcharts, sequence, Gantt |
| Markdown | `text/markdown` | Reports, long-form writing |
| Code | `application/vnd.ant.code` | Non-executed source, syntax-highlighted |
| PDF | `application/pdf` | Formal docs/certificates (downloadable) |

Creation criteria: ≥~15 lines, self-contained, user-editable/iterable/reusable, referable later.

## 3.2 React artifact library whitelist

```js
// Imports confirmed via Anthropic system-prompt leaks and the artifact runner repos.
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Camera } from "lucide-react";              // ~0.383.0 (drifts; historically 0.263.1)
import { LineChart, XAxis } from "recharts";
import * as math from "mathjs";
import _ from "lodash";
import * as d3 from "d3";
import * as Plotly from "plotly";
import * as THREE from "three";                      // r128 (OLD)
import * as Chart from "chart.js";
import * as Tone from "tone";
import * as Papa from "papaparse";
import * as XLSX from "sheetjs";                     // SheetJS
import * as mammoth from "mammoth";
import * as tf from "tensorflow";                    // tensorflow.js
import {
  Alert, AlertDescription, AlertTitle,
  AlertDialog, AlertDialogAction, Button, Card, CardContent, CardHeader,
  CardTitle, Dialog, Input, Textarea, Select, ScrollArea, Tabs,
  Badge, DropdownMenu, Popover, Calendar, Collapsible, Form, Label,
  Checkbox, RadioGroup, Switch, Slider, Table, Toast, Tooltip, Separator
} from "@/components/ui/alert"; // shadcn/ui (mix-path import pattern)
```

No other libraries are available. No Framer Motion, no react-router, no react-spring, no axios, no date-fns.

**Three.js r128 gotchas**:
- `CapsuleGeometry` (r142+) is missing — compose `CylinderGeometry` + two `SphereGeometry`.
- `OrbitControls` from `three/examples/jsm/controls/OrbitControls` is not reachable.
- HTML-artifact CDN allowed: only `https://cdnjs.cloudflare.com`. Correct Three.js URL: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`.
- Pyodide is allow-listed via CSP (not in the official list but works).

## 3.3 `window.storage` persistent API

Official surface (support.claude.com):
- **Plans**: Pro, Max, Team, Enterprise.
- **Only works after the artifact is published.** Unpublish = permanent data loss.
- **Per-artifact cap**: 20 MB total (text only — no binary).
- **Personal vs shared storage** are isolated.

API:

```js
await window.storage.set(key, value);                   // personal (default)
await window.storage.set(key, value, true);             // shared
await window.storage.set(key, value, { shared: true }); // alt form
const res = await window.storage.get(key);              // { value: string } | null
const data = res ? JSON.parse(res.value) : null;
await window.storage.delete(key);
const keys = await window.storage.list("notes:");       // prefix list
```

Constraints: keys <200 chars, no whitespace/slashes/quotes. Values text/JSON only. ~5 MB per key (community-observed). All methods are async. Concurrency: last-write-wins.

Batching pattern:

```js
// ❌ sequential writes
await window.storage.set("cards", cards);
await window.storage.set("benefits", benefits);
// ✅ single combined key
await window.storage.set("app-state", JSON.stringify({ cards, benefits, completion }));
```

Error handling:

```js
try {
  const res = await window.storage.get("x");
  return res ? JSON.parse(res.value) : defaults;
} catch { return defaults; }
```

## 3.4 AI-powered artifacts ("Claudeception")

- Endpoint: `https://api.anthropic.com/v1/messages` — **no API key** required; billed against the end-user's Claude subscription.
- Pinned model inside artifacts: `claude-sonnet-4-20250514`.

```js
const r = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{ role: "user", content: "..." }]
  })
});
const data = await r.json();
const text = data.content.filter(i => i.type === "text").map(i => i.text).join("\n");
```

With web search:

```js
tools: [{ type: "web_search_20250305", name: "web_search" }]
```

With MCP servers (each user authenticates independently):

```js
mcp_servers: [{ type: "url", url: "https://mcp.asana.com/sse", name: "asana-mcp" }]
// parse results by item type, not index:
const mcpResults = data.content.filter(i => i.type === "mcp_tool_result")
                                .map(i => i.content?.[0]?.text || "");
```

Reading user-uploaded files:

```js
// Node fs/promises-shaped API
const bytes = await window.fs.readFile("/path/to/upload.csv");           // Uint8Array
const text  = await window.fs.readFile("/path/to/upload.csv", { encoding: "utf8" });
```

## 3.5 Constraints & gotchas

| Constraint | Detail |
|---|---|
| `localStorage`/`sessionStorage`/`indexedDB` | **Blocked.** Use React state or `window.storage`. |
| `<form>` in React | **Breaks.** Use `onClick` handlers. No `type="submit"`. |
| Tailwind | Core utility classes only. **No JIT / arbitrary values** like `text-[22px]`. No `tailwind.config`. |
| File layout | Single-file only. Cannot reference sibling files you "create". |
| React default export | Must have `export default function`. Component must render with zero required props. |
| Hooks | Must import explicitly: `import { useState } from "react"`. |
| External CDN | HTML artifacts: `cdnjs.cloudflare.com` only. React artifacts: whitelist only. |
| `fetch` | Blocked to arbitrary hosts. **Only `api.anthropic.com/v1/messages`** is allow-listed (July 2025). |
| `window.fs` | Read-only; user-uploaded files only. |
| Three.js | r128 only; no r142+ features. |
