export const SHADER_HEADER = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uBeatPhase;
uniform float uAmplitude;
uniform vec2 uResolution;
uniform float uOpacity;
varying vec2 vUv;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float pseudoFbm(vec2 p) {
  float v = 0.0;
  v += sin(p.x * 1.3) * cos(p.y * 1.1) * 0.5;
  v += sin(p.x * 2.7 + 1.0) * cos(p.y * 2.3 - 0.5) * 0.25;
  v += sin(p.x * 5.4 - 0.7) * cos(p.y * 5.1 + 1.2) * 0.125;
  return v * 0.5 + 0.5;
}

vec3 starLayer(vec2 uv, float scale, float drift, vec3 tint) {
  uv *= scale;
  uv.y += uTime * drift;
  vec2 id = floor(uv);
  vec2 gv = fract(uv) - 0.5;
  float h = hash21(id);
  float size = h * 0.08 + 0.012;
  size *= 1.0 + uAmplitude * 1.8;
  float d = length(gv);
  float bright = smoothstep(size, 0.0, d);
  bright *= step(0.78, h);
  bright *= 0.6 + 0.4 * sin(uTime * 2.0 + h * 12.56);
  return tint * bright;
}
`;
