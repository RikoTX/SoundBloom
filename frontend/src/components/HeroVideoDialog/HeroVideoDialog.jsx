import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CaretRightFilled, CloseOutlined } from "@ant-design/icons";
import { AnimatePresence, motion } from "framer-motion";

const animationVariants = {
  "from-bottom": {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "from-center": {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  "from-top": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "-100%", opacity: 0 },
  },
  "from-left": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  "from-right": {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  "top-in-bottom-out": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "left-in-right-out": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
};

function buildEmbedUrl(videoSrc) {
  if (!videoSrc) return "";
  const joiner = videoSrc.includes("?") ? "&" : "?";
  return `${videoSrc}${joiner}autoplay=1&rel=0`;
}

export default function HeroVideoDialog({
  animationStyle = "from-center",
  videoSrc,
  thumbnailSrc,
  thumbnailAlt = "Video thumbnail",
  className = "",
}) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [thumbSrc, setThumbSrc] = useState(thumbnailSrc);
  const selectedAnimation = animationVariants[animationStyle];

  useEffect(() => {
    setThumbSrc(thumbnailSrc);
  }, [thumbnailSrc]);

  useEffect(() => {
    if (!isVideoOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape") setIsVideoOpen(false);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isVideoOpen]);

  const handleThumbError = () => {
    if (!thumbSrc || thumbSrc.includes("hqdefault")) return;
    const idMatch = thumbSrc.match(/\/vi\/([a-zA-Z0-9_-]{11})\//);
    if (idMatch) {
      setThumbSrc(`https://img.youtube.com/vi/${idMatch[1]}/hqdefault.jpg`);
    }
  };

  const modal = createPortal(
    <AnimatePresence>
      {isVideoOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="presentation"
          onClick={() => setIsVideoOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-8"
        >
          <motion.div
            {...selectedAnimation}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-6xl"
          >
            <button
              type="button"
              aria-label="Close video"
              onClick={() => setIsVideoOpen(false)}
              className="absolute -top-12 right-0 rounded-full bg-white/10 hover:bg-[#cb0094] transition-colors p-2 text-xl text-white ring-1 ring-white/20 cursor-pointer z-10"
            >
              <CloseOutlined />
            </button>

            <div className="relative w-full overflow-hidden rounded-2xl border border-[#cb0094]/40 shadow-[0_0_60px_rgba(203,0,148,0.35)] bg-black aspect-video">
              <iframe
                src={buildEmbedUrl(videoSrc)}
                title={thumbnailAlt}
                className="absolute inset-0 h-full w-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          type="button"
          aria-label="Play video"
          className="group relative cursor-pointer border-0 bg-transparent p-0 w-full block"
          onClick={() => setIsVideoOpen(true)}
        >
          {thumbSrc ? (
            <img
              src={thumbSrc}
              alt={thumbnailAlt}
              onError={handleThumbError}
              className="w-full aspect-video object-cover rounded-md shadow-lg transition-all duration-200 ease-out group-hover:brightness-[0.7]"
            />
          ) : (
            <div className="w-full aspect-video rounded-md bg-[#2a2a2a]" />
          )}
          <div className="absolute inset-0 flex scale-90 items-center justify-center transition-all duration-200 ease-out group-hover:scale-100">
            <div className="bg-[#cb0094]/15 flex w-20 h-20 items-center justify-center rounded-full backdrop-blur-md">
              <div className="relative flex w-14 h-14 items-center justify-center rounded-full bg-gradient-to-b from-[#cb0094]/40 to-[#cb0094] shadow-md transition-all duration-200 ease-out group-hover:scale-110">
                <CaretRightFilled
                  style={{
                    color: "white",
                    fontSize: 24,
                    marginLeft: 2,
                    filter:
                      "drop-shadow(0 4px 3px rgb(0 0 0 / 0.15)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.1))",
                  }}
                />
              </div>
            </div>
          </div>
        </button>
      </div>
      {modal}
    </>
  );
}
