import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LoadingOutlined,
  PlayCircleFilled,
  SearchOutlined,
} from "@ant-design/icons";
import SectionHeading from "../../components/SectionHeading";
import usePlayerControls from "../../hooks/usePlayerControls";
import useTrackSearch from "../../hooks/useTrackSearch";
import useNavigateWithScroll from "../../hooks/useNavigateWithScroll";
import { formatPlaylistForPlayer } from "../../utils/formatTrackForPlayer";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";

const QUICK_GENRES = [
  { tag: "pop", labelKey: "home.genre.pop" },
  { tag: "rock", labelKey: "home.genre.rock" },
  { tag: "electronic", labelKey: "home.genre.electronic" },
  { tag: "hiphop", labelKey: "home.genre.hiphop" },
  { tag: "jazz", labelKey: "home.genre.jazz" },
  { tag: "lounge", labelKey: "home.genre.chill" },
];

export default function Search({ setCurrentTrackIndex, setCurrentPlaylist }) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const [searchValue, setSearchValue] = useState(urlQuery);
  const { tracks, loading } = useTrackSearch(searchValue);
  const navigateWithScroll = useNavigateWithScroll();
  const { handlePlaySong } = usePlayerControls(
    setCurrentPlaylist,
    setCurrentTrackIndex,
  );

  const trimmed = searchValue.trim();

  useEffect(() => {
    setSearchValue(urlQuery);
  }, [urlQuery]);

  const handleSearchChange = (value) => {
    setSearchValue(value);
    const q = value.trim();
    setSearchParams(q ? { q } : {}, { replace: true });
  };

  const playTrack = (index) => {
    handlePlaySong(formatPlaylistForPlayer(tracks), index);
  };

  const openGenre = (tag, label) => {
    navigateWithScroll(`/PageGenre/${tag}`, {
      state: { label, from: "search" },
    });
  };

  return (
    <div className="px-[4%] pb-14 pt-6">
      <SectionHeading
        title={t("search.pageTitleMain")}
        pinkTitle={t("search.pageTitleAccent")}
      />

      <div className="mt-8 flex max-w-3xl items-stretch overflow-hidden rounded-xl border border-sb-border-strong bg-sb-muted shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
        <input
          type="search"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={t("nav.searchPlaceholder")}
          autoFocus
          className="min-w-0 flex-1 border-none bg-transparent px-5 py-4 text-base text-sb-fg outline-none placeholder:text-sb-fg-subtle"
        />
        <div className="flex items-center px-5 text-[#cb0094]">
          <SearchOutlined className="text-xl" />
        </div>
      </div>

      {!trimmed && (
        <div className="mt-8 max-w-3xl">
          <p className="text-sm leading-relaxed text-sb-fg-subtle">
            {t("search.emptyHint")}
          </p>
          <p className="mt-6 text-xs uppercase tracking-widest text-sb-fg-muted">
            {t("search.quickGenres")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_GENRES.map(({ tag, labelKey }) => {
              const label = t(labelKey);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => openGenre(tag, label)}
                  className="cursor-pointer rounded-full border border-[#cb009444] bg-sb-muted px-4 py-2 text-sm text-sb-fg transition hover:border-[#cb0094] hover:text-[#ee10b0]"
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {trimmed && loading && (
        <div className="mt-12 flex justify-center py-16">
          <LoadingOutlined style={{ fontSize: 36, color: "#cb0094" }} />
        </div>
      )}

      {trimmed && !loading && tracks.length === 0 && (
        <p className="mt-12 text-center text-sb-fg-subtle">{t("common.noResults")}</p>
      )}

      {trimmed && !loading && tracks.length > 0 && (
        <div className="mt-10">
          <p className="mb-4 text-sm text-sb-fg-muted">
            {t("search.resultsFor", { query: trimmed, count: tracks.length })}
          </p>
          <div className="space-y-2">
            {tracks.map((track, idx) => (
              <button
                key={`${track.source || "jamendo"}-${track.id ?? idx}`}
                type="button"
                onClick={() => playTrack(idx)}
                className="sb-table-row flex w-full cursor-pointer items-center gap-4 rounded-xl px-3 py-3 text-left transition hover:bg-sb-muted/80"
              >
                <img
                  src={resolveMediaUrl(track.cover)}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sb-fg">{track.title}</p>
                  <p className="truncate text-sm text-sb-fg-muted">
                    {track.artist}
                    {track.source === "soundbloom" && (
                      <span className="ml-2 rounded border border-[#0E9EEF55] px-1.5 py-px text-[10px] text-[#0E9EEF]">
                        SoundBloom
                      </span>
                    )}
                  </p>
                </div>
                {track.time && (
                  <span className="shrink-0 text-xs tabular-nums text-sb-fg-subtle">
                    {track.time}
                  </span>
                )}
                <PlayCircleFilled className="shrink-0 text-2xl text-[#cb0094]" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
