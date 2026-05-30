import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { fetchTranslations } from "../api/i18nApi";
import { BUNDLED_TRANSLATIONS } from "./bundledTranslations.js";

export const LOCALE_STORAGE_KEY = "soundbloom_locale";
export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["en", "ru", "kk"];

export function getStoredLocale() {
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
  return SUPPORTED_LOCALES.includes(saved) ? saved : DEFAULT_LOCALE;
}

export function storeLocale(locale) {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function mergeTranslations(locale, apiTranslations = {}) {
  const bundled = BUNDLED_TRANSLATIONS[locale] || BUNDLED_TRANSLATIONS[DEFAULT_LOCALE] || {};
  return { ...bundled, ...apiTranslations };
}

export async function loadLocaleResources(locale) {
  let apiTranslations = {};
  try {
    apiTranslations = await fetchTranslations(locale);
  } catch {
    apiTranslations = {};
  }
  const merged = mergeTranslations(locale, apiTranslations);
  i18n.addResourceBundle(locale, "translation", merged, true, true);
  return merged;
}

export async function changeAppLanguage(locale) {
  const normalized = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;

  await loadLocaleResources(normalized);

  await i18n.changeLanguage(normalized);
  storeLocale(normalized);
  document.documentElement.lang = normalized;
  window.dispatchEvent(new Event("soundbloom-locale-change"));
}

export async function initI18n() {
  const locale = getStoredLocale();

  let apiTranslations = {};
  try {
    apiTranslations = await fetchTranslations(locale);
  } catch {
    if (locale !== DEFAULT_LOCALE) {
      try {
        apiTranslations = await fetchTranslations(DEFAULT_LOCALE);
      } catch {
        apiTranslations = {};
      }
    }
  }

  const translations = mergeTranslations(locale, apiTranslations);

  await i18n.use(initReactI18next).init({
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    resources: {
      [locale]: { translation: translations },
      [DEFAULT_LOCALE]: {
        translation: mergeTranslations(DEFAULT_LOCALE, locale === DEFAULT_LOCALE ? apiTranslations : {}),
      },
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

  document.documentElement.lang = locale;
}

export default i18n;
