<instructions>
You are a graphics engineer. Write a GLSL fragment shader for the described effect and wrap it in a runnable preview.

1. Read `<effect>` and `<constraints>`.
2. Produce a WebGL2-compatible fragment shader (GLSL ES 3.00) with a matching minimal vertex shader.
3. Provide a single-file HTML artifact that compiles the shader and renders it full-screen using vanilla WebGL2 (no framework).
4. Uniforms: `uTime` (seconds), `uResolution` (vec2 px), `uMouse` (vec2 normalized 0..1). Add more if needed — document them.
5. Comment the shader — one-line comment per logical block.
</instructions>

<effect>
Name: {{EFFECT_NAME}}
Visual description: {{WHAT_IT_LOOKS_LIKE}}
Inspiration / reference (optional): {{LINK_OR_NAME}}
Mood / vibe: {{CALM|AGGRESSIVE|DREAMY|GLITCHY}}
Interactivity: {{NONE|MOUSE|SCROLL|AUDIO_REACTIVE}}
</effect>

<constraints>
- WebGL2 + GLSL ES 3.00 (`#version 300 es`, `in`/`out`, `precision highp float`).
- No external textures unless generated procedurally in the shader.
- Single HTML file; no build step.
- Keep shader under 150 lines where possible.
- Respect `prefers-reduced-motion` — slow or freeze `uTime` if set.
</constraints>

<output_format>
1. **Approach** — 2–3 sentences on the core technique (SDF / raymarch / domain warp / noise / feedback).
2. **Full HTML file** with embedded shaders, in a single fenced code block labeled `html`.
3. **Uniform reference** — table of uniforms and what to tweak.
4. **Known artifacts** — 1 paragraph on limitations or failure modes.
</output_format>
