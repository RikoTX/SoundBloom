import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AlbumHeader from "../../components/AlbumHeader/AlbumHeader";
import SongsTableAll from "../../components/SongsTableAll/SongsTableAll";
import usePlayerControls from "../../hooks/usePlayerControls";
import { useReturnNavigation } from "../../hooks/useNavigateWithScroll";
import { getAlbumById } from "../../api/iTunesApi";
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

export default function PageAlbums({
  setCurrentPlaylist,
  setCurrentTrackIndex,
}) {
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const from = location.state?.from || "home";
  const { goBack } = useReturnNavigation(from);

  const { handlePlaySong, stopPlayback } = usePlayerControls(
    setCurrentPlaylist,
    setCurrentTrackIndex
  );

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [palette, setPalette] = useState(FALLBACK_GRADIENT);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setAlbum(null);
    setPalette(FALLBACK_GRADIENT);

    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    getAlbumById(id)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setNotFound(true);
        } else {
          setAlbum(data);
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
    if (!album?.cover) return;
    let cancelled = false;
    extractAlbumGradient(album.cover).then((p) => {
      if (!cancelled && p) setPalette(p);
    });
    return () => {
      cancelled = true;
    };
  }, [album?.cover]);

  const totalDuration = formatTotalDurationFromTracks(album?.tracks);

  const playAll = () => {
    if (!album?.tracks?.length) return;
    playFromList(album.tracks, 0);
  };

  const playFromList = (list, index) => {
    handlePlaySong(formatPlaylistForPlayer(list, "itunes"), index);
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
          <p style={{ fontSize: 18, opacity: 0.7 }}>{t("common.loadingAlbum")}</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (notFound || !album) {
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
        <h2 style={{ fontSize: 32, marginBottom: 12 }}>{t("errors.albumNotFound")}</h2>
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
          {t("common.goBack")}
        </button>
      </div>
    );
  }

  const infoLine = [album.genre, album.releaseDateLong].filter(Boolean).join(" · ");

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
          title={album.title}
          cover={album.cover}
          artist={album.artist}
          infoAlbums={infoLine}
          tracksCount={album.trackCount || album.tracks.length}
          totalDuration={totalDuration}
          shareUrl={album.shareUrl}
          releaseDateLong={album.releaseDateLong}
          genre={album.genre}
          headerBg={palette.soft}
          onPlayAll={playAll}
          onStopAll={stopPlayback}
          extraActions={<SaveButton type="album" item={album} label={t("library.save.album")} />}
        />
        <SongsTableAll
          songs={album.tracks}
          onPlaySong={(idx) => playFromList(album.tracks, idx)}
          hideCover
          columns={[
            {
              header: t("common.releaseDate"),
              render: (song) => song.releaseDate || album.releaseDate || "—",
              width: "180px",
            },
            {
              header: t("common.album"),
              render: () => album.title,
              width: "200px",
            },
            {
              header: t("common.time"),
              render: (song) => (
                <span className="inline-flex items-center gap-2">
                  <LikeButton
                    track={{ ...song, source: "itunes", album: album.title }}
                    size="sm"
                  />
                  {song.time}
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
