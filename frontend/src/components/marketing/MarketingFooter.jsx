import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import DiaTextReveal from "../DiaTextReveal/DiaTextReveal";

export default function MarketingFooter() {
  const { t } = useTranslation();

  const FOOTER_LINKS = [
    { labelKey: "nav.aboutUs", path: "/about" },
    { labelKey: "common.contact", path: "/contact" },
    { labelKey: "common.premium", path: "/premium" },
    { labelKey: "marketing.footer.privacy", path: "#" },
    { labelKey: "marketing.footer.terms", path: "/terms" },
  ];

  return (
    <footer className="relative z-10 mt-24 border-t border-white/[0.06] bg-[#09090B]/60 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          <Link to="/Home" className="inline-flex flex-col items-center gap-2 md:items-start">
            <DiaTextReveal
              text={t("common.brand")}
              colors={["#EE10B0", "#0E9EEF"]}
              finalGradient
              duration={1.6}
              repeat
              repeatDelay={1.5}
              once={false}
              startOnView={false}
              className="text-base font-extrabold tracking-tight"
            />
            <p className="max-w-xs text-center text-xs leading-relaxed text-white/35 md:text-left">
              {t("marketing.footer.tagline")}
            </p>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {FOOTER_LINKS.map(({ labelKey, path }) => (
              <motion.div key={labelKey} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                {path === "#" ? (
                  <span className="cursor-default text-sm text-white/40">{t(labelKey)}</span>
                ) : (
                  <Link
                    to={path}
                    className="text-sm text-white/45 transition-colors duration-200 hover:text-[#EE10B0]"
                  >
                    {t(labelKey)}
                  </Link>
                )}
              </motion.div>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-white/[0.05] pt-6 text-center text-xs text-white/25">
          {t("common.copyright", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
