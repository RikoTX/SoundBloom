import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { cn } from "../../lib/utils";
import { applyTheme, isDarkTheme } from "../../theme/initTheme";
import { getPreference } from "../../utils/userPreferences";

const STYLE_ID = "magicui-theme-toggler-style";

/** @typedef {"circle" | "square" | "triangle" | "diamond" | "rectangle" | "hexagon" | "star"} TransitionVariant */

function getMaxRadius(x, y, vw, vh) {
  return Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y));
}

function getClipPath(variant, radius, x, y, vw, vh) {
  const cx = x;
  const cy = y;
  switch (variant) {
    case "square": {
      const size = radius * 2;
      const left = Math.max(0, cx - size / 2);
      const top = Math.max(0, cy - size / 2);
      return `inset(${top}px ${vw - left - size}px ${vh - top - size}px ${left}px round 0)`;
    }
    case "diamond": {
      const d = radius * 1.4;
      return `polygon(${cx}% ${cy - d}px, ${cx + d}px ${cy}%, ${cx}% ${cy + d}px, ${cx - d}px ${cy}%)`;
    }
    case "rectangle":
      return `inset(0 round 0)`;
    case "hexagon":
    case "triangle":
    case "star":
    default:
      return `circle(${radius}px at ${cx}px ${cy}px)`;
  }
}

function injectTransitionStyles({ variant, x, y, maxRadius, duration, vw, vh }) {
  let styleEl = document.getElementById(STYLE_ID);
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    document.head.appendChild(styleEl);
  }

  const from = getClipPath(variant, 0, x, y, vw, vh);
  const to = getClipPath(variant, maxRadius, x, y, vw, vh);

  styleEl.textContent = `
    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation: none !important;
      mix-blend-mode: normal;
    }
    ::view-transition-new(root) {
      animation: magicui-theme-reveal var(--magicui-theme-vt-duration, 400ms) ease-in-out forwards !important;
    }
    @keyframes magicui-theme-reveal {
      from { clip-path: ${from}; }
      to { clip-path: ${to}; }
    }
  `;
}

function clearTransitionStyles() {
  const styleEl = document.getElementById(STYLE_ID);
  if (styleEl) {
    styleEl.textContent = `
      ::view-transition-old(root),
      ::view-transition-new(root) {
        animation: none !important;
        mix-blend-mode: normal;
      }
    `;
  }
}

/**
 * Animated theme toggle (Magic UI) — View Transitions API reveal.
 * @see https://magicui.design/docs/components/animated-theme-toggler
 */
export function AnimatedThemeToggler({
  className,
  duration = 400,
  variant = "circle",
  fromCenter = false,
  ...props
}) {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" ? isDarkTheme() : true,
  );
  const buttonRef = useRef(null);

  useEffect(() => {
    const sync = () => setIsDark(isDarkTheme());
    sync();
    window.addEventListener("soundbloom-theme-change", sync);
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      window.removeEventListener("soundbloom-theme-change", sync);
      observer.disconnect();
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const nextDark = !isDarkTheme();
    const apply = () => {
      flushSync(() => {
        applyTheme(nextDark ? "dark" : "light");
        setIsDark(nextDark);
      });
    };

    if (
      !document.startViewTransition ||
      getPreference("reduceMotion") === true ||
      document.documentElement.classList.contains("reduce-motion")
    ) {
      apply();
      return;
    }

    const vw = window.visualViewport?.width ?? window.innerWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const rect = buttonRef.current?.getBoundingClientRect();
    const x = fromCenter
      ? vw / 2
      : (rect?.left ?? vw / 2) + (rect?.width ?? 0) / 2;
    const y = fromCenter
      ? vh / 2
      : (rect?.top ?? vh / 2) + (rect?.height ?? 0) / 2;
    const maxRadius = getMaxRadius(x, y, vw, vh);

    root.style.setProperty("--magicui-theme-vt-duration", `${duration}ms`);
    injectTransitionStyles({ variant, x, y, maxRadius, duration, vw, vh });

    const transition = document.startViewTransition(apply);
    transition.finished.finally(clearTransitionStyles);
  }, [duration, variant, fromCenter]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        "border border-sb-border bg-sb-card text-sb-fg shadow-sm",
        "transition-colors hover:bg-sb-card-hover cursor-pointer",
        className,
      )}
      {...props}
    >
      {isDark ? (
        <Sun className="h-[1.15rem] w-[1.15rem]" strokeWidth={2} />
      ) : (
        <Moon className="h-[1.15rem] w-[1.15rem]" strokeWidth={2} />
      )}
    </button>
  );
}

export default AnimatedThemeToggler;
