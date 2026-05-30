import MarketingBackground from "./MarketingBackground";
import MarketingNav from "./MarketingNav";
import MarketingFooter from "./MarketingFooter";

export default function MarketingLayout({
  children,
  intensity = "default",
  className = "",
}) {
  return (
    <div className={`relative min-h-screen bg-[#09090B] text-white ${className}`}>
      <MarketingBackground intensity={intensity} />
      <MarketingNav />
      <main className="relative z-10">{children}</main>
      <MarketingFooter />
    </div>
  );
}
