import React, { useRef } from "react";
import { motion } from "framer-motion";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import HeroVideoDialog from "../HeroVideoDialog/HeroVideoDialog";
import SectionHeading from "../SectionHeading";

function extractYouTubeId(url) {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

function getEmbedSrc(video) {
  if (video.videoId) {
    return `https://www.youtube.com/embed/${video.videoId}`;
  }
  if (video.src && video.src.includes("youtube.com/embed/")) {
    return video.src;
  }
  const id = extractYouTubeId(video.src);
  return id ? `https://www.youtube.com/embed/${id}` : video.src;
}

function getThumbnail(video) {
  if (video.thumbnail) return video.thumbnail;
  const id = video.videoId || extractYouTubeId(video.src);
  if (!id) return "";
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

const MusicVideoGrid = ({
  title,
  pinkTitle,
  videos = [],
  loading = false,
  skeletonCount = 4,
}) => {
  const scrollRef = useRef(null);
  const scrollBy = (delta) =>
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });

  const showSkeletons = loading && videos.length === 0;

  return (
    <div className="mt-4 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between pr-[4%]">
        <SectionHeading title={title} pinkTitle={pinkTitle} />
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollBy(-700)}
            className="sb-scroll-btn"
          >
            <LeftOutlined />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollBy(700)}
            className="sb-scroll-btn"
          >
            <RightOutlined />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="thin-scrollbar flex gap-6 overflow-x-auto overflow-y-hidden scroll-smooth px-[4%] py-5"
      >
        {showSkeletons
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="flex-shrink-0 w-[300px] sm:w-[360px] md:w-[400px] bg-sb-card rounded-xl p-2.5"
              >
                <div className="w-full aspect-video rounded-[8px] sb-shimmer" />
                <div className="h-4 w-3/4 rounded bg-sb-skeleton mt-3" />
                <div className="h-3 w-1/2 rounded bg-sb-skeleton mt-2" />
              </div>
            ))
          : videos.map((video, index) => (
              <motion.div
                key={video.videoId ?? index}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(index, 8) * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex-shrink-0 w-[300px] sm:w-[360px] md:w-[400px]"
              >
                <div className="sb-media-card rounded-xl p-2.5 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(203,0,148,0.25)]">
                  <HeroVideoDialog
                    animationStyle="from-center"
                    videoSrc={getEmbedSrc(video)}
                    thumbnailSrc={getThumbnail(video)}
                    thumbnailAlt={video.title}
                    className="rounded-[8px] overflow-hidden"
                  />
                  <p
                    className="m-2 font-semibold text-sb-fg text-base truncate"
                    title={video.title}
                  >
                    {video.title}
                  </p>
                  <div className="flex justify-between mx-2 text-xs text-sb-fg-muted">
                    <p className="truncate">{video.artist}</p>
                    {video.views && <p>{video.views}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
      </div>
    </div>
  );
};

export default MusicVideoGrid;
