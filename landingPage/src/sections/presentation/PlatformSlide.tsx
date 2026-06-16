import { usePresentation } from "../../i18n/usePresentation";
import { SlideFrame } from "../../components/presentation/SlideFrame";
import { Reveal } from "../../components/Reveal";

export function PlatformSlide() {
  const { p } = usePresentation();

  return (
    <SlideFrame
      id="platform"
      eyebrow={p.platform.eyebrow}
      heading={p.platform.heading}
      slide={p.platform.slide}
      variant="dark"
    >
      <Reveal className="pres-flow mb-10 overflow-x-auto">
        <div className="flex min-w-[640px] items-center justify-between gap-2">
          {p.platform.flow.map((node, i) => (
            <div key={node} className="flex items-center gap-2">
              <div className="pres-flow-node">{node}</div>
              {i < p.platform.flow.length - 1 && (
                <span className="pres-flow-arrow" aria-hidden>
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-2">
        <Reveal delay={0.08} className="pres-stack-card">
          <span className="pres-stack-icon" aria-hidden>
            📱
          </span>
          <h3 className="text-xl font-semibold text-white">{p.platform.frontend.title}</h3>
          <p className="mt-1 text-sm italic text-pres-mint">{p.platform.frontend.stack}</p>
          <p className="mt-4 text-sm leading-relaxed text-white/75">{p.platform.frontend.text}</p>
        </Reveal>
        <Reveal delay={0.12} className="pres-stack-card">
          <span className="pres-stack-icon" aria-hidden>
            🖥
          </span>
          <h3 className="text-xl font-semibold text-white">{p.platform.backend.title}</h3>
          <p className="mt-1 text-sm italic text-pres-mint">{p.platform.backend.stack}</p>
          <p className="mt-4 text-sm leading-relaxed text-white/75">{p.platform.backend.text}</p>
        </Reveal>
      </div>
    </SlideFrame>
  );
}
