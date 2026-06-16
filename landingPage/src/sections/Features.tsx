import { useLanguage } from "../i18n/LanguageProvider";
import type { FeatureItem } from "../lib/content";
import { Container } from "../components/Container";
import { SectionLabel } from "../components/SectionLabel";
import { Reveal } from "../components/Reveal";

function FeatureRow({ item }: { item: FeatureItem }) {
  return (
    <div className="group relative border-t border-white/[0.08] py-7 last:border-b">
      <div className="flex items-baseline gap-5 sm:gap-8">
        <span className="font-display text-sm text-bone/30 transition-colors duration-300 group-hover:text-magenta">
          {item.no}
        </span>
        <h3 className="font-display text-[clamp(1.6rem,3.8vw,2.7rem)] font-semibold leading-tight text-bone/65 transition-all duration-500 group-hover:translate-x-2 group-hover:text-bone">
          {item.title}
        </h3>
        <span className="ml-auto hidden shrink-0 self-center rounded-full border border-white/10 px-3 py-1 text-xs text-bone/45 sm:inline-block">
          {item.tag}
        </span>
      </div>

      <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out lg:grid-rows-[0fr] lg:group-hover:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <p className="max-w-xl pl-9 pt-3 text-bone/50 sm:pl-[3.25rem]">
            {item.text}
          </p>
        </div>
      </div>

      <span className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-magenta to-azure transition-all duration-700 ease-out group-hover:w-full" />
    </div>
  );
}

export function Features() {
  const { c } = useLanguage();

  return (
    <section id="features" className="relative py-[clamp(7rem,16vh,12rem)]">
      <Container>
        <SectionLabel index={c.features.index} label={c.features.label} />
        <Reveal className="mt-10">
          <h2 className="max-w-3xl font-display text-[clamp(1.9rem,5vw,4rem)] font-semibold leading-[1.03]">
            {c.features.heading}
          </h2>
        </Reveal>

        <div className="mt-14">
          {c.features.items.map((item, i) => (
            <Reveal key={item.no} delay={i * 0.04} y={20} amount={0.4}>
              <FeatureRow item={item} />
            </Reveal>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-2 gap-y-12 md:grid-cols-4">
          {c.features.stats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 0.08}
              className="md:border-l md:border-white/10 md:pl-7 md:first:border-l-0 md:first:pl-0"
            >
              <div className="font-display text-[clamp(2.6rem,6vw,4.6rem)] font-semibold leading-none text-spectrum">
                {s.value}
              </div>
              <div className="mt-3 max-w-[16ch] text-sm text-bone/45">
                {s.label}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
