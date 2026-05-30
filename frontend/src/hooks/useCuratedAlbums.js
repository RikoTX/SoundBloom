import { useEffect, useState } from "react";
import { getCuratedAlbums } from "../api/iTunesApi";

const cache = new Map();

function keyOf(list) {
  return Array.isArray(list)
    ? list.map((x) => `${x.artist}::${x.album}`).join("|")
    : String(list);
}

export default function useCuratedAlbums(list) {
  const cacheKey = keyOf(list);
  const [albums, setAlbums] = useState(() => cache.get(cacheKey) || []);
  const [loading, setLoading] = useState(() => !cache.has(cacheKey));

  useEffect(() => {
    if (cache.has(cacheKey)) {
      setAlbums(cache.get(cacheKey));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getCuratedAlbums(list)
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          cache.set(cacheKey, data);
        }
        setAlbums(data || []);
      })
      .catch((err) => {
        console.error("[useCuratedAlbums] failed:", err);
        if (!cancelled) setAlbums([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey]);

  return { albums, loading };
}
