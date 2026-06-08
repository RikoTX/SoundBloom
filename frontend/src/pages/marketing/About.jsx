import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FireOutlined,
  HeartOutlined,
  CustomerServiceOutlined,
  CrownOutlined,
  PlayCircleFilled,
  GlobalOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import MarketingPageShell from "../../components/marketing/MarketingPageShell";
import SectionReveal from "../../components/marketing/SectionReveal";

const EQ_BARS = [0.5, 0.85, 0.55, 1, 0.65, 0.9, 0.45, 0.8, 0.6, 0.95, 0.5, 0.75];

const FEATURES = [
  { icon: FireOutlined, titleKey: "marketing.about.f1Title", textKey: "marketing.about.f1Text", tint: "#EE10B0" },
  { icon: HeartOutlined, titleKey: "marketing.about.f2Title", textKey: "marketing.about.f2Text", tint: "#0E9EEF" },
  { icon: CustomerServiceOutlined, titleKey: "marketing.about.f3Title", textKey: "marketing.about.f3Text", tint: "#EE10B0" },
  { icon: CrownOutlined, titleKey: "marketing.about.f4Title", textKey: "marketing.about.f4Text", tint: "#0E9EEF" },
];

const STACK = ["React", "C# / .NET", "Supabase", "Jamendo", "iTunes"];

function Equalizer({ className = "" }) {
  return (
    <div className={`flex items-end gap-1.5 ${className}`} aria-hidden="true">
      {EQ_BARS.map((peak, i) => (
        <motion.span
          key={i}
          className="w-2 rounded-full bg-gradient-to-t from-[#EE10B0] to-[#0E9EEF]"
          animate={{
            height: [`${peak * 30}%`, `${peak * 100}%`, `${peak * 40}%`, `${peak * 85}%`, `${peak * 30}%`],
          }}
          transition={{
            duration: 1.1 + (i % 4) * 0.22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.06,
          }}
        />
      ))}
    </div>
  );
}

function VinylCard({ t }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#161618] to-[#0b0b0d] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#EE10B0]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-[#0E9EEF]/15 blur-3xl" />

      <div className="relative flex flex-col items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
          className="relative h-44 w-44 rounded-full shadow-inner"
          style={{
            background:
              "repeating-radial-gradient(circle at center, #1b1b1f 0 5px, #0c0c0e 5px 8px)",
          }}
        >
          <div className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-gradient-to-br from-[#EE10B0] to-[#0E9EEF]" />
          <div className="absolute inset-0 m-auto h-3 w-3 rounded-full bg-[#09090b]" />
        </motion.div>

        <div className="mt-7 flex w-full items-center gap-3">
          <PlayCircleFilled className="text-3xl text-[#EE10B0]" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">SoundBloom</p>
            <p className="truncate text-xs text-white/40">{t("marketing.about.nowPlaying")}</p>
          </div>
          <Equalizer className="h-7" />
        </div>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#EE10B0] to-[#0E9EEF]"
            animate={{ width: ["8%", "92%"] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function About() {
  const { t } = useTranslation();

  return (
    <MarketingPageShell>
      {/* HERO */}
      <section className="px-5 pb-10 pt-10 sm:px-8 sm:pt-14">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#EE10B0]/30 bg-[#EE10B0]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[#EE10B0]">
              <Equalizer className="h-3" />
              {t("marketing.about.eyebrow")}
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              {t("marketing.about.hero")}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg">
              {t("marketing.about.lead1")}
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/45">
              {t("marketing.about.lead2")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/Home"
                className="inline-flex items-center gap-2 rounded-full bg-[#EE10B0] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#cb0094]"
              >
                <PlayCircleFilled /> {t("marketing.about.ctaListen")}
              </Link>
              <Link
                to="/premium"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-[#EE10B0]/40 hover:text-white"
              >
                <CrownOutlined /> {t("marketing.about.ctaPremium")}
              </Link>
            </div>
          </motion.div>

          <VinylCard t={t} />
        </div>
      </section>

      {/* FEATURES */}
      <SectionReveal className="mx-auto mt-8 max-w-6xl px-5 sm:mt-14 sm:px-8">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("marketing.about.featuresTitle")}
          </h2>
          <p className="mt-3 text-white/45">{t("marketing.about.featuresLead")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.titleKey}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-7"
              >
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: `${f.tint}33` }}
                />
                <div
                  className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-xl"
                  style={{ background: `${f.tint}1f`, color: f.tint }}
                >
                  <Icon />
                </div>
                <h3 className="relative text-lg font-semibold text-white">{t(f.titleKey)}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-white/50">
                  {t(f.textKey)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </SectionReveal>

      {/* BUILD + LANGUAGES */}
      <SectionReveal className="mx-auto mt-14 max-w-6xl px-5 sm:mt-20 sm:px-8" delay={0.05}>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#141416] to-[#0b0b0d] p-7 sm:p-9">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0E9EEF]/15 text-xl text-[#0E9EEF]">
              <ThunderboltOutlined />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {t("marketing.about.buildTitle")}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/50 sm:text-[15px]">
              {t("marketing.about.buildText")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {STACK.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/60"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] p-7 sm:p-9">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#EE10B0]/15 text-xl text-[#EE10B0]">
              <GlobalOutlined />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {t("marketing.about.langTitle")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/50 sm:text-[15px]">
              {t("marketing.about.langText")}
            </p>
            <div className="mt-6 flex gap-2">
              {["EN", "RU", "KK"].map((code) => (
                <span
                  key={code}
                  className="rounded-lg border border-[#EE10B0]/25 bg-[#EE10B0]/10 px-3 py-1.5 text-xs font-semibold text-[#EE10B0]"
                >
                  {code}
                </span>
              ))}
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* CLOSING */}
      <SectionReveal className="mx-auto mb-6 mt-14 max-w-6xl px-5 sm:mt-20 sm:px-8" delay={0.1}>
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-r from-[#EE10B0]/15 via-[#141416] to-[#0E9EEF]/15 px-7 py-12 text-center sm:px-10 sm:py-16">
          <Equalizer className="mx-auto mb-6 h-10 justify-center" />
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("marketing.about.closingTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/55">
            {t("marketing.about.closingText")}
          </p>
          <Link
            to="/Home"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#EE10B0] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#cb0094]"
          >
            <PlayCircleFilled /> {t("marketing.about.ctaListen")}
          </Link>
        </div>
      </SectionReveal>
    </MarketingPageShell>
  );
}
