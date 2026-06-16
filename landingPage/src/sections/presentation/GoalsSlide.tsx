import { usePresentation } from "../../i18n/usePresentation";
import { SlideFrame } from "../../components/presentation/SlideFrame";
import { Reveal } from "../../components/Reveal";

export function GoalsSlide() {
  const { p } = usePresentation();

  return (
    <SlideFrame
      id="goals"
      eyebrow={p.goals.eyebrow}
      heading={p.goals.heading}
      slide={p.goals.slide}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_1.1fr]">
        <Reveal className="pres-goal-card">
          <span className="pres-goal-icon" aria-hidden>
            ⚡
          </span>
          <p className="pres-eyebrow !text-pres-mint">{p.goals.goalLabel}</p>
          <p className="mt-4 text-base leading-relaxed text-white/90 sm:text-lg">
            {p.goals.goal}
          </p>
        </Reveal>

        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {p.goals.tasks.map((task, i) => (
            <Reveal key={i} delay={i * 0.04} className="flex gap-3">
              <span className="pres-check" aria-hidden>
                ✓
              </span>
              <p className="text-sm leading-snug text-pres-ink/80 sm:text-base">{task.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}
