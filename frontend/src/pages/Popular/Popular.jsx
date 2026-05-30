import { useTranslation } from "react-i18next";
import useNavigateWithScroll from "../../hooks/useNavigateWithScroll";
import SongGridCircle from "../../components/SongGridCircle/SongGridCircle";
import JamendoSongsTable from "../../components/JamendoSongsTable/JamendoSongsTable";
import AlbumGrid from "../../components/AlbumGrid/AlbumGrid";
import usePopularState from "../../state/popularState";
import usePlayerControls from "../../hooks/usePlayerControls";
import useArtistsList from "../../hooks/useArtistsList";
import useCuratedAlbums from "../../hooks/useCuratedAlbums";

const POPULAR_ARTIST_NAMES = [
  "Drake",
  "Taylor Swift",
  "Eminem",
  "The Weeknd",
  "Adele",
  "Billie Eilish",
  "Ed Sheeran",
  "Bruno Mars",
  "Beyoncé",
  "Rihanna",
  "Coldplay",
  "Justin Bieber",
];

const POPULAR_ALBUMS = [
  { artist: "Eminem", album: "Music to Be Murdered By" },
  { artist: "The Weeknd", album: "Starboy" },
  { artist: "Drake", album: "Take Care" },
  { artist: "Adele", album: "25" },
  { artist: "Taylor Swift", album: "1989" },
  { artist: "Billie Eilish", album: "When We All Fall Asleep" },
  { artist: "Post Malone", album: "Beerbongs & Bentleys" },
  { artist: "Bruno Mars", album: "Unorthodox Jukebox" },
  { artist: "Coldplay", album: "A Head Full of Dreams" },
  { artist: "Imagine Dragons", album: "Evolve" },
  { artist: "Lady Gaga", album: "Chromatica" },
  { artist: "Ariana Grande", album: "Positions" },
];

export default function Popular({
  setSelectedAlbum,
  setCurrentPlaylist,
  setCurrentTrackIndex,
}) {
  const { t } = useTranslation();
  const navigateWithScroll = useNavigateWithScroll();
  const { handlePlaySong } = usePlayerControls(
    setCurrentPlaylist,
    setCurrentTrackIndex
  );

  const openAlbums = (album) => {
    if (!album?.id) return;
    navigateWithScroll(`/PageAlbums/${album.id}`, { state: { from: "popular" } });
  };

  const openArtist = (artist) => {
    const artistName = artist.name || artist.artist;
    if (!artistName) return;
    navigateWithScroll(`/PageArtists/${encodeURIComponent(artistName)}`, {
      state: { from: "popular" },
    });
  };

  const {
    showPopularAll,
    setShowPopularAll,
    showPopularAlbumsAll,
    setShowPopularAlbumsAll,
    showPopularMusicAll,
    setShowPopularMusicAll,
  } = usePopularState();

  const { artists: popularArtists, loading: popularArtistsLoading } =
    useArtistsList(POPULAR_ARTIST_NAMES);

  const { albums: popularAlbums, loading: popularAlbumsLoading } =
    useCuratedAlbums(POPULAR_ALBUMS);

  const playFromList = (list, index) => {
    const formatted = list.map((track) => ({
      music: track.audio || track.music,
      title: track.title,
      artist: track.artist,
      cover: track.cover,
    }));
    handlePlaySong(formatted, index);
  };

  return (
    <div>
      <section id="popular-artists">
        <SongGridCircle
          title={t("home.section.popularArtists.main")}
          pinkTitle={t("home.section.popularArtists.accent")}
          items={popularArtists}
          showAll={showPopularAll}
          setShowAll={setShowPopularAll}
          onClickItem={openArtist}
          loading={popularArtistsLoading}
          skeletonCount={6}
        />
      </section>

      <section id="popular-songs">
        <JamendoSongsTable
          title={t("home.section.popularSongs.main")}
          pinkTitle={t("home.section.popularSongs.accent")}
          showAll={showPopularMusicAll}
          setShowAll={setShowPopularMusicAll}
          onPlaySong={(list, idx) => playFromList(list, idx)}
        />
      </section>

      <section id="popular-albums">
        <AlbumGrid
          title={t("home.section.popularAlbums.main")}
          pinkTitle={t("home.section.popularAlbums.accent")}
          albums={popularAlbums}
          showAll={showPopularAlbumsAll}
          setShowAll={setShowPopularAlbumsAll}
          onClickAlbum={openAlbums}
          setSelectedAlbum={setSelectedAlbum}
          loading={popularAlbumsLoading}
        />
      </section>
    </div>
  );
}
