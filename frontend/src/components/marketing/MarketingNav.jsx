import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import DiaTextReveal from "../DiaTextReveal/DiaTextReveal";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";

export default function MarketingNav() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const NAV_LINKS = [
    { labelKey: "common.about", path: "/about" },
    { labelKey: "common.contact", path: "/contact" },
    { labelKey: "common.premium", path: "/premium" },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090B]/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/Home" className="inline-flex items-center gap-2.5">
          <img
            src={`${import.meta.env.BASE_URL}logo-round.png`}
            alt=""
            className="h-8 w-8 rounded-full"
          />
          <DiaTextReveal
            text={t("common.brand")}
            colors={["#EE10B0", "#0E9EEF"]}
            finalGradient
            duration={1.6}
            repeat
            repeatDelay={1.2}
            once={false}
            startOnView={false}
            className="text-lg font-extrabold tracking-tight sm:text-xl"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ labelKey, path }) => (
            <Link
              key={path}
              to={path}
              className={`text-sm transition-colors duration-200 ${
                pathname === path
                  ? "text-white"
                  : "text-white/45 hover:text-white/80"
              }`}
            >
              {t(labelKey)}
            </Link>
          ))}
          <LanguageSwitcher compact />
          <Link
            to="/Home"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-[#cb0094]/40 hover:text-white"
          >
            {t("nav.openApp")}
          </Link>
        </nav>

        <Link
          to="/Home"
          className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 transition hover:border-[#cb0094]/40 hover:text-white md:hidden"
        >
          {t("nav.app")}
        </Link>
      </div>
    </motion.header>
  );
}
