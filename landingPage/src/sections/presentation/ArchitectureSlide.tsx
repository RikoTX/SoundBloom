import { usePresentation } from "../../i18n/usePresentation";
import { SlideFrame } from "../../components/presentation/SlideFrame";
import { Reveal } from "../../components/Reveal";

export function ArchitectureSlide() {
  const { p } = usePresentation();

  return (
    <SlideFrame
      id="architecture"
      eyebrow={p.architecture.eyebrow}
      heading={p.architecture.heading}
      slide={p.architecture.slide}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {p.architecture.layers.map((layer, i) => (
            <Reveal key={layer.title} delay={i * 0.05} className="pres-layer-row">
              <span className="pres-layer-dot" aria-hidden />
              <div>
                <h3 className="font-semibold text-pres-ink">{layer.title}</h3>
                <p className="mt-1 text-sm text-pres-ink/65">{layer.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {p.architecture.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={0.08 + i * 0.05} className="pres-stat-card">
              <p className="pres-stat-value">{stat.value}</p>
              <p className="pres-stat-label">{stat.label}</p>
              {stat.sub && <p className="pres-stat-sub">{stat.sub}</p>}
            </Reveal>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}
