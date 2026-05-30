import React from "react";
import { Row, Col } from "antd";
import { HeartOutlined } from "@ant-design/icons";
import ViewAllButtonRectangle from "../../components/ViewAllButtonRectangle/ViewAllButtonRectangle";
import { motion } from "framer-motion";

const SongsTable = ({
  title,
  pinkTitle,
  songs = [],
  columns = [],
  showAll,
  setShowAll,
  onPlaySong,
}) => {
  const sortedSongs =
    songs.length > 0 && songs[0].plays !== undefined
      ? [...songs].sort((a, b) => b.plays - a.plays)
      : songs;

  const itemsToShow = showAll ? sortedSongs : sortedSongs.slice(0, 4);

  return (
    <div style={{ padding: "0 5%" }}>
      <p style={{ fontWeight: 600, fontSize: 35, marginTop: 35 }}>
        {title} <span style={{ color: "#cb0094" }}>{pinkTitle}</span>
      </p>

      <Row
        gutter={16}
        style={{ margin: "30px 0", fontWeight: 500, fontSize: 20 }}
      >
        <Col span={2}></Col>
        <Col span={8}></Col>
        {columns.map((col, idx) => (
          <Col key={idx} span={col.span || 4} style={{ textAlign: "center", fontSize: 20 }}>
            {col.header}
          </Col>
        ))}
      </Row>

      {itemsToShow.map((song, index) => (
        <motion.div
          key={song.id ?? index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
        >
          <Row
            gutter={16}
            align="middle"
            onClick={
              typeof onPlaySong === "function"
                ? () => onPlaySong(itemsToShow, index)
                : undefined
            }
            style={{
              background: "#1F1F1F",
              borderRadius: 10,
              marginBottom: 12,
              cursor:
                typeof onPlaySong === "function" ? "pointer" : "default",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (typeof onPlaySong === "function")
                e.currentTarget.style.background = "#2a2a32";
            }}
            onMouseLeave={(e) => {
              if (typeof onPlaySong === "function")
                e.currentTarget.style.background = "#1F1F1F";
            }}
          >
            <Col
              span={2}
              style={{ fontSize: 24, fontWeight: 600, textAlign: "center" }}
            >
              #{index + 1}
            </Col>

            <Col span={8}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={
                        song.cover?.startsWith("http")
                          ? song.cover
                          : import.meta.env.BASE_URL + song.cover
                      }
                  alt={song.title}
                  style={{ width: 75, height: 75, borderRadius: 10 }}
                />
                <div style={{ marginLeft: 12 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 20 }}>{song.title}</p>
                  <p style={{ margin: 0, color: "#929292", fontSize: 13 }}>
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

      {!showAll && songs.length > 4 && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <ViewAllButtonRectangle onToggle={() => setShowAll(true)} />
        </div>
      )}
    </div>
  );
};

export default SongsTable;
