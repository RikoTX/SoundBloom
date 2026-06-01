const STORAGE_KEY = "soundbloom-theme";

export function getStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  return "dark";
}

export function applyTheme(theme) {
  const root = document.documentElement;
  const isDark = theme === "dark";
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
  try {
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("soundbloom-theme-change"));
}

export function initTheme() {
  applyTheme(getStoredTheme());
}

export function isDarkTheme() {
  return document.documentElement.classList.contains("dark");
}

export function toggleThemeClass() {
  applyTheme(isDarkTheme() ? "light" : "dark");
}
