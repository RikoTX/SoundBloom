import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import GridMotion from "../GridMotion/GridMotion";
import { fetchJamendoCovers } from "../../api/JamendoMusicApi";

const GRID_ROWS = 6;
const GRID_COLS = 10;
const TOTAL_CELLS = GRID_ROWS * GRID_COLS;

function fillToTotal(source, total) {
  if (!source || source.length === 0) return [];
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  const items = [];
  let i = 0;
  while (items.length < total) {
    items.push(shuffled[i % shuffled.length]);
    i++;
  }
  return items;
}

const HeroSection = () => {
  const { t } = useTranslation();
  const [apiCovers, setApiCovers] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetchJamendoCovers(TOTAL_CELLS).then((covers) => {
      if (!cancelled && covers.length > 0) {
        setApiCovers(covers);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(
    () => fillToTotal(apiCovers, TOTAL_CELLS),
    [apiCovers]
  );

  const hasCovers = items.length > 0;

  return (
    <div className="px-4 sm:px-6 pt-2">
      <div className="relative w-full h-[460px] sm:h-[520px] md:h-[600px] overflow-hidden rounded-2xl border border-white/5 bg-[#09090B]">
        <AnimatePresence>
          {hasCovers && (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <GridMotion
                items={items}
                gradientColor="transparent"
                rows={GRID_ROWS}
                cols={GRID_COLS}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-[#09090B]/80 to-[#09090B]/10 pointer-events-none z-[5]" />

        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 md:px-14 z-[10]">
          <div className="max-w-md">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white">
              {t("home.hero.allThe")}{" "}
              <span className="bg-gradient-to-r from-[#EE10B0] to-[#0E9EEF] bg-clip-text text-transparent">
                {t("home.hero.bestSongs")}
              </span>
              <br />
              {t("home.hero.inOnePlace")}
            </h1>

            <p className="mt-5 text-sm sm:text-base text-[#bdbdbd] leading-relaxed">
              {t("home.hero.subtitleLong")}
            </p>

            <div className="mt-7 flex flex-wrap gap-4">
              <button
                type="button"
                className="bg-[#cb0094] hover:bg-[#ee10b0] text-white border-0 px-6 py-2.5 rounded-md text-base font-medium cursor-pointer transition-all shadow-[0_4px_20px_rgba(203,0,148,0.35)] hover:shadow-[0_6px_24px_rgba(238,16,176,0.5)]"
              >
                {t("home.hero.discover")}
              </button>
              <button
                type="button"
                className="bg-transparent text-[#0E9EEF] border-2 border-[#0E9EEF] hover:bg-[#0E9EEF]/10 px-6 py-2.5 rounded-md text-base font-medium cursor-pointer transition-colors"
              >
                {t("home.hero.createPlaylist")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
