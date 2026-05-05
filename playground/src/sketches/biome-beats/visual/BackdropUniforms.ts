import * as THREE from "three";

export type BackdropUniforms = {
  [key: string]: THREE.IUniform;
} & {
  uTime: THREE.IUniform<number>;
  uBeatPhase: THREE.IUniform<number>;
  uAmplitude: THREE.IUniform<number>;
  uResolution: THREE.IUniform<THREE.Vector2>;
  uOpacity: THREE.IUniform<number>;
  uReducedMotion: THREE.IUniform<number>;
};

export function createBackdropUniforms(): BackdropUniforms {
  return {
    uTime: { value: 0 },
    uBeatPhase: { value: 0 },
    uAmplitude: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uOpacity: { value: 1 },
    uReducedMotion: { value: 0 },
  };
}

export const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;
