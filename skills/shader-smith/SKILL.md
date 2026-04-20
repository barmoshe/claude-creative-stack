---
name: shader-smith
description: Author GLSL fragment shaders for visual effects, backgrounds, post-processing, and generative visuals, and wrap them in a runnable WebGL2 or Three.js r128 preview. Use when the user asks for GLSL, shaders, raymarching, SDF, fragment effects, procedural visuals, or custom post-processing. This is an orchestrator-leaning skill — it focuses on the shader + minimal wrapper; deep 3D-scene shader work is delegated to freshtechbro/claudedesignskills Three.js skills when installed.
license: MIT
---

# Shader Smith

Opinionated about GLSL style; minimal about the host code.

## When to trigger

- "Write a shader that looks like X"
- "Raymarch a scene"
- "SDF logo"
- "Background effect with mouse"
- "Post-processing filter"

## Pick a host first

| Target | Host |
|---|---|
| Standalone preview, no scene | Vanilla WebGL2 in one HTML artifact |
| In an existing Three.js r128 scene | `ShaderMaterial` / `RawShaderMaterial` (artifact) |
| R3F scene | `<shaderMaterial />` — delegate to `freshtechbro/claudedesignskills` |
| Pixi v8 filter | `Filter` + fragment shader |

## GLSL ES 3.00 template

```glsl
#version 300 es
precision highp float;

uniform vec2  uResolution;
uniform float uTime;
uniform vec2  uMouse;       // 0..1

out vec4 fragColor;

// --- helpers ---------------------------------------------------------------
float hash21(vec2 p){ p = fract(p*vec2(234.34,435.345)); p += dot(p, p+34.23); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash21(i), b = hash21(i+vec2(1,0)), c = hash21(i+vec2(0,1)), d = hash21(i+vec2(1,1));
  vec2 u = f*f*(3.-2.*f);
  return mix(a,b,u.x) + (c-a)*u.y*(1.-u.x) + (d-b)*u.x*u.y;
}

// --- main ------------------------------------------------------------------
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uResolution) / uResolution.y;
  float n = noise(uv*4.0 + uTime*0.3);
  vec3 col = mix(vec3(0.05,0.07,0.12), vec3(0.9,0.55,0.3), n);
  fragColor = vec4(col, 1.0);
}
```

## Minimal WebGL2 host (HTML artifact)

Key points the scaffold must include:
- Fullscreen triangle, not quad — 1 draw call, no index buffer.
- Resize handler that sets `canvas.width = cssW * devicePixelRatio`.
- `requestAnimationFrame` loop feeding `uTime` in seconds.
- Pointer-move listener writing to `uMouse` normalized.
- Respect `prefers-reduced-motion` — pause time.

## Technique cheat sheet

| Technique | When to reach for |
|---|---|
| SDF 2D (circle/box/rounded) + `smoothstep` | Crisp shapes, logos, UI glow |
| Domain warp (`p += noise(p)`) | Organic flows, liquid, fabric |
| fBm (fractal Brownian motion) | Clouds, terrain noise, paper |
| Raymarch SDF 3D | 3D scenes with no geometry upload |
| Worley / Voronoi | Cells, skin, crystals |
| Feedback (ping-pong FBO) | Trails, reaction-diffusion, blur |

## Delegation

- Full scene-graph shader work with multiple passes → hand to `freshtechbro/claudedesignskills` Three.js / R3F skills.
- This skill: single-shader effects + wrapper.

## Common pitfalls

- `precision highp float;` — always declare; mobile defaults vary.
- `#version 300 es` must be the **first** line (no preceding comment).
- Avoid dynamic loops on mobile GPUs — unroll or cap iterations.
- `gl_FragCoord.y` points up in WebGL; invert if matching image coords.

## Output shape

1. **Approach** — 2 sentences on technique.
2. **Shader** in a fenced block labeled `glsl`.
3. **Full HTML artifact** (shader + host) in a fenced block labeled `html`.
4. **Uniform reference** table.
5. **Known artifacts** — one paragraph on mobile/perf caveats.

## Further reading

- `knowledge/05-graphics-design.md` — GLSL cheat sheet.
- `knowledge/03-artifacts.md` — Three.js r128 and `three/examples/jsm` restrictions.
- `artifacts/html/shader-playground.html` — working starter.
