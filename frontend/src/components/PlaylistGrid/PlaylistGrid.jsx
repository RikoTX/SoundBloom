import React, { useRef } from "react";
import { motion } from "framer-motion";
import {
  LeftOutlined,
  RightOutlined,
  PlayCircleFilled,
  UserOutlined,
} from "@ant-design/icons";
import SectionHeading from "../SectionHeading";

const PlaylistGrid = ({
  title,
  pinkTitle,
  playlist = [],
  loading = false,
  onClickPlaylist,
  skeletonCount = 6,
}) => {
  const scrollRef = useRef(null);
  const scrollBy = (delta) =>
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });

  const showSkeletons = loading && playlist.length === 0;

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
        className="thin-scrollbar flex gap-7 overflow-x-auto overflow-y-hidden scroll-smooth px-[4%] py-6"
      >
        {!showSkeletons && playlist.length === 0 ? (
          <div className="flex-shrink-0 w-full py-10 text-center text-sb-fg-muted">
            No playlists found
          </div>
        ) : showSkeletons ? (
          Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="flex-shrink-0 w-[210px] pt-2"
              >
                <div
                  className="w-full aspect-square rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(110deg, #2a2a2a 30%, #3a3a3a 50%, #2a2a2a 70%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.4s linear infinite",
                  }}
                />
                <div className="mt-3 h-4 w-3/4 rounded bg-[#2a2a2a]" />
                <div className="mt-2 h-3 w-1/2 rounded bg-[#2a2a2a]" />
              </div>
            ))
        ) : (
          playlist.map((item, index) => (
              <motion.div
                key={item.id ?? index}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(index, 8) * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex-shrink-0 w-[210px] pt-3"
              >
                <div
                  onClick={() => onClickPlaylist?.(item)}
                  className="group cursor-pointer"
                >
                  <div className="relative w-full aspect-square">
                    {}
                    <div className="absolute top-[-6px] left-[6px] right-[-6px] bottom-[6px] rounded-2xl bg-white/5 rotate-[3deg] transition-transform duration-300 group-hover:rotate-[6deg] group-hover:translate-x-1" />
                    <div className="absolute top-[-3px] left-[3px] right-[-3px] bottom-[3px] rounded-2xl bg-white/10 rotate-[1.5deg] transition-transform duration-300 group-hover:rotate-[3deg]" />

                    {}
                    <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:shadow-[0_18px_40px_rgba(203,0,148,0.45)] group-hover:-translate-y-1">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#53104a] via-[#1a1a22] to-[#0a2840]" />
                      {item.cover && (
                        <img
                          src={item.cover}
                          alt={item.title || item.titlePlaylist}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                          className="relative z-[1] w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )}

                      {}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                      {}
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1 text-[11px] text-white/90 font-medium border border-white/10">
                        Playlist
                      </div>

                      {}
                      <div className="absolute bottom-3 right-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-12 h-12 rounded-full bg-[#EE10B0] flex items-center justify-center shadow-[0_6px_20px_rgba(238,16,176,0.6)] hover:scale-110 transition-transform">
                          <PlayCircleFilled className="!text-white !text-[28px]" />
                        </div>
                      </div>

                      {}
                      <div className="absolute bottom-0 left-0 right-0 p-3 pr-16">
                        <p
                          className="font-bold text-white text-base leading-tight line-clamp-2 drop-shadow-md"
                          title={item.title || item.titlePlaylist}
                        >
                          {item.title || item.titlePlaylist}
                        </p>
                      </div>
                    </div>
                  </div>

                  {}
                  {item.user && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-[#a0a0a0]">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#EE10B0] to-[#0E9EEF] flex items-center justify-center text-white text-[10px]">
                        <UserOutlined className="!text-[10px]" />
                      </div>
                      <span className="truncate">by {item.user}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
        )}
      </div>
    </div>
  );
};

export default PlaylistGrid;
