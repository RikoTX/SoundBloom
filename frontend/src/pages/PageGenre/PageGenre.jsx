import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AlbumHeader from "../../components/AlbumHeader/AlbumHeader";
import SongsTableAll from "../../components/SongsTableAll/SongsTableAll";
import usePlayerControls from "../../hooks/usePlayerControls";
import { useReturnNavigation } from "../../hooks/useNavigateWithScroll";
import { fetchJamendoTracks } from "../../api/JamendoMusicApi";
import { formatTotalDurationFromTracks } from "../../utils/formatTotalDuration";
import { formatPlaylistForPlayer } from "../../utils/formatTrackForPlayer";
import SaveButton from "../../components/SaveButton/SaveButton";
import LikeButton from "../../components/LikeButton/LikeButton";

const DARK_BG = "#0C0B0B";
const DARK_HEADER = "linear-gradient(180deg, #1F1F1F 0%, #141414 100%)";

export default function PageGenre({
  setCurrentPlaylist,
  setCurrentTrackIndex,
}) {
  const { t } = useTranslation();
  const { tag } = useParams();
  const location = useLocation();
  const label = location.state?.label || tag;
  const { goBack } = useReturnNavigation(location.state?.from || "home");

  const { handlePlaySong, stopPlayback } = usePlayerControls(
    setCurrentPlaylist,
    setCurrentTrackIndex
  );

  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchJamendoTracks({
      tags: tag,
      order: "popularity_month",
      limit: 30,
    })
      .then((data) => {
        if (!cancelled) setTracks(data || []);
      })
      .catch(() => {
        if (!cancelled) setTracks([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tag]);

  const totalDuration = formatTotalDurationFromTracks(tracks);

  const playFromList = (list, index) => {
    handlePlaySong(formatPlaylistForPlayer(list, "jamendo"), index);
  };

  if (loading && tracks.length === 0) {
    return (
      <div
        style={{
          margin: "40px",
          padding: "100px 40px",
          borderRadius: "15px",
          background: DARK_BG,
          color: "white",
          textAlign: "center",
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>
          <div
            style={{
              width: 60,
              height: 60,
              border: "3px solid rgba(238, 16, 176, 0.2)",
              borderTop: "3px solid #EE10B0",
              borderRadius: "50%",
              margin: "0 auto 20px",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ fontSize: 18, opacity: 0.7 }}>{t("common.loadingNamed", { name: label })}</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const cover = tracks[0]?.cover;

  return (
    <div
      style={{
        margin: "40px",
        paddingBottom: "100px",
        borderRadius: "15px",
        background: DARK_BG,
      }}
    >
      <div style={{ color: "white" }}>
        <AlbumHeader
          onBack={goBack}
          title={label}
          cover={cover}
          artist={t("common.genre")}
          infoAlbums={t("player.topGenreTracks", { label })}
          tracksCount={tracks.length}
          totalDuration={totalDuration}
          shareUrl={window.location.href}
          headerBg={DARK_HEADER}
          onPlayAll={() => playFromList(tracks, 0)}
          onStopAll={stopPlayback}
          extraActions={
            <SaveButton
              type="genre"
              item={{ tag, label, cover }}
              label={t("library.save.genre")}
            />
          }
        />
        <SongsTableAll
          songs={tracks}
          onPlaySong={(idx) => playFromList(tracks, idx)}
          columns={[
            {
              header: t("common.releaseDate"),
              render: (s) => s.releaseDate || "—",
              width: "180px",
            },
            {
              header: t("common.album"),
              render: (s) => s.album,
              width: "200px",
            },
            {
              header: t("common.time"),
              render: (s) => (
                <span className="inline-flex items-center gap-2">
                  <LikeButton track={{ ...s, source: "jamendo" }} size="sm" />
                  {s.time}
                </span>
              ),
              width: "120px",
            },
          ]}
        />
      </div>
    </div>
  );
}
