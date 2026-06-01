import { useState } from "react";
import { ArrowLeftOutlined, CaretRightFilled } from "@ant-design/icons";
import { Row, Col, Modal } from "antd";
import { notifyError, notifySuccess } from "../../utils/appNotification";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const BAR_PATTERNS = [
  ["8px", "16px", "10px", "18px", "8px"],
  ["14px", "8px", "18px", "10px", "14px"],
  ["10px", "18px", "12px", "16px", "10px"],
  ["16px", "10px", "14px", "8px", "16px"],
];

function EqualizerBars() {
  return (
    <div className="flex items-end justify-center gap-[3px] h-[20px]">
      {BAR_PATTERNS.map((pattern, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-[#EE10B0]"
          animate={{ height: pattern }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.12,
          }}
        />
      ))}
    </div>
  );
}

function PlayAllButton({ onPlayAll, onStopAll }) {
  const { t } = useTranslation();
  const [active, setActive] = useState(false);

  const handleClick = () => {
    if (active) {
      setActive(false);
      onStopAll?.();
      return;
    }
    setActive(true);
    onPlayAll?.();
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-label={active ? t("player.stopPlayback") : t("player.playAllTracks")}
      layout
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      whileHover={{ scale: active ? 1.04 : 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={`group relative flex items-center justify-center cursor-pointer border backdrop-blur-sm transition-colors duration-300 ${
        active
          ? "w-14 h-14 rounded-full border-[#EE10B0]/40 bg-[#EE10B0]/10 shadow-[0_0_24px_rgba(238,16,176,0.2)]"
          : "rounded-full border-white/10 bg-white/[0.06] hover:bg-white/[0.1] hover:border-[#EE10B0]/30 hover:shadow-[0_4px_20px_rgba(238,16,176,0.12)] pl-5 pr-1.5 py-1.5 gap-3"
      }`}
    >
      {active && (
        <motion.span
          className="absolute inset-0 rounded-full border border-[#EE10B0]/30 pointer-events-none"
          animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      )}

      <AnimatePresence mode="wait">
        {!active ? (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -8, transition: { duration: 0.2 } }}
            className="flex items-center gap-3"
          >
            <span className="text-white/90 font-semibold text-base tracking-wide whitespace-nowrap group-hover:text-white transition-colors">
              {t("player.playAll")}
            </span>
            <span className="flex items-center justify-center w-11 h-11 rounded-full bg-white/[0.08] border border-white/10 group-hover:bg-[#EE10B0]/20 group-hover:border-[#EE10B0]/40 transition-all duration-300">
              <motion.span
                animate={{ x: [0, 1.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <CaretRightFilled className="!text-white/70 !text-[18px] ml-0.5 group-hover:!text-[#EE10B0] transition-colors" />
              </motion.span>
            </span>
          </motion.span>
        ) : (
          <motion.span
            key="active"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="relative z-10"
          >
            <EqualizerBars />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default function AlbumHeader({
  onBack,
  title,
  cover,
  artist,
  infoAlbums,
  tracksCount = 0,
  totalDuration,
  shareUrl,
  releaseDateLong,
  genre,
  headerBg,
  onPlayAll,
  onStopAll,
  extraActions,
}) {
  const { t } = useTranslation();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);

  const handleShare = async () => {
    const url = shareUrl || window.location.href;
    const shareData = {
      title: `${title}${artist ? ` — ${artist}` : ""}`,
      text: t("player.shareText", { title, artist: artist || "" }),
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      notifySuccess(t("common.linkCopied"));
    } catch (_) {
      try {
        await navigator.clipboard.writeText(url);
        notifySuccess(t("common.linkCopied"));
      } catch {
        notifyError(t("common.couldNotShare"));
      }
    }
  };

  const handleBack = () => {
    onBack?.();
  };

  return (
    <div
      style={{
        borderRadius: "15px",
        background:
          headerBg ||
          "linear-gradient(to right,#0E9EEF,rgb(4, 58, 87))",
        padding: "20px",
        transition: "background 0.6s ease",
      }}
    >
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: "30px" }}
      >
        <Col>
          <button
            onClick={handleBack}
            style={{
              cursor: "pointer",
              width: "80px",
              height: "80px",
              fontSize: 40,
              backgroundColor: "transparent",
              border: "none",
              color: "white",
            }}
            aria-label={t("common.back")}
          >
            <ArrowLeftOutlined />
          </button>
        </Col>

        <Col>
          <Row gutter={[24, 0]} justify="end" align="middle">
            <Col>
              <a
                onClick={handleShare}
                style={{
                  color: "white",
                  fontWeight: 700,
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                {t("common.share")}
              </a>
            </Col>
            <Col>
              <a
                onClick={() => setAboutOpen(true)}
                style={{
                  color: "white",
                  fontWeight: 700,
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                {t("common.about")}
              </a>
            </Col>
            <Col>
              <a
                onClick={() => setPremiumOpen(true)}
                style={{
                  color: "white",
                  fontWeight: 700,
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                {t("common.premium")}
              </a>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row gutter={[32, 32]} align="middle">
        <Col xs={24} md={6}>
          <img
            src={resolveMediaUrl(cover)}
            alt={title}
            style={{
              width: "100%",
              maxWidth: "250px",
              borderRadius: "10px",
              boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
            }}
          />
        </Col>

        <Col xs={24} md={12}>
          <h1 style={{ fontSize: 35, color: "white", margin: 0 }}>{title}</h1>
          {artist && (
            <p
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.85)",
                fontWeight: 600,
                margin: "8px 0",
              }}
            >
              {artist}
            </p>
          )}
          {infoAlbums && (
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: 0 }}>
              {infoAlbums}
            </p>
          )}
          <p
            style={{
              color: "#fff",
              marginTop: "12px",
              marginBottom: "0",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {tracksCount} {t("common.songs")}&nbsp;&nbsp;
            <span style={{ color: "#EE10B0" }}>●</span>&nbsp;&nbsp;
            {totalDuration}
          </p>
        </Col>

        <Col xs={24} md={6}>
          <div className="flex flex-col justify-center items-center h-full py-4 md:py-0 gap-4">
            <PlayAllButton onPlayAll={onPlayAll} onStopAll={onStopAll} />
            {extraActions}
          </div>
        </Col>
      </Row>

      <Modal
        open={aboutOpen}
        onCancel={() => setAboutOpen(false)}
        footer={null}
        title={<span style={{ color: "white" }}>{t("player.aboutAlbum")}</span>}
        styles={{
          content: { background: "#1a1a22" },
          header: { background: "#1a1a22", borderBottom: "1px solid #2a2a35" },
        }}
      >
        <div style={{ color: "white", lineHeight: 1.7 }}>
          <p style={{ margin: "0 0 12px" }}>
            <strong>{title}</strong>
            {artist && ` by ${artist}`}
          </p>
          {genre && (
            <p style={{ margin: "6px 0" }}>
              <span style={{ opacity: 0.6 }}>{t("common.genre")}:</span> {genre}
            </p>
          )}
          {releaseDateLong && (
            <p style={{ margin: "6px 0" }}>
              <span style={{ opacity: 0.6 }}>{t("player.released")}</span> {releaseDateLong}
            </p>
          )}
          <p style={{ margin: "6px 0" }}>
            <span style={{ opacity: 0.6 }}>{t("common.tracks")}:</span> {tracksCount}
          </p>
          <p style={{ margin: "6px 0" }}>
            <span style={{ opacity: 0.6 }}>{t("player.totalLength")}</span> {totalDuration}
          </p>
        </div>
      </Modal>

      <Modal
        open={premiumOpen}
        onCancel={() => setPremiumOpen(false)}
        footer={null}
        title={<span style={{ color: "white" }}>{t("player.premiumTitle")}</span>}
        styles={{
          content: { background: "#1a1a22" },
          header: { background: "#1a1a22", borderBottom: "1px solid #2a2a35" },
        }}
      >
        <div style={{ color: "white", lineHeight: 1.7 }}>
          <p>{t("player.premiumSoon")}</p>
          <p style={{ opacity: 0.7, fontSize: 13, margin: 0 }}>
            {t("player.premiumDesc")}
          </p>
        </div>
      </Modal>
    </div>
  );
}
