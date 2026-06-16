import { useLanguage } from "./LanguageProvider";
import { PRESENTATION } from "../lib/presentationContent";

export function usePresentation() {
  const { lang } = useLanguage();
  return { p: PRESENTATION[lang] };
}
