import { getToken } from "../utils/getToken";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5223";

function authHeaders() {
  const { token } = getToken();
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseJson(response) {
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Promo request failed.");
  }
  return data;
}

export function fetchAdminPromos() {
  return fetch(`${API_URL}/api/admin/promos`, {
    headers: authHeaders(),
  }).then(parseJson);
}

export function createAdminPromo(payload) {
  return fetch(`${API_URL}/api/admin/promos`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }).then(parseJson);
}

export function updateAdminPromo(id, payload) {
  return fetch(`${API_URL}/api/admin/promos/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }).then(parseJson);
}

export function deleteAdminPromo(id) {
  return fetch(`${API_URL}/api/admin/promos/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(parseJson);
}

export function validatePromo(code, plan) {
  return fetch(`${API_URL}/api/subscription/promo/validate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ code, plan }),
  }).then(parseJson);
}
