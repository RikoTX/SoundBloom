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
      <p style={{ fontWeight: 600, fontSize: 35, marginLeft: "4%" }}>
        {title} <span style={{ color: "#cb0094" }}>{pinkTitle}</span>
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ width: "85%" }}>
          <Row justify="space-around" align="align" gutter={[30, 20]}>
            {songsToShow.map((song, index) => (
              <Col key={index} span={4}>
                <div
                  onClick={() => handlePlaySong(songs, index)}
                  style={{
                    textAlign: "center",
                    backgroundColor: "#1F1F1F",
                    padding: 10,
                    borderRadius: "10px",
                    cursor: "pointer",
                    width: "100%",
                    margin: "0 auto",
                  }}
                >
                  <img
                    src={song.cover}
                    alt={song.title}
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "10px",
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
          </Row>
        </div>
        <div style={{paddingLeft:'30px'}}>
          {!showAll && songs.length > 3 && (
            <ViewAllCircleButton onToggle={() => setShowAll(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SongGrid;
