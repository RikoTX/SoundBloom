const BASE_URL = "https://api.jamendo.com/v3.0";
const CLIENT_ID = "638e6390";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_PREFIX = "jamendo:v2:";
const MAX_CONCURRENT = 2;
const REQUEST_GAP_MS = 350;
const MAX_RETRIES = 3;

const FAILURE_THRESHOLD = 4;
const COOLDOWN_MS = 60 * 1000;

const inflight = new Map();
const queue = [];
let activeCount = 0;
let lastStartedAt = 0;
let consecutiveFailures = 0;
let cooldownUntil = 0;

function buildUrl(endpoint, params) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("format", "json");
  for (const [k, v] of Object.entries(params || {})) {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.set(k, v);
    }
  }
  return url.toString();
}

function readCache(url) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + url);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_PREFIX + url);
      return null;
    }
    return data;
  } catch (_) {
    return null;
  }
}

function writeCache(url, data) {
  try {
    localStorage.setItem(
      CACHE_PREFIX + url,
      JSON.stringify({ data, ts: Date.now() })
    );
  } catch (_) {}
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function pump() {
  if (activeCount >= MAX_CONCURRENT) return;
  const next = queue.shift();
  if (!next) return;
  const wait = Math.max(0, lastStartedAt + REQUEST_GAP_MS - Date.now());
  setTimeout(() => {
    activeCount++;
    lastStartedAt = Date.now();
    next();
    pump();
  }, wait);
}

function schedule(task) {
  return new Promise((resolve, reject) => {
    queue.push(() => {
      task()
        .then(resolve, reject)
        .finally(() => {
          activeCount--;
          pump();
        });
    });
    pump();
  });
}

async function rawFetch(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const err = new Error(`Jamendo HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function jamendoGet(endpoint, params) {
  const url = buildUrl(endpoint, params);

  const cached = readCache(url);
  if (cached) return cached;

  if (inflight.has(url)) return inflight.get(url);

  if (Date.now() < cooldownUntil) {
    throw new Error("Jamendo API cooldown active");
  }

  const promise = (async () => {
    let lastErr;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (Date.now() < cooldownUntil) throw lastErr || new Error("Cooldown");
      try {
        const data = await schedule(() => rawFetch(url));
        consecutiveFailures = 0;
        if (!data?.headers?.error_message) {
          writeCache(url, data);
        }
        return data;
      } catch (err) {
        lastErr = err;
        consecutiveFailures++;
        if (consecutiveFailures >= FAILURE_THRESHOLD) {
          cooldownUntil = Date.now() + COOLDOWN_MS;
          console.warn(
            `[Jamendo] Too many failures, paused for ${COOLDOWN_MS / 1000}s`
          );
          throw err;
        }
        const backoff = 800 * Math.pow(2, attempt) + Math.random() * 500;
        await sleep(backoff);
      }
    }
    throw lastErr;
  })().finally(() => {
    inflight.delete(url);
  });

  inflight.set(url, promise);
  return promise;
}

function formatTime(seconds) {
  if (!seconds || seconds < 0) return "0:00";
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function mapTrack(t) {
  return {
    id: t.id,
    title: t.name,
    artist: t.artist_name,
    artistId: t.artist_id,
    album: t.album_name,
    albumId: t.album_id,
    cover:
      t.image ||
      t.album_image ||
      "https://usercontent.jamendo.com?type=album&id=0&width=300",
    music: t.audio,
    audio: t.audio,
    audioDownload: t.audiodownload,
    duration: Number(t.duration) || 0,
    time: formatTime(Number(t.duration) || 0),
    releaseDate: t.releasedate,
    shareUrl: t.shareurl,
  };
}

function pickRawTrackCover(track) {
  if (!track) return null;
  return track.album_image || track.image || null;
}

function mapPlaylist(p, cover = null) {
  return {
    id: p.id,
    title: p.name,
    user: p.user_name,
    cover: cover || p.image || null,
    createdAt: p.creationdate,
    shareUrl: p.shareurl,
  };
}

async function fetchPlaylistCoverUrl(playlistId) {
  try {
    const data = await jamendoGet("/playlists/tracks", {
      id: playlistId,
      imagesize: 500,
    });
    return pickRawTrackCover(data.results?.[0]?.tracks?.[0]);
  } catch {
    return null;
  }
}

async function enrichPlaylistsWithCovers(playlists) {
  if (!playlists.length) return playlists;

  return Promise.all(
    playlists.map(async (playlist) => {
      if (playlist.cover) return playlist;
      const cover = await fetchPlaylistCoverUrl(playlist.id);
      return cover ? { ...playlist, cover } : playlist;
    })
  );
}

export async function fetchJamendoTracks({
  order = "popularity_month",
  tags,
  limit = 20,
  offset = 0,
  search,
} = {}) {
  const data = await jamendoGet("/tracks", {
    order,
    limit,
    offset,
    imagesize: 500,
    ...(tags ? { tags } : {}),
    ...(search ? { namesearch: search } : {}),
  });
  return (data.results || []).map(mapTrack);
}

export async function searchJamendoTracks(query) {
  if (!query || !query.trim()) return [];
  return fetchJamendoTracks({ search: query, limit: 20 });
}

export async function fetchJamendoPlaylists({
  order = "creationdate_desc",
  limit = 12,
  offset = 0,
  namesearch,
} = {}) {
  const data = await jamendoGet("/playlists", {
    order,
    limit,
    offset,
    imagesize: 500,
    ...(namesearch ? { namesearch } : {}),
  });
  const playlists = (data.results || []).map((p) => mapPlaylist(p));
  return enrichPlaylistsWithCovers(playlists);
}

const MOOD_PLAYLIST_TAGS = [
  "chill",
  "happy",
  "relax",
  "focus",
  "energy",
  "lofi",
];

export async function fetchMoodPlaylists({ limit = 12 } = {}) {
  const perTag = Math.max(2, Math.ceil(limit / MOOD_PLAYLIST_TAGS.length));
  const settled = await Promise.allSettled(
    MOOD_PLAYLIST_TAGS.map((tag) =>
      fetchJamendoPlaylists({
        namesearch: tag,
        limit: perTag,
        order: "creationdate_desc",
      })
    )
  );

  const seen = new Set();
  const unique = [];
  for (const result of settled) {
    if (result.status !== "fulfilled") continue;
    for (const playlist of result.value) {
      if (seen.has(playlist.id)) continue;
      seen.add(playlist.id);
      unique.push(playlist);
    }
  }

  return unique.slice(0, limit);
}

export async function fetchPlaylistTracks(playlistId) {
  const data = await jamendoGet("/playlists/tracks", {
    id: playlistId,
    imagesize: 500,
  });
  const playlist = data.results?.[0];
  if (!playlist) return null;
  const tracks = (playlist.tracks || []).map(mapTrack);
  const cover = tracks[0]?.cover || pickRawTrackCover(playlist.tracks?.[0]);
  return {
    ...mapPlaylist(playlist, cover),
    tracks,
  };
}

export async function fetchGenreCover(tag) {
  const tracks = await fetchJamendoTracks({
    tags: tag,
    order: "popularity_month",
    limit: 1,
  });
  return tracks[0]?.cover || null;
}

export async function fetchJamendoCovers(limit = 60) {
  const queries = [
    { order: "popularity_total", limit: 20 },
    { order: "popularity_month", limit: 20 },
    { order: "popularity_month", tags: "pop", limit: 15 },
    { order: "popularity_month", tags: "rock", limit: 15 },
    { order: "popularity_month", tags: "electronic", limit: 15 },
    { order: "popularity_month", tags: "hiphop", limit: 10 },
    { order: "popularity_month", tags: "jazz", limit: 10 },
    { order: "releasedate_desc", limit: 15 },
  ];

  const results = await Promise.allSettled(
    queries.map((params) =>
      jamendoGet("/tracks", { ...params, imagesize: 300 })
    )
  );

  const tracks = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value?.results || []);

  const covers = tracks.map((t) => t.album_image || t.image).filter(Boolean);
  const unique = Array.from(new Set(covers));
  return unique.sort(() => Math.random() - 0.5).slice(0, limit);
}

export function clearJamendoCache() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(CACHE_PREFIX)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch (_) {
    
  }
}
