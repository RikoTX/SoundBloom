import { useEffect, useState } from "react";
import { fetchGenreCover } from "../api/JamendoMusicApi";

const cache = new Map();

function keyOf(genres) {
  return Array.isArray(genres) ? genres.map((g) => g.tag).join("|") : "";
}

export default function useGenreCovers(genres) {
  const cacheKey = keyOf(genres);
  const [items, setItems] = useState(() => cache.get(cacheKey) || genres || []);
  const [loading, setLoading] = useState(() => !cache.has(cacheKey));

  useEffect(() => {
    if (cache.has(cacheKey)) {
      setItems(cache.get(cacheKey));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const enriched = [];
      for (const g of genres || []) {
        try {
          const cover = await fetchGenreCover(g.tag);
          enriched.push({ ...g, cover });
        } catch {
          enriched.push({ ...g, cover: null });
        }
      }
      if (!cancelled) {
        if (enriched.length > 0) cache.set(cacheKey, enriched);
        setItems(enriched);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cacheKey]);

  return { items, loading };
}
