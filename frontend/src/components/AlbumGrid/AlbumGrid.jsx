import React, { useRef } from "react";
import { motion } from "framer-motion";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";
import SectionHeading from "../SectionHeading";

const AlbumGrid = ({
  title,
  pinkTitle,
  albums = [],
  onClickAlbum,
  loading = false,
  skeletonCount = 6,
}) => {
  const scrollRef = useRef(null);

  const scrollBy = (delta) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: delta, behavior: "smooth" });
    }
  };

  const sortedAlbums =
    albums.length > 0 && albums[0].plays !== undefined
      ? [...albums].sort((a, b) => b.plays - a.plays)
      : albums;

  const showSkeletons = loading && sortedAlbums.length === 0;

  return (
    <div className="mt-2 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between pr-[4%]">
        <SectionHeading title={title} pinkTitle={pinkTitle} />

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
          ? Array.from({ length: skeletonCount }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="flex-shrink-0 w-[170px] sm:w-[190px] md:w-[200px] bg-sb-card rounded-xl p-4 text-center"
              >
                <div
                  className="w-full aspect-square rounded-[10px] mb-2.5"
                  style={{
                    background:
                      "linear-gradient(110deg, #2a2a2a 30%, #3a3a3a 50%, #2a2a2a 70%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.4s linear infinite",
                  }}
                />
                <div className="h-4 w-3/4 mx-auto rounded bg-sb-skeleton mb-2" />
                <div className="h-3 w-1/2 mx-auto rounded bg-sb-skeleton" />
              </div>
            ))
          : sortedAlbums.map((album, index) => (
              <motion.div
                key={album.id ?? index}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(index, 10) * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex-shrink-0 w-[170px] sm:w-[190px] md:w-[200px]"
              >
                <div
                  onClick={() => onClickAlbum?.(album)}
                  className="sb-media-card text-center p-4 rounded-xl cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(203,0,148,0.25)]"
                >
                  <img
                    src={resolveMediaUrl(album.cover)}
                    alt={album.title}
                    loading="lazy"
                    className="w-full aspect-square rounded-[10px] mb-2.5 object-cover"
                  />
                  <p
                    className="m-1 font-semibold truncate text-sb-fg text-sm sm:text-base"
                    title={album.title}
                  >
                    {album.title}
                  </p>
                  <p
                    className="m-1 truncate text-sb-fg-muted text-xs"
                    title={album.artist}
                  >
                    {album.artist}
                  </p>
                </div>
              </motion.div>
            ))}
      </div>
    </div>
  );
};

export default AlbumGrid;
