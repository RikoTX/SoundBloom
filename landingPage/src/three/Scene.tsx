import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import { COLORS } from "../lib/theme";
import { CameraRig } from "./CameraRig";
import { BloomCore } from "./BloomCore";
import { ParticleField } from "./ParticleField";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export default function Scene() {
  const reduced = usePrefersReducedMotion();
  const detail = reduced ? 8 : 24;
  const particles = reduced ? 180 : 650;

  return (
    <Canvas
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.8]}
      camera={{ position: [0, 0, 8.6], fov: 40, near: 0.1, far: 100 }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(new THREE.Color(COLORS.ink), 0);
        scene.fog = new THREE.FogExp2(new THREE.Color(COLORS.ink).getHex(), 0.04);
      }}
    >
      <CameraRig />
      <ParticleField count={particles} />
      <BloomCore detail={detail} />
      <AdaptiveDpr pixelated={false} />
    </Canvas>
  );
}
