import { useState } from "react";
import musicData from "../../data/music.json";
import usePlayerControls from "../../hooks/usePlayerControls";
import RectangleGrid from "../../components/RectangleGrid/RectangleGrid";
import SearchBarWithHeader from "../../components/SearchBarWithHeader/SearchBarWithHeader";
import PlaylistGrid from "../../components/PlaylistGrid/PlaylistGrid";
import SongGridCircle from "../../components/SongGridCircle/SongGridCircle";
import MusicVideoGrid from "../../components/MusicVideoGrid/MusicVideoGrid";
import SongGrid from "../../components/SongGrid/SongGrid";
import AlbumGrid from "../../components/AlbumGrid/AlbumGrid"

export default function Search({ setCurrentTrackIndex, setCurrentPlaylist }) {
  const { handlePlaySong } = usePlayerControls(
    setCurrentPlaylist,
    setCurrentTrackIndex
  );
  const [showAllPlaylist, setShowAllPlaylist] = useState(false);
  const [showPopularAll, setShowPopularAll] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [showAllAlbums, setShowAllAlbums] = useState(false);
  const [showNewReleaseAll, setShowNewReleaseAll] = useState(false);
  const [showAllRectangle, setShowAllRectangle] = useState(false);

  const allSongs = [
    ...(musicData.NewReleaseSongs || []),
    ...(musicData.WeeklyTopSongs || []),
  ];

  return (
    <div>
      {/* ХЭЙДЕР КОМПАНЕНТЫ */}
      <SearchBarWithHeader
        allSongs={allSongs}
        handlePlaySong={handlePlaySong}
      />

      {/* ПРЯМОУГОЛЬНЫЕ КАРТЫ */}
      <RectangleGrid
        title="Top"
        pinkTitle="Albums"
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
