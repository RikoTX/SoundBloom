import { motion } from "framer-motion";

const DISC_IMAGE = `${import.meta.env.BASE_URL}disc.png`;

const SIZE_MAP = {
  sm: "clamp(100px, 22vw, 160px)",
  md: "clamp(140px, 28vw, 220px)",
  lg: "clamp(180px, 36vw, 320px)",
  xl: "clamp(220px, 42vw, 420px)",
};

export default function FloatingDisc({
  size = "md",
  className = "",
  duration = 24,
  delay = 0,
  glow = true,
  style = {},
}) {
  const discSize = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <motion.div
      className={`pointer-events-none relative ${className}`}
      style={style}
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {glow && (
        <div className="absolute -inset-8 rounded-full bg-[#cb0094]/20 blur-[40px]" />
      )}

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration, repeat: Infinity, ease: "linear", delay }}
        className="relative rounded-full shadow-[0_24px_80px_rgba(0,0,0,0.65),0_0_60px_rgba(203,0,148,0.2)]"
        style={{ width: discSize, height: discSize }}
      >
        <img
          src={DISC_IMAGE}
          alt=""
          draggable={false}
          className="h-full w-full rounded-full object-cover select-none"
        />
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-35" />
      </motion.div>
    </motion.div>
  );
}
