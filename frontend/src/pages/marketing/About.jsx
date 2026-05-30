import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import MarketingPageShell from "../../components/marketing/MarketingPageShell";
import GlassCard from "../../components/marketing/GlassCard";
import SectionReveal from "../../components/marketing/SectionReveal";

const STATS = [
  { value: "2.4M+", labelKey: "marketing.about.statListeners" },
  { value: "180K+", labelKey: "marketing.about.statPlaylists" },
  { value: "12M+", labelKey: "marketing.about.statHours" },
];

const MISSION_CARDS = [
  {
    titleKey: "marketing.about.mission",
    textKey: "marketing.about.missionText",
  },
  {
    titleKey: "marketing.about.why",
    textKey: "marketing.about.whyText",
  },
  {
    titleKey: "marketing.about.experience",
    textKey: "marketing.about.experienceText",
  },
];

export default function About() {
  const { t } = useTranslation();

  return (
    <MarketingPageShell>
      <section className="px-5 pb-8 pt-8 sm:px-8 sm:pt-10">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#EE10B0]/80">
              {t("marketing.about.title")}
            </p>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              {t("marketing.about.hero")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/45 sm:text-lg">
              {t("marketing.about.p1")}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/45 sm:text-lg">
              {t("marketing.about.p2")}
            </p>
          </motion.div>
        </div>
      </section>

      <SectionReveal className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          {STATS.map((stat) => (
            <GlassCard key={stat.labelKey} glow>
              <p className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-white/40">{t(stat.labelKey)}</p>
            </GlassCard>
          ))}
        </div>
      </SectionReveal>

      <SectionReveal className="mx-auto mt-16 max-w-6xl px-5 sm:mt-20 sm:px-8" delay={0.1}>
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {MISSION_CARDS.map((card) => (
            <GlassCard key={card.titleKey} glow>
              <h2 className="text-xl font-semibold tracking-tight text-white">
                {t(card.titleKey)}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/45 sm:text-[15px]">
                {t(card.textKey)}
              </p>
            </GlassCard>
          ))}
        </div>
      </SectionReveal>

      <SectionReveal className="mx-auto mt-16 max-w-6xl px-5 pb-4 sm:mt-20 sm:px-8" delay={0.15}>
        <GlassCard glow>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("marketing.about.builtTitle")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/45 sm:text-base">
            {t("marketing.about.builtP1")}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/45 sm:text-base">
            {t("marketing.about.builtP2")}
          </p>
        </GlassCard>
      </SectionReveal>
    </MarketingPageShell>
  );
}
