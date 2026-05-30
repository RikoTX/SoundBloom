import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { HeartOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import usePlayerControls from "../../hooks/usePlayerControls";
import useNavigateWithScroll, {
  useReturnNavigation,
} from "../../hooks/useNavigateWithScroll";
import ArtistBanner from "../../components/ArtistBanner/ArtistBanner";
import SongsTable from "../../components/SongsTable/SongsTable";
import AlbumGrid from "../../components/AlbumGrid/AlbumGrid";
import SongGrid from "../../components/SongGrid/SongGrid";
import SongGridCircleBig from "../../components/SongGridCircleBig/SongGridCircleBig";
import usePageArtistsState from "../../state/pageArtistsState";
import { getFullArtistData, getArtistsList } from "../../api/iTunesApi";

const FANS_ARTISTS = [
  "Drake",
  "Kendrick Lamar",
  "50 Cent",
  "JAY-Z",
  "Kanye West",
  "Post Malone",
  "Travis Scott",
  "J. Cole",
];

export default function PageArtists({
  setSelectedAlbum,
  setCurrentPlaylist,
  setCurrentTrackIndex,
}) {
  const { t } = useTranslation();
  const {
    showPopularTableAll,
    setShowPopularTableAll,
    showPopularAll,
    setShowPopularAll,
    showNewReleaseAll,
    setShowNewReleaseAll,
    showAllAlbums,
    setShowAllAlbums,
  } = usePageArtistsState();

  const { artist: artistName } = useParams();
  const navigateWithScroll = useNavigateWithScroll();
  const { goBack } = useReturnNavigation("artist");

  const { handlePlaySong } = usePlayerControls(
    setCurrentPlaylist,
    setCurrentTrackIndex
  );

  const [artistData, setArtistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fans, setFans] = useState([]);

  const decodedName = useMemo(
    () => decodeURIComponent(artistName || ""),
    [artistName]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setArtistData(null);

    getFullArtistData(decodedName)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setNotFound(true);
        } else {
          setArtistData(data);
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
  }, [decodedName]);

  useEffect(() => {
    let cancelled = false;
    const fansPool = FANS_ARTISTS.filter(
      (n) => n.toLowerCase() !== decodedName.toLowerCase()
    ).slice(0, 6);
    getArtistsList(fansPool).then((list) => {
      if (!cancelled) setFans(list);
    });
    return () => {
      cancelled = true;
    };
  }, [decodedName]);

  if (loading) {
    return (
      <div
        style={{
          margin: "40px",
          padding: "100px 40px",
          borderRadius: "15px",
          background: "#0C0B0B",
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
          <p style={{ fontSize: 18, opacity: 0.7 }}>
            {t("common.loadingNamed", { name: decodedName })}
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (notFound || !artistData) {
    return (
      <div
        style={{
          margin: "40px",
          padding: "80px 40px",
          borderRadius: "15px",
          background: "#0C0B0B",
          color: "white",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 32, marginBottom: 12 }}>{t("errors.artistNotFound")}</h2>
        <p style={{ opacity: 0.6, marginBottom: 24 }}>
          {t("errors.artistNotFoundHint", { name: decodedName })}
        </p>
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
          {t("errors.backToArtists")}
        </button>
      </div>
    );
  }

  const { name, image, tracks, albums } = artistData;

  const popularTracks = tracks.slice(0, 10);
  const singles = tracks.slice(0, 12);

  const playFromList = (list, index) => {
    const formatted = list.map((t) => ({
      music: t.audio || t.music,
      title: t.title,
      artist: t.artist,
      cover: t.cover,
    }));
    handlePlaySong(formatted, index);
  };

  const openAlbums = (album) => {
    if (!album?.id) return;
    setSelectedAlbum?.(album);
    navigateWithScroll(`/PageAlbums/${album.id}`, { state: { from: "artist" } });
  };

  return (
    <div
      style={{
        margin: "40px",
        paddingBottom: "100px",
        borderRadius: "15px",
        background: "#0C0B0B",
      }}
    >
      <div style={{ color: "white" }}>
        <ArtistBanner backgroundImage={image} artist={name} onBack={goBack} />

        <SongsTable
          title={t("artists.popular")}
          pinkTitle=""
          songs={popularTracks}
          showAll={showPopularTableAll}
          setShowAll={setShowPopularTableAll}
          columns={[
            {
              header: t("common.releaseDate"),
              render: (song) => song.releaseDate || "—",
              width: "180px",
            },
            {
              header: t("common.album"),
              render: (song) => song.album,
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
          ]}
        />
      </div>

      {albums.length > 0 && (
        <AlbumGrid
          title={t("artists.albums.main")}
          pinkTitle={t("artists.albums.accent")}
          albums={albums}
          showAll={showAllAlbums}
          setShowAll={setShowAllAlbums}
          onClickAlbum={openAlbums}
        />
      )}

      {singles.length > 0 && (
        <SongGrid
          title={t("artists.topTracks.main")}
          pinkTitle={t("artists.topTracks.accent")}
          songs={singles}
          showAll={showNewReleaseAll}
          setShowAll={setShowNewReleaseAll}
          handlePlaySong={(_, idx) => playFromList(singles, idx)}
        />
      )}

      {fans.length > 0 && (
        <SongGridCircleBig
          title={t("artists.fans.main", { name })}
          pinkTitle={t("artists.fans.accent")}
          items={fans}
          showAll={showPopularAll}
          setShowAll={setShowPopularAll}
        />
      )}
    </div>
  );
}
