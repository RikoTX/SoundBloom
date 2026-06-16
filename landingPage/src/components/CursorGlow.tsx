import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

/** Soft dual-tone aura that follows the pointer — replaces buggy 3D trail spheres. */
export function CursorGlow() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const pos = useRef({ x: -9999, y: -9999 });
  const target = useRef({ x: -9999, y: -9999 });
  const visible = useRef(false);

  useEffect(() => {
    if (reduced) return;

    let raf = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      target.current = { x: e.clientX, y: e.clientY };
      visible.current = true;
      if (root.current) root.current.style.opacity = "1";
    };

    const onLeave = () => {
      visible.current = false;
      if (root.current) root.current.style.opacity = "0";
    };

    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.09;
      pos.current.y += (target.current.y - pos.current.y) * 0.09;
      if (root.current && visible.current) {
        root.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[5] overflow-hidden"
      aria-hidden
    >
      <div
        ref={root}
        className="absolute left-0 top-0 opacity-0 transition-opacity duration-500 will-change-transform"
        style={{ transform: "translate3d(-9999px, -9999px, 0)" }}
      >
        <div
          className="-translate-x-1/2 -translate-y-1/2 h-[min(70vw,520px)] w-[min(70vw,520px)] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(238,16,176,0.14) 0%, rgba(14,158,239,0.07) 38%, transparent 68%)",
            filter: "blur(1px)",
          }}
        />
      </div>
    </div>
  );
}
