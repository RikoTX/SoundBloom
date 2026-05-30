import { getToken } from "../utils/getToken";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5223";

async function adminFetch(path, options = {}) {
  const { token } = getToken();
  const response = await fetch(`${API_URL}/api/admin${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Admin request failed.");
  }
  return data;
}

export function fetchAdminUsers() {
  return adminFetch("/users");
}

export function updateUserRole(userId, role) {
  return adminFetch(`/users/${encodeURIComponent(userId)}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export function updateAdminUser(userId, payload) {
  return adminFetch(`/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminUser(userId) {
  return adminFetch(`/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
}

export function fetchAdminStats() {
  return adminFetch("/stats");
}

export function fetchAdminLogs(limit = 100) {
  return adminFetch(`/logs?limit=${limit}`);
}

export function fetchAdminTranslations(search = "") {
  const q = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  return adminFetch(`/translations${q}`);
}

export function upsertAdminTranslation({ key, locale, value, namespace }) {
  return adminFetch("/translations", {
    method: "PUT",
    body: JSON.stringify({ key, locale, value, namespace }),
  });
}

export function createAdminTranslationKey({ key, en, ru, kk, namespace }) {
  return adminFetch("/translations", {
    method: "POST",
    body: JSON.stringify({ key, en, ru, kk, namespace }),
  });
}

export function deleteAdminTranslation(key, locale) {
  return adminFetch(
    `/translations/${encodeURIComponent(key)}/${encodeURIComponent(locale)}`,
    { method: "DELETE" },
  );
}
