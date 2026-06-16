import { usePresentation } from "../../i18n/usePresentation";
import { SlideFrame } from "../../components/presentation/SlideFrame";
import { PresCard } from "../../components/presentation/PresCard";

export function ExperienceSlide() {
  const { p } = usePresentation();

  return (
    <SlideFrame
      id="experience"
      eyebrow={p.experience.eyebrow}
      heading={p.experience.heading}
      slide={p.experience.slide}
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {p.experience.cards.map((card, i) => (
          <PresCard key={card.title} {...card} delay={i * 0.05} variant="mint" />
        ))}
      </div>
    </SlideFrame>
  );
}
