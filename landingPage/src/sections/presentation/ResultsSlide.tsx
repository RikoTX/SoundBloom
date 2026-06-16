import { usePresentation } from "../../i18n/usePresentation";
import { SlideFrame } from "../../components/presentation/SlideFrame";
import { Reveal } from "../../components/Reveal";

export function ResultsSlide() {
  const { p } = usePresentation();

  return (
    <SlideFrame
      id="results"
      eyebrow={p.results.eyebrow}
      heading={p.results.heading}
      slide={p.results.slide}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {p.results.stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.06} className="pres-stat-card pres-stat-card-lg">
            <p className="pres-stat-value">{stat.value}</p>
            <p className="pres-stat-label">{stat.label}</p>
            {stat.sub && <p className="pres-stat-sub">{stat.sub}</p>}
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2} className="pres-banner mt-10">
        <p className="pres-eyebrow !text-pres-mint">{p.results.bannerLabel}</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {p.results.banner.map((item) => (
            <div key={item.label}>
              <p className="text-3xl font-semibold text-white sm:text-4xl">{item.value}</p>
              <p className="mt-2 text-sm text-pres-mint">{item.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </SlideFrame>
  );
}
