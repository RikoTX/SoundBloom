import React from "react";
import { Row, Col } from "antd";
import ViewAllCircleButton from "../../components/ViewAllCircleButton/ViewAllCircleButton";
import { motion } from "framer-motion";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";

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
            lg={6}
            xl={5}
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.05,
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "270px",
                  height: "270px",
                  aspectRatio: "1",
                  borderRadius: "50%",
                  overflow: "hidden",
                }}
              >
                <img
                  src={resolveMediaUrl(fan.cover)}
                  alt={fan.artist}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    color: "white",
                    textAlign: "center",
                    padding: "6px 0 12px",
                    fontSize: 18,
                    fontWeight: 500,
                    fontFamily: "cursive",
                  }}
                >
                  {fan.artist}
                </div>
              </div>
            </motion.div>
          </Col>
        ))}
        {!showAll && items.length > 2 && (
          <Col style={{ display: "flex", paddingLeft: "60px" }}>
            <ViewAllCircleButton onToggle={() => setShowAll(true)} />
          </Col>
        )}
      </Row>
    </div>
  );
}
