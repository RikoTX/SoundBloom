import { useLanguage } from "../i18n/LanguageProvider";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { SectionLabel } from "../components/SectionLabel";
import { WaveText } from "../components/WaveText";

export function About() {
  const { c } = useLanguage();

  return (
    <section id="about" className="relative py-[clamp(7rem,17vh,13rem)]">
      <Container>
        <SectionLabel index={c.about.index} label={c.about.label} />

        <div className="mt-12 grid gap-x-10 gap-y-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-8">
            <h2 className="font-display text-[clamp(1.9rem,4.8vw,3.8rem)] font-semibold leading-[1.04]">
              {c.about.heading}
            </h2>
          </Reveal>

          <div className="space-y-6 self-end text-lg leading-relaxed text-bone/70 lg:col-span-4">
            {c.about.paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.08 * i}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="text-accent-pink text-shield mt-[clamp(4rem,11vh,9rem)]">
          <WaveText
            as="p"
            text={c.about.pull}
            gradient
            className="block max-w-[22ch] font-display text-[clamp(2.1rem,7.5vw,5.4rem)] font-semibold leading-[1.05]"
          />
        </div>
      </Container>
    </section>
  );
}
