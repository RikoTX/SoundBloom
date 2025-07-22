import { useParams, useNavigate } from "react-router-dom";
import usePlayerControls from "../../hooks/usePlayerControls";
import ArtistBanner from "../../components/ArtistBanner/ArtistBanner";
import SongsTable from "../../components/SongsTable/SongsTable";
import AlbumGridLess from "../../components/AlbumGridLess/AlbumGridLess";
import PlaylistGrid from "../../components/PlaylistGrid/PlaylistGrid";
import SongGrid from "../../components/SongGrid/SongGrid";
import SongGridCircleBig from "../../components/SongGridCircleBig/SongGridCircleBig";
import { HeartOutlined } from "@ant-design/icons";
import musicData from "../../data/music.json";
import usePageArtistsState from "../../state/pageArtistsState";

export default function PageArtists({
  setSelectedAlbum,
  setCurrentPlaylist,
  setCurrentTrackIndex,
}) {
  const {
    showPopularTableAll,
    setShowPopularTableAll,
    showAlbumsAll,
    setShowAlbumsAll,
    showPopularAll,
    setShowPopularAll,
    showNewReleaseAll,
    setShowNewReleaseAll,
    showAllPlaylist,
    setShowAllPlaylist,
  } = usePageArtistsState();

  const { artist: artistName } = useParams();
  const navigate = useNavigate();

  const { handlePlaySong } = usePlayerControls(
    setCurrentPlaylist,
    setCurrentTrackIndex
  );

  const allArtists = [...musicData.LegendsArtists, ...musicData.PopularArtists];
  const artistData = allArtists.find(
    (a) =>
      a.artist.toLowerCase() === decodeURIComponent(artistName).toLowerCase()
  );

  if (!artistData) {
    return (
      <div style={{ color: "white", padding: "40px" }}>
        Artist not found: {artistName}
      </div>
    );
  }

  const {
    backgroundImage,
    artist,
    tracks,
    albums,
    singles,
    playlist,
    fansAlsoListen,
  } = artistData;

  const openAlbums = (album) => {
    setSelectedAlbum(album);
    navigate("/PageAlbums", { state: { album } });
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
        />
      </div>

      <AlbumGridLess
        title="Artist’s "
        pinkTitle="Albums"
        albums={albums}
        showAll={showAlbumsAll}
        setShowAll={setShowAlbumsAll}
        onClickAlbum={openAlbums}
        setSelectedAlbum={setSelectedAlbum}
      />

      <SongGrid
        title="Single"
        pinkTitle="Songs"
        songs={singles}
        showAll={showNewReleaseAll}
        setShowAll={setShowNewReleaseAll}
        handlePlaySong={handlePlaySong}
      />

      <PlaylistGrid
        title="Artist’s "
        pinkTitle="Playlist"
        playlist={playlist}
        showAll={showAllPlaylist}
        setShowAll={setShowAllPlaylist}
      />

      <SongGridCircleBig
        title={`${artist} Fans`}
        pinkTitle="Also Listen To"
        items={fansAlsoListen}
        showAll={showPopularAll}
        setShowAll={setShowPopularAll}
      />
    </div>
  );
}
