import React from "react";
import { Row, Col } from "antd";
import ViewAllButtonRectangle from "../ViewAllButtonRectangle/ViewAllButtonRectangle";
import { motion } from "framer-motion";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";
import SectionHeading from "../SectionHeading";

const INITIAL_VISIBLE = 6;

const SongGridCircle = ({
  title,
  pinkTitle,
  items = [],
  showAll,
  setShowAll,
  onClickItem,
  loading = false,
  skeletonCount = 6,
}) => {
  const itemsToShow = showAll ? items : items.slice(0, INITIAL_VISIBLE);
  const showSkeletons = loading && itemsToShow.length === 0;
  const canExpand = Boolean(setShowAll) && items.length > INITIAL_VISIBLE;

  return (
    <div>
      <SectionHeading
        title={title}
        pinkTitle={pinkTitle}
        className="ml-[4%] mb-6 pb-0"
      />

      <div style={{ paddingRight: "40px", paddingLeft: "40px" }}>
        <Row gutter={[20, 20]}>
          {showSkeletons
            ? Array.from({ length: skeletonCount }).map((_, index) => (
                <Col key={`skeleton-${index}`} lg={4} md={8} sm={12} xs={24}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: 10,
                      maxWidth: "160px",
                      margin: "0 auto",
                    }}
                  >
                    <div
                      style={{
                        width: 140,
                        height: 140,
                        borderRadius: "70px",
                        background:
                          "linear-gradient(110deg, #1a1a1a 30%, #2a2a2a 50%, #1a1a1a 70%)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 1.4s linear infinite",
                      }}
                    />
                    <div
                      style={{
                        marginTop: 12,
                        height: 16,
                        width: 90,
                        borderRadius: 4,
                        background: "#1a1a1a",
                        marginInline: "auto",
                      }}
                    />
                  </div>
                </Col>
              ))
            : itemsToShow.map((song, index) => {
                const name = song.artist || song.name;
                const clickable = typeof onClickItem === "function";
                return (
                  <Col key={song.id ?? index} lg={4} md={8} sm={12} xs={24}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                    >
                      <div
                        onClick={
                          clickable ? () => onClickItem(song) : undefined
                        }
                        style={{
                          textAlign: "center",
                          padding: 10,
                          borderRadius: "10px",
                          maxWidth: "160px",
                          margin: "0 auto",
                          cursor: clickable ? "pointer" : "default",
                        }}
                      >
                        <img
                          src={resolveMediaUrl(song.cover)}
                          alt={name}
                          style={{
                            width: "140px",
                            height: "140px",
                            borderRadius: "70px",
                            objectFit: "cover",
                            background: "#1a1a1a",
                          }}
                          loading="lazy"
                        />
                        <p className="m-1 text-lg font-light text-sb-fg">
                          {name}
                        </p>
                      </div>
                    </motion.div>
                  </Col>
                );
              })}
        </Row>

        {!showAll && canExpand && (
          <ViewAllButtonRectangle onToggle={() => setShowAll(true)} />
        )}
      </div>
    </div>
  );
};

export default SongGridCircle;
