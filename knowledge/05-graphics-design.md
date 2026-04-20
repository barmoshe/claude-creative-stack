# 05 — Graphics, Assets, Visual Design

## 5.1 2025–2026 design trends

- **Bento grids** — Apple-style modular cards. `display: grid; grid-template-columns: repeat(12, 1fr); gap: 1rem;` cells span different widths/heights; rounded corners 16–24 px; subtle borders; aspect ratios for visual rhythm.
- **Glassmorphism 2.0** — multi-layer `backdrop-filter: blur(24px) saturate(180%);` translucent fills rgba α 0.08–0.25, 1 px inner highlight, paired with vibrant mesh backgrounds or SVG noise overlay.
- **Neo-brutalism** — `border: 3px solid #000; box-shadow: 6px 6px 0 0 #000; border-radius: 0;` saturated colors (yellow, hot pink, electric blue), chunky sans.
- **Kinetic typography** — variable font weights animated, SplitText per-character, scroll-linked transforms; `animation-timeline: view()` + `font-variation-settings`.
- **Editorial / magazine** — asymmetric CSS grid with named areas, drop caps (`::first-letter`), mixed serif+sans, rule lines, wide whitespace, justified columns.
- **Anti-design** — default fonts (Times/Arial/Comic Sans), broken grids, deliberately unstyled; `border: 2px ridge`.
- **Y2K revival** — chrome/iridescent gradients, holographic conic gradients, blobby 3D, pixel fonts; `linear-gradient(135deg, #c0c0c0, #fff, #a0a0a0)` + `filter: hue-rotate()`.
- **Organic / blob shapes** — `border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%;` animated; SVG Bézier blobs (blobmaker.app).
- **Big typography** — `font-size: clamp(4rem, 15vw, 20rem); letter-spacing: -0.04em; line-height: 0.85;`, often overflowing viewport.
- **Dark mode + vibrant accents** — `background: oklch(0.15 0 0); --accent: oklch(0.85 0.3 140); text-shadow: 0 0 20px var(--accent);`.

## 5.2 Tailwind CSS v4

- **Current**: v4.1 (April 2025). Oxide Rust engine (~5–10× full build, 100×+ incremental).
- Entry point: `@import "tailwindcss";` replacing the three `@tailwind` directives.
- CSS-first config:

  ```css
  @theme {
    --color-brand: oklch(0.7 0.2 260);
    --font-display: "Satoshi", sans-serif;
    --breakpoint-3xl: 120rem;
  }
  ```

- Arbitrary values: `w-[123px]`. CSS var syntax changed in v4: `bg-(--brand)` (was `bg-[--brand]`).
- Container queries native: `@container`, `@min-*`, `@max-*`.
- Default changes: `border` uses `currentColor` (was gray-200); `ring` is 1px currentColor (was 3px blue-500).
- Requires Safari 16.4+, Chrome 111+, Firefox 128+, Node 20+.
- Upgrade tool: `npx @tailwindcss/upgrade`.
- Packages: `@tailwindcss/vite` (recommended), `@tailwindcss/postcss`, `@tailwindcss/cli`.

## 5.3 GLSL shaders cheat sheet

See [`04-animation.md` §4.5](04-animation.md). Libraries:
- **lygia** — `patriciogonzalezvivo/lygia`; `#include "lygia/generative/snoise.glsl"`.
- **glsl-noise** — `npm i glsl-noise` + glslify.
- Shadertoy ports — paste Shadertoy fragment into three.js `ShaderMaterial` with `iTime`, `iResolution`, `iMouse` uniforms.

## 5.4 SVG mastery

**Path commands** (upper = absolute, lower = relative):
`M x y`, `L x y`, `H x`, `V y`, `C x1 y1 x2 y2 x y`, `S x2 y2 x y`, `Q x1 y1 x y`, `T x y`, `A rx ry rot largeArc sweep x y`, `Z`.

**Filter primitives**: `feTurbulence`, `feGaussianBlur`, `feDisplacementMap`, `feColorMatrix`, `feMorphology`, `feComposite`, `feFlood`, `feMerge`, `feOffset`, `feBlend`.

