import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Trail } from "@react-three/drei";
import * as THREE from "three";
import { pointer } from "../lib/store";

interface RibbonDef {
  color: string;
  width: number;
  speed: number;
  offset: [number, number, number];
}

const RIBBONS: RibbonDef[] = [
  { color: "#ee10b0", width: 1.0, speed: 1.0, offset: [0, 0, 0] },
  { color: "#0e9eef", width: 0.7, speed: 0.9, offset: [0.18, -0.12, 0.25] },
  { color: "#f3f0ea", width: 0.4, speed: 1.15, offset: [-0.12, 0.14, -0.2] },
];

function Emitter({ color, width, speed, offset }: RibbonDef) {
  const ref = useRef<THREE.Mesh>(null);
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime;

    const idleX = Math.cos(t * 0.6 * speed) * 3.0;
    const idleY = Math.sin(t * 0.9 * speed) * 1.9;
    const ax = pointer.active ? pointer.x * 5.2 + offset[0] : idleX;
    const ay = pointer.active ? pointer.y * 3.0 + offset[1] : idleY;

    v.set(ax, ay, 1.4 + offset[2] + Math.sin(t * speed) * 0.3);
    m.position.lerp(v, 0.12);
  });

  return (
    <Trail width={width} length={5} color={color} decay={1.2} attenuation={(t) => t * t}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </Trail>
  );
}

export function NeonRibbons() {
  return (
    <>
      {RIBBONS.map((r) => (
        <Emitter key={r.color} {...r} />
      ))}
    </>
  );
}
