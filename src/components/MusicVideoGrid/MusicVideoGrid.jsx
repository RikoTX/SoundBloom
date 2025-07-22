import React from "react";
import { Row, Col } from "antd";
import ViewAllCircleButton from "../../components/ViewAllCircleButton/ViewAllCircleButton";
import ViewAllButtonRectangle from "../ViewAllButtonRectangle/ViewAllButtonRectangle";

const MusicVideoGrid = ({
  title,
  pinkTitle,
  videos = [],
  showAll,
  setShowAll,
}) => {
  const videosToShow = showAll ? videos : videos.slice(0, 3);

  return (
    <div>
      <p style={{ fontWeight: 600, fontSize: 35, marginLeft: "4%" }}>
        {title} <span style={{ color: "#cb0094" }}>{pinkTitle}</span>
      </p>

      <div style={{ padding: "0 40px" }}>
        <Row gutter={[60, 60]} justify="center">
          {videosToShow.map((song, index) => (
            <Col key={index} span={8}>
              <div
                style={{
                  width: "100%",
                  backgroundColor: "#1F1F1F",
                  borderRadius: "10px",
                  padding: "10px",
                  boxSizing: "border-box",
                }}
              >
                <iframe
                  style={{ borderRadius: "7px" }}
                  width="100%"
                  height="175"
                  src={song.src}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>

                <p
                  style={{
                    margin: "5px 0",
                    fontWeight: 600,
                    fontSize: "18px",
                    textAlign: "left",
                  }}
                >
                  {song.title}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    fontWeight: 300,
                  }}
                >
                  <p>{song.artist}</p>
                  <p>{song.views}</p>
                </div>
              </div>
            </Col>
          ))}
        </Row>

       <div style={{marginTop:'30px'}}>
         {!showAll && videos.length > 3 && (
          <Col>
            <ViewAllButtonRectangle onToggle={() => setShowAll(true)} />
          </Col>
        )}
       </div>
      </div>
    </div>
  );
};

export default MusicVideoGrid;
