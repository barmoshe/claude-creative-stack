#version 300 es
// Voronoi — animated cells. Useful as a base for skin, crystals, scales.
precision highp float;

uniform vec2  uResolution;
uniform float uTime;

out vec4 fragColor;

vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453) * 2.0 - 1.0;
}

float voronoi(vec2 p, float t, out vec2 nearest) {
  vec2 i = floor(p), f = fract(p);
  float d = 1.0;
  nearest = vec2(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 o = hash22(i + g);
      o = 0.5 + 0.5 * sin(t + 6.2831 * o);  // animate cell points
      vec2 r = g + o - f;
      float dd = dot(r, r);
      if (dd < d) { d = dd; nearest = i + g; }
    }
  }
  return sqrt(d);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.y * 6.0;
  vec2 nearest;
  float d = voronoi(uv, uTime * 0.6, nearest);

  // Edge glow.
  float edge = smoothstep(0.05, 0.0, abs(d - 0.5));

  // Per-cell hue from nearest point.
  float h = fract(dot(nearest, vec2(0.13, 0.27)));
  vec3 base = 0.5 + 0.5 * cos(6.28318 * (h + vec3(0.0, 0.33, 0.67)));

  vec3 col = mix(base * 0.4, base, smoothstep(0.0, 0.4, d)) + edge * 0.6;
  fragColor = vec4(col, 1.0);
}
