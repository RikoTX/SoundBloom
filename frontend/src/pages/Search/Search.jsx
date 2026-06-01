import { useTranslation } from "react-i18next";
import useNavigateWithScroll from "../../hooks/useNavigateWithScroll";
import usePlayerControls from "../../hooks/usePlayerControls";
import PlaylistGrid from "../../components/PlaylistGrid/PlaylistGrid";
import SongGridCircle from "../../components/SongGridCircle/SongGridCircle";
import MusicVideoGrid from "../../components/MusicVideoGrid/MusicVideoGrid";
import MusicGenresGrid from "../../components/MusicGenresGrid/MusicGenresGrid";
import SongGrid from "../../components/SongGrid/SongGrid";
import AlbumGrid from "../../components/AlbumGrid/AlbumGrid";

import useArtistsList from "../../hooks/useArtistsList";
import useCuratedAlbums from "../../hooks/useCuratedAlbums";
import useJamendoTracks from "../../hooks/useJamendoTracks";
import useJamendoPlaylists from "../../hooks/useJamendoPlaylists";
import useGenreCovers from "../../hooks/useGenreCovers";
import useCatalogTracks from "../../hooks/useCatalogTracks";
import useSearchState from "../../state/searchState";
import { formatPlaylistForPlayer } from "../../utils/formatTrackForPlayer";
import { TRENDING_MUSIC_VIDEOS } from "../../constants/trendingMusicVideos";

const SEARCH_ARTIST_NAMES = [
  "Drake",
  "Taylor Swift",
  "Eminem",
  "The Weeknd",
  "Adele",
  "Billie Eilish",
];

const SEARCH_TOP_ALBUMS = [
  { artist: "Eminem", album: "The Eminem Show" },
  { artist: "Adele", album: "21" },
  { artist: "Taylor Swift", album: "1989" },
  { artist: "The Weeknd", album: "After Hours" },
  { artist: "Drake", album: "Scorpion" },
  { artist: "Billie Eilish", album: "Happier Than Ever" },
];

const SEARCH_GENRE_TAGS = [
  { tag: "pop", labelKey: "home.genre.pop" },
  { tag: "rock", labelKey: "home.genre.rock" },
  { tag: "electronic", labelKey: "home.genre.electronic" },
  { tag: "hiphop", labelKey: "home.genre.hiphop" },
  { tag: "jazz", labelKey: "home.genre.jazz" },
  { tag: "lounge", labelKey: "home.genre.chill" },
];

export default function Search({ setCurrentTrackIndex, setCurrentPlaylist }) {
  const { t } = useTranslation();
  const navigateWithScroll = useNavigateWithScroll();
  const { handlePlaySong } = usePlayerControls(
    setCurrentPlaylist,
    setCurrentTrackIndex
  );

  const { showPopularAll, setShowPopularAll } = useSearchState();

  const searchGenres = SEARCH_GENRE_TAGS.map((g) => ({
    ...g,
    label: t(g.labelKey),
  }));

  const { artists, loading: artistsLoading } =
    useArtistsList(SEARCH_ARTIST_NAMES);
  const { albums, loading: albumsLoading } =
    useCuratedAlbums(SEARCH_TOP_ALBUMS);
  const { tracks: newRelease, loading: newReleaseLoading } = useJamendoTracks({
    order: "releasedate_desc",
    limit: 12,
  });
  const { tracks: platformTracks, loading: platformLoading } = useCatalogTracks({
    order: "recent",
    limit: 10,
  });
  const { playlists, loading: playlistsLoading } = useJamendoPlaylists({
    order: "creationdate_desc",
    limit: 10,
  });
  const { items: genres, loading: genresLoading } =
    useGenreCovers(searchGenres);

  const openArtist = (artist) => {
    const name = artist.name || artist.artist;
    if (!name) return;
    navigateWithScroll(`/PageArtists/${encodeURIComponent(name)}`, {
      state: { from: "search" },
    });
  };

  const openAlbums = (album) => {
    if (!album?.id) return;
    navigateWithScroll(`/PageAlbums/${album.id}`, { state: { from: "search" } });
  };

  const openPlaylist = (pl) => {
    if (!pl?.id) return;
    navigateWithScroll(`/PagePlaylist/${pl.id}`, { state: { from: "search" } });
  };

  const openGenre = (genre) => {
    if (!genre?.tag) return;
    navigateWithScroll(`/PageGenre/${genre.tag}`, {
      state: { label: genre.label, from: "search" },
    });
  };

  const playFromList = (list, index) => {
    handlePlaySong(formatPlaylistForPlayer(list), index);
  };

  return (
    <div>
      <section id="music-genres">
        <MusicGenresGrid
          title={t("home.section.musicGenres.main")}
          pinkTitle={t("home.section.musicGenres.accent")}
          genres={genres}
          loading={genresLoading}
          onClickGenre={openGenre}
        />
      </section>

      <section id="mood-playlists">
        <PlaylistGrid
          title={t("home.section.moodPlaylist.main")}
          pinkTitle={t("home.section.moodPlaylist.accent")}
          playlist={playlists}
          loading={playlistsLoading}
          onClickPlaylist={openPlaylist}
        />
      </section>

      <section id="popular-artists">
        <SongGridCircle
          title={t("home.section.popularArtists.main")}
          pinkTitle={t("home.section.popularArtists.accent")}
          items={artists}
          showAll={showPopularAll}
          setShowAll={setShowPopularAll}
          loading={artistsLoading}
          onClickItem={openArtist}
        />
      </section>

      <section id="music-videos">
        <MusicVideoGrid
          title={t("home.section.musicVideo.main")}
          pinkTitle={t("home.section.musicVideo.accent")}
          videos={TRENDING_MUSIC_VIDEOS}
        />
      </section>

      {(platformLoading || platformTracks.length > 0) && (
        <section id="platform-tracks-search" aria-busy={platformLoading}>
          <SongGrid
            title={t("home.section.platformTracks.main")}
            pinkTitle={t("home.section.platformTracks.accent")}
            songs={platformTracks}
            loading={platformLoading}
            skeletonCount={10}
            handlePlaySong={(_, idx) => playFromList(platformTracks, idx)}
          />
        </section>
      )}

      <section id="new-release-songs">
        <SongGrid
          title={t("home.section.newRelease.main")}
          pinkTitle={t("home.section.newRelease.accent")}
          songs={newRelease}
          loading={newReleaseLoading}
          handlePlaySong={(_, idx) => playFromList(newRelease, idx)}
        />
      </section>

      <section id="top-albums">
        <AlbumGrid
          title={t("home.section.topAlbums.main")}
          pinkTitle={t("home.section.topAlbums.accent")}
          albums={albums}
          loading={albumsLoading}
          onClickAlbum={openAlbums}
        />
      </section>
    </div>
  );
}
