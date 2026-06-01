import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { dismissToast, subscribeToasts } from "../../utils/toastBus";

const STYLES = {
  success: {
    wrap: "border-[#EE10B0]/40 bg-[#111113]/95 shadow-[0_12px_40px_rgba(238,16,176,0.2)]",
    icon: "#EE10B0",
    Icon: CheckCircleOutlined,
  },
  error: {
    wrap: "border-red-500/35 bg-[#111113]/95 shadow-[0_12px_40px_rgba(239,68,68,0.15)]",
    icon: "#f87171",
    Icon: CloseCircleOutlined,
  },
  info: {
    wrap: "border-[#0E9EEF]/35 bg-[#111113]/95 shadow-[0_12px_40px_rgba(14,158,239,0.15)]",
    icon: "#0E9EEF",
    Icon: InfoCircleOutlined,
  },
  warning: {
    wrap: "border-amber-500/35 bg-[#111113]/95 shadow-[0_12px_40px_rgba(245,158,11,0.12)]",
    icon: "#fbbf24",
    Icon: ExclamationCircleOutlined,
  },
};

function ToastCard({ toast, onClose }) {
  const cfg = STYLES[toast.type] || STYLES.info;
  const Icon = cfg.Icon;

  return (
    <motion.div
      layout
      role="status"
      initial={{ opacity: 0, x: 48, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 48, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className={`pointer-events-auto flex gap-3 rounded-2xl border p-4 backdrop-blur-md ${cfg.wrap}`}
    >
      <Icon className="mt-0.5 shrink-0 text-lg" style={{ color: cfg.icon }} />
      <div className="min-w-0 flex-1">
        {toast.title ? (
          <p className="text-sm font-semibold text-white">{toast.title}</p>
        ) : null}
        {toast.message ? (
          <p
            className={`text-sm text-white/65 ${toast.title ? "mt-1" : ""}`}
          >
            {toast.message}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 text-white/35 hover:text-white cursor-pointer self-start"
        aria-label="Close"
      >
        <CloseOutlined />
      </button>
    </motion.div>
  );
}

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const timers = new Map();

    return subscribeToasts((event) => {
      if (event.type === "dismiss") {
        clearTimeout(timers.get(event.id));
        timers.delete(event.id);
        remove(event.id);
        return;
      }

      setToasts((prev) => [...prev, event].slice(-5));

      const timer = window.setTimeout(() => {
        remove(event.id);
        timers.delete(event.id);
      }, event.duration ?? 6000);
      timers.set(event.id, timer);
    });
  }, [remove]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed top-4 right-4 z-[10000] flex w-[min(100vw-2rem,380px)] flex-col gap-3 pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onClose={() => {
              dismissToast(toast.id);
            }}
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
