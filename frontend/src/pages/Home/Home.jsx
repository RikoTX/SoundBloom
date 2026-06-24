import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useNavigateWithScroll from "../../hooks/useNavigateWithScroll";

import usePlayerControls from "../../hooks/usePlayerControls";
import HeroSection from "../../components/HomeContendImage/HomeContendImage";
import SongGrid from "../../components/SongGrid/SongGrid";
import JamendoSongsTable from "../../components/JamendoSongsTable/JamendoSongsTable";
import SongGridCircle from "../../components/SongGridCircle/SongGridCircle";
import MusicVideoGrid from "../../components/MusicVideoGrid/MusicVideoGrid";
import MusicGenresGrid from "../../components/MusicGenresGrid/MusicGenresGrid";
import { TRENDING_MUSIC_VIDEOS } from "../../constants/trendingMusicVideos";
import AlbumGrid from "../../components/AlbumGrid/AlbumGrid";
import PlaylistGrid from "../../components/PlaylistGrid/PlaylistGrid";
import SignInAndLogin from "../../components/SignInAndLogin/SignInAndLogin";

import { getToken } from "../../utils/getToken";
import useArtistsList from "../../hooks/useArtistsList";
import useCuratedAlbums from "../../hooks/useCuratedAlbums";
import useJamendoTracks from "../../hooks/useJamendoTracks";
import useJamendoPlaylists from "../../hooks/useJamendoPlaylists";
import useGenreCovers from "../../hooks/useGenreCovers";
import useCatalogTracks from "../../hooks/useCatalogTracks";
import { formatPlaylistForPlayer } from "../../utils/formatTrackForPlayer";
const HOME_POPULAR_ARTIST_NAMES = [
  "Drake",
  "Taylor Swift",
  "Billie Eilish",
  "The Weeknd",
  "Eminem",
  "Adele",
  "Bruno Mars",
  "Beyoncé",
  "Ed Sheeran",
  "Rihanna",
  "Justin Bieber",
  "Post Malone",
];

const HOME_TOP_ALBUMS = [
  { artist: "The Weeknd", album: "After Hours" },
  { artist: "Adele", album: "30" },
  { artist: "Billie Eilish", album: "Happier Than Ever" },
  { artist: "Drake", album: "Certified Lover Boy" },
  { artist: "Taylor Swift", album: "Midnights" },
  { artist: "Eminem", album: "The Eminem Show" },
  { artist: "Bruno Mars", album: "24K Magic" },
  { artist: "Ed Sheeran", album: "Divide" },
  { artist: "Post Malone", album: "Hollywood's Bleeding" },
  { artist: "Kendrick Lamar", album: "DAMN." },
  { artist: "Dua Lipa", album: "Future Nostalgia" },
  { artist: "Harry Styles", album: "Harry's House" },
];

const MUSIC_GENRE_TAGS = [
  { tag: "pop", labelKey: "home.genre.pop" },
  { tag: "rock", labelKey: "home.genre.rock" },
  { tag: "electronic", labelKey: "home.genre.electronic" },
  { tag: "hiphop", labelKey: "home.genre.hiphop" },
  { tag: "jazz", labelKey: "home.genre.jazz" },
  { tag: "classical", labelKey: "home.genre.classical" },
  { tag: "lounge", labelKey: "home.genre.chill" },
  { tag: "soundtrack", labelKey: "home.genre.soundtrack" },
];

const TRACK_FETCH_OPTS = {
  weekly: { order: "popularity_week", limit: 14 },
  newRelease: { order: "releasedate_desc", limit: 14 },
  hits: { order: "popularity_month", tags: "pop", limit: 14 },
};
const PLAYLIST_OPTS = { mood: true, limit: 12 };

