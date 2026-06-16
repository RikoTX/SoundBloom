import { motion } from "framer-motion";
import { LANGS } from "../lib/content";
import { useLanguage } from "../i18n/LanguageProvider";

export function LangSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="relative flex items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.03] p-1 backdrop-blur-md">
      {LANGS.map(({ code, short, label }) => {
        const active = code === lang;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-label={label}
            aria-pressed={active}
            className="relative rounded-full px-2.5 py-1 text-xs font-medium"
          >
            {active && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-magenta-deep to-magenta shadow-[0_4px_18px_-6px_rgba(238,16,176,0.8)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span
              className={`relative z-10 transition-colors ${
                active ? "text-white" : "text-bone/55 hover:text-bone"
              }`}
            >
              {short}
            </span>
          </button>
        );
      })}
    </div>
  );
}
