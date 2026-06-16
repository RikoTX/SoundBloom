import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";

interface CTAButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  className?: string;
}

const SPRING = { stiffness: 160, damping: 14, mass: 0.2 };

export function CTAButton({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
}: CTAButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, SPRING);
  const y = useSpring(my, SPRING);
  // Label drifts a touch further than the button shell for depth.
  const lx = useTransform(x, (v) => v * 0.35);
  const ly = useTransform(y, (v) => v * 0.35);

  const handleMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.35);
    my.set((e.clientY - (r.top + r.height / 2)) * 0.45);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const base =
    "group relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium tracking-wide transition-colors duration-300 will-change-transform";
  const skin =
    variant === "primary"
      ? "text-white"
      : "text-bone/80 border border-white/15 hover:border-white/30 hover:text-white";

  const inner = (
    <>
      {variant === "primary" && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-gradient-to-r from-magenta-deep via-magenta to-azure opacity-100 shadow-[0_10px_40px_-12px_rgba(238,16,176,0.7)] transition-opacity duration-300 group-hover:opacity-90"
        />
      )}
      {variant === "primary" && (
        <span
          aria-hidden
          className="absolute -inset-px rounded-full opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-60"
          style={{
            background:
              "linear-gradient(90deg,#cb0094,#ee10b0,#0e9eef)",
          }}
        />
      )}
      <motion.span
        style={{ x: lx, y: ly }}
        className="relative z-10 inline-flex items-center gap-2"
      >
        {children}
      </motion.span>
    </>
  );

  const sharedProps = {
    ref: ref as never,
    onMouseMove: handleMove,
    onMouseLeave: reset,
    style: { x, y },
    className: `${base} ${skin} ${className}`,
  };

  if (href) {
    const external = href.startsWith("http");
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(href);
    return (
      <motion.a
        {...sharedProps}
        href={href}
        target={external && !isLocalhost ? "_blank" : undefined}
        rel={external && !isLocalhost ? "noreferrer" : undefined}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.button {...sharedProps} type="button" onClick={onClick}>
      {inner}
    </motion.button>
  );
}
