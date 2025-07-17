import {
  HeartOutlined,
  ArrowLeftOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AlbumHeader from "../../components/AlbumHeader/AlbumHeader";
import SongsTableAll from "../../components/SongsTableAll/SongsTableAll";

export default function PageAlbums({ selectedAlbum }) {
  const navigate = useNavigate();
  if (!selectedAlbum) {
    return (
      <div style={{ color: "white", padding: "40px" }}>Album not selected</div>
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

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  };


  return (
    <div
      style={{
        margin: "40px",
        paddingBottom: "100px",
        borderRadius: "15px",
        background: "linear-gradient(to right,rgb(3, 98, 152),rgb(1, 37, 57))",
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
