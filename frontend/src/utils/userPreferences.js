const PREFS_KEY = "soundbloom_preferences";
export const PREFS_CHANGE_EVENT = "soundbloom-prefs-change";

const DEFAULTS = {
  autoplayNext: true,
  repeatMode: "all",
  reduceMotion: false,
  showHeaderNews: true,
  crossfadeEnabled: true,
};

function readAll() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function writeAll(prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  window.dispatchEvent(new Event(PREFS_CHANGE_EVENT));
}

export function getPreference(key) {
  return readAll()[key];
}

export function setPreference(key, value) {
  const prefs = readAll();
  prefs[key] = value;
  writeAll(prefs);
}

export function getAllPreferences() {
  return readAll();
}

export function resetPreferences() {
  localStorage.removeItem(PREFS_KEY);
  window.dispatchEvent(new Event(PREFS_CHANGE_EVENT));
}

export function getPlayerVolume() {
  const saved = localStorage.getItem("playerVolume");
  return saved !== null ? parseFloat(saved) : 1;
}

export function setPlayerVolume(value) {
  const clamped = Math.min(1, Math.max(0, value));
  localStorage.setItem("playerVolume", String(clamped));
  window.dispatchEvent(new Event(PREFS_CHANGE_EVENT));
}

export function clearLocalAppData({ keepLocale = true } = {}) {
  const locale = keepLocale ? localStorage.getItem("soundbloom_locale") : null;
  const keysToRemove = [
    PREFS_KEY,
    "playerVolume",
    "token",
    "username",
    "role",
  ];
  keysToRemove.forEach((k) => localStorage.removeItem(k));
  sessionStorage.clear();
  if (locale) localStorage.setItem("soundbloom_locale", locale);
  window.dispatchEvent(new Event(PREFS_CHANGE_EVENT));
}
