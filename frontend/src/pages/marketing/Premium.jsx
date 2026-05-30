import { useState } from "react";
import { motion } from "framer-motion";
import { CheckOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import MarketingPageShell from "../../components/marketing/MarketingPageShell";
import GlassCard from "../../components/marketing/GlassCard";
import SectionReveal from "../../components/marketing/SectionReveal";

function PremiumBadge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#cb0094]/40 bg-[#cb0094]/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[#EE10B0]">
      {children}
    </span>
  );
}

export default function Premium() {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState("premium");

  const FEATURES = [
    "marketing.premium.noAds",
    "marketing.premium.lossless",
    "marketing.premium.unlimitedSkips",
    "marketing.premium.exclusiveMixes",
  ];

  const PLANS = [
    {
      id: "free",
      nameKey: "marketing.premium.free",
      price: "$0",
      periodKey: "marketing.premium.forever",
      descriptionKey: "marketing.premium.planFreeDesc",
      featureKeys: [
        "marketing.premium.featureStandard",
        "marketing.premium.featureAds",
        "marketing.premium.featureLimitedSkips",
      ],
      highlighted: false,
      ctaKey: "marketing.premium.currentPlan",
    },
    {
      id: "premium",
      nameKey: "marketing.premium.planPremium",
      price: "$9.99",
      periodKey: "marketing.premium.perMonth",
      descriptionKey: "marketing.premium.planPremiumDesc",
      featureKeys: FEATURES,
      highlighted: true,
      ctaKey: "marketing.premium.getPremium",
      badgeKey: "marketing.premium.mostPopular",
    },
    {
      id: "family",
      nameKey: "marketing.premium.planFamily",
      price: "$14.99",
      periodKey: "marketing.premium.perMonth",
      descriptionKey: "marketing.premium.planFamilyDesc",
      featureKeys: [
        ...FEATURES,
        "marketing.premium.featureFamilyAccounts",
        "marketing.premium.featureFamilyMix",
      ],
      highlighted: false,
      ctaKey: "marketing.premium.getFamily",
    },
  ];

  return (
    <MarketingPageShell intensity="premium">
      <section className="relative overflow-hidden px-5 pb-12 pt-8 sm:px-8 sm:pt-10">
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <PremiumBadge>{t("marketing.premium.title")}</PremiumBadge>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              {t("marketing.premium.subtitle")}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/45 sm:text-lg">
              {t("marketing.premium.heroDesc")}
            </p>
          </motion.div>
        </div>
      </section>

      <SectionReveal className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {FEATURES.map((featureKey) => (
            <span
              key={featureKey}
              className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs text-white/55 backdrop-blur-md sm:text-sm"
            >
              {t(featureKey)}
            </span>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {PLANS.map((plan, i) => {
            const isSelected = selectedPlan === plan.id;
            const isHighlighted = plan.highlighted;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => setSelectedPlan(plan.id)}
                className="cursor-pointer"
              >
                <GlassCard
                  glow={isHighlighted || isSelected}
                  hover={false}
                  className={`relative h-full transition-all duration-300 ${
                    isHighlighted
                      ? "border-[#cb0094]/35 shadow-[0_0_60px_rgba(203,0,148,0.15)]"
                      : isSelected
                        ? "border-white/20"
                        : ""
                  }`}
                >
                  {plan.badgeKey && (
                    <div className="mb-4">
                      <PremiumBadge>{t(plan.badgeKey)}</PremiumBadge>
                    </div>
                  )}

                  <h2 className="text-2xl font-semibold tracking-tight">
                    {t(plan.nameKey)}
                  </h2>
                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-4xl font-semibold tracking-tight">
                      {plan.price}
                    </span>
                    <span className="mb-1 text-sm text-white/40">
                      {t(plan.periodKey)}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-white/45">
                    {t(plan.descriptionKey)}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {plan.featureKeys.map((featureKey) => (
                      <li
                        key={featureKey}
                        className="flex items-start gap-2.5 text-sm text-white/60"
                      >
                        <CheckOutlined className="mt-0.5 shrink-0 text-[#EE10B0]" />
                        {t(featureKey)}
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`mt-8 w-full rounded-full py-3.5 text-sm font-semibold transition-all duration-200 ${
                      isHighlighted
                        ? "bg-[#cb0094] text-white shadow-[0_10px_28px_rgba(203,0,148,0.35)] hover:bg-[#EE10B0]"
                        : "border border-white/15 bg-white/[0.04] text-white/80 hover:border-[#cb0094]/30 hover:text-white"
                    }`}
                  >
                    {t(plan.ctaKey)}
                  </motion.button>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </SectionReveal>

      <SectionReveal
        className="mx-auto mt-20 max-w-3xl px-5 pb-8 text-center sm:mt-28 sm:px-8"
        delay={0.1}
      >
        <GlassCard glow>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("marketing.premium.upgrade")}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/45 sm:text-base">
            {t("marketing.premium.upgradeDesc")}
          </p>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-8 rounded-full bg-[#cb0094] px-10 py-3.5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(203,0,148,0.35)] transition hover:bg-[#EE10B0]"
          >
            {t("marketing.premium.trial")}
          </motion.button>
        </GlassCard>
      </SectionReveal>
    </MarketingPageShell>
  );
}
