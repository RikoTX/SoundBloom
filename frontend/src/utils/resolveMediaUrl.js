/** Absolute URL, data URL, or blob — use as-is. Otherwise treat as app-relative path. */
export function resolveMediaUrl(src) {
  if (!src) return "";
  const trimmed = String(src).trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  const base = import.meta.env.BASE_URL || "/";
  const path = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
  return `${base}${path}`;
}
