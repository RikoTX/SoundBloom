import { useEffect, useState } from "react";
import { getArtistsList } from "../api/iTunesApi";

const cache = new Map();

function keyOf(names) {
  return Array.isArray(names) ? names.join("|") : String(names);
}

export default function useArtistsList(names) {
  const cacheKey = keyOf(names);
  const [artists, setArtists] = useState(() => cache.get(cacheKey) || []);
  const [loading, setLoading] = useState(() => !cache.has(cacheKey));

  useEffect(() => {
    if (cache.has(cacheKey)) {
      setArtists(cache.get(cacheKey));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getArtistsList(names)
      .then((list) => {
        if (cancelled) return;
        if (Array.isArray(list) && list.length > 0) {
          cache.set(cacheKey, list);
        }
        setArtists(list || []);
      })
      .catch((err) => {
        console.error("[useArtistsList] failed:", err);
        if (!cancelled) setArtists([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey]);

  return { artists, loading };
}