**Masks vs clip-paths**:
- `<clipPath>` — binary geometry cutout.
- `<mask>` — grayscale luminance; supports partial alpha, gradients, images.
- CSS: `clip-path: path()/polygon()/circle()`; `mask: linear-gradient(...)`.

**Gradients**:

```xml
<linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#f0f"/><stop offset="1" stop-color="#0ff"/>
</linearGradient>
<radialGradient id="rg" cx="0.5" cy="0.5" r="0.5"/>
```

CSS conic: `conic-gradient(from 45deg, red, yellow, lime, cyan, blue, magenta, red)` (CSS-only; no SVG conic).

**SVG-in-CSS data URI**:

```css
background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='2' fill='%23000'/></svg>");
```

Use `%23` for `#`, `%20` for space; prefer utf8 over base64 for size.

## 5.5 Icon sets

| Package | Version | Count | Install | Notes |
|---|---|---|---|---|
| `lucide-react` | 1.8.0 | 1600+ | `npm i lucide-react` | Feather fork; tree-shakable |
| `@heroicons/react` | 2.2.0 | 316 × 4 | `npm i @heroicons/react` | 24/outline, 24/solid, 20/solid, 16/solid |
| `@phosphor-icons/react` | latest | 9000+ | `npm i @phosphor-icons/react` | Weights: thin, light, regular, bold, fill, duotone |
| `@tabler/icons-react` | 3.41.1 | 6000+ | `npm i @tabler/icons-react` | Stroke-based |
| `@radix-ui/react-icons` | 1.3.2 | 332 | `npm i @radix-ui/react-icons` | 15×15 optimized |
| `@iconify/react` | latest | 200k+ | `npm i @iconify/react` | 100+ icon sets on demand |

## 5.6 Typography

- Variable fonts: `font-variation-settings: "wght" 650, "wdth" 85, "opsz" 48;`
- Fluid type: `font-size: clamp(1rem, 0.5rem + 2vw, 2rem);`
- OpenType: `font-feature-settings: "liga","smcp","onum","tnum","ss01";` or shorthand `font-variant-*`.
- Balance / prettier wrapping: `h1,h2 { text-wrap: balance; } p { text-wrap: pretty; }`.
- Optical sizing: `font-optical-sizing: auto;`.
- Google Fonts variable: `https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap`.

## 5.7 Color

- **oklch(L C H)**: L 0–1, C 0–~0.4, H 0–360. Perceptually uniform — consistent luminance across hues.
- **Wide gamut**: `color(display-p3 1 0.3 0.1)` (~25% more colors on P3 displays). Provide sRGB fallback first.
- **`color-mix()`**: `color-mix(in oklch, var(--brand) 60%, black)`.
- **WCAG contrast**: AA normal 4.5:1, large 3:1; AAA normal 7:1, large 4.5:1.
- **Mesh gradient** (multi-radial fake):

  ```css
  background:
    radial-gradient(at 20% 30%, oklch(.8 .2 20) 0, transparent 50%),
    radial-gradient(at 80% 20%, oklch(.75 .22 280) 0, transparent 50%),
    radial-gradient(at 50% 80%, oklch(.7 .25 150) 0, transparent 50%),
    oklch(.15 0 0);
  ```

- **Grain overlay** via SVG feTurbulence + feColorMatrix alpha-only, applied as a fixed-position semi-transparent background.

## 5.8 AI asset generation

| Model | Strength |
|---|---|
| Flux (Pro / Dev / Schnell / Ultra / Kontext) | Prompt adherence, typography; dev weights open |
| Ideogram v2/v3 | In-image text rendering, logos |
| DALL-E 3 | Instruction following, GPT integration |
| Stable Diffusion 3.5 / SDXL | Open ecosystem, ControlNet, LoRAs |
| Midjourney v6.1/v7 | Aesthetic excellence |
| Google Imagen 3 / Nano Banana | Google flagship |
| Recraft V3 | Vector / brand generation |

**Claude generating SVG**: excellent for clean hand-authored icon / illustration / chart SVG. Prompt pattern: *"Generate valid SVG with viewBox 0 0 24 24, stroke-width 1.5, currentColor strokes, no fills, of X."*

Sprite sheets: generate individual frames via image model → pack with `free-tex-packer` or TexturePacker → emit atlas JSON.
