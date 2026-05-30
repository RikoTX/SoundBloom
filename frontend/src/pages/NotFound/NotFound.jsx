import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  HomeOutlined,
  ArrowLeftOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import "./NotFound.css";

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="not-found-wrapper">
      <div className="not-found-glow not-found-glow--left" />
      <div className="not-found-glow not-found-glow--right" />

      <motion.div
        className="not-found-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="not-found-icon"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, ease: "backOut", delay: 0.1 }}
        >
          <CustomerServiceOutlined />
        </motion.div>

        <motion.h1
          className="not-found-code"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="not-found-code__digit">4</span>
          <motion.span
            className="not-found-code__zero"
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <span className="not-found-code__zero-inner" />
          </motion.span>
          <span className="not-found-code__digit">4</span>
        </motion.h1>

        <motion.h2
          className="not-found-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {t("errors.notFound.pageWord")}{" "}
          <span className="not-found-title__accent">{t("errors.notFound.titleAccent")}</span>
        </motion.h2>

        <motion.p
          className="not-found-description"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {t("errors.notFound.line1")}
          <br />
          {t("errors.notFound.line2")}
        </motion.p>

        <motion.div
          className="not-found-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <button
            className="not-found-btn not-found-btn--secondary"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftOutlined />
            {t("common.goBack")}
          </button>
          <button
            className="not-found-btn not-found-btn--primary"
            onClick={() => navigate("/Home")}
          >
            <HomeOutlined />
            {t("common.backToHome")}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
