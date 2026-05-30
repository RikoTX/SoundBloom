import { useEffect, useState } from "react";
import { fetchJamendoTracks } from "../api/JamendoMusicApi";

const cache = new Map();

function keyOf(opts) {
  return JSON.stringify(opts || {});
}

export default function useJamendoTracks(opts) {
  const cacheKey = keyOf(opts);
  const [tracks, setTracks] = useState(() => cache.get(cacheKey) || []);
  const [loading, setLoading] = useState(() => !cache.has(cacheKey));

  useEffect(() => {
    if (cache.has(cacheKey)) {
      setTracks(cache.get(cacheKey));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchJamendoTracks(opts)
      .then((list) => {
        if (cancelled) return;
        if (Array.isArray(list) && list.length > 0) {
          cache.set(cacheKey, list);
        }
        setTracks(list || []);
      })
      .catch((err) => {
        console.error("[useJamendoTracks] failed:", err);
        if (!cancelled) setTracks([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey]);

  return { tracks, loading };
}
