import { ArrowLeftOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { Row, Col } from "antd";

export default function AlbumHeader({
  navigate,
  title,
  cover,
  infoAlbums,
  tracks,
  getTotalDuration,
  from,
}) {
  return (
    <div
      style={{
        borderRadius: "15px",
        background: "linear-gradient(to right,#0E9EEF,rgb(4, 58, 87))",
        padding: "20px",
      }}
    >
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: "30px" }}
      >
        <Col>
          <button
            onClick={() => navigate(from === "popular" ? "/Popular" : "/Home")}
            style={{
              cursor: "pointer",
              width: "80px",
              height: "80px",
              fontSize: 40,
              backgroundColor: "transparent",
              border: "none",
              color: "white",
            }}
          >
            <ArrowLeftOutlined />
          </button>
        </Col>

        <Col>
          <Row gutter={[16, 0]} justify="end">
            <Col>
              <a style={{ color: "white", fontWeight: 700, fontSize: 20 }}>
                Share
              </a>
            </Col>
            <Col>
              <a style={{ color: "white", fontWeight: 700, fontSize: 20 }}>
                About
              </a>
            </Col>
            <Col>
              <a style={{ color: "white", fontWeight: 700, fontSize: 20 }}>
                Premium
              </a>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row gutter={[32, 32]} align="middle">
        <Col xs={24} md={6}>
          <img
            src={cover}
            alt={title}
            style={{
              width: "100%",
              maxWidth: "250px",
              borderRadius: "10px",
            }}
          />
        </Col>

        <Col xs={24} md={12}>
          <h1 style={{ fontSize: 35, color: "white" }}>{title}</h1>
          <p style={{ fontSize: 17, fontWeight: 600, color: "white" }}>
            {infoAlbums}
          </p>
          <p
            style={{
              color: "#fff",
              marginBottom: "10px",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {tracks.length} songs&nbsp;&nbsp;
            <span style={{ color: "red" }}>●</span>&nbsp;&nbsp;
            {getTotalDuration(tracks)}
          </p>
        </Col>

        <Col xs={24} md={6}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
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
        </Col>
      </Row>
    </div>
  );
}
