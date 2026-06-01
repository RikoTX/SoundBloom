import { searchJamendoTracks } from "../api/JamendoMusicApi";
import { searchCatalogTracks } from "../api/catalogApi";

/** For text search: SoundBloom matches first, then Jamendo. */
export function mergeTracksPlatformFirst(platformTracks, otherTracks, maxTotal = 24) {
  const seen = new Set();
  const merged = [];

  for (const track of platformTracks) {
    const key = `${track.source || "soundbloom"}:${track.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(track);
    if (merged.length >= maxTotal) return merged;
  }

  for (const track of otherTracks) {
    const key = `${track.source || "jamendo"}:${track.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(track);
    if (merged.length >= maxTotal) return merged;
  }

  return merged;
}

/** Mix platform tracks into a Jamendo list (e.g. genre page), not all at the start. */
export function interleaveTracks(platformTracks, otherTracks, maxTotal = 40) {
  const seen = new Set();
  const platform = [];
  const other = [];

  for (const track of platformTracks) {
    const key = `${track.source || "soundbloom"}:${track.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    platform.push(track);
  }

  for (const track of otherTracks) {
    const key = `${track.source || "jamendo"}:${track.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    other.push(track);
  }

  if (!platform.length) return other.slice(0, maxTotal);
  if (!other.length) return platform.slice(0, maxTotal);

  const result = [];
  const gap = Math.max(1, Math.ceil(other.length / (platform.length + 1)));
  let pi = 0;
  let oi = 0;

  while (result.length < maxTotal && (oi < other.length || pi < platform.length)) {
    let added = 0;
    while (added < gap && oi < other.length && result.length < maxTotal) {
      result.push(other[oi++]);
      added += 1;
    }
    if (pi < platform.length && result.length < maxTotal) {
      result.push(platform[pi++]);
    }
  }

  while (oi < other.length && result.length < maxTotal) {
    result.push(other[oi++]);
  }
  while (pi < platform.length && result.length < maxTotal) {
    result.push(platform[pi++]);
  }

  return result;
}

export async function searchAllTracks(query, { limit = 20, platformLimit = 10 } = {}) {
  const trimmed = query?.trim();
  if (!trimmed) return [];

  const [platform, jamendo] = await Promise.all([
    searchCatalogTracks(trimmed, platformLimit).catch(() => []),
    searchJamendoTracks(trimmed).catch(() => []),
  ]);

  return mergeTracksPlatformFirst(platform, jamendo, limit);
}
