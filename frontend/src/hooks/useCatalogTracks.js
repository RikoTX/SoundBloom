import { useEffect, useState } from "react";
import { fetchCatalogFeatured } from "../api/catalogApi";

const cache = new Map();

function cacheKey(opts) {
  return JSON.stringify(opts || {});
}

export default function useCatalogTracks({ order = "recent", limit = 14, tag } = {}) {
  const key = cacheKey({ order, limit, tag });
  const cached = cache.get(key);
  const [tracks, setTracks] = useState(() => cached || []);
  const [loading, setLoading] = useState(() => !cache.has(key));

  useEffect(() => {
    if (cache.has(key)) {
      setTracks(cache.get(key) || []);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setTracks([]);
    setLoading(true);

    fetchCatalogFeatured({ order, limit, tag })
      .then((list) => {
        if (cancelled) return;
        const value = list || [];
        if (value.length > 0) cache.set(key, value);
        setTracks(value);
      })
      .catch((err) => {
        console.error("[useCatalogTracks]", err);
        if (!cancelled) setTracks([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [key, order, limit, tag]);

  return { tracks, loading };
}
