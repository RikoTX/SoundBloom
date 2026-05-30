import { useEffect, useState } from "react";
import {
  fetchJamendoPlaylists,
  fetchMoodPlaylists,
} from "../api/JamendoMusicApi";

const cache = new Map();

function keyOf(opts) {
  return `covers-v1:${JSON.stringify(opts || {})}`;
}

export default function useJamendoPlaylists(opts) {
  const cacheKey = keyOf(opts);
  const [playlists, setPlaylists] = useState(() => cache.get(cacheKey) || []);
  const [loading, setLoading] = useState(() => !cache.has(cacheKey));

  useEffect(() => {
    if (cache.has(cacheKey)) {
      setPlaylists(cache.get(cacheKey));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const load = opts?.mood
      ? () => fetchMoodPlaylists({ limit: opts.limit ?? 12 })
      : () => fetchJamendoPlaylists(opts);

    load()
      .then((list) => {
        if (cancelled) return;
        if (Array.isArray(list) && list.length > 0) {
          cache.set(cacheKey, list);
        }
        setPlaylists(list || []);
      })
      .catch((err) => {
        console.error("[useJamendoPlaylists] failed:", err);
        if (!cancelled) setPlaylists([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey]);

  return { playlists, loading };
}
