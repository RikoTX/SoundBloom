import React from "react";
import { Row, Col } from "antd";
import ViewAllCircleButton from "../../components/ViewAllCircleButton/ViewAllCircleButton";

const PlaylistGrid = ({
  title,
  pinkTitle,
  playlist = [],
  showAll,
  setShowAll,
}) => {
  const playlistToShow = showAll ? playlist : playlist.slice(0, 5);

  return (
    <div>
      <p style={{ fontWeight: 600, fontSize: 35, marginLeft: "4%" }}>
        {title} <span style={{ color: "#cb0094" }}>{pinkTitle}</span>
      </p>

      <div style={{ padding: "0 40px" }}>
        <Row align="align" gutter={[20, 20]}>
          {playlistToShow.map((playlist, index) => (
            <Col key={index} xs={12} sm={8} md={6} lg={4} >
              <div
                style={{
                  textAlign: "center",
                  backgroundColor: "#1F1F1F",
                  borderRadius: "10px",
                }}
              >
                <img
                  src={import.meta.env.BASE_URL+playlist.cover}
                  alt={playlist.titlePlaylist}
                  style={{
                    width: "100%",
                    height: "160px",
                    borderRadius: "10px",
                    objectFit: "cover",
                  }}
                />
                <p
                  style={{
                    margin: "5px 0",
                    fontWeight: 600,
                    textAlign: "left",
                    padding: "3px 8px",
                  }}
                >
                  {playlist.titlePlaylist}
                </p>
              </div>
            </Col>
          ))}

          {!showAll && playlist.length > 4 && (
            <Col style={{ display: "flex", justifyContent: "center", paddingLeft:'40px' }}>
              <ViewAllCircleButton onToggle={() => setShowAll(true)} />
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
};

export default PlaylistGrid;
