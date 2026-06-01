import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import MarketingPageShell from "../../components/marketing/MarketingPageShell";
import GlassCard from "../../components/marketing/GlassCard";

const SECTIONS = [
  "s1",
  "s2",
  "s3",
  "s4",
  "s5",
  "s6",
  "s7",
  "s8",
  "s9",
  "s10",
  "s11",
  "s12",
];

export default function TermsOfUse() {
  const { t } = useTranslation();

  return (
    <MarketingPageShell>
      <section className="px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#EE10B0]/80">
              {t("common.brand")}
            </p>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              {t("marketing.terms.title")}
            </h1>
            <p className="mt-3 text-sm text-white/40">{t("marketing.terms.updated")}</p>
            <p className="mt-6 text-base leading-relaxed text-white/55">
              {t("marketing.terms.intro")}
            </p>
          </motion.div>

          <div className="mt-10 space-y-6">
            {SECTIONS.map((id, index) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
              >
                <GlassCard className="p-5 sm:p-6">
                  <h2 className="text-lg font-semibold text-white mb-3">
                    {t(`marketing.terms.${id}.title`)}
                  </h2>
                  <p className="text-sm leading-relaxed text-white/50 whitespace-pre-line">
                    {t(`marketing.terms.${id}.body`)}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-[#EE10B0]/20 bg-[#EE10B0]/5 p-6 text-center">
            <p className="text-sm text-white/55">{t("marketing.terms.contact")}</p>
            <Link
              to="/contact"
              className="mt-3 inline-block text-sm font-medium text-[#EE10B0] hover:underline"
            >
              {t("common.contact")} →
            </Link>
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
}
