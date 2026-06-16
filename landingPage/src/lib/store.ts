/**
 * Tiny mutable singletons for high-frequency state (pointer + scroll).
 * Read inside `useFrame`/rAF loops so the 3D layer never triggers React
 * re-renders. Values are intentionally plain objects, not React state.
 */

export const pointer = {
  /** Normalized target position, -1..1 (raw, from the last pointer event). */
  tx: 0,
  ty: 0,
  /** Smoothed position, -1..1 (consumers ease toward the target). */
  x: 0,
  y: 0,
  /** Whether a fine pointer is currently active (desktop hover). */
  active: false,
};

export const scroll = {
  /** Whole-page progress, 0..1. */
  progress: 0,
  /** Signed scroll velocity from Lenis. */
  velocity: 0,
};

/** Ease the smoothed pointer toward its target. Call once per frame. */
export function dampPointer(lerp = 0.08) {
  pointer.x += (pointer.tx - pointer.x) * lerp;
  pointer.y += (pointer.ty - pointer.y) * lerp;
}
