import React, { useRef } from "react";
import { motion } from "framer-motion";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";
import SectionHeading from "../SectionHeading";

const SongGrid = ({
  title,
  songs = [],
  handlePlaySong,
  pinkTitle,
  loading = false,
  skeletonCount = 6,
}) => {
  const scrollRef = useRef(null);

  const scrollBy = (delta) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: delta, behavior: "smooth" });
    }
  };

  const showSkeletons = loading && songs.length === 0;
  if (!showSkeletons && (!songs || songs.length === 0)) return null;

  return (
    <div className="mt-2 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between pr-[4%]">
        <SectionHeading
          title={title}
          pinkTitle={pinkTitle}
          className="ml-[4%] mb-5"
        />

        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollBy(-600)}
            className="sb-scroll-btn"
          >
            <LeftOutlined />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollBy(600)}
            className="sb-scroll-btn"
          >
            <RightOutlined />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="thin-scrollbar flex gap-5 overflow-x-auto overflow-y-hidden scroll-smooth px-[4%] py-5"
      >
        {showSkeletons
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[190px] bg-sb-card rounded-xl p-4"
              >
                <div
                  className="w-full aspect-square rounded-[10px] mb-2.5 sb-shimmer"
                />
                <div className="h-4 w-3/4 mx-auto rounded bg-sb-skeleton mb-2" />
                <div className="h-3 w-1/2 mx-auto rounded bg-sb-skeleton" />
              </div>
            ))
          : songs.map((song, index) => (
              <motion.div
                key={song.id ?? index}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(index, 10) * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[190px]"
              >
                <div
                  onClick={() => handlePlaySong?.(songs, index)}
                  className="text-center bg-sb-card p-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-sb-card-hover hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(203,0,148,0.25)]"
                >
                  <img
                    src={resolveMediaUrl(song.cover)}
                    alt={song.title}
                    loading="lazy"
                    className="w-full aspect-square rounded-[10px] mb-2.5 object-cover"
                  />
                  <p
                    className="m-1 font-semibold truncate text-sb-fg text-sm sm:text-base"
                    title={song.title}
                  >
                    {song.title}
                  </p>
                  <p className="m-1 truncate text-sb-fg-muted text-xs">
                    {song.artist}
                  </p>
                </div>
              </motion.div>
            ))}
      </div>
    </div>
  );
};

export default SongGrid;
