import { usePresentation } from "../../i18n/usePresentation";
import { SlideFrame } from "../../components/presentation/SlideFrame";
import { PresCard } from "../../components/presentation/PresCard";
import { Reveal } from "../../components/Reveal";

export function ProblemSlide() {
  const { p } = usePresentation();

  return (
    <SlideFrame
      id="problem"
      eyebrow={p.problem.eyebrow}
      heading={p.problem.heading}
      slide={p.problem.slide}
    >
      <div className="grid gap-5 md:grid-cols-3">
        {p.problem.cards.map((card, i) => (
          <PresCard key={card.title} {...card} delay={i * 0.06} variant="mint" />
        ))}
      </div>
      <Reveal delay={0.2} className="mt-10 max-w-4xl text-base leading-relaxed text-pres-ink/75 sm:text-lg">
        <span className="font-semibold text-pres-teal">{p.problem.relevanceLabel} </span>
        {p.problem.relevance}
      </Reveal>
    </SlideFrame>
  );
}
