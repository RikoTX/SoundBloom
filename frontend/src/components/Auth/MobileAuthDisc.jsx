import { motion } from "framer-motion";

const DISC_IMAGE = `${import.meta.env.BASE_URL}disc.png`;

export const MOBILE_DISC_SIZE = "min(68vw, 260px)";

export const MOBILE_AUTH_TOP_OFFSET = 40;

export default function MobileAuthDisc() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 lg:hidden"
      style={{ top: MOBILE_AUTH_TOP_OFFSET }}
      aria-hidden
    >
      <div className="absolute -inset-8 rounded-full bg-[#cb0094]/18 blur-[40px]" />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="relative rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_50px_rgba(203,0,148,0.2)]"
        style={{ width: MOBILE_DISC_SIZE, height: MOBILE_DISC_SIZE }}
      >
        <img
          src={DISC_IMAGE}
          alt=""
          draggable={false}
          className="h-full w-full rounded-full object-cover select-none"
        />
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/12 via-transparent to-transparent opacity-30" />
      </motion.div>
    </div>
  );
}
