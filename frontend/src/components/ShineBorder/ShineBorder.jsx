export default function ShineBorder({
  borderWidth = 1,
  duration = 14,
  shineColor = "#000000",
  className = "",
  style,
}) {
  const colorString = Array.isArray(shineColor)
    ? shineColor.join(",")
    : shineColor;

  return (
    <div
      style={{
        "--border-width": `${borderWidth}px`,
        "--duration": `${duration}s`,
        backgroundImage: `radial-gradient(transparent, transparent, ${colorString}, transparent, transparent)`,
        backgroundSize: "300% 300%",
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMask:
          "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        padding: `${borderWidth}px`,
        ...style,
      }}
      className={`pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position] motion-safe:animate-shine ${className}`}
    />
  );
}
