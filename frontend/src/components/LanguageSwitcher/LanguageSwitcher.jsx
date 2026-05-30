import { useEffect, useRef, useState } from "react";
import { GlobalOutlined, CheckOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { changeAppLanguage, SUPPORTED_LOCALES } from "../../i18n";

const LOCALE_LABELS = {
  en: "lang.en",
  ru: "lang.ru",
  kk: "lang.kk",
};

export default function LanguageSwitcher({ compact = false }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const current = i18n.language?.slice(0, 2) || "en";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    setOpen(false);
    if (code !== current) {
      changeAppLanguage(code);
    }
  };

  return (
    <div ref={rootRef} className="relative z-[1300]">
      <button
        type="button"
        aria-label={t("nav.language")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#141416] text-white/80 transition-all hover:border-[#EE10B0]/50 hover:text-[#EE10B0] cursor-pointer ${
          open ? "border-[#EE10B0]/50 text-[#EE10B0]" : ""
        } ${compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"}`}
      >
        <GlobalOutlined />
        {!compact && <span className="uppercase font-semibold">{current}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] min-w-[160px] overflow-hidden rounded-xl border border-white/10 bg-[#141416] py-1 shadow-[0_16px_48px_rgba(0,0,0,0.75)]">
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
            {t("nav.language")}
          </p>
          {SUPPORTED_LOCALES.map((code) => {
            const active = code === current;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleSelect(code)}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                  active
                    ? "bg-[#EE10B0]/15 text-[#EE10B0]"
                    : "text-white/75 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span>{t(LOCALE_LABELS[code])}</span>
                {active && <CheckOutlined className="text-xs" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
