import { getToken } from "../utils/getToken";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5223";

const DEFAULT_COVER =
  "https://usercontent.jamendo.com?type=album&id=0&width=300";

function toAbsoluteMediaUrl(url) {
  if (!url) return "";
  return url.startsWith("/api/") ? `${API_URL}${url}` : url;
}

export function mapCatalogTrack(track) {
  const audio = toAbsoluteMediaUrl(track.audioUrl);
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    cover: toAbsoluteMediaUrl(track.cover) || DEFAULT_COVER,
    music: audio,
    audio,
    time: track.time || "—",
    duration: track.durationSeconds || 0,
    source: track.source || "soundbloom",
    album: track.album || "SoundBloom",
  };
}

async function parseJson(response) {
  const data = await response.json().catch(() => []);
  if (!response.ok) {
    throw new Error(data.message || "Catalog request failed.");
  }
  return data;
}

export async function searchCatalogTracks(query, limit = 10) {
  if (!query?.trim()) return [];
  const params = new URLSearchParams({
    q: query.trim(),
    limit: String(limit),
  });
  const data = await parseJson(
    await fetch(`${API_URL}/api/catalog/tracks?${params}`, {
      headers: { Accept: "application/json" },
    }),
  );
  return Array.isArray(data) ? data.map(mapCatalogTrack) : [];
}

export async function recordCatalogListen(trackId, listenerKey) {
  const { token } = getToken();
  const response = await fetch(
    `${API_URL}/api/catalog/tracks/${encodeURIComponent(trackId)}/listen`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ listenerKey }),
    },
  );
  if (!response.ok && response.status !== 204) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Could not record listen.");
  }
}

export async function fetchCatalogFeatured({ order = "recent", limit = 14, tag } = {}) {
  const params = new URLSearchParams({
    order,
    limit: String(limit),
  });
  if (tag?.trim()) params.set("tag", tag.trim());

  const data = await parseJson(
    await fetch(`${API_URL}/api/catalog/tracks/featured?${params}`, {
      headers: { Accept: "application/json" },
    }),
  );
  return Array.isArray(data) ? data.map(mapCatalogTrack) : [];
}
