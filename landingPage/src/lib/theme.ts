/** Brand palette + motion constants shared between CSS, Framer Motion and Three.js. */
export const COLORS = {
  ink: "#050507",
  ink2: "#0a0a0c",
  surface: "#131316",
  bone: "#f3f0ea",
  magenta: "#ee10b0",
  magentaDeep: "#cb0094",
  azure: "#0e9eef",
} as const;

/** Signature "expensive" easing — used everywhere for a cohesive motion language. */
export const EASE_BLOOM: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_GSAP = "power3.out";
export const EASE_GSAP_INOUT = "power4.inOut";

/** The live SoundBloom app (GitHub Pages deploy). */
export const APP_URL = "https://rikotx.github.io/SoundBloom";
