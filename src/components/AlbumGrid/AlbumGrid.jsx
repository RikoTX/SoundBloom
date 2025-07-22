import React from "react";
import { Row, Col } from "antd";
import ViewAllCircleButton from "../../components/ViewAllCircleButton/ViewAllCircleButton";

const AlbumGrid = ({
  title,
  pinkTitle,
  albums = [],
  showAll,
  setShowAll,
  onClickAlbum,
}) => {
  const sortedAlbums =
    albums.length > 0 && albums[0].plays !== undefined
      ? [...albums].sort((a, b) => b.plays - a.plays)
      : albums;

  const albumsToShow = showAll ? sortedAlbums : sortedAlbums.slice(0, 5);

  return (
    <div style={{ padding: "0 40px" }}>
      <p style={{ fontWeight: 600, fontSize: 35 }}>
        {title} <span style={{ color: "#cb0094" }}>{pinkTitle}</span>
      </p>

      <Row gutter={[55, 30]}>
        {albumsToShow.map((album, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6} xl={4}>
            <div
              onClick={() => onClickAlbum?.(album)}
              style={{
                textAlign: "center",
                backgroundColor: "#1F1F1F",
                padding: 15,
                borderRadius: "10px",
                cursor: "pointer",
                maxWidth: "100%",
                width:'100%'
              }}
            >
              <img
                src={album.cover}
                alt={album.title}
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "10px",
                }}
              />
              <p style={{ margin: "5px 0", fontWeight: 600 }}>{album.title}</p>
              <p style={{ margin: 0, color: "#929292", fontSize: "12px" }}>
                {album.artist}
              </p>
            </div>
          </Col>
        ))}

        {!showAll && albums.length > 2 && (
          <Col
            flex="auto"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ViewAllCircleButton onToggle={() => setShowAll(true)} />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default AlbumGrid;
