import { useLanguage } from "../i18n/LanguageProvider";
import { APP_URL } from "../lib/theme";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { WaveText } from "../components/WaveText";
import { CTAButton } from "../components/CTAButton";
import { Equalizer } from "../components/Equalizer";

export function Finale() {
  const { c } = useLanguage();

  return (
    <section
      id="finale"
      className="relative flex min-h-[100svh] items-center py-[clamp(7rem,16vh,12rem)]"
    >
      <Container className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center gap-10 text-center sm:gap-12">
          <Reveal>
            <Equalizer className="h-9" bars={7} />
          </Reveal>

          <Reveal delay={0.05}>
            <p className="overline text-magenta">{c.finale.kicker}</p>
          </Reveal>

          <Reveal>
            <h2 className="relative z-20 w-full font-display font-semibold">
              <span className="text-shield wt-line block text-[clamp(2.4rem,8.5vw,6.5rem)] leading-[1.08] text-bone">
                <WaveText text={c.finale.titleTop} />
              </span>
              <span className="text-accent-pink wt-line mt-2 block text-[clamp(2.4rem,8.5vw,6.5rem)] leading-[1.08]">
                <WaveText text={c.finale.titleBottom} gradient delay={0.12} />
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mx-auto max-w-md text-lg leading-relaxed text-bone/75">
              {c.finale.subtitle}
            </p>
          </Reveal>

          <Reveal delay={0.16} y={16}>
            <div className="flex flex-col items-center gap-4 pt-2">
              <CTAButton href={APP_URL} className="px-9 py-4 text-base">
                {c.finale.cta}
              </CTAButton>
              <p className="text-sm text-bone/60">{c.finale.note}</p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
