#version 300 es
// Raymarched single sphere with a procedural ground. Minimal but complete:
// distance field, raymarch loop, normal estimate, soft shadow, fog.
precision highp float;

uniform vec2  uResolution;
uniform float uTime;
uniform vec2  uMouse;

out vec4 fragColor;

float sdSphere(vec3 p, float r) { return length(p) - r; }
float sdGround(vec3 p) { return p.y + 1.0; }
float opUnion(float a, float b) { return min(a, b); }

float map(vec3 p) {
  float d1 = sdSphere(p - vec3(0.0, sin(uTime * 1.2) * 0.2, 0.0), 0.7);
  float d2 = sdGround(p);
  return opUnion(d1, d2);
}

vec3 calcNormal(vec3 p) {
  const float h = 0.0001;
  const vec2 k = vec2(1, -1);
  return normalize(
    k.xyy * map(p + k.xyy * h) +
    k.yyx * map(p + k.yyx * h) +
    k.yxy * map(p + k.yxy * h) +
    k.xxx * map(p + k.xxx * h)
  );
}

float softShadow(vec3 ro, vec3 rd) {
  float t = 0.02, res = 1.0;
  for (int i = 0; i < 32; i++) {
    float h = map(ro + rd * t);
    if (h < 0.001) return 0.0;
    res = min(res, 8.0 * h / t);
    t += clamp(h, 0.02, 0.5);
    if (t > 6.0) break;
  }
  return clamp(res, 0.0, 1.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

  // Camera orbit on mouse X; tilt on mouse Y.
  float ay = (uMouse.x - 0.5) * 6.2831;
  float ax = (uMouse.y - 0.5) * 1.0;
  vec3 ro = vec3(sin(ay) * 3.0, 1.0 + ax, cos(ay) * 3.0);
  vec3 fwd = normalize(vec3(0.0, 0.5, 0.0) - ro);
  vec3 right = normalize(cross(fwd, vec3(0, 1, 0)));
  vec3 up = cross(right, fwd);
  vec3 rd = normalize(uv.x * right + uv.y * up + 1.5 * fwd);

  // Raymarch.
  float t = 0.0; bool hit = false; vec3 p;
  for (int i = 0; i < 96; i++) {
    p = ro + rd * t;
    float d = map(p);
    if (d < 0.001) { hit = true; break; }
    if (t > 20.0) break;
    t += d;
  }

  vec3 col = vec3(0.6, 0.75, 0.95) - rd.y * 0.3;     // sky
  if (hit) {
    vec3 n = calcNormal(p);
    vec3 ld = normalize(vec3(0.6, 0.8, 0.4));
    float diff = max(dot(n, ld), 0.0);
    float sh = softShadow(p + n * 0.01, ld);
    vec3 albedo = mix(vec3(0.8, 0.5, 0.3), vec3(0.9), step(-0.99, p.y));
    col = albedo * (0.2 + diff * sh);
    col = mix(col, vec3(0.6, 0.75, 0.95), 1.0 - exp(-0.05 * t * t)); // fog
  }

  col = pow(col, vec3(0.4545)); // gamma
  fragColor = vec4(col, 1.0);
}
