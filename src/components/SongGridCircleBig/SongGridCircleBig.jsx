import React from "react";
import { Row, Col } from "antd";
import ViewAllCircleButton from "../../components/ViewAllCircleButton/ViewAllCircleButton";

export default function SongGridCircleBig({
  title,
  pinkTitle,
  items = [],
  showAll,
  setShowAll,
}) {
  const itemsToShow = showAll ? items : items.slice(0, 4);

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

      <Row gutter={[32, 32]} justify="start" style={{ padding: "0 40px" }}>
        {itemsToShow.map((fan, index) => (
          <Col
            key={index}
            xs={24}
            sm={12}
            md={8}
            lg={5}
            style={{ textAlign: "center" }}
          >
            <div style={{ padding: 10, borderRadius: "10px" }}>
              <img
                src={import.meta.env.BASE_URL+fan.cover}
                alt={fan.artist}
                style={{
                  width: "220px",
                  height: "220px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <p
                style={{
                  margin: "10px 0 0",
                  fontWeight: 300,
                  fontSize: "18px",
                  color: "#000",
                }}
              >
                {fan.artist}
              </p>
            </div>
            
          </Col>
        ))}
        {!showAll && items.length > 2 && (
              <Col
                style={{ display:'flex', paddingLeft: '60px'}}
              >
                <ViewAllCircleButton onToggle={() => setShowAll(true)} />
              </Col>
            )}
      </Row>
    </div>
  );
}
