import React from "react";
import { Row, Col } from "antd";
import ViewAllButtonRectangle from "../../components/ViewAllButtonRectangle/ViewAllButtonRectangle";
import { motion } from "framer-motion";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";
import SectionHeading from "../SectionHeading";

const TableArtists = ({
  title,
  pinkTitle,
  songs = [],
  columns = [],
  showAll,
  setShowAll,
}) => {
  const sortedSongs =
    songs.length > 0 && songs[0].plays !== undefined
      ? [...songs].sort((a, b) => b.plays - a.plays)
      : songs;

  const itemsToShow = showAll ? sortedSongs : sortedSongs.slice(0, 8);

  return (
    <div className="px-[5%] py-8 text-sb-fg">
      <SectionHeading title={title} pinkTitle={pinkTitle} className="mt-4" />

      <Row gutter={16} className="my-8 font-medium text-sb-fg-muted">
        <Col span={2}></Col>
        <Col span={6}></Col>
        {columns.map((col, idx) => (
          <Col
            key={idx}
            span={col.span || 4}
            style={{ textAlign: "center", fontSize: 20 }}
          >
            {col.header}
          </Col>
        ))}
      </Row>

      {itemsToShow.map((song, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
        >
          <Row
            key={index}
            gutter={16}
            align="middle"
            className="sb-table-row mb-3"
          >
            <Col
              span={2}
              style={{ fontSize: 24, fontWeight: 600, textAlign: "center" }}
            >
              #{index + 1}
            </Col>

            <Col span={6}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={resolveMediaUrl(song.cover)}
                  alt={song.title}
                  style={{ width: 70, height: 70, borderRadius: 10 }}
                />
                <div style={{ marginLeft: 12 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "110%" }}>
                    {song.artist}
                  </p>
                </div>
              </div>
            </Col>

            {columns.map((col, i) => (
              <Col
                key={i}
                span={col.span || 4}
                style={{ textAlign: "center", fontSize: 14 }}
              >
                {typeof col.render === "function"
                  ? col.render(song, index)
                  : null}
              </Col>
            ))}
          </Row>
        </motion.div>
      ))}

      {!showAll && songs.length > 8 && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <ViewAllButtonRectangle onToggle={() => setShowAll(true)} />
        </div>
      )}
    </div>
  );
};

export default TableArtists;
