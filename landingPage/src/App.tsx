import { Suspense, lazy, useEffect, useState } from "react";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { SmoothScroll } from "./providers/SmoothScroll";
import { usePointerTracking } from "./hooks/usePointerTracking";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { Nav } from "./components/Nav";
import { CursorGlow } from "./components/CursorGlow";
import { Hero } from "./sections/Hero";
import { About } from "./sections/About";
import { ProblemSolution } from "./sections/ProblemSolution";
import { Showcase } from "./sections/Showcase";
import { Features } from "./sections/Features";
import { Finale } from "./sections/Finale";
import { Footer } from "./sections/Footer";

const Scene = lazy(() => import("./three/Scene"));

function Background() {
  const [show, setShow] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const id = window.setTimeout(() => setShow(true), 250);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(238,16,176,0.10),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_88%,rgba(14,158,239,0.08),transparent_55%)]" />
      <div className="absolute inset-0">
        <Suspense fallback={null}>{show && !reduced && <Scene />}</Suspense>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_48%,rgba(5,5,7,0.88)_100%)]" />
    </div>
  );
}

function Content() {
  usePointerTracking();

  return (
    <div className="grain relative">
      <Background />
      <CursorGlow />
      <div className="relative z-10">
        <Nav />
        <main>
          <Hero />
          <About />
          <ProblemSolution />
          <Showcase />
          <Features />
          <Finale />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <SmoothScroll>
        <Content />
      </SmoothScroll>
    </LanguageProvider>
  );
}
