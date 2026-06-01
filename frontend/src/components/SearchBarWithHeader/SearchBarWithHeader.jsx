import React, { useState, useEffect } from "react";
import {
  SearchOutlined,
  LoadingOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { searchAllTracks } from "../../utils/searchAllTracks";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";
import "./SearchBarWithHeader.css";

const SearchInput = ({ handlePlaySong }) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = searchValue.trim();
    if (!query) {
      setTracks([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timer = setTimeout(() => {
      searchAllTracks(query, { limit: 24, platformLimit: 12 })
        .then((list) => {
          if (!cancelled) setTracks(list || []);
        })
        .catch(() => {
          if (!cancelled) setTracks([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchValue]);

  const onPlay = (list, index) => {
    const formatted = list.map((track) => ({
      music: track.audio || track.music,
      title: track.title,
      artist: track.artist,
      cover: track.cover,
    }));
    handlePlaySong(formatted, index);
    setSearchValue("");
  };

  return (
    <div className="relative w-[600px] max-w-[60vw]">
      <div className="flex overflow-hidden rounded-lg border border-sb-border-strong bg-sb-muted">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={t("nav.searchPlaceholder")}
          className="flex-1 border-none bg-transparent px-4 py-2.5 text-sm text-sb-fg outline-none placeholder:text-sb-fg-subtle"
        />
        <button
          type="button"
          className="border-none bg-transparent px-4 text-sb-fg-subtle"
          aria-hidden
        >
          <SearchOutlined />
        </button>
      </div>

      {searchValue && (
        <div className="custom-scroll absolute left-0 top-[50px] z-[9999] max-h-[400px] w-full overflow-y-auto rounded-lg border border-sb-border-strong bg-sb-muted shadow-[0_8px_24px_var(--sb-shadow)]">
          {loading ? (
            <div className="py-5 text-center">
              <LoadingOutlined style={{ fontSize: 24, color: "#cb0094" }} />
            </div>
          ) : tracks.length === 0 ? (
            <div className="px-5 py-5 text-center text-sb-fg-subtle">
              {t("common.noResults")}
            </div>
          ) : (
            tracks.map((track, idx) => (
              <div
                key={track.id ?? `t-${idx}`}
                onClick={() => onPlay(tracks, idx)}
                className="search-item-hover flex cursor-pointer items-center gap-2.5 border-b border-sb-border-strong p-2.5"
              >
                <img
                  src={resolveMediaUrl(track.cover)}
                  alt={track.title}
                  className="h-11 w-11 shrink-0 rounded object-cover"
                />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="truncate font-medium text-sb-fg">
                    {track.title}
                  </div>
                  <div className="text-xs text-sb-fg-muted">
                    {track.artist}
                    {track.source === "soundbloom" && (
                      <span className="ml-2 rounded border border-[#0E9EEF55] px-1.5 py-px text-[10px] text-[#0E9EEF]">
                        SoundBloom
                      </span>
                    )}
                  </div>
                </div>
                <div className="mr-2.5 text-xs text-sb-fg-subtle">
                  {track.time}
                </div>
                <PlayCircleOutlined
                  style={{ color: "#cb0094", fontSize: 20 }}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
