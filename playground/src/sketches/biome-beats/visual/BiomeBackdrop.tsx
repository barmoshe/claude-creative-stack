import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { BiomeId } from "../data/biomes";
import { spaceFrag } from "./shaders/space.frag";
import { jungleFrag } from "./shaders/jungle.frag";
import { seaFrag } from "./shaders/sea.frag";
import { cyberpunkFrag } from "./shaders/cyberpunk.frag";
import { tundraFrag } from "./shaders/tundra.frag";
import { createBackdropUniforms, VERTEX_SHADER } from "./BackdropUniforms";

const FRAGMENTS: Record<BiomeId, string> = {
  space: spaceFrag,
  jungle: jungleFrag,
  sea: seaFrag,
  cyberpunk: cyberpunkFrag,
  tundra: tundraFrag,
};

const CROSSFADE_MS = 700;

interface BackdropProps {
  biomeId: BiomeId;
  beatPhaseRef: React.MutableRefObject<number>;
  amplitudeRef: React.MutableRefObject<number>;
  reducedMotion?: boolean;
}

interface QuadMeshProps {
  fragment: string;
  matRef: React.MutableRefObject<THREE.ShaderMaterial | null>;
  renderOrder: number;
}

function QuadMesh({ fragment, matRef, renderOrder }: QuadMeshProps) {
  const uniforms = useMemo(() => createBackdropUniforms(), []);
  return (
    <mesh frustumCulled={false} renderOrder={renderOrder}>
      <planeGeometry args={[100, 100]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

function BackdropScene({ biomeId, beatPhaseRef, amplitudeRef, reducedMotion }: BackdropProps) {
  const matCurrent = useRef<THREE.ShaderMaterial | null>(null);
  const matPrev = useRef<THREE.ShaderMaterial | null>(null);
  const { size } = useThree();

  const [currentId, setCurrentId] = useState<BiomeId>(biomeId);
  const [prevId, setPrevId] = useState<BiomeId>(biomeId);
  const blendRef = useRef(1);
  const startedAt = useRef(performance.now());

  useEffect(() => {
    if (biomeId === currentId) return;
    setPrevId(currentId);
    setCurrentId(biomeId);
    blendRef.current = 0;
    startedAt.current = performance.now();
  }, [biomeId, currentId]);

  useFrame(({ clock }) => {
    if (blendRef.current < 1) {
      const elapsed = performance.now() - startedAt.current;
      blendRef.current = Math.min(1, elapsed / CROSSFADE_MS);
    }
    const t = clock.elapsedTime;
    const p = beatPhaseRef.current;
    const a = amplitudeRef.current;
    const update = (m: THREE.ShaderMaterial | null, opacity: number) => {
      if (!m) return;
      if (!reducedMotion) m.uniforms.uTime.value = t;
      m.uniforms.uBeatPhase.value = p;
      m.uniforms.uAmplitude.value = a;
      m.uniforms.uResolution.value.set(size.width, size.height);
      m.uniforms.uReducedMotion.value = reducedMotion ? 1 : 0;
      m.uniforms.uOpacity.value = opacity;
    };
    update(matPrev.current, 1 - blendRef.current);
    update(matCurrent.current, blendRef.current);
  });

  const showPrev = blendRef.current < 1 && prevId !== currentId;

  return (
    <>
      {showPrev && (
        <QuadMesh
          key={`prev-${prevId}`}
          fragment={FRAGMENTS[prevId]}
          matRef={matPrev}
          renderOrder={0}
        />
      )}
      <QuadMesh
        key={`cur-${currentId}`}
        fragment={FRAGMENTS[currentId]}
        matRef={matCurrent}
        renderOrder={1}
      />
    </>
  );
}

export function BiomeBackdrop(props: BackdropProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas
        gl={{ antialias: false, powerPreference: "low-power" }}
        dpr={[1, 1.5]}
        frameloop="always"
      >
        <BackdropScene {...props} />
      </Canvas>
    </div>
  );
}
