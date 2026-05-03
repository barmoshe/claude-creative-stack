/**
 * TSL — domain-warped color material. Compiles to WGSL on WebGPU and GLSL on WebGL2.
 * Drop into a Three.js (>= r171) scene as `mesh.material = makeWarp()`.
 *
 * Usage outside the artifact sandbox only — Three.js r128 in the artifact runtime is WebGL only
 * and does not include the node system. Use `assets/plasma.glsl` for the artifact path.
 */

import * as THREE from "three/webgpu";
import {
  uv, time, vec3, mix, sin, length, mx_noise_float,
} from "three/tsl";

export function makeWarp() {
  const mat = new THREE.MeshBasicNodeMaterial();

  // Domain warp: noise drives a UV offset, then we sample noise again.
  const warped = uv().mul(3.0).add(time.mul(0.2));
  const offset = vec3(
    mx_noise_float(warped),
    mx_noise_float(warped.add(vec3(5.2, 1.3, 0.0))),
    0.0,
  ).mul(0.6);
  const noise = mx_noise_float(warped.add(offset));

  const cool = vec3(0.05, 0.10, 0.40);
  const hot  = vec3(1.00, 0.65, 0.20);
  mat.colorNode = mix(cool, hot, sin(noise.add(time.mul(0.5))).mul(0.5).add(0.5));
  return mat;
}
