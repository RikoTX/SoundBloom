import musicData from "../../data/music.json";
import usePlayerControls from "../../hooks/usePlayerControls";
import RectangleGrid from "../../components/RectangleGrid/RectangleGrid";
import SearchBarWithHeader from "../../components/SearchBarWithHeader/SearchBarWithHeader";
import PlaylistGrid from "../../components/PlaylistGrid/PlaylistGrid";
import SongGridCircle from "../../components/SongGridCircle/SongGridCircle";
import MusicVideoGrid from "../../components/MusicVideoGrid/MusicVideoGrid";
import SongGrid from "../../components/SongGrid/SongGrid";
import AlbumGrid from "../../components/AlbumGrid/AlbumGrid";
import useSearchState from "../../state/searchState";

export default function Search({ setCurrentTrackIndex, setCurrentPlaylist }) {
  const { handlePlaySong } = usePlayerControls(
    setCurrentPlaylist,
    setCurrentTrackIndex
  );
  const allSongs = [
    ...(musicData.NewReleaseSongs || []),
    ...(musicData.WeeklyTopSongs || []),
  ];
  const {
    showAllPlaylist,
    setShowAllPlaylist,
    showPopularAll,
    setShowPopularAll,
    showAllVideos,
    setShowAllVideos,
    showAllAlbums,
    setShowAllAlbums,
    showNewReleaseAll,
    setShowNewReleaseAll,
    showAllRectangle,
    setShowAllRectangle,
  } = useSearchState();

  return (
    <div>
      {/* ХЭЙДЕР КОМПАНЕНТЫ */}
      <SearchBarWithHeader
        allSongs={allSongs}
        handlePlaySong={handlePlaySong}
      />

      {/* ПРЯМОУГОЛЬНЫЕ КАРТЫ */}
      <RectangleGrid
        title="Music"
        pinkTitle="Genres"
        rectangle={musicData.MusicGenres}
        showAll={showAllRectangle}
        setShowAll={setShowAllRectangle}
      />

      {/* ПЛЭЙЛИСТЫ */}
      <PlaylistGrid
        title="Mood"
        pinkTitle="Playlist"
        playlist={musicData.MoodPlaylist}
        showAll={showAllPlaylist}
        setShowAll={setShowAllPlaylist}
      />

      {/* КРУГЛЫЕ ФОРМЫ, ОТОБРАЖЕНИЕ ПОПУЛЯРНЫХ АРТИСТОВ */}
      <SongGridCircle
        title="Popular"
        pinkTitle="Artists"
        items={musicData.PopularArtists}
        showAll={showPopularAll}
        setShowAll={setShowPopularAll}
      />

      {/* ВИДЕО МУЗЫКА  */}
      <MusicVideoGrid
        title="Music"
        pinkTitle="Video"
        videos={musicData.MusicVideo}
        showAll={showAllVideos}
        setShowAll={setShowAllVideos}
      />

      {/* ОТОБРАЖЕНИЕ Weekly Top */}
      <SongGrid
        title="New Release"
        pinkTitle="Songs"
        songs={musicData.NewReleaseSongs}
        showAll={showNewReleaseAll}
        setShowAll={setShowNewReleaseAll}
        handlePlaySong={handlePlaySong}
      />

      {/* АЛЬБОМЫ */}
      <AlbumGrid
        title="Top"
        pinkTitle="Albums"
        albums={musicData.TopAlbums}
        showAll={showAllAlbums}
        setShowAll={setShowAllAlbums}
      />
    </div>
  );
}
