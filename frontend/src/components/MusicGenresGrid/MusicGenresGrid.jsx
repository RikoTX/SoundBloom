import React, { useRef } from "react";
import { motion } from "framer-motion";
import {
  LeftOutlined,
  RightOutlined,
  PlayCircleFilled,
} from "@ant-design/icons";

const MusicGenresGrid = ({
  title,
  pinkTitle,
  genres = [],
  loading = false,
  onClickGenre,
  skeletonCount = 6,
}) => {
  const scrollRef = useRef(null);
  const scrollBy = (delta) =>
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });

  const showSkeletons = loading && genres.length === 0;

  return (
    <div className="mt-4 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between pr-[4%]">
        <p className="text-[35px] font-semibold ml-[4%] mb-5 text-white">
          {title} <span className="text-[#cb0094]">{pinkTitle}</span>
        </p>
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollBy(-700)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1F1F1F] text-white/70 hover:text-white hover:bg-[#cb0094] transition-colors cursor-pointer"
          >
            <LeftOutlined />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollBy(700)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1F1F1F] text-white/70 hover:text-white hover:bg-[#cb0094] transition-colors cursor-pointer"
          >
            <RightOutlined />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="thin-scrollbar flex gap-6 overflow-x-auto overflow-y-hidden scroll-smooth px-[4%] py-6"
      >
        {showSkeletons
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="flex-shrink-0 w-[260px] h-[180px] rounded-2xl bg-[#1F1F1F]"
                style={{
                  background:
                    "linear-gradient(110deg, #1a1a1a 30%, #2a2a2a 50%, #1a1a1a 70%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.4s linear infinite",
                }}
              />
            ))
          : genres.map((genre, index) => (
              <motion.div
                key={genre.tag ?? index}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(index, 8) * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex-shrink-0"
              >
                <div
                  onClick={() => onClickGenre?.(genre)}
                  className="group relative w-[260px] h-[180px] rounded-2xl overflow-hidden cursor-pointer bg-[#1F1F1F] border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:bg-[#262629] hover:border-white/10 hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
                >
                  {genre.cover && (
                    <>
                      <img
                        src={genre.cover}
                        alt=""
                        loading="lazy"
                        aria-hidden
                        className="absolute right-[60px] bottom-[14px] w-[80px] h-[80px] object-cover rounded-xl rotate-[-12deg] shadow-[0_8px_18px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:rotate-[-18deg] opacity-80"
                      />
                      <img
                        src={genre.cover}
                        alt={genre.label}
                        loading="lazy"
                        className="absolute right-[-18px] bottom-[-18px] w-[120px] h-[120px] object-cover rounded-xl rotate-[12deg] shadow-[0_12px_30px_rgba(0,0,0,0.55)] transition-all duration-500 group-hover:rotate-[6deg] group-hover:scale-105"
                      />
                    </>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-r from-[#1F1F1F] via-[#1F1F1F]/60 to-transparent" />

                  <div className="relative z-10 h-full flex flex-col justify-between p-4">
                    <h3 className="text-white text-2xl font-bold tracking-tight">
                      {genre.label}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-[#EE10B0] group-hover:scale-105">
                        <PlayCircleFilled className="!text-white !text-[22px]" />
                      </div>
                      <span className="text-[#929292] text-xs font-medium group-hover:text-white/80 transition-colors">
                        Play genre
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
      </div>
    </div>
  );
};

export default MusicGenresGrid;
