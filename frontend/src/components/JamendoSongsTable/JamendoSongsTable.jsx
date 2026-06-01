import { HeartOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import SongsTable from "../SongsTable/SongsTable";
import SectionHeading from "../SectionHeading";
import useJamendoTracks from "../../hooks/useJamendoTracks";

export const JAMENDO_SONGS_FETCH_OPTS = {
  order: "popularity_month",
  limit: 12,
};

export default function JamendoSongsTable({
  title,
  pinkTitle,
  showAll,
  setShowAll,
  onPlaySong,
  fetchOpts = JAMENDO_SONGS_FETCH_OPTS,
}) {
  const { t } = useTranslation();
  const { tracks, loading } = useJamendoTracks(fetchOpts);

  const columns = [
    {
      header: t("common.releaseDate"),
      render: (song) => song.releaseDate || "—",
      width: "120px",
    },
    {
      header: t("common.album"),
      render: (song) => song.album || "—",
      width: "200px",
    },
    {
      header: t("common.time"),
      render: (song) => (
        <>
          <HeartOutlined style={{ color: "#EE10B0", marginRight: 5 }} />
          {song.time}
        </>
      ),
      width: "100px",
    },
  ];

  if (loading && tracks.length === 0) {
    return (
      <div className="px-[5%] pt-9">
        <SectionHeading title={title} pinkTitle={pinkTitle} />
        <div className="mt-8 py-10 text-center text-sb-fg-muted">
          {t("common.loadingTracks")}
        </div>
      </div>
    );
  }

  return (
    <SongsTable
      title={title}
      pinkTitle={pinkTitle}
      songs={tracks}
      showAll={showAll}
      setShowAll={setShowAll}
      onPlaySong={onPlaySong}
      columns={columns}
    />
  );
}
