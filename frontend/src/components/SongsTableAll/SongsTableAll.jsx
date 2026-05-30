import React from "react";
import { Row, Col } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";

const resolveSrc = (src) => {
  if (!src) return "";
  return src.startsWith("http") ? src : import.meta.env.BASE_URL + src;
};

const SongsTableAll = ({
  title,
  pinkTitle,
  songs = [],
  columns = [],
  onPlaySong,
  hideCover = false,
}) => {
  const sortedSongs =
    songs.length > 0 && songs[0].plays !== undefined
      ? [...songs].sort((a, b) => b.plays - a.plays)
      : songs;

  return (
    <div style={{ padding: "0 5%" }}>
      {(title || pinkTitle) && (
        <p style={{ fontWeight: 600, fontSize: 35, marginTop: 35 }}>
          {title} <span style={{ color: "#cb0094" }}>{pinkTitle}</span>
        </p>
      )}

      <Row
        gutter={16}
        style={{ margin: "30px 0", fontWeight: 500, fontSize: 20 }}
      >
        <Col span={2}></Col>
        <Col span={8}></Col>
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

      {sortedSongs.map((song, index) => {
        const clickable = typeof onPlaySong === "function";
        return (
          <Row
            key={song.id ?? index}
            gutter={16}
            align="middle"
            onClick={clickable ? () => onPlaySong(index) : undefined}
            style={{
              background: "#1F1F1F",
              borderRadius: 10,
              marginBottom: 12,
              minHeight: hideCover ? 60 : 91,
              cursor: clickable ? "pointer" : "default",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (clickable) e.currentTarget.style.background = "#2a2a32";
            }}
            onMouseLeave={(e) => {
              if (clickable) e.currentTarget.style.background = "#1F1F1F";
            }}
          >
            <Col
              span={2}
              style={{ fontSize: 24, fontWeight: 600, textAlign: "center" }}
            >
              {clickable ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <PlayCircleOutlined
                    style={{ color: "#EE10B0", fontSize: 22 }}
                  />
                  {song.trackNumber || index + 1}
                </span>
              ) : (
                <>#{index + 1}</>
              )}
            </Col>

            <Col span={8}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {!hideCover && (
                  <img
                    src={resolveSrc(song.cover)}
                    alt={song.title}
                    style={{ width: 75, height: 75, borderRadius: 10 }}
                  />
                )}
                <div style={{ marginLeft: hideCover ? 0 : 12 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 20 }}>
                    {song.title}
                  </p>
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
        );
      })}
    </div>
  );
};

export default SongsTableAll;
