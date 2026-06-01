import React from "react";
import { Row, Col } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";
import SectionHeading from "../SectionHeading";

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
    <div className="px-[5%] text-sb-fg">
      {(title || pinkTitle) && (
        <SectionHeading title={title} pinkTitle={pinkTitle} className="mt-9" />
      )}

      <Row gutter={16} className="my-8 font-medium text-xl text-sb-fg-muted">
        <Col span={2} />
        <Col span={8} />
        {columns.map((col, idx) => (
          <Col key={idx} span={col.span || 4} className="text-center text-xl">
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
            className="sb-table-row mb-3"
            onClick={clickable ? () => onPlaySong(index) : undefined}
            style={{
              minHeight: hideCover ? 60 : 91,
              cursor: clickable ? "pointer" : "default",
            }}
          >
            <Col span={2} className="text-center text-2xl font-semibold">
              {clickable ? (
                <span className="inline-flex items-center gap-1.5">
                  <PlayCircleOutlined
                    style={{ color: "#EE10B0", fontSize: 22 }}
                  />
                  #{index + 1}
                </span>
              ) : (
                `#${index + 1}`
              )}
            </Col>

            <Col span={8}>
              <div className="flex items-center">
                {!hideCover && (
                  <img
                    src={resolveMediaUrl(song.cover)}
                    alt={song.title}
                    className="h-[75px] w-[75px] rounded-[10px] object-cover"
                  />
                )}
                <div className={hideCover ? "" : "ml-3"}>
                  <p className="m-0 text-xl font-semibold text-sb-fg">
                    {song.title}
                  </p>
                  <p className="m-0 text-[13px] text-sb-fg-muted">
                    {song.artist}
                  </p>
                </div>
              </div>
            </Col>

            {columns.map((col, i) => (
              <Col
                key={i}
                span={col.span || 4}
                className="text-center text-sm text-sb-fg-muted"
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
