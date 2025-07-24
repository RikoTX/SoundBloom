import React from "react";
import { Row, Col } from "antd";
import ViewAllCircleButton from "../../components/ViewAllCircleButton/ViewAllCircleButton";
import ViewAllButtonRectangle from "../ViewAllButtonRectangle/ViewAllButtonRectangle";

const SongGridCircle = ({
  title,
  pinkTitle,
  items = [],
  showAll,
  setShowAll,
}) => {
  const itemsToShow = showAll ? items : items.slice(0, 6);

  return (
    <div>
      <p
        style={{
          fontWeight: 600,
          fontSize: 35,
          margin: "35px 10px 0px 4%",
          paddingBottom: "25px",
        }}
      >
        {title} <span style={{ color: "#cb0094" }}>{pinkTitle}</span>
      </p>

      <div style={{ paddingRight: "40px", paddingLeft: "40px" }}>
        <Row gutter={[20, 20]}>
          {itemsToShow.map((song, index) => (
            <Col key={index} lg={4} md={8} sm={12} xs={24}>
              <div
                style={{
                  textAlign: "center",
                  padding: 10,
                  borderRadius: "10px",
                  maxWidth: "160px",
                  margin: "0 auto",
                }}
              >
                <img
                  src={import.meta.env.BASE_URL+song.cover}
                  alt={song.artist}
                  style={{
                    width: "140px",
                    height: "140px",
                    borderRadius: "70px",
                    objectFit: "cover",
                  }}
                />
                <p
                  style={{
                    margin: "5px 0",
                    fontWeight: 300,
                    fontSize: "18px",
                  }}
                >
                  {song.artist}
                </p>
              </div>
            </Col>
          ))}
        </Row>

        {!showAll && items.length > 3 && (
          <ViewAllButtonRectangle onToggle={() => setShowAll(true)} />
        )}
      </div>
    </div>
  );
};

export default SongGridCircle;
