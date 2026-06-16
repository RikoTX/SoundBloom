import { useEffect, useRef } from "react";
import { useLanguage } from "../i18n/LanguageProvider";
import { useSmoothScroll } from "../providers/SmoothScroll";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { gsap } from "../lib/gsap";
import { APP_URL } from "../lib/theme";
import { Container } from "../components/Container";
import { WaveText } from "../components/WaveText";
import { CTAButton } from "../components/CTAButton";
import { ScrollCue } from "../components/ScrollCue";
import { Equalizer } from "../components/Equalizer";

export function Hero() {
  const { c } = useLanguage();
  const { scrollTo } = useSmoothScroll();
  const root = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.9, delay: 0.5 })
        .from(".hero-sub", { y: 24, opacity: 0, duration: 1 }, "-=0.2")
        .from(
          ".hero-cta",
          { y: 26, opacity: 0, duration: 0.9, stagger: 0.12 },
          "-=0.55",
        );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      id="hero"
      ref={root}
      className="relative flex min-h-[100svh] items-center"
    >
      <Container>
        <div className="max-w-5xl">
          <div className="hero-eyebrow flex items-center gap-3">
            <Equalizer className="h-3.5" bars={5} />
            <span className="overline text-bone/55">{c.hero.eyebrow}</span>
          </div>

          <h1 className="text-shield mt-7 font-display font-semibold">
            <span className="wt-line block text-[clamp(3.2rem,13vw,10rem)] leading-[0.95] text-bone">
              <WaveText text={c.hero.titleTop} immediate />
            </span>
            <span className="wt-line mt-1 block text-[clamp(3.2rem,13vw,10rem)] leading-[0.95]">
              <WaveText
                text={c.hero.titleBottom}
                gradient
                immediate
                delay={0.18}
              />
            </span>
          </h1>

          <p className="hero-sub mt-8 max-w-xl text-lg leading-relaxed text-bone/55 sm:text-xl">
            {c.hero.subtitle}
          </p>

          <div className="mt-11 flex flex-wrap items-center gap-4">
            <div className="hero-cta">
              <CTAButton href={APP_URL}>{c.hero.ctaPrimary}</CTAButton>
            </div>
            <div className="hero-cta">
              <CTAButton variant="ghost" onClick={() => scrollTo("#about")}>
                {c.hero.ctaSecondary}
              </CTAButton>
            </div>
          </div>
        </div>
      </Container>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <ScrollCue label={c.hero.scrollCue} />
      </div>
    </section>
  );
}
