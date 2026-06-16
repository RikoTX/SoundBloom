import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { bloomVertexShader, bloomFragmentShader } from "./shaders";
import { COLORS } from "../lib/theme";
import { pointer, scroll } from "../lib/store";

const lerp = THREE.MathUtils.lerp;

export function BloomCore({ detail = 24 }: { detail?: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uColorA: { value: new THREE.Color(COLORS.magentaDeep) },
      uColorB: { value: new THREE.Color(COLORS.azure) },
      uColorRim: { value: new THREE.Color(COLORS.magenta) },
    }),
    [],
  );

  useFrame((_, delta) => {
    const o = mesh.current;
    const m = mat.current;
    if (!o || !m) return;
    const d = Math.min(delta, 0.05);

    const showcase = Math.max(0, 1 - Math.abs(scroll.progress - 0.58) / 0.18);

    const u = m.uniforms;
    u.uTime.value += d;
    u.uScroll.value += (scroll.progress - u.uScroll.value) * 0.06;
    u.uPointer.value.set(pointer.x, pointer.y);

    // Orb stays centered — only a subtle pointer tilt, no positional drift.
    o.rotation.y += d * (0.12 + showcase * 0.9);
    o.rotation.x = lerp(o.rotation.x, pointer.y * 0.12, 0.04);
    o.rotation.z = lerp(o.rotation.z, pointer.x * 0.08, 0.04);
    o.position.x = lerp(o.position.x, 0, 0.08);
    o.position.y = lerp(o.position.y, 0, 0.08);

    const targetScale = 1 + u.uScroll.value * 0.08;
    o.scale.setScalar(lerp(o.scale.x || 1, targetScale, 0.05));
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.15, detail]} />
      <shaderMaterial
        ref={mat}
        vertexShader={bloomVertexShader}
        fragmentShader={bloomFragmentShader}
        uniforms={uniforms}
        toneMapped={false}
      />
    </mesh>
  );
}
