import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: `${6 + ((i * 17) % 88)}%`,
  y: `${4 + ((i * 23) % 92)}%`,
  size: 1.5 + (i % 3),
  delay: i * 0.35,
}));

export default function MarketingBackground({ intensity = "default", inline = false }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 36, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 36, damping: 22 });
  const glowX = useTransform(springX, [-0.5, 0.5], [-40, 40]);
  const glowY = useTransform(springY, [-0.5, 0.5], [-32, 32]);
  const glowX2 = useTransform(glowX, (v) => -v * 0.55);
  const glowY2 = useTransform(glowY, (v) => -v * 0.55);

  useEffect(() => {
    const onMove = (e) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  const isPremium = intensity === "premium";

  return (
    <div
      className={`pointer-events-none overflow-hidden ${
        inline ? "absolute inset-0 h-full min-h-full" : "fixed inset-0 bg-[#09090B]"
      }`}
    >
      <div
        className={`absolute inset-0 ${
          isPremium
            ? "bg-[radial-gradient(ellipse_at_50%_0%,rgba(203,0,148,0.18),transparent_55%),radial-gradient(ellipse_at_80%_80%,rgba(14,158,239,0.08),transparent_45%)]"
            : "bg-[radial-gradient(ellipse_at_15%_15%,rgba(203,0,148,0.12),transparent_42%),radial-gradient(ellipse_at_85%_85%,rgba(14,158,239,0.06),transparent_40%)]"
        }`}
      />

      <motion.div
        style={{ x: glowX, y: glowY }}
        className={`absolute rounded-full blur-[100px] ${
          isPremium
            ? "-top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 bg-[#cb0094]/15"
            : "-top-24 left-[8%] h-80 w-80 bg-[#cb0094]/10"
        }`}
        animate={{ opacity: isPremium ? [0.35, 0.65, 0.35] : [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        style={{ x: glowX2, y: glowY2 }}
        className="absolute bottom-[-80px] right-[6%] h-96 w-96 rounded-full bg-[#0E9EEF]/[0.06] blur-[110px]"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {isPremium && (
        <motion.div
          className="absolute left-1/2 top-[30%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#EE10B0]/[0.04] blur-[120px]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-[#EE10B0]/40"
          style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
          animate={{ opacity: [0.06, 0.32, 0.06], y: [0, -12, 0] }}
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
