import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AlbumHeader from "../../components/AlbumHeader/AlbumHeader";
import SongsTableAll from "../../components/SongsTableAll/SongsTableAll";
import usePlayerControls from "../../hooks/usePlayerControls";
import { useReturnNavigation } from "../../hooks/useNavigateWithScroll";
import { fetchPlaylistTracks } from "../../api/JamendoMusicApi";
import { extractAlbumGradient } from "../../utils/extractAlbumColor";
import { formatTotalDurationFromTracks } from "../../utils/formatTotalDuration";
import { formatPlaylistForPlayer } from "../../utils/formatTrackForPlayer";
import SaveButton from "../../components/SaveButton/SaveButton";
import LikeButton from "../../components/LikeButton/LikeButton";

const FALLBACK_GRADIENT = {
  base: "rgb(30, 30, 38)",
  gradient: "linear-gradient(135deg, #1a1a22 0%, #0a0a0f 100%)",
  soft: "linear-gradient(180deg, #1a1a22 0%, #0a0a0f 100%)",
};

export default function PagePlaylist({
  setCurrentPlaylist,
  setCurrentTrackIndex,
}) {
  const { t } = useTranslation();
  const { id } = useParams();
  const { goBack } = useReturnNavigation("home");
  const { handlePlaySong, stopPlayback } = usePlayerControls(
    setCurrentPlaylist,
    setCurrentTrackIndex
  );

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [palette, setPalette] = useState(FALLBACK_GRADIENT);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setPlaylist(null);
    setPalette(FALLBACK_GRADIENT);

    fetchPlaylistTracks(id)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setNotFound(true);
        } else {
          setPlaylist(data);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!playlist?.cover) return;
    let cancelled = false;
    extractAlbumGradient(playlist.cover).then((p) => {
      if (!cancelled && p) setPalette(p);
    });
    return () => {
      cancelled = true;
    };
  }, [playlist?.cover]);

  const totalDuration = formatTotalDurationFromTracks(playlist?.tracks);

  const playFromList = (list, index) => {
    handlePlaySong(formatPlaylistForPlayer(list, "jamendo"), index);
  };

  if (loading) {
    return (
      <div
        style={{
          margin: "40px",
          padding: "100px 40px",
          borderRadius: "15px",
          background: FALLBACK_GRADIENT.gradient,
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
          <p style={{ fontSize: 18, opacity: 0.7 }}>{t("common.loadingPlaylist")}</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (notFound || !playlist) {
    return (
      <div
        style={{
          margin: "40px",
          padding: "80px 40px",
          borderRadius: "15px",
          background: FALLBACK_GRADIENT.gradient,
          color: "white",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 32, marginBottom: 12 }}>{t("errors.playlistNotFound")}</h2>
        <button
          onClick={() => goBack()}
          style={{
            padding: "12px 28px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: "#EE10B0",
            color: "white",
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {t("common.goHome")}
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        margin: "40px",
        paddingBottom: "100px",
        borderRadius: "15px",
        background: palette.gradient,
        transition: "background 0.6s ease",
      }}
    >
      <div style={{ color: "white" }}>
        <AlbumHeader
          onBack={goBack}
          title={playlist.title}
          cover={playlist.cover}
          artist={playlist.user ? t("player.curatedBy", { user: playlist.user }) : ""}
          infoAlbums={t("player.jamendoPlaylist")}
          tracksCount={playlist.tracks.length}
          totalDuration={totalDuration}
          shareUrl={playlist.shareUrl}
          headerBg={palette.soft}
          onPlayAll={() => playFromList(playlist.tracks, 0)}
          onStopAll={stopPlayback}
          extraActions={
            <SaveButton type="playlist" item={playlist} label={t("library.save.playlist")} />
          }
        />
        <SongsTableAll
          songs={playlist.tracks}
          onPlaySong={(idx) => playFromList(playlist.tracks, idx)}
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
