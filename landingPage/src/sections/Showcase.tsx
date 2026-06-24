import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useLanguage } from "../i18n/LanguageProvider";
import type { Lang, Step } from "../lib/content";
import { Container } from "../components/Container";
import { SectionLabel } from "../components/SectionLabel";
import { Reveal } from "../components/Reveal";
import { Equalizer } from "../components/Equalizer";

const NOW_PLAYING: Record<Lang, string> = {
  en: "Now playing",
  ru: "Сейчас играет",
  kk: "Қазір ойнап тұр",
};

function Player({
  step,
  label,
  progressWidth,
}: {
  step: Step;
  label: string;
  progressWidth: MotionValue<string>;
}) {
  return (
    <div className="relative w-[min(86vw,30rem)] rounded-[2rem] border border-white/10 bg-gradient-to-br from-surface to-ink-2 p-6 shadow-[var(--shadow-lift)] sm:p-7">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-magenta/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-10 h-40 w-40 rounded-full bg-azure/20 blur-3xl" />

      <div className="relative flex items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
          className="relative h-20 w-20 shrink-0 rounded-full"
          style={{
            background:
              "repeating-radial-gradient(circle at center,#161619 0 5px,#0b0b0d 5px 8px)",
          }}
        >
          <span className="absolute inset-0 m-auto h-7 w-7 rounded-full bg-gradient-to-br from-magenta to-azure" />
          <span className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-ink" />
        </motion.div>

        <div className="min-w-0 flex-1">
          <p className="overline text-[0.6rem] text-bone/40">{label}</p>
          <motion.h3
            key={step.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-1 truncate font-display text-xl font-semibold text-bone"
          >
            {step.title}
          </motion.h3>
          <p className="mt-0.5 truncate text-sm text-bone/45">SoundBloom</p>
        </div>

        <Equalizer className="h-7" bars={4} />
      </div>

      <div className="relative mt-7 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          style={{ width: progressWidth }}
          className="h-full rounded-full bg-gradient-to-r from-magenta to-azure"
        />
      </div>
      <div className="mt-2.5 flex justify-between text-[11px] tabular-nums text-bone/35">
        <span>1:24</span>
        <span>3:48</span>
      </div>

      <div className="mt-6 flex items-center justify-center gap-8 text-bone/75">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 5h2v14H6zm12 0-9 7 9 7z" />
        </svg>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-magenta to-azure text-white shadow-[0_10px_30px_-10px_rgba(238,16,176,0.8)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 5h2v14h-2zM6 5l9 7-9 7z" />
        </svg>
      </div>
    </div>
  );
}

export function Showcase() {
  const { c, lang } = useLanguage();
  const steps = c.showcase.steps;
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });

  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.floor(v * steps.length);
    setActive(Math.max(0, Math.min(steps.length - 1, idx)));
  });

  const rotateY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const floatY = useTransform(scrollYProgress, [0, 1], [44, -44]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["10%", "94%"]);

  return (
    <section id="showcase" className="relative">
      <Container className="pt-[clamp(6rem,14vh,11rem)]">
        <SectionLabel index={c.showcase.index} label={c.showcase.label} />
        <Reveal className="mt-10">
          <h2 className="font-display text-[clamp(1.9rem,5vw,4rem)] font-semibold leading-[1.03]">
            {c.showcase.heading}
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-4 max-w-md text-lg text-bone/70">{c.showcase.subtitle}</p>
        </Reveal>
      </Container>

      <div ref={track} className="relative h-[240vh]">
        <div className="sticky top-0 flex h-[100svh] items-center">
          <Container className="grid items-center gap-14 lg:grid-cols-2">
            <div className="flex justify-center [perspective:1200px]">
              <motion.div
                style={{ rotateY, y: floatY, transformStyle: "preserve-3d" }}
              >
                <Player
                  step={steps[active]}
                  label={NOW_PLAYING[lang]}
                  progressWidth={progressWidth}
                />
              </motion.div>
            </div>

            <div>
              {steps.map((step, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={step.title}
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    className="block w-full border-t border-white/[0.08] py-6 text-left last:border-b"
                  >
                    <div className="flex items-baseline gap-5">
                      <span
                        className={`font-display text-sm transition-colors duration-300 ${
                          isActive ? "text-magenta" : "text-bone/30"
                        }`}
                      >
                        0{i + 1}
                      </span>
                      <div className="flex-1">
                        <h3
                          className={`font-display text-2xl font-semibold transition-colors duration-300 sm:text-3xl ${
                            isActive ? "text-bone" : "text-bone/55"
                          }`}
                        >
                          {step.title}
                        </h3>
                        <motion.div
                          initial={false}
                          animate={{
                            height: isActive ? "auto" : 0,
                            opacity: isActive ? 1 : 0,
                          }}
                          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="pt-2 mt-2 max-w-sm text-bone/70">
                            {step.text}
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
