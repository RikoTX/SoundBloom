import { getToken } from "../utils/getToken";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5223";

async function parseJsonResponse(response) {
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.title || "Request failed.");
  }
  return data;
}

function authHeaders() {
  const { token } = getToken();
  if (!token) throw new Error("Not authenticated.");
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export function fetchPendingTracks() {
  return fetch(`${API_URL}/api/operator/tracks/pending`, {
    headers: authHeaders(),
  }).then(parseJsonResponse);
}

export function fetchOperatorTrackDetail(trackId) {
  return fetch(`${API_URL}/api/operator/tracks/${encodeURIComponent(trackId)}`, {
    headers: authHeaders(),
  }).then(parseJsonResponse);
}

export function approveTrack(trackId) {
  return fetch(`${API_URL}/api/operator/tracks/${encodeURIComponent(trackId)}/approve`, {
    method: "POST",
    headers: authHeaders(),
  }).then(parseJsonResponse);
}

export function rejectTrack(trackId, reason) {
  return fetch(`${API_URL}/api/operator/tracks/${encodeURIComponent(trackId)}/reject`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ reason }),
  }).then(parseJsonResponse);
}
