import type { ReactNode } from "react";
import { Reveal } from "../Reveal";

interface SlideFrameProps {
  id: string;
  eyebrow: string;
  heading: string;
  slide?: string;
  variant?: "light" | "dark";
  children: ReactNode;
  className?: string;
}

export function SlideFrame({
  id,
  eyebrow,
  heading,
  slide,
  variant = "light",
  children,
  className = "",
}: SlideFrameProps) {
  const isDark = variant === "dark";

  return (
    <section
      id={id}
      className={`pres-slide snap-slide ${isDark ? "pres-slide-dark" : "pres-slide-light"} ${className}`}
    >
      <div className="pres-slide-inner mx-auto w-full max-w-[1200px] px-6 py-16 sm:px-10 sm:py-20 lg:py-24">
        <Reveal y={20}>
          <p className="pres-eyebrow">{eyebrow}</p>
        </Reveal>
        <Reveal delay={0.05} y={24}>
          <h2 className="pres-heading mt-4 max-w-4xl">{heading}</h2>
        </Reveal>
        <div className="mt-10 sm:mt-12">{children}</div>
        {slide && (
          <p className={`pres-pagenum mt-12 text-right ${isDark ? "text-white/35" : "text-pres-teal/50"}`}>
            {slide}
          </p>
        )}
      </div>
    </section>
  );
}
