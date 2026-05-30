import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: `${10 + ((i * 19) % 80)}%`,
  y: `${8 + ((i * 27) % 84)}%`,
  size: 2 + (i % 2),
  delay: i * 0.4,
}));

export default function AuthBackground({ parallax = true }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  const glowX = useTransform(springX, [-0.5, 0.5], [-30, 30]);
  const glowY = useTransform(springY, [-0.5, 0.5], [-24, 24]);
  const glowX2 = useTransform(glowX, (v) => -v * 0.5);
  const glowY2 = useTransform(glowY, (v) => -v * 0.5);

  useEffect(() => {
    if (!parallax) return;

    const onMove = (e) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [parallax, mouseX, mouseY]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#09090B]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_15%,rgba(203,0,148,0.12),transparent_42%),radial-gradient(ellipse_at_85%_85%,rgba(14,158,239,0.06),transparent_40%)]" />

      <motion.div
        style={{ x: glowX, y: glowY }}
        className="absolute -top-24 left-[8%] h-80 w-80 rounded-full bg-[#cb0094]/10 blur-[100px]"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{ x: glowX2, y: glowY2 }}
        className="absolute bottom-[-80px] right-[6%] h-96 w-96 rounded-full bg-[#0E9EEF]/[0.06] blur-[110px]"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-[#EE10B0]/40"
          style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
          animate={{ opacity: [0.08, 0.35, 0.08], y: [0, -10, 0] }}
          transition={{
            duration: 4 + (p.id % 3),
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
