interface EqualizerProps {
  bars?: number;
  className?: string;
}

/** A tiny CSS-driven equalizer used as a recurring brand motif. */
export function Equalizer({ bars = 5, className = "" }: EqualizerProps) {
  return (
    <span className={`inline-flex items-end gap-[3px] ${className}`} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="eq-bar block w-[3px] rounded-full bg-gradient-to-t from-magenta to-azure"
          style={{
            height: "100%",
            ["--eq-dur" as string]: `${0.7 + (i % 3) * 0.25}s`,
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </span>
  );
}
