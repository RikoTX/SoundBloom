import { DiaTextReveal } from "./DiaTextReveal";

const BRAND_COLORS = ["#EE10B0", "#0E9EEF"] as const;

interface BrandLogoProps {
  className?: string;
  /** Play sweep on mount (header). */
  playOnMount?: boolean;
  /** Play sweep when scrolled into view (footer). */
  playOnView?: boolean;
}

export function BrandLogo({
  className = "font-display text-xl font-extrabold tracking-tight sm:text-2xl",
  playOnMount = false,
  playOnView = false,
}: BrandLogoProps) {
  return (
    <DiaTextReveal
      text="SoundBloom"
      colors={[...BRAND_COLORS]}
      finalGradient
      duration={1.6}
      startOnView={playOnView && !playOnMount}
      once
      delay={playOnMount ? 0.5 : 0}
      className={className}
    />
  );
}
