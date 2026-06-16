import { motion } from "framer-motion";

export function ScrollCue({ label }: { label: string }) {
  return (
    <motion.div
      className="flex items-center gap-3 text-bone/45"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.4, duration: 1.2 }}
    >
      <span className="overline text-[0.62rem]">{label}</span>
      <span className="relative block h-10 w-px overflow-hidden bg-white/15">
        <motion.span
          className="absolute left-0 top-0 block h-4 w-px bg-gradient-to-b from-magenta to-transparent"
          animate={{ y: ["-100%", "260%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
    </motion.div>
  );
}
