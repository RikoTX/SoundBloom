import React from "react";
import { Row, Col } from "antd";
import ViewAllButtonRectangle from "../../components/ViewAllButtonRectangle/ViewAllButtonRectangle";

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
    <div style={{ padding: "0 5%" }}>
      <p style={{ fontWeight: 600, fontSize: 35, marginTop: 35 }}>
        {title} <span style={{ color: "#cb0094" }}>{pinkTitle}</span>
      </p>

      <Row gutter={16} style={{ margin: "30px 0", fontWeight: 500}}>
        <Col span={2}></Col>
        <Col span={6}></Col>
        {columns.map((col, idx) => (
          <Col key={idx} span={col.span || 4} style={{ textAlign: "center",fontSize: 20 }}>
            {col.header}
          </Col>
        ))}
      </Row>

      {itemsToShow.map((song, index) => (
        <Row
          key={index}
          gutter={16}
          align="middle"
          style={{
            background: "#1F1F1F",
            borderRadius: 10,
            marginBottom: 12,
            padding: 12,
          }}
        >
          <Col span={2} style={{ fontSize: 24, fontWeight: 600, textAlign: "center" }}>
            #{index + 1}
          </Col>

          <Col span={6}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={import.meta.env.BASE_URL + song.cover}
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
              {typeof col.render === "function" ? col.render(song, index) : null}
            </Col>
          ))}
        </Row>
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
