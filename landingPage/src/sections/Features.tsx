import { useLanguage } from "../i18n/LanguageProvider";
import type { FeatureItem } from "../lib/content";
import { Container } from "../components/Container";
import { SectionLabel } from "../components/SectionLabel";
import { Reveal } from "../components/Reveal";

function FeatureRow({ item }: { item: FeatureItem }) {
  return (
    <div className="border-t border-white/[0.08] py-6 last:border-b">
      <div className="grid gap-3 sm:grid-cols-[3rem_1fr] sm:gap-8">
        <span className="font-display text-sm tabular-nums text-magenta/80">
          {item.no}
        </span>
        <div>
          <h3 className="font-display text-xl font-semibold text-bone sm:text-2xl">
            {item.title}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-bone/60">
            {item.text}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Features() {
  const { c } = useLanguage();

  return (
    <section id="features" className="relative py-[clamp(7rem,16vh,12rem)]">
      <Container>
        <SectionLabel index={c.features.index} label={c.features.label} />

        <div className="mt-12">
          {c.features.items.map((item, i) => (
            <Reveal key={item.no} delay={i * 0.04} y={16} amount={0.3}>
              <FeatureRow item={item} />
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {c.features.stats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 0.06}
              className="md:border-l md:border-white/10 md:pl-6 md:first:border-l-0 md:first:pl-0"
            >
              <div className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-none text-spectrum">
                {s.value}
              </div>
              <div className="mt-2 text-sm text-bone/55">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
