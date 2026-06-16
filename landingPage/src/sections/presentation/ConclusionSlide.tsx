import { BrandLogo } from "../../components/BrandLogo";
import { CTAButton } from "../../components/CTAButton";
import { Reveal } from "../../components/Reveal";
import { SlideArcs } from "../../components/presentation/SlideArcs";
import { AUTHOR } from "../../lib/author";
import { APP_URL } from "../../lib/theme";
import { usePresentation } from "../../i18n/usePresentation";

const ROW_ICONS = ["🖥", "📱", "✓"] as const;

export function ConclusionSlide() {
  const { p } = usePresentation();

  return (
    <section id="conclusion" className="pres-slide pres-slide-dark snap-slide relative min-h-[100svh]">
      <SlideArcs />
      <div className="pres-slide-inner relative mx-auto max-w-[1200px] px-6 py-16 sm:px-10 sm:py-24">
        <Reveal>
          <p className="pres-eyebrow">{p.conclusion.eyebrow}</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="pres-heading mt-4 max-w-4xl">{p.conclusion.heading}</h2>
        </Reveal>

        <div className="mt-12 space-y-6">
          {p.conclusion.rows.map((row, i) => (
            <Reveal key={i} delay={0.1 + i * 0.06} className="flex gap-4">
              <span className="pres-row-icon" aria-hidden>
                {ROW_ICONS[i] ?? "•"}
              </span>
              <p className="max-w-3xl text-base leading-relaxed text-white/85 sm:text-lg">
                {row.text}
              </p>
            </Reveal>
          ))}
        </div>

        <div className="pres-divider mt-14" />

        <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <Reveal delay={0.2}>
            <p className="font-display text-3xl font-semibold text-pres-mint sm:text-4xl">
              {p.conclusion.thanks}
            </p>
          </Reveal>
          <Reveal delay={0.24} className="text-right">
            <p className="text-lg text-white">{AUTHOR.name}</p>
            <p className="mt-1 text-sm text-white/55">{AUTHOR.group}</p>
            <p className="pres-institution mt-3 text-xs tracking-[0.24em] text-white/40 uppercase">
              {AUTHOR.institution} · {AUTHOR.year}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.28} className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <BrandLogo playOnView className="font-display text-xl font-extrabold sm:text-2xl" />
          <CTAButton href={APP_URL}>{p.footer.cta}</CTAButton>
        </Reveal>

        <p className="pres-pagenum mt-10 text-right text-white/30">{p.conclusion.slide}</p>
      </div>
    </section>
  );
}
