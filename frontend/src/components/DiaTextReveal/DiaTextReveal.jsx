import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

const DEFAULT_COLORS = ["#c679c4", "#fa3d1d", "#ffb005", "#e1e1fe", "#0358f7"];
const BAND_HALF = 17;
const SWEEP_START = -BAND_HALF;
const SWEEP_END = 100 + BAND_HALF;

const sweepEase = (t) =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

function buildGradient(pos, colors, textColor, finalProgress) {
  const bandStart = pos - BAND_HALF;
  const bandEnd = pos + BAND_HALF;

  if (bandStart >= 100) {
    if (finalProgress >= 1) {
      return `linear-gradient(90deg, ${colors.join(", ")})`;
    }
    if (finalProgress <= 0) {
      return `linear-gradient(90deg, ${textColor}, ${textColor})`;
    }
    const whitePct = ((1 - finalProgress) * 100).toFixed(1);
    const interpolated = colors.map(
      (c) => `color-mix(in srgb, ${textColor} ${whitePct}%, ${c})`
    );
    return `linear-gradient(90deg, ${interpolated.join(", ")})`;
  }

  const n = colors.length;
  const parts = [];

  if (bandStart > 0)
    parts.push(`${textColor} 0%`, `${textColor} ${bandStart.toFixed(2)}%`);

  if (bandStart <= 0 && bandEnd > 0)
    parts.push(`${textColor} 0%`, `${textColor} ${bandEnd.toFixed(2)}%`);

  colors.forEach((c, i) => {
    const pct = n === 1 ? pos : bandStart + (i / (n - 1)) * BAND_HALF * 2;
    parts.push(`${c} ${pct.toFixed(2)}%`);
  });

  if (bandEnd < 100)
    parts.push(`${textColor} ${bandEnd.toFixed(2)}%`, `${textColor} 100%`);

  return `linear-gradient(90deg, ${parts.join(", ")})`;
}

function measureWidths(el, texts) {
  const ghost = el.cloneNode();
  Object.assign(ghost.style, {
    position: "absolute",
    visibility: "hidden",
    pointerEvents: "none",
    width: "auto",
    whiteSpace: "nowrap",
  });
  el.parentElement.appendChild(ghost);
  const widths = texts.map((t) => {
    ghost.textContent = t;
    return ghost.getBoundingClientRect().width;
  });
  ghost.remove();
  return widths;
}

export default function DiaTextReveal({
  text,
  colors = DEFAULT_COLORS,
  textColor = "#ffffff",
  finalGradient = false,
  duration = 1.5,
  delay = 0,
  repeat = false,
  repeatDelay = 0.5,
  startOnView = true,
  once = true,
  className = "",
  fixedWidth = false,
  ...props
}) {
  const texts = Array.isArray(text) ? text : [text];
  const isMulti = texts.length > 1;
  const prefersReducedMotion = useReducedMotion();

  const spanRef = useRef(null);
  const optsRef = useRef({
    colors,
    textColor,
    duration,
    delay,
    repeat,
    repeatDelay,
    texts,
    finalGradient,
  });
  optsRef.current = {
    colors,
    textColor,
    duration,
    delay,
    repeat,
    repeatDelay,
    texts,
    finalGradient,
  };

  const indexRef = useRef(0);
  const hasPlayedRef = useRef(false);
  const timerRef = useRef(undefined);
  const playRef = useRef(null);
  const stopRef = useRef(null);
  const finalAnimRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [measuredWidths, setMeasuredWidths] = useState([]);

  const sweepPos = useMotionValue(SWEEP_START);
  const finalProgress = useMotionValue(0);

  const backgroundImage = useTransform(
    [sweepPos, finalProgress],
    ([pos, progress]) =>
      buildGradient(
        pos,
        optsRef.current.colors,
        optsRef.current.textColor,
        progress
      )
  );

  const isInView = useInView(spanRef, { once, amount: 0.1 });

  useEffect(() => {
    const el = spanRef.current;
    if (!el || !isMulti) return;
    setMeasuredWidths(measureWidths(el, texts));
  }, [Array.isArray(text) ? text.join("\0") : text]);

  playRef.current = () => {
    const {
      duration,
      delay,
      repeat,
      repeatDelay,
      texts,
      finalGradient,
    } = optsRef.current;

    finalAnimRef.current?.stop();
    sweepPos.set(SWEEP_START);
    if (finalGradient) finalProgress.set(0);

    const controls = animate(sweepPos, SWEEP_END, {
      duration,
      delay,
      ease: sweepEase,
      onComplete() {
        if (finalGradient) {
          finalAnimRef.current = animate(finalProgress, 1, {
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          });
        }
        if (!repeat) return;
        timerRef.current = setTimeout(() => {
          const next = (indexRef.current + 1) % texts.length;
          indexRef.current = next;
          setActiveIndex(next);
          playRef.current();
        }, repeatDelay * 1000);
      },
    });

    stopRef.current = () => controls.stop();
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      sweepPos.set(SWEEP_END);
      if (optsRef.current.finalGradient) finalProgress.set(1);
      return;
    }
    if (startOnView && !isInView) return;
    if (once && hasPlayedRef.current) return;
    hasPlayedRef.current = true;
    playRef.current();

    return () => {
      stopRef.current?.();
      finalAnimRef.current?.stop();
      clearTimeout(timerRef.current);
    };
  }, [isInView, startOnView, once, prefersReducedMotion, sweepPos, finalProgress]);

  const fixedW =
    isMulti && fixedWidth && measuredWidths.length > 0
      ? Math.max(...measuredWidths)
      : undefined;

  const animatedW =
    isMulti && !fixedWidth && measuredWidths[activeIndex] != null
      ? measuredWidths[activeIndex]
      : undefined;

  return (
    <motion.span
      ref={spanRef}
      className={`align-bottom leading-[100%] text-inherit ${className}`}
      style={{
        transform: "translateY(-2px)",
        color: "transparent",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        backgroundSize: "100% 100%",
        backgroundImage,
        ...(isMulti && {
          display: "inline-block",
          overflow: "hidden",
          whiteSpace: "nowrap",
          verticalAlign: "text-center",
          ...(fixedW != null && { width: fixedW }),
        }),
      }}
      animate={animatedW != null ? { width: animatedW } : undefined}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      {...props}
    >
      {texts[activeIndex]}
    </motion.span>
  );
}