export default function Home({ setCurrentTrackIndex, setCurrentPlaylist }) {
  const { t } = useTranslation();
  const { handlePlaySong } = usePlayerControls(
    setCurrentPlaylist,
    setCurrentTrackIndex
  );
  const navigateWithScroll = useNavigateWithScroll();
  const { isAuth } = getToken();
  const loginRef = useRef(null);
  const [showTrendingAll, setShowTrendingAll] = useState(false);
  const [showPopularAll, setShowPopularAll] = useState(false);

  const musicGenres = MUSIC_GENRE_TAGS.map((g) => ({
    ...g,
    label: t(g.labelKey),
  }));

  const { artists: popularArtists, loading: popularArtistsLoading } =
    useArtistsList(HOME_POPULAR_ARTIST_NAMES);
  const { albums: topAlbums, loading: topAlbumsLoading } =
    useCuratedAlbums(HOME_TOP_ALBUMS);

  const { tracks: weeklyTop, loading: weeklyLoading } =
    useJamendoTracks(TRACK_FETCH_OPTS.weekly);
  const { tracks: newRelease, loading: newReleaseLoading } =
    useJamendoTracks(TRACK_FETCH_OPTS.newRelease);
  const { tracks: hitMusic, loading: hitMusicLoading } =
    useJamendoTracks(TRACK_FETCH_OPTS.hits);

  const { tracks: platformTracks, loading: platformLoading } = useCatalogTracks({
    order: "recent",
    limit: 12,
  });

  const { playlists, loading: playlistsLoading } =
    useJamendoPlaylists(PLAYLIST_OPTS);
  const { items: genres, loading: genresLoading } =
    useGenreCovers(musicGenres);

  const openAlbums = (album) => {
    if (!album?.id) return;
    navigateWithScroll(`/PageAlbums/${album.id}`, { state: { from: "home" } });
  };

  const openArtist = (artist) => {
    const artistName = artist.name || artist.artist;
    if (!artistName) return;
    navigateWithScroll(`/PageArtists/${encodeURIComponent(artistName)}`, {
      state: { from: "home" },
    });
  };

  const openPlaylist = (pl) => {
    if (!pl?.id) return;
    navigateWithScroll(`/PagePlaylist/${pl.id}`, { state: { from: "home" } });
  };

  const openGenre = (genre) => {
    if (!genre?.tag) return;
    navigateWithScroll(`/PageGenre/${genre.tag}`, {
      state: { label: genre.label, from: "home" },
    });
  };

  const playFromList = (list, index) => {
    handlePlaySong(formatPlaylistForPlayer(list), index);
  };

  return (
    <div>
      {!isAuth && <HeroSection />}

      {(platformLoading || platformTracks.length > 0) && (
        <section id="platform-tracks" aria-busy={platformLoading}>
          <SongGrid
            title={t("home.section.platformTracks.main")}
            pinkTitle={t("home.section.platformTracks.accent")}
            songs={platformTracks}
            handlePlaySong={(_, idx) => playFromList(platformTracks, idx)}
            loading={platformLoading}
            skeletonCount={12}
          />
        </section>
      )}

      <section id="weekly-top-songs">
        <SongGrid
          title={t("home.section.weeklyTop.main")}
          pinkTitle={t("home.section.weeklyTop.accent")}
          songs={weeklyTop}
          handlePlaySong={(_, idx) => playFromList(weeklyTop, idx)}
          loading={weeklyLoading}
        />
      </section>

      <section id="new-release-songs">
        <SongGrid
          title={t("home.section.newRelease.main")}
          pinkTitle={t("home.section.newRelease.accent")}
          songs={newRelease}
          handlePlaySong={(_, idx) => playFromList(newRelease, idx)}
          loading={newReleaseLoading}
        />
      </section>

      <section id="hit-music">
        <SongGrid
          title={t("home.section.hitMusic.main")}
          pinkTitle={t("home.section.hitMusic.accent")}
          songs={hitMusic}
          handlePlaySong={(_, idx) => playFromList(hitMusic, idx)}
          loading={hitMusicLoading}
        />
      </section>

      <section id="trending-songs">
        <JamendoSongsTable
          title={t("home.section.trending.main")}
          pinkTitle={t("home.section.trending.accent")}
          showAll={showTrendingAll}
          setShowAll={setShowTrendingAll}
          onPlaySong={(list, idx) => playFromList(list, idx)}
        />
      </section>

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

      <section id="music-videos">
        <MusicVideoGrid
          title={t("home.section.musicVideo.main")}
          pinkTitle={t("home.section.musicVideo.accent")}
          videos={TRENDING_MUSIC_VIDEOS}
        />
      </section>

      <section id="top-albums">
        <AlbumGrid
          title={t("home.section.topAlbums.main")}
          pinkTitle={t("home.section.topAlbums.accent")}
          albums={topAlbums}
          onClickAlbum={openAlbums}
          loading={topAlbumsLoading}
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

      <section id="music-genres">
        <MusicGenresGrid
          title={t("home.section.musicGenres.main")}
          pinkTitle={t("home.section.musicGenres.accent")}
          genres={genres}
          loading={genresLoading}
          onClickGenre={openGenre}
        />
      </section>

      {!isAuth && (
        <section id="sign-in" ref={loginRef}>
          <SignInAndLogin />
        </section>
      )}
    </div>
  );
}
