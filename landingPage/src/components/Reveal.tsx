import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_BLOOM } from "../lib/theme";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  blur?: boolean;
  once?: boolean;
  amount?: number;
}

/** A restrained, "expensive" scroll reveal — soft rise + optional defocus. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 28,
  blur = true,
  once = true,
  amount = 0.35,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: blur ? "blur(10px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, amount }}
      transition={{ duration: 1, ease: EASE_BLOOM, delay }}
    >
      {children}
    </motion.div>
  );
}
