const STORAGE_KEY = "soundbloom_listener_key";

export function getListenerKey() {
  try {
    let key = localStorage.getItem(STORAGE_KEY);
    if (!key) {
      key =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(STORAGE_KEY, key);
    }
    return key;
  } catch {
    return `anon-${Date.now()}`;
  }
}
