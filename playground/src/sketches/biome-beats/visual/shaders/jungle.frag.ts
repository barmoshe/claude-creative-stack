import { SHADER_HEADER } from "./common.glsl";

export const jungleFrag = SHADER_HEADER + /* glsl */ `
void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;

  vec3 bg1 = vec3(0.05, 0.10, 0.04);
  vec3 bg2 = vec3(0.08, 0.18, 0.06);
  vec3 col = mix(bg1, bg2, vUv.y);

  // canopy noise
  float canopy = pseudoFbm(uv * 2.5 + vec2(uTime * 0.05, 0.0));
  col += vec3(0.06, 0.18, 0.04) * smoothstep(0.3, 0.8, canopy);

  // dappled light spots
  float dapple = sin(uv.x * 6.0 + uTime * 0.15) * cos(uv.y * 5.0 - uTime * 0.12);
  dapple = smoothstep(0.55, 0.95, dapple);
  vec3 light = vec3(0.55, 0.65, 0.20);
  col += light * dapple * (0.35 + uAmplitude * 0.5);

  // beat-pulse leaf shimmer near center
  float center = max(0.0, 1.0 - length(uv) * 0.6);
  float pulse = 0.4 + 0.6 * sin(uBeatPhase * 6.2832);
  col += vec3(0.30, 0.55, 0.18) * pow(center, 1.8) * pulse * 0.4;

  // fireflies
  vec3 ff = starLayer(uv, 16.0, 0.05, vec3(0.9, 1.0, 0.4));
  col += ff * (0.6 + uAmplitude * 1.2);

  gl_FragColor = vec4(col, uOpacity);
}
`;
