import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { dampPointer, scroll } from "../lib/store";

/** Drives the single cinematic camera and damps the shared pointer once a frame. */
export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    dampPointer(0.08);

    const p = scroll.progress;
    const z = 8.6 - Math.sin(p * Math.PI) * 1.4 - p * 0.45;
    const y = Math.sin(p * Math.PI) * 0.22;

    target.set(0, y, z);
    camera.position.lerp(target, 0.05);
    camera.lookAt(0, 0, 0);
  });

  return null;
}
