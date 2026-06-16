import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CONTENT, type Lang, type SiteContent } from "../lib/content";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  c: SiteContent;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "soundbloom-landing-lang";

function detectInitial(): Lang {
  if (typeof window === "undefined") return "ru";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in CONTENT) return saved as Lang;
  } catch {
    /* ignore */
  }
  const nav = navigator.language.slice(0, 2).toLowerCase();
  if (nav === "en") return "en";
  if (nav === "kk") return "kk";
  return "ru";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitial);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, c: CONTENT[lang] }),
    [lang],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
