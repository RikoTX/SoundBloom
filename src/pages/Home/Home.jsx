import { useNavigate } from "react-router-dom";
import musicData from "../../data/music.json";
import { HeartOutlined } from "@ant-design/icons";
import usePlayerControls from "../../hooks/usePlayerControls";
import HeroSection from "../../components/HomeContendImage/HomeContendImage";
import SongGrid from "../../components/SongGrid/SongGrid";
import SongsTable from "../../components/SongsTable/SongsTable";
import SongGridCircle from "../../components/SongGridCircle/SongGridCircle";
import MusicVideoGrid from "../../components/MusicVideoGrid/MusicVideoGrid";
import AlbumGrid from "../../components/AlbumGrid/AlbumGrid";
import PlaylistGrid from "../../components/PlaylistGrid/PlaylistGrid";
import SignInAndLogin from "../../components/SignInAndLogin/SignInAndLogin";
import useHomeState from "../../state/homeState";
export default function Home({
  setCurrentTrackIndex,
  setCurrentPlaylist,
  setSelectedAlbum,
}) {
  const { handlePlaySong } = usePlayerControls(
    setCurrentPlaylist,
    setCurrentTrackIndex
  );
  const navigate = useNavigate();

  const openAlbums = (album) => {
        navigate(`/PageAlbums/${album.artist}`, { state: { from: "home" } });
  };

  const {
    searchValue,
    setSearchValue,
    showPopularAll,
    setShowPopularAll,
    showTrendingAll,
    setShowTrendingAll,
    showAllVideos,
    setShowAllVideos,
    showAllAlbums,
    setShowAllAlbums,
    showAllPlaylist,
    setShowAllPlaylist,
    showWeeklyAll,
    setShowWeeklyAll,
    showNewReleaseAll,
    setShowNewReleaseAll,
  } = useHomeState();

  const handleSearch = () => {
    console.log(searchValue);
  };

  const allSongs = [
    ...(musicData.NewReleaseSongs || []),
    ...(musicData.WeeklyTopSongs || []),
  ];

  const filteredSongs = allSongs.filter((song) => {
    const query = searchValue.toLowerCase();
    return (
      song.title?.toLowerCase().includes(query) ||
      song.artist?.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      {/* ГЛАВНАЯ КАРТИНКА  */}
      <HeroSection
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        handleSearch={handleSearch}
        filteredSongs={filteredSongs}
        handlePlaySong={handlePlaySong}
      />

      {/* ОТОБРАЖЕНИЕ Weekly Top */}
      <SongGrid
        title="Weekly Top"
        pinkTitle="Songs"
        songs={musicData.WeeklyTopSongs}
        showAll={showWeeklyAll}
        setShowAll={setShowWeeklyAll}
        handlePlaySong={handlePlaySong}
      />

      {/* ОТОБРАЖЕНИЕ New Release */}
      <SongGrid
        title="New Release"
        pinkTitle="Songs"
        songs={musicData.NewReleaseSongs}
        showAll={showNewReleaseAll}
        setShowAll={setShowNewReleaseAll}
        handlePlaySong={handlePlaySong}
      />

      {/* ТАБЛИЦА ТРЕНДОВЫХ ПЕСЕН */}
      <div>
        <SongsTable
          title="Trending"
          pinkTitle="Songs"
          songs={musicData.TrendingSongs}
          showAll={showTrendingAll}
          setShowAll={setShowTrendingAll}
          columns={[
            {
              header: "Release Date",
              render: (song) => song.releaseDate,
              width: "120px",
            },
            {
              header: "Album",
              render: (song) => song.album,
              width: "200px",
            },
            {
              header: "Time",
              render: (song) => (
                <>
                  <HeartOutlined style={{ color: "#EE10B0", marginRight: 5 }} />
                  {song.time}
                </>
              ),
              width: "100px",
            },
          ]}
          onViewAllClick={() => console.log("View All нажалась")}
          onHeartClick={(song) => console.log("понравилось: ", song)}
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

        {/* АЛЬБОМЫ */}
        <AlbumGrid
          title="Top"
          pinkTitle="Albums"
          albums={musicData.PopularAlbums}
          showAll={showAllAlbums}
          setShowAll={setShowAllAlbums}
          onClickAlbum={openAlbums}
          setSelectedAlbum={setSelectedAlbum}
        />

        {/* ПЛЭЙЛИСТЫ */}
        <PlaylistGrid
          title="Mood"
          pinkTitle="Playlist"
          playlist={musicData.MoodPlaylist}
          showAll={showAllPlaylist}
          setShowAll={setShowAllPlaylist}
        />

        {/* РЕГЕСТРАЦИЯ И ВХОД В АККАУНТ */}
        <SignInAndLogin />
      </div>
    </div>
  );
}
