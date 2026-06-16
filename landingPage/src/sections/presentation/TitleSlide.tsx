import { BrandLogo } from "../../components/BrandLogo";
import { Reveal } from "../../components/Reveal";
import { SlideArcs } from "../../components/presentation/SlideArcs";
import { AUTHOR } from "../../lib/author";
import { usePresentation } from "../../i18n/usePresentation";

export function TitleSlide() {
  const { p } = usePresentation();

  return (
    <section id="title" className="pres-slide pres-slide-dark snap-slide relative min-h-[100svh]">
      <SlideArcs />
      <div className="pres-slide-inner relative mx-auto flex min-h-[100svh] max-w-[1200px] flex-col justify-center px-6 py-24 sm:px-10">
        <Reveal>
          <BrandLogo playOnMount className="font-display text-2xl font-extrabold sm:text-3xl" />
        </Reveal>

        <Reveal delay={0.08}>
          <p className="pres-eyebrow mt-10">{p.title.badge}</p>
        </Reveal>

        <Reveal delay={0.12}>
          <h1 className="pres-heading pres-heading-hero mt-5 max-w-4xl">{p.title.heading}</h1>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="mt-6 max-w-2xl text-lg italic text-white/70">{p.title.stack}</p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="pres-divider mt-10 max-w-xl" />
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-8 space-y-2 text-base text-white/85 sm:text-lg">
            <p>
              <span className="text-pres-mint">Дипломник: </span>
              {AUTHOR.name}
            </p>
            <p>
              <span className="text-pres-mint">Группа: </span>
              {AUTHOR.group}
            </p>
            <p className="text-white/55">{p.title.role}</p>
          </div>
        </Reveal>

        <Reveal delay={0.28}>
          <p className="pres-institution mt-14 text-sm tracking-[0.28em] text-white/45 uppercase">
            {AUTHOR.institution} · {AUTHOR.year}
          </p>
        </Reveal>

        <p className="pres-pagenum absolute right-6 bottom-8 text-white/30 sm:right-10">
          01 / 10
        </p>
      </div>
    </section>
  );
}
