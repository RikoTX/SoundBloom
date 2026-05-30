import { ArrowLeftOutlined } from "@ant-design/icons";

export default function ArtistBanner({ backgroundImage, artist, onBack }) {

  const bgUrl = backgroundImage?.startsWith("http")
    ? backgroundImage
    : `${import.meta.env.BASE_URL}${backgroundImage || ""}`;

  return (
    <div
      style={{
        borderRadius: "10px",
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(12,11,11,0.85) 100%), url(${bgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        height: "480px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: "10px",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "white",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={() => onBack?.()}
            style={{
              cursor: "pointer",
              width: "100px",
              height: "100px",
              fontSize: 40,
              backgroundColor: "transparent",
              border: "none",
              color: "white",
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
            <a style={{ color: "white", fontWeight: 700, fontSize: 20 }}>
              Share
            </a>
            <a style={{ color: "white", fontWeight: 700, fontSize: 20 }}>
              About
            </a>
            <a style={{ color: "white", fontWeight: 700, fontSize: 20 }}>
              Premium
            </a>
          </div>
        </div>

        <h1
          style={{
            fontSize: 100,
            margin: 0,
            marginLeft: "3%",
            marginBottom: "8%",
          }}
        >
          {artist}
        </h1>
      </div>
    </div>
  );
}
