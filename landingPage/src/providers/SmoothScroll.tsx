import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { scroll } from "../lib/store";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

interface SmoothScrollApi {
  scrollTo: (target: string | number | HTMLElement) => void;
}

const SmoothScrollContext = createContext<SmoothScrollApi>({
  scrollTo: () => {},
});

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", (e: Lenis) => {
      scroll.progress = e.progress;
      scroll.velocity = e.velocity;
      ScrollTrigger.update();
    });

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value?: number) {
        if (value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    ScrollTrigger.addEventListener("refresh", () => lenis.resize());
    ScrollTrigger.refresh();

    const onRaf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onRaf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onRaf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  const api = useMemo<SmoothScrollApi>(
    () => ({
      scrollTo: (target) => {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(target, { offset: 0, duration: 1.4 });
        } else if (typeof target === "string") {
          document
            .querySelector(target)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      },
    }),
    [],
  );

  return (
    <SmoothScrollContext.Provider value={api}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}
