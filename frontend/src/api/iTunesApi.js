

const BASE_URL = "https://itunes.apple.com";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_PREFIX = "itunes:v1:";
const MAX_CONCURRENT = 1;
const REQUEST_GAP_MS = 800;
const MAX_RETRIES = 3;

const FAILURE_THRESHOLD = 4;
const COOLDOWN_MS = 60 * 1000;

let __jsonpCounter = 0;
const inflight = new Map();

const queue = [];
let activeCount = 0;
let lastStartedAt = 0;

let consecutiveFailures = 0;
let cooldownUntil = 0;

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
  } catch (_) {

  }
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

function rawJsonp(url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const cbName = `__itunes_cb_${Date.now()}_${++__jsonpCounter}`;
    const script = document.createElement("script");
    let timeoutId;

    const cleanup = () => {
      clearTimeout(timeoutId);
      try {
        delete window[cbName];
      } catch (_) {
        window[cbName] = undefined;
      }
      if (script.parentNode) script.parentNode.removeChild(script);
    };

    window[cbName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error(`JSONP failed: ${url}`));
    };

    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`JSONP timeout: ${url}`));
    }, timeoutMs);

    const sep = url.includes("?") ? "&" : "?";
    script.src = `${url}${sep}callback=${cbName}`;
    document.head.appendChild(script);
  });
}

async function jsonp(url) {
  const cached = readCache(url);
  if (cached) return cached;

  if (inflight.has(url)) return inflight.get(url);

  if (Date.now() < cooldownUntil) {
    throw new Error("iTunes API cooldown active");
  }

  const promise = (async () => {
    let lastErr;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (Date.now() < cooldownUntil) {
        throw new Error("iTunes API cooldown active");
      }
      try {
        const data = await schedule(() => rawJsonp(url));
        consecutiveFailures = 0;
        writeCache(url, data);
        return data;
      } catch (err) {
        lastErr = err;
        consecutiveFailures++;
        if (consecutiveFailures >= FAILURE_THRESHOLD) {
          cooldownUntil = Date.now() + COOLDOWN_MS;
          console.warn(
            `[iTunes] Too many failures, pausing requests for ${COOLDOWN_MS / 1000}s`
          );
          throw err;
        }
        const backoff = 1000 * Math.pow(2, attempt) + Math.random() * 500;
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

function hdArtwork(url, size = 600) {
  if (!url) return null;
  return url.replace(/\/\d+x\d+(bb)?\./, `/${size}x${size}$1.`);
}

function formatTime(ms) {
  if (!ms) return "0:00";
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export async function searchArtist(name) {
  const data = await jsonp(
    `${BASE_URL}/search?term=${encodeURIComponent(
      name
    )}&entity=musicArtist&limit=1`
  );
  return data.results?.[0] || null;
}

export async function getArtistTopTracks(artistId, limit = 15) {
  const data = await jsonp(
    `${BASE_URL}/lookup?id=${artistId}&entity=song&limit=${limit + 1}`
  );
  return (data.results || []).filter(
    (r) => r.wrapperType === "track" && r.kind === "song"
  );
}

export async function getArtistAlbums(artistId, limit = 20) {
  const data = await jsonp(
    `${BASE_URL}/lookup?id=${artistId}&entity=album&limit=${limit + 1}`
  );
  return (data.results || []).filter(
    (r) => r.wrapperType === "collection" && r.collectionType === "Album"
  );
}

export async function searchAlbum(artistName, albumName) {
  const data = await jsonp(
    `${BASE_URL}/search?term=${encodeURIComponent(
      `${artistName} ${albumName}`
    )}&entity=album&limit=1`
  );
  return data.results?.[0] || null;
}

export async function getAlbumById(collectionId) {
  const data = await jsonp(
    `${BASE_URL}/lookup?id=${collectionId}&entity=song&limit=200`
  );
  const results = data.results || [];
  const album = results.find((r) => r.wrapperType === "collection");
  if (!album) return null;
  const tracks = results
    .filter((r) => r.wrapperType === "track" && r.kind === "song")
    .sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0));
  return mapFullAlbum(album, tracks);
}

function mapTrack(t) {
  return {
    id: t.trackId,
    title: t.trackName,
    artist: t.artistName,
    album: t.collectionName,
    cover: hdArtwork(t.artworkUrl100, 400),
    music: t.previewUrl,
    audio: t.previewUrl,
    duration: Math.round((t.trackTimeMillis || 0) / 1000),
    time: formatTime(t.trackTimeMillis),
    releaseDate: t.releaseDate ? t.releaseDate.slice(0, 10) : "",
    plays: undefined,
  };
}

function mapAlbum(a) {
  return {
    id: a.collectionId,
    title: a.collectionName,
    artist: a.artistName,
    cover: hdArtwork(a.artworkUrl100, 600),
    releaseDate: a.releaseDate ? a.releaseDate.slice(0, 10) : "",
    trackCount: a.trackCount,
  };
}

function mapFullAlbum(album, tracks) {
  return {
    id: album.collectionId,
    title: album.collectionName,
    artist: album.artistName,
    artistId: album.artistId,
    cover: hdArtwork(album.artworkUrl100, 600),
    coverHd: hdArtwork(album.artworkUrl100, 1000),
    releaseDate: album.releaseDate ? album.releaseDate.slice(0, 10) : "",
    releaseDateLong: album.releaseDate
      ? new Date(album.releaseDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "",
    genre: album.primaryGenreName,
    trackCount: album.trackCount,
    shareUrl: album.collectionViewUrl,
    tracks: tracks.map((t, idx) => ({
      ...mapTrack(t),
      trackNumber: t.trackNumber || idx + 1,
    })),
  };
}

export async function getFullArtistData(name) {
  const artist = await searchArtist(name);
  if (!artist) return null;

  const [tracks, albums] = await Promise.all([
    getArtistTopTracks(artist.artistId, 15),
    getArtistAlbums(artist.artistId, 12),
  ]);

  const mappedTracks = tracks.map(mapTrack);
  const mappedAlbums = albums.map(mapAlbum);

  const heroImage =
    hdArtwork(tracks[0]?.artworkUrl100, 1000) ||
    hdArtwork(albums[0]?.artworkUrl100, 1000) ||
    null;

  return {
    id: artist.artistId,
    name: artist.artistName,
    artist: artist.artistName,
    genre: artist.primaryGenreName,
    image: heroImage,
    cover: heroImage,
    tracks: mappedTracks,
    albums: mappedAlbums,
  };
}

export async function getArtistsList(names) {
  const out = [];
  for (const name of names) {
    try {
      const a = await searchArtist(name);
      if (!a) continue;
      const tracks = await getArtistTopTracks(a.artistId, 1);
      out.push({
        id: a.artistId,
        name: a.artistName,
        artist: a.artistName,
        genre: a.primaryGenreName,
        cover: hdArtwork(tracks[0]?.artworkUrl100, 500),
      });
    } catch (_) {

    }
  }
  return out;
}

export async function getCuratedAlbums(list) {
  const out = [];
  for (const { artist, album } of list) {
    try {
      const a = await searchAlbum(artist, album);
      if (!a) continue;
      out.push({
        id: a.collectionId,
        title: a.collectionName,
        artist: a.artistName,
        cover: hdArtwork(a.artworkUrl100, 500),
        releaseDate: a.releaseDate ? a.releaseDate.slice(0, 10) : "",
        trackCount: a.trackCount,
      });
    } catch (_) {

    }
  }
  return out;
}

export function clearItunesCache() {
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
