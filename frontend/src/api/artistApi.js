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

export function fetchArtistStudio() {
  return fetch(`${API_URL}/api/artist/studio`, {
    headers: authHeaders(),
  }).then(parseJsonResponse);
}

export function registerArtist(payload) {
  return fetch(`${API_URL}/api/artist/register`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }).then(parseJsonResponse);
}

export function createArtistTrack(payload) {
  return fetch(`${API_URL}/api/artist/tracks`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }).then(parseJsonResponse);
}

export function deleteArtistTrack(trackId) {
  return fetch(`${API_URL}/api/artist/tracks/${encodeURIComponent(trackId)}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(parseJsonResponse);
}

export function fetchTrackAnalytics(trackId) {
  return fetch(
    `${API_URL}/api/artist/tracks/${encodeURIComponent(trackId)}/analytics`,
    { headers: authHeaders() },
  ).then(parseJsonResponse);
}
