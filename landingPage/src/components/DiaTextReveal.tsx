import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps } from "react";
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

const sweepEase = (t: number) =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

function buildGradient(
  pos: number,
  colors: string[],
  textColor: string,
  finalProgress: number,
) {
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
      (c) => `color-mix(in srgb, ${textColor} ${whitePct}%, ${c})`,
    );
    return `linear-gradient(90deg, ${interpolated.join(", ")})`;
  }

  const n = colors.length;
  const parts: string[] = [];

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

function measureWidths(el: HTMLElement, texts: string[]) {
  const ghost = el.cloneNode(true) as HTMLElement;
  Object.assign(ghost.style, {
    position: "absolute",
    visibility: "hidden",
    pointerEvents: "none",
    width: "auto",
    whiteSpace: "nowrap",
  });
  el.parentElement?.appendChild(ghost);
  const widths = texts.map((t) => {
    ghost.textContent = t;
    return ghost.getBoundingClientRect().width;
  });
  ghost.remove();
  return widths;
}

type DiaTextRevealProps = Omit<ComponentProps<typeof motion.span>, "children"> & {
  text: string | string[];
  colors?: string[];
  textColor?: string;
  finalGradient?: boolean;
  duration?: number;
  delay?: number;
  repeat?: boolean;
  repeatDelay?: number;
  startOnView?: boolean;
  once?: boolean;
  fixedWidth?: boolean;
};

export function DiaTextReveal({
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
}: DiaTextRevealProps) {
  const texts = Array.isArray(text) ? text : [text];
  const isMulti = texts.length > 1;
  const prefersReducedMotion = useReducedMotion();

  const spanRef = useRef<HTMLSpanElement>(null);
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const playRef = useRef<(() => void) | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const finalAnimRef = useRef<ReturnType<typeof animate> | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [measuredWidths, setMeasuredWidths] = useState<number[]>([]);

  const sweepPos = useMotionValue(SWEEP_START);
  const finalProgress = useMotionValue(0);

  const backgroundImage = useTransform(
    [sweepPos, finalProgress],
    ([pos, progress]) =>
      buildGradient(
        pos as number,
        optsRef.current.colors,
        optsRef.current.textColor,
        progress as number,
      ),
  );

  const isInView = useInView(spanRef, { once, amount: 0.1 });
  const textKey = Array.isArray(text) ? text.join("\0") : text;

  useEffect(() => {
    const el = spanRef.current;
    if (!el || !isMulti) return;
    setMeasuredWidths(measureWidths(el, texts));
  }, [textKey, isMulti, texts]);

  playRef.current = () => {
    const { duration, delay, repeat, repeatDelay, texts, finalGradient } =
      optsRef.current;

    if (once && hasPlayedRef.current) return;
    hasPlayedRef.current = true;

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
          playRef.current?.();
        }, repeatDelay * 1000);
      },
    });

    stopRef.current = () => controls.stop();
  };

  useLayoutEffect(() => {
    if (prefersReducedMotion) {
      sweepPos.set(SWEEP_END);
      if (optsRef.current.finalGradient) finalProgress.set(1);
      return;
    }
    if (startOnView) return;
    playRef.current?.();
  }, [startOnView, prefersReducedMotion, sweepPos, finalProgress, textKey]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!startOnView) return;
    if (!isInView) return;
    playRef.current?.();

    return () => {
      hasPlayedRef.current = false;
      stopRef.current?.();
      finalAnimRef.current?.stop();
      clearTimeout(timerRef.current);
    };
  }, [isInView, startOnView, prefersReducedMotion, textKey]);

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
