import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import AuthBackground from "./AuthBackground";
import AnimatedVinyl from "./AnimatedVinyl";
import MobileAuthDisc, { MOBILE_AUTH_TOP_OFFSET } from "./MobileAuthDisc";

export const AUTH_NOTCH_RADIUS = 102;

export const AUTH_PANEL_WIDTH = "62%";

function AuthFormContent({ title, subtitle, children }) {
  const { t } = useTranslation();

  return (
    <>
      <p className="mb-5 text-center text-[11px] leading-relaxed text-white/35 sm:mb-6 sm:text-xs lg:hidden">
        {t("auth.layout.tagline")}
      </p>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight sm:text-[32px] lg:text-[36px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm leading-relaxed text-white/45 sm:mt-3 sm:text-[15px]">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </>
  );
}

export default function AuthLayout({ children, title, subtitle }) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[2000] overflow-x-hidden overflow-y-auto bg-[#09090B] text-white lg:overflow-y-hidden">
      <AuthBackground parallax />

      <div
        className="relative z-10 flex min-h-full w-full flex-col lg:h-full lg:min-h-0 lg:flex-row"
        style={{ "--auth-panel-w": AUTH_PANEL_WIDTH }}
      >
        <section className="relative w-full overflow-visible lg:h-full lg:w-[var(--auth-panel-w)] lg:shrink-0">
          <AnimatedVinyl />

          <div
            className="auth-panel-notch relative z-10 flex min-h-[100dvh] flex-col overflow-visible bg-[#09090B] lg:min-h-0 lg:h-full"
            style={{ "--auth-notch-r": `${AUTH_NOTCH_RADIUS}px` }}
          >
            <div
              className="pointer-events-none absolute top-1/2 right-0 z-[15] hidden -translate-y-1/2 translate-x-1/2 lg:block"
              aria-hidden
            >
              <div
                className="rounded-full"
                style={{
                  width: AUTH_NOTCH_RADIUS * 2,
                  height: AUTH_NOTCH_RADIUS * 2,
                  boxShadow:
                    "inset 10px 0 22px rgba(0,0,0,0.55), inset 4px 0 10px rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              />
            </div>

            <Link
              to="/Home"
              className="absolute left-10 top-10 z-30 hidden items-center gap-2 text-sm text-white/45 transition hover:text-white/80 lg:inline-flex"
            >
              <img
                src={`${import.meta.env.BASE_URL}logo-round.png`}
                alt=""
                className="h-7 w-7 rounded-full"
              />
              {t("common.brand")}
            </Link>

            <div className="absolute inset-0 z-20 hidden items-center justify-center px-10 lg:flex">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[440px]"
              >
                <AuthFormContent title={title} subtitle={subtitle}>
                  {children}
                </AuthFormContent>
              </motion.div>
            </div>

            <div className="relative z-20 flex min-h-[100dvh] flex-col px-3 py-5 sm:px-4 sm:py-6 lg:hidden">
              <Link
                to="/Home"
                className="mb-4 inline-flex w-fit shrink-0 items-center gap-2 text-sm text-white/45 transition hover:text-white/80 sm:mb-5"
              >
                <img
                  src={`${import.meta.env.BASE_URL}logo-round.png`}
                  alt=""
                  className="h-7 w-7 rounded-full"
                />
                {t("common.brand")}
              </Link>

              <div className="flex flex-1 flex-col justify-center overflow-visible">
                <div className="relative w-full overflow-visible">
                  <MobileAuthDisc />

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10 w-full rounded-[28px] bg-[#09090B] px-5 pb-8 sm:px-6"
                    style={{
                      marginTop: MOBILE_AUTH_TOP_OFFSET,
                      paddingTop: `calc(min(34vw, 130px) - ${MOBILE_AUTH_TOP_OFFSET}px)`,
                    }}
                  >
                    <AuthFormContent title={title} subtitle={subtitle}>
                      {children}
                    </AuthFormContent>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div
          className="hidden min-w-0 flex-1 bg-[#09090B] lg:block lg:h-full"
          aria-hidden
        />
      </div>
    </div>
  );
}
