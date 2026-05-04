#version 300 es
// Plasma — a sum-of-sines classic. Drop into shader-playground.html.
precision highp float;

uniform vec2  uResolution;
uniform float uTime;
uniform vec2  uMouse;

out vec4 fragColor;

vec3 palette(float t) {
  // Iñigo Quílez palette form: a + b * cos(2π * (c * t + d))
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 0.5);
  vec3 d = vec3(0.0, 0.10, 0.20);
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  float t = uTime * 0.4;

  float v =
      sin(uv.x * 4.0 + t) +
      sin(uv.y * 5.0 - t * 1.3) +
      sin((uv.x + uv.y) * 3.0 + t * 0.7) +
      sin(length(uv) * 8.0 - t);

  v = (v + 4.0) / 8.0; // remap roughly to 0..1
  vec3 col = palette(v + uMouse.x * 0.5);
  fragColor = vec4(col, 1.0);
}
