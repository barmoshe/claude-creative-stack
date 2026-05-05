import { SHADER_HEADER } from "./common.glsl";

export const cyberpunkFrag = SHADER_HEADER + /* glsl */ `
void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;

  vec3 bg1 = vec3(0.04, 0.0, 0.07);
  vec3 bg2 = vec3(0.10, 0.0, 0.12);
  vec3 col = mix(bg1, bg2, vUv.y);

  // neon horizon
  float horizon = abs(uv.y + 0.2 + sin(uTime * 0.2) * 0.05);
  horizon = smoothstep(0.0, 0.02, horizon);
  vec3 magenta = vec3(0.95, 0.10, 0.60);
  col += magenta * (1.0 - horizon) * 0.7;

  // perspective grid below horizon
  if (uv.y < -0.2) {
    float gridY = abs(fract(uv.y * 10.0 - uTime * 0.5) - 0.5);
    float gridX = abs(fract(uv.x * 14.0 / max(0.1, -uv.y)) - 0.5);
    float gridLine = smoothstep(0.46, 0.5, max(gridX, gridY * 0.8));
    col += vec3(0.0, 0.65, 0.95) * gridLine * 0.7;
  }

  // vertical neon strips above horizon
  if (uv.y > -0.2) {
    float lines = abs(sin(uv.x * 22.0 + uTime * 0.6));
    col += vec3(0.95, 0.4, 0.85) * pow(lines, 28.0) * 0.5;
  }

  // beat-reactive pulse
  float pulse = 0.5 + 0.5 * sin(uBeatPhase * 6.2832);
  float boost = 0.7 + uAmplitude * 1.5 * pulse;
  col *= boost;

  // cyber sun
  vec2 sunC = vec2(0.0, -0.18);
  float sun = max(0.0, 0.4 - length((uv - sunC) * vec2(1.0, 1.6)));
  col += vec3(1.0, 0.45, 0.10) * pow(sun * 2.5, 2.0);

  gl_FragColor = vec4(col, uOpacity);
}
`;
