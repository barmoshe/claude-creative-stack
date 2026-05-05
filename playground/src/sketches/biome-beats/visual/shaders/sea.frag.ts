import { SHADER_HEADER } from "./common.glsl";

export const seaFrag = SHADER_HEADER + /* glsl */ `
void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;

  vec3 bg1 = vec3(0.02, 0.06, 0.18);
  vec3 bg2 = vec3(0.05, 0.16, 0.30);
  vec3 col = mix(bg1, bg2, vUv.y);

  // rolling waves
  float w1 = sin(uv.x * 4.0 + uTime * 0.3 + sin(uv.y * 2.0) * 0.6);
  float w2 = sin(uv.y * 3.0 - uTime * 0.2);
  float waves = (w1 * 0.5 + 0.5) * (w2 * 0.5 + 0.5);
  col += vec3(0.10, 0.32, 0.42) * waves * 0.5;

  // deep current
  float deep = pseudoFbm(uv * 1.5 + vec2(0.0, uTime * 0.06));
  col += vec3(0.05, 0.18, 0.32) * smoothstep(0.4, 0.8, deep) * 0.6;

  // foam glints
  vec2 foamUv = uv * 30.0 + vec2(uTime * 0.4, uTime * 0.1);
  float foam = step(0.92, hash21(floor(foamUv)));
  col += vec3(0.7, 0.85, 0.95) * foam * (0.3 + uAmplitude * 0.6);

  // beat ripple from center
  float ring = abs(length(uv) - mod(uTime * 0.25 + uBeatPhase * 0.5, 1.5));
  ring = smoothstep(0.05, 0.0, ring);
  col += vec3(0.4, 0.7, 0.9) * ring * 0.4 * (0.4 + uAmplitude * 1.0);

  gl_FragColor = vec4(col, uOpacity);
}
`;
