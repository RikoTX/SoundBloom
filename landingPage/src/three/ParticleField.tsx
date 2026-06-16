import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { particleVertexShader, particleFragmentShader } from "./shaders";
import { COLORS } from "../lib/theme";
import { pointer } from "../lib/store";

const lerp = THREE.MathUtils.lerp;

function generate(count: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const palette = [
    new THREE.Color(COLORS.magenta),
    new THREE.Color(COLORS.azure),
    new THREE.Color(COLORS.bone),
  ];

  for (let i = 0; i < count; i++) {
    // A wide curtain of dust kept *behind* the focal plane so points stay
    // small and never balloon in front of the camera.
    positions[i * 3] = (Math.random() * 2 - 1) * 24;
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * 13;
    positions[i * 3 + 2] = -(5 + Math.random() * 28);

    const pick = Math.random();
    const c = pick < 0.45 ? palette[0] : pick < 0.7 ? palette[1] : palette[2];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;

    scales[i] = 0.4 + Math.random() * 1.6;
  }
  return { positions, colors, scales };
}

export function ParticleField({ count = 1200 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { positions, colors, scales } = useMemo(() => generate(count), [count]);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uSize: { value: 2.6 } }),
    [],
  );

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    if (mat.current) mat.current.uniforms.uTime.value += d;
    const p = points.current;
    if (p) {
      p.rotation.y += d * 0.01;
      p.position.x = lerp(p.position.x, pointer.x * 0.6, 0.03);
      p.position.y = lerp(p.position.y, pointer.y * 0.4, 0.03);
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}
