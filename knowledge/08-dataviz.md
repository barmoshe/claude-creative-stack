# 08 — Data Visualization

## 8.1 Library matrix

| Library | Version | npm | Render | Strength |
|---|---|---|---|---|
| D3.js | 7.9.0 | `d3` | SVG/Canvas | Low-level primitives |
| Recharts | 3.8.1 | `recharts` | SVG (React) | Composable; v3 has breaking changes from v2 |
| Chart.js | 4.5.1 | `chart.js` | Canvas | ESM-only, 8 chart types |
| Plotly.js | 3.5.0 | `plotly.js` / `plotly.js-dist-min` | SVG + WebGL | 40+ trace types |
| Observable Plot | 0.6.17 | `@observablehq/plot` | SVG | Grammar of graphics |
| Visx | 3.12.0 | `@visx/visx` + submodules | SVG (React) | Low-level; D3 math |
| ECharts | 6.0.0 | `echarts` | Canvas + WebGL (echarts-gl) | 20+ types, great perf |
| nivo | 0.99.0 | `@nivo/core`+`@nivo/bar` … | SVG/Canvas/HTML (React) | SSR |
| deck.gl | 9.3.0 | `deck.gl` or `@deck.gl/core` | WebGL2/WebGPU | Large geospatial |
| regl | 2.1.1 | `regl` | WebGL (functional) | Stateless wrapper |

## 8.2 D3 v7 modules

`d3-force` (force-directed sim), `d3-geo` (projections/paths), `d3-hierarchy` (tree/pack/partition/treemap), `d3-scale` (Linear/Log/Time/Band/Ordinal/Sequential), `d3-shape` (arc/line/area/pie/stack/symbol), `d3-selection`, `d3-transition`, `d3-array`, `d3-scale-chromatic`.

```js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
const sim = d3.forceSimulation(nodes)
  .force("charge", d3.forceManyBody().strength(-80))
  .force("center", d3.forceCenter(W/2, H/2))
  .force("link", d3.forceLink(links).id(d=>d.id).distance(40))
  .on("tick", render);
```

## 8.3 Recipes

```jsx
// Recharts
<LineChart width={400} height={300} data={data}>
  <XAxis dataKey="name"/><YAxis/><Tooltip/><CartesianGrid stroke="#eee"/>
  <Line type="monotone" dataKey="uv" stroke="#f73"/>
</LineChart>
```

```js
// Chart.js 4 — ESM
import Chart from "chart.js/auto";
new Chart(ctx, { type:"bar", data:{ labels, datasets:[{ label:"S", data }]}, options:{} });
```

```js
// Observable Plot
import * as Plot from "@observablehq/plot";
Plot.rectY(data, Plot.binX({ y:"count" }, { x:"value" })).plot();
```

```js
// ECharts 6
import * as echarts from "echarts";
echarts.init(el).setOption({ xAxis:{ type:"category", data:labels }, yAxis:{ type:"value" },
  series:[{ type:"line", data }]});
```

```js
// deck.gl 9
import { Deck } from "@deck.gl/core";
import { ScatterplotLayer } from "@deck.gl/layers";
new Deck({
  initialViewState:{ longitude:-122.4, latitude:37.78, zoom:8 }, controller:true,
  layers:[new ScatterplotLayer({ data, getPosition:d=>d.pos, getRadius:50, getFillColor:[255,140,0] })]
});
```

**Perf tiers**: SVG (D3/Recharts/Plot/Visx) → ~1k–10k points; Canvas (Chart.js/ECharts/nivo-Canvas) → 10k–100k; WebGL (deck.gl/regl/Plotly scattergl/ECharts-GL) → millions.
