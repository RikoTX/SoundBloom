import { useParams, useNavigate, useLocation } from "react-router-dom";
import musicData from "../../data/music.json";
import AlbumHeader from "../../components/AlbumHeader/AlbumHeader";
import SongsTableAll from "../../components/SongsTableAll/SongsTableAll";
import { HeartOutlined } from "@ant-design/icons";

export default function PageAlbums() {
  const { artist } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "home";

  if (!artist) {
    return (
      <div style={{ color: "white", padding: "40px" }}>
        ❌ Artist not provided in URL
      </div>
    );
  }

  const allAlbums = [
    ...musicData.PopularAlbums,
  ];

  const selectedAlbum = allAlbums.find(
    (album) =>
      album.artist &&
      album.artist.toLowerCase().trim() === artist.toLowerCase().trim()
  );

  if (!selectedAlbum) {
    return (
      <div style={{ color: "white", padding: "40px" }}>
        Album not found: {artist}
      </div>
    );
  }

  const { infoAlbums, title, cover, tracks } = selectedAlbum;

  const getTotalDuration = (trackList) => {
    let totalSeconds = 0;
    trackList.forEach((track) => {
      const [min, sec] = track.duration.split(":").map(Number);
      totalSeconds += min * 60 + sec;
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`;
  };

  return (
    <div
      style={{
        margin: "40px",
        paddingBottom: "100px",
        borderRadius: "15px",
        background: "linear-gradient(to right, rgb(3, 98, 152), rgb(1, 37, 57))",
      }}
    >
      <div style={{ color: "white" }}>
        <AlbumHeader
          navigate={navigate}
          title={title}
          cover={cover}
          infoAlbums={infoAlbums}
          tracks={tracks}
          getTotalDuration={getTotalDuration}
          from={from}
        />
        <SongsTableAll
          songs={tracks}
          columns={[
            {
              header: "Release Date",
              render: (song) => song.releaseDate,
              width: "180px",
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
    </div>
  );
}
