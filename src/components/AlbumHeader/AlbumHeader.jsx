import { ArrowLeftOutlined, PlayCircleOutlined } from "@ant-design/icons";

export default function AlbumHeader({
  navigate,
  title,
  cover,
  infoAlbums,
  tracks,
  getTotalDuration,
}) {
  return (
    <div
      style={{
        borderRadius: "15px",
        background: "linear-gradient(to right,#0E9EEF,rgb(4, 58, 87))",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={() => navigate("/Popular")}
          style={{
            cursor: "pointer",
            width: "100px",
            height: "100px",
            fontSize: 40,
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <ArrowLeftOutlined />
        </button>
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            maxWidth: "400px",
            width: "100%",
            alignItems: "center",
          }}
        >
          <a style={{ color: "white", fontWeight: 700, fontSize: 20 }}>Share</a>
          <a style={{ color: "white", fontWeight: 700, fontSize: 20 }}>About</a>
          <a style={{ color: "white", fontWeight: 700, fontSize: 20 }}>Premium</a>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "30px",
          marginLeft: "50px",
          paddingBottom: "30px",
        }}
      >
        <img
          src={cover}
          alt={title}
          style={{
            width: "250px",
            borderRadius: "10px",
            marginTop: "20px",
          }}
        />
        <div
          style={{ display: "flex", flexDirection: "column", gap: "10%" }}
        >
          <h1 style={{ fontSize: 35 }}>{title}</h1>
          <p style={{ fontSize: 17, fontWeight: 600 }}>{infoAlbums}</p>
          <p
            style={{
              color: "#fff",
              marginBottom: "10px",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {tracks.length} songs&nbsp;&nbsp;
            <span style={{ color: "red" }}>●</span> &nbsp;&nbsp;
            {getTotalDuration(tracks)}
          </p>
        </div>
        <div
          style={{
            width: "300px",
            height: "300px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#EE10B0",
              gap: "10px",
              cursor: "pointer",
            }}
          >
            <h1>Play All</h1>
            <button
              style={{
                padding: 1,
                fontSize: 60,
                backgroundColor: "transparent",
                border: "none",
                color: "#EE10B0",
                cursor: "pointer",
              }}
            >
              <PlayCircleOutlined />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
