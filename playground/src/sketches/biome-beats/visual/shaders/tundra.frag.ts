import { SHADER_HEADER } from "./common.glsl";

export const tundraFrag = SHADER_HEADER + /* glsl */ `
void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;

  vec3 bg1 = vec3(0.06, 0.08, 0.13);
  vec3 bg2 = vec3(0.12, 0.16, 0.22);
  vec3 col = mix(bg1, bg2, vUv.y);

  // aurora bands
  float wave1 = sin(uv.x * 0.8 + uTime * 0.05 + sin(uv.y * 1.2 + uTime * 0.04) * 1.5);
  wave1 = smoothstep(0.5, 1.0, 1.0 - abs(wave1));
  float yMask1 = smoothstep(-0.2, 0.4, uv.y);
  col += vec3(0.20, 0.75, 0.50) * wave1 * yMask1 * (0.5 + uAmplitude * 0.6);

  float wave2 = sin(uv.x * 0.5 - uTime * 0.03 + sin(uv.y * 0.9 - uTime * 0.02) * 1.2);
  wave2 = smoothstep(0.5, 1.0, 1.0 - abs(wave2));
  float yMask2 = smoothstep(-0.4, 0.2, uv.y);
  col += vec3(0.55, 0.45, 0.85) * wave2 * yMask2 * 0.5;

  // beat-reactive aurora intensity
  float pulse = 0.4 + 0.6 * sin(uBeatPhase * 6.2832);
  col *= 1.0 + 0.18 * pulse;

  // distant snow
  col += starLayer(uv, 14.0, 0.03, vec3(0.85, 0.95, 1.05)) * 0.6;
  col += starLayer(uv, 8.0, 0.012, vec3(0.95, 1.0, 1.15)) * 0.4;

  // ground glow
  float ground = smoothstep(-1.0, -0.4, uv.y);
  col += vec3(0.10, 0.16, 0.25) * (1.0 - ground) * 0.4;

  gl_FragColor = vec4(col, uOpacity);
}
`;
