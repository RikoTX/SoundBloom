const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5223";

export async function fetchLocales() {
  const response = await fetch(`${API_URL}/api/i18n/locales`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    return ["en", "ru", "kk"];
  }

  return response.json();
}

export async function fetchTranslations(locale) {
  const response = await fetch(`${API_URL}/api/i18n/${encodeURIComponent(locale)}`, {
    headers: { Accept: "application/json" },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Could not load translations.");
  }

  return data.translations || {};
}
