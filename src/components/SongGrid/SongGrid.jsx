import React from "react";
import { Row, Col } from "antd";
import ViewAllCircleButton from "../../components/ViewAllCircleButton/ViewAllCircleButton";

const SongGrid = ({
  title,
  songs,
  showAll,
  setShowAll,
  handlePlaySong,
  pinkTitle,
}) => {
  const songsToShow = showAll ? songs : songs.slice(0, 5);

  return (
    <div>
      <p
        style={{
          fontWeight: 600,
          fontSize: 35,
          marginLeft: "4%",
          marginBottom: 30,
        }}
      >
        {title} <span style={{ color: "#cb0094" }}>{pinkTitle}</span>
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "30px",
        }}
      >
        <div style={{ width: "95%" }}>
          <Row gutter={[40, 40]}>
            {songsToShow.map((song, index) => (
              <Col key={index} xl={4}>
                <div
                  onClick={() => handlePlaySong(songs, index)}
                  style={{
                    textAlign: "center",
                    backgroundColor: "#1F1F1F",
                    padding: 15,
                    borderRadius: "12px",
                    cursor: "pointer",
                    height: "90%",
                    width: "100%",
                  }}
                >
                  <img
                    src={song.cover}
                    alt={song.title}
                    style={{
                      width: "100%",
                      maxWidth: "150px",
                      height: "150px",
                      borderRadius: "10px",
                      marginBottom: "10px",
                    }}
                  />
                  <p style={{ margin: "5px 0", fontWeight: 600 }}>
                    {song.title}
                  </p>
                  <p style={{ margin: 0, color: "#929292", fontSize: "12px" }}>
                    {song.artist}
                  </p>
                </div>
              </Col>
            ))}

            {!showAll && songs.length > 3 && (
              <Col xl={4}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <ViewAllCircleButton onToggle={() => setShowAll(true)} />
                </div>
              </Col>
            )}
          </Row>
        </div>
      </div>
    </div>
  );
};

export default SongGrid;
