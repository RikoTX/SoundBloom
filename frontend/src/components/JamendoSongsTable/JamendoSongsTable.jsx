import { HeartOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import SongsTable from "../SongsTable/SongsTable";
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
      <div style={{ padding: "0 5%", marginTop: 35 }}>
        <p style={{ fontWeight: 600, fontSize: 35 }}>
          {title} <span style={{ color: "#cb0094" }}>{pinkTitle}</span>
        </p>
        <div
          style={{
            marginTop: 30,
            padding: 40,
            textAlign: "center",
            color: "#929292",
          }}
        >
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
