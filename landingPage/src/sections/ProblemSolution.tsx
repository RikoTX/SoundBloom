import { useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useLanguage } from "../i18n/LanguageProvider";
import { EASE_BLOOM } from "../lib/theme";
import { Container } from "../components/Container";
import { SectionLabel } from "../components/SectionLabel";
import { Reveal } from "../components/Reveal";

const BAR_COUNT = 28;
/** Scroll progress inside the sticky track where solutions take over. */
const SOLUTION_AT = 0.4;

function Bar({
  progress,
  noise,
  bloom,
}: {
  progress: MotionValue<number>;
  noise: number;
  bloom: number;
}) {
  const scaleY = useTransform(progress, [0, 1], [noise, bloom]);
  const gradOpacity = useTransform(progress, [0.2, 0.75], [0, 1]);
  return (
    <div className="relative h-full flex-1">
      <motion.span
        style={{ scaleY }}
        className="absolute inset-x-0 bottom-0 block h-full origin-bottom rounded-full bg-white/[0.12]"
      />
      <motion.span
        style={{ scaleY, opacity: gradOpacity }}
        className="absolute inset-x-0 bottom-0 block h-full origin-bottom rounded-full bg-gradient-to-t from-magenta-deep via-magenta to-azure"
      />
    </div>
  );
}

export function ProblemSolution() {
  const { c } = useLanguage();
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });

  const [showSolutions, setShowSolutions] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setShowSolutions(v >= SOLUTION_AT);
  });

  const barProgress = useTransform(scrollYProgress, [0, SOLUTION_AT, 1], [0, 0, 1]);

  const bars = useMemo(() => {
    return Array.from({ length: BAR_COUNT }, (_, i) => {
      const noise = 0.12 + Math.random() * 0.34;
      const wave = Math.abs(Math.sin((i / BAR_COUNT) * Math.PI));
      const bloom = Math.min(
        1,
        Math.max(0.12, 0.32 + wave * 0.62 * (0.65 + 0.35 * Math.sin(i * 0.8))),
      );
      return { noise, bloom };
    });
  }, []);

  return (
    <section id="problem" className="relative">
      <Container className="pt-[clamp(6rem,14vh,11rem)]">
        <SectionLabel index={c.problem.index} label={c.problem.label} />
        <Reveal className="mt-10">
          <h2 className="max-w-4xl font-display text-[clamp(1.9rem,5vw,4rem)] font-semibold leading-[1.03]">
            {c.problem.heading}
          </h2>
        </Reveal>
      </Container>

      <div ref={track} className="relative h-[220vh]">
        <div className="sticky top-0 flex h-[100svh] items-center">
          <Container>
            <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
              {/* One state at a time — problems fully exit before solutions enter */}
              <div className="relative min-h-[20rem] sm:min-h-[22rem]">
                <AnimatePresence mode="wait" initial={false}>
                  {!showSolutions ? (
                    <motion.div
                      key="problems"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -22, filter: "blur(6px)" }}
                      transition={{ duration: 0.5, ease: EASE_BLOOM }}
                    >
                      <p className="overline text-bone/65">{c.problem.problemTitle}</p>
                      <ul className="mt-6 space-y-4">
                        {c.problem.problems.map((p) => (
                          <li
                            key={p}
                            className="font-display text-2xl leading-snug text-bone/65 sm:text-3xl"
                          >
                            {p}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="solutions"
                      initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -18 }}
                      transition={{ duration: 0.55, ease: EASE_BLOOM }}
                    >
                      <p className="overline text-magenta">{c.problem.solutionTitle}</p>
                      <ul className="mt-6 space-y-4">
                        {c.problem.solutions.map((s) => (
                          <li
                            key={s}
                            className="font-display text-2xl leading-snug text-bone sm:text-3xl"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex h-56 items-end gap-1.5 sm:h-72">
                {bars.map((b, i) => (
                  <Bar
                    key={i}
                    progress={barProgress}
                    noise={b.noise}
                    bloom={b.bloom}
                  />
                ))}
              </div>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
