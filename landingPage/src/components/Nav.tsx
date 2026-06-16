import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useLanguage } from "../i18n/LanguageProvider";
import { useSmoothScroll } from "../providers/SmoothScroll";
import { LangSwitcher } from "./LangSwitcher";
import { CTAButton } from "./CTAButton";
import { BrandLogo } from "./BrandLogo";
import { APP_URL, EASE_BLOOM } from "../lib/theme";

export function Nav() {
  const { c } = useLanguage();
  const { scrollTo } = useSmoothScroll();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  return (
    <motion.header
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.1, ease: EASE_BLOOM, delay: 0.3 }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        aria-hidden
        className={`absolute inset-0 border-b transition-all duration-500 ${
          scrolled
            ? "border-white/[0.07] bg-ink/70 backdrop-blur-xl"
            : "border-transparent"
        }`}
      />
      <nav
        className={`relative mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 transition-all duration-500 sm:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr] ${
          scrolled ? "py-3" : "py-5"
        }`}
      >
        <button
          type="button"
          onClick={() => scrollTo(0)}
          className="justify-self-start"
          aria-label="SoundBloom"
        >
          <BrandLogo playOnMount />
        </button>

        <div className="hidden items-center gap-9 justify-self-center lg:flex">
          {c.nav.links.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollTo(`#${link.id}`)}
              className="text-sm text-bone/55 transition-colors duration-300 hover:text-bone"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 justify-self-end">
          <LangSwitcher />
          <CTAButton href={APP_URL} className="hidden px-5 py-2.5 text-xs sm:inline-flex">
            {c.nav.cta}
          </CTAButton>
        </div>
      </nav>
    </motion.header>
  );
}
