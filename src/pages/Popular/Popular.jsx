import { useNavigate } from "react-router-dom";
import { useState } from "react";
import musicData from "../../data/music.json";
import { HeartOutlined } from "@ant-design/icons";
import SongGridCircle from "../../components/SongGridCircle/SongGridCircle";
import SongsTable from "../../components/SongsTable/SongsTable";
import AlbumGrid from "../../components/AlbumGrid/AlbumGrid";
import usePopularState from "../../state/popularState";

export default function Popular({ setSelectedAlbum }) {
  const navigate = useNavigate();

  const openAlbums = (album) => {
    navigate(`/PageAlbums/${album.artist}`, { state: { from: "popular" } });
  };
  const {
    showPopularAll,
    setShowPopularAll,
    showPopularTableAll,
    setShowPopularTableAll,
    showPopularAlbumsAll,
    setShowPopularAlbumsAll,
  } = usePopularState();
  return (
    <div>
      {/* КРУГЛЫЕ ФОРМЫ, ОТОБРАЖЕНИЕ ПОПУЛЯРНЫХ АРТИСТОВ */}
      <SongGridCircle
        title="Popular"
        pinkTitle="Artists"
        items={musicData.PopularArtists}
        showAll={showPopularAll}
        setShowAll={setShowPopularAll}
      />

      {/* ТАБЛИЦА ПОПУЛЯРНЫХ ПЕСЕН */}
      <SongsTable
        title="Popular"
        pinkTitle="Songs"
        songs={musicData.PopularSongs}
        showAll={showPopularTableAll}
        setShowAll={setShowPopularTableAll}
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

      {/* АЛЬБОМЫ */}
      <AlbumGrid
        title="Popular"
        pinkTitle="Albums"
        albums={musicData.PopularAlbums}
        showAll={showPopularAlbumsAll}
        setShowAll={setShowPopularAlbumsAll}
        onClickAlbum={openAlbums}
        setSelectedAlbum={setSelectedAlbum}
      />
    </div>
  );
}
