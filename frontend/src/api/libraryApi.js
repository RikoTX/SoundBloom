import { getToken } from "../utils/getToken";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5223";

async function parseJsonResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.title || "Request failed.");
  }

  return data;
}

function authHeaders() {
  const { token } = getToken();

  if (!token) {
    throw new Error("Not authenticated.");
  }

  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchLikes() {
  const response = await fetch(`${API_URL}/api/library/likes`, {
    headers: authHeaders(),
  });
  return parseJsonResponse(response);
}

export async function checkLike(source, trackId) {
  const response = await fetch(
    `${API_URL}/api/library/likes/${encodeURIComponent(source)}/${encodeURIComponent(trackId)}`,
    { headers: authHeaders() }
  );
  return parseJsonResponse(response);
}

export async function addLike(track) {
  const source = String(track.source || "").toLowerCase();
  const payload = {
    trackId: String(track.id),
    source,
    title: track.title || "Untitled",
    artist: track.artist || null,
    album: track.album || null,
  };

  if (source === "soundbloom") {
    payload.cover = null;
    payload.audioUrl = null;
  } else {
    payload.cover = track.cover || null;
    payload.audioUrl = track.music || track.audio || track.audioUrl || null;
  }

  const response = await fetch(`${API_URL}/api/library/likes`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(response);
}

export async function removeLike(source, trackId) {
  const response = await fetch(
    `${API_URL}/api/library/likes/${encodeURIComponent(String(source).toLowerCase())}/${encodeURIComponent(trackId)}`,
    { method: "DELETE", headers: authHeaders() }
  );
  if (response.status === 204) return;
  return parseJsonResponse(response);
}

export async function fetchSavedAlbums() {
  const response = await fetch(`${API_URL}/api/library/albums`, {
    headers: authHeaders(),
  });
  return parseJsonResponse(response);
}

export async function checkSavedAlbum(albumId) {
  const response = await fetch(
    `${API_URL}/api/library/albums/${encodeURIComponent(albumId)}`,
    { headers: authHeaders() }
  );
  return parseJsonResponse(response);
}

export async function saveAlbum(album) {
  const response = await fetch(`${API_URL}/api/library/albums`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      albumId: String(album.id || album.albumId),
      title: album.title,
      artist: album.artist || null,
      cover: album.cover || null,
      trackCount: album.trackCount ?? album.tracks?.length ?? null,
    }),
  });
  return parseJsonResponse(response);
}

export async function removeSavedAlbum(albumId) {
  const response = await fetch(
    `${API_URL}/api/library/albums/${encodeURIComponent(albumId)}`,
    { method: "DELETE", headers: authHeaders() }
  );
  if (response.status === 204) return;
  return parseJsonResponse(response);
}

export async function fetchSavedGenres() {
  const response = await fetch(`${API_URL}/api/library/genres`, {
    headers: authHeaders(),
  });
  return parseJsonResponse(response);
}

export async function checkSavedGenre(tag) {
  const response = await fetch(
    `${API_URL}/api/library/genres/${encodeURIComponent(tag)}`,
    { headers: authHeaders() }
  );
  return parseJsonResponse(response);
}

export async function saveGenre(genre) {
  const response = await fetch(`${API_URL}/api/library/genres`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      tag: genre.tag,
      label: genre.label,
      cover: genre.cover || null,
    }),
  });
  return parseJsonResponse(response);
}

export async function removeSavedGenre(tag) {
  const response = await fetch(
    `${API_URL}/api/library/genres/${encodeURIComponent(tag)}`,
    { method: "DELETE", headers: authHeaders() }
  );
  if (response.status === 204) return;
  return parseJsonResponse(response);
}

export async function fetchSavedPlaylists() {
  const response = await fetch(`${API_URL}/api/library/playlists`, {
    headers: authHeaders(),
  });
  return parseJsonResponse(response);
}

export async function checkSavedPlaylist(playlistId) {
  const response = await fetch(
    `${API_URL}/api/library/playlists/${encodeURIComponent(playlistId)}`,
    { headers: authHeaders() }
  );
  return parseJsonResponse(response);
}

export async function savePlaylist(playlist) {
  const response = await fetch(`${API_URL}/api/library/playlists`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      playlistId: String(playlist.id || playlist.playlistId),
      title: playlist.title,
      cover: playlist.cover || null,
      userName: playlist.user || playlist.userName || null,
    }),
  });
  return parseJsonResponse(response);
}

export async function removeSavedPlaylist(playlistId) {
  const response = await fetch(
    `${API_URL}/api/library/playlists/${encodeURIComponent(playlistId)}`,
    { method: "DELETE", headers: authHeaders() }
  );
  if (response.status === 204) return;
  return parseJsonResponse(response);
}
