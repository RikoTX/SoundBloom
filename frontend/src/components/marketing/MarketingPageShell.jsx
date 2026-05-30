import MarketingBackground from "./MarketingBackground";

export default function MarketingPageShell({
  children,
  intensity = "default",
  className = "",
}) {
  return (
    <div className={`relative text-white ${className}`}>
      <div className="pointer-events-none absolute inset-0 min-h-full overflow-hidden">
        <MarketingBackground intensity={intensity} inline />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
