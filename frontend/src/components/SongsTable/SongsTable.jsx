import React from "react";
import { Row, Col } from "antd";
import ViewAllButtonRectangle from "../../components/ViewAllButtonRectangle/ViewAllButtonRectangle";
import { motion } from "framer-motion";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";
import SectionHeading from "../SectionHeading";

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
    <div className="px-[5%] text-sb-fg">
      <SectionHeading
        title={title}
        pinkTitle={pinkTitle}
        className="mt-9 mb-0"
      />

      <Row
        gutter={16}
        className="my-8 font-medium text-xl text-sb-fg-muted"
      >
        <Col span={2} />
        <Col span={8} />
        {columns.map((col, idx) => (
          <Col key={idx} span={col.span || 4} className="text-center text-xl">
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
            className="sb-table-row mb-3"
            onClick={
              typeof onPlaySong === "function"
                ? () => onPlaySong(itemsToShow, index)
                : undefined
            }
            style={{
              cursor:
                typeof onPlaySong === "function" ? "pointer" : "default",
            }}
          >
            <Col
              span={2}
              className="text-center text-2xl font-semibold text-sb-fg"
            >
              #{index + 1}
            </Col>

            <Col span={8}>
              <div className="flex items-center">
                <img
                  src={resolveMediaUrl(song.cover)}
                  alt={song.title}
                  className="h-[75px] w-[75px] rounded-[10px] object-cover"
                />
                <div className="ml-3">
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
        </motion.div>
      ))}

      {!showAll && songs.length > 4 && (
        <div className="mt-5 text-center">
          <ViewAllButtonRectangle onToggle={() => setShowAll(true)} />
        </div>
      )}
    </div>
  );
};

export default SongsTable;
