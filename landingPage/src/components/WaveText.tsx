import {
  useEffect,
  useRef,
  type CSSProperties,
  type ComponentType,
  type ElementType,
  type ReactNode,
  type Ref,
} from "react";
import { gsap } from "../lib/gsap";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

interface WaveTextProps {
  text: string;
  as?: ElementType;
  className?: string;
  gradient?: boolean;
  delay?: number;
  /** Play reveal as soon as the element enters the viewport. */
  immediate?: boolean;
  wave?: boolean;
}

function splitToChars(text: string, gradient: boolean, wave: boolean) {
  const words = text.split(" ");
  let i = 0;
  const innerClass = gradient
    ? "wt-char-inner wt-grad"
    : "wt-char-inner";

  return words.map((word, w) => {
    const chars = Array.from(word).map((char) => {
      const idx = i++;
      return (
        <span
          className={wave ? "wt-char" : "wt-char-static"}
          style={{ "--wt-i": idx } as CSSProperties}
          key={idx}
        >
          <span className={innerClass} data-char="">
            {char}
          </span>
        </span>
      );
    });
    return (
      <span className="wt-word" key={`w-${w}`}>
        {chars}
        {w < words.length - 1 ? "\u00A0" : ""}
      </span>
    );
  });
}

export function WaveText({
  text,
  as = "span",
  className = "",
  gradient = false,
  delay = 0,
  immediate = false,
  wave = true,
}: WaveTextProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const inners = el.querySelectorAll<HTMLElement>("[data-char]");
    if (!inners.length) return;

    if (reduced) {
      gsap.set(inners, { yPercent: 0, opacity: 1 });
      return;
    }

    let played = false;
    let observer: IntersectionObserver | undefined;

    const ctx = gsap.context(() => {
      const play = () => {
        if (played) return;
        played = true;
        gsap.fromTo(
          inners,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1,
            ease: "power4.out",
            stagger: 0.028,
            delay,
          },
        );
      };

      if (immediate) {
        play();
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            play();
            observer?.disconnect();
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      );
      observer.observe(el);
    }, el);

    return () => {
      observer?.disconnect();
      ctx.revert();
    };
  }, [text, delay, immediate, reduced]);

  const Tag = as as unknown as ComponentType<{
    ref?: Ref<HTMLElement>;
    className?: string;
    children?: ReactNode;
  }>;

  return (
    <Tag ref={ref} className={`wt ${className}`}>
      {splitToChars(text, gradient, wave && !reduced)}
    </Tag>
  );
}
