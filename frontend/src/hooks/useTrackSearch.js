import { useEffect, useState } from "react";
import { searchAllTracks } from "../utils/searchAllTracks";

export default function useTrackSearch(
  query,
  { limit = 32, platformLimit = 16, debounceMs = 400 } = {},
) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query?.trim();
    if (!trimmed) {
      setTracks([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timer = setTimeout(() => {
      searchAllTracks(trimmed, { limit, platformLimit })
        .then((list) => {
          if (!cancelled) setTracks(list || []);
        })
        .catch(() => {
          if (!cancelled) setTracks([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, limit, platformLimit, debounceMs]);

  return { tracks, loading };
}
