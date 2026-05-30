import { motion } from "framer-motion";

export default function GlassCard({
  children,
  className = "",
  hover = true,
  glow = false,
  ...props
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl sm:rounded-3xl sm:p-8 ${
        glow
          ? "shadow-[0_0_40px_rgba(203,0,148,0.08),inset_0_1px_0_rgba(255,255,255,0.06)]"
          : "shadow-[0_20px_60px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.05)]"
      } ${className}`}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent" />
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  );
}
