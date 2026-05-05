import { SHADER_HEADER } from "./common.glsl";

export const spaceFrag = SHADER_HEADER + /* glsl */ `
void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;

  vec3 bg1 = vec3(0.05, 0.02, 0.18);
  vec3 bg2 = vec3(0.12, 0.06, 0.30);
  vec3 col = mix(bg1, bg2, vUv.y);

  float n1 = sin(uv.x * 3.0 + uTime * 0.08) * cos(uv.y * 2.0 - uTime * 0.05);
  float n2 = sin(uv.x * 1.5 - uTime * 0.06 + uv.y * 4.0);
  col += vec3(0.18, 0.10, 0.32) * (0.5 + 0.5 * n1) * 0.4;
  col += vec3(0.10, 0.06, 0.28) * (0.5 + 0.5 * n2) * 0.3;

  float center = max(0.0, 1.0 - length(uv) * 0.5);
  float pulse = 0.55 + 0.45 * sin(uBeatPhase * 6.2832);
  col += vec3(0.40, 0.25, 0.65) * pow(center, 2.0) * (0.30 + uAmplitude * 0.7) * pulse;

  col += starLayer(uv, 5.0, 0.020, vec3(0.85, 0.75, 1.0));
  col += starLayer(uv, 11.0, 0.04, vec3(1.0, 0.92, 1.0));
  col += starLayer(uv, 22.0, 0.08, vec3(0.65, 0.55, 1.0)) * 0.7;

  float band = sin(uv.y * 1.2 + uTime * 0.04) * 0.5 + 0.5;
  col += vec3(0.10, 0.04, 0.20) * band * 0.6;

  gl_FragColor = vec4(col, uOpacity);
}
`;
