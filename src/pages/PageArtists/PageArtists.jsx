import { useState } from "react";
import SongGrid from "../../components/SongGrid/SongGrid";
import usePlayerControls from "../../hooks/usePlayerControls";
import ArtistBanner from "../../components/ArtistBanner/ArtistBanner";

import {
  HeartOutlined,
  ArrowLeftOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import SongsTable from "../../components/SongsTable/SongsTable";
import AlbumGridLess from "../../components/AlbumGridLess/AlbumGridLess";
import PlaylistGrid from "../../components/PlaylistGrid/PlaylistGrid";
import SongGridCircleBig from "../../components/SongGridCircleBig/SongGridCircleBig";
export default function PageArtists({
  selectedArtists,
  setSelectedAlbum,
  setCurrentPlaylist,
  setCurrentTrackIndex,
}) {
  const navigate = useNavigate();
  const [showPopularTableAll, setShowPopularTableAll] = useState(false);
  const [showAlbumsAll, setShowAlbumsAll] = useState(false);
  const [showPopularAll, setShowPopularAll] = useState(false);
  const [showNewReleaseAll, setShowNewReleaseAll] = useState(false);
  const [showAllPlaylist, setShowAllPlaylist] = useState(false);
  const { handlePlaySong } = usePlayerControls(
    setCurrentPlaylist,
    setCurrentTrackIndex
  );
  if (!selectedArtists) {
    return (
      <div style={{ color: "white", padding: "40px" }}>Artist not selected</div>
    );
  }
  const openAlbums = (album) => {
    setSelectedAlbum(album);
    navigate("/PageAlbums", { state: { album } });
  };
  const {
    backgroundImage,
    artist,
    tracks,
    albums,
    singles,
    playlist,
    fansAlsoListen,
  } = selectedArtists;

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
        <ArtistBanner backgroundImage={backgroundImage} artist={artist} />


        <SongsTable
          title="Popular"
          pinkTitle=""
          songs={tracks}
          showAll={showPopularTableAll}
          setShowAll={setShowPopularTableAll}
          columns={[
            {
              header: "Release Date",
              render: (song) => song.releaseDate,
              width: "180px",
            },
            {
              header: "Played",
              render: (song) => song.plays,
              width: "200px",
            },
            {
              header: "Time",
              render: (song) => (
                <>
                  <HeartOutlined style={{ color: "#EE10B0", marginRight: 5 }} />
                  {song.duration}
                </>
              ),
              width: "100px",
            },
          ]}
          onViewAllClick={() => console.log("View All нажалась")}
          onHeartClick={(song) => console.log("понравилось: ", song)}
        />
      </div>
      <div>
        <AlbumGridLess
          title="Artist’s "
          pinkTitle="Albums"
          albums={albums}
          showAll={showAlbumsAll}
          setShowAll={setShowAlbumsAll}
          onClickAlbum={openAlbums}
          setSelectedAlbum={setSelectedAlbum}
        />

        {/* ОТОБРАЖЕНИЕ Single Songs */}
        <SongGrid
          title="Single"
          pinkTitle="Songs"
          songs={singles}
          showAll={showNewReleaseAll}
          setShowAll={setShowNewReleaseAll}
          handlePlaySong={handlePlaySong}
        />

        {/* ПЛЭЙЛИСТЫ */}
        <PlaylistGrid
          title="Artist’s "
          pinkTitle="Playlist"
          playlist={playlist}
          showAll={showAllPlaylist}
          setShowAll={setShowAllPlaylist}
        />
        <SongGridCircleBig
          title="Eminem Fans"
          pinkTitle="Also Listen To"
          items={fansAlsoListen}
          showAll={showPopularAll}
          setShowAll={setShowPopularAll}
        />
      </div>
    </div>
  );
}
