import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const VINYL_IMAGE = `${import.meta.env.BASE_URL}disc.png`;

export const VINYL_LAYOUT = {
  baseTranslateX: "50%",
  offsetX: "-6%",
  offsetY: "0%",
  diskSize: "clamp(240px, 102vh, 920px)",
};

export default function AnimatedVinyl() {
  const { baseTranslateX, offsetX, offsetY, diskSize } = VINYL_LAYOUT;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 22 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);

  useEffect(() => {
    const onMove = (e) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 hidden overflow-visible lg:block">
      <motion.div
        className="absolute top-1/2 right-0 -translate-y-1/2"
        style={{
          rotateX,
          rotateY,
          width: diskSize,
          height: diskSize,
          translateX: baseTranslateX,
          x: offsetX,
          y: offsetY,
        }}
      >
        <div className="pointer-events-none absolute -inset-12 rounded-full bg-[#cb0094]/15 blur-[70px]" />
        <div className="pointer-events-none absolute -inset-6 rounded-full bg-[#EE10B0]/10 blur-[40px]" />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="relative h-full w-full rounded-full shadow-[0_32px_100px_rgba(0,0,0,0.7),0_0_80px_rgba(203,0,148,0.18)]"
        >
          <img
            src={VINYL_IMAGE}
            alt=""
            draggable={false}
            className="h-full w-full rounded-full object-cover select-none"
          />
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-40" />
        </motion.div>
      </motion.div>
    </div>
  );
}
