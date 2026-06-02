import { useState } from "react";
import { motion } from "framer-motion";
import { MailOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import MarketingPageShell from "../../components/marketing/MarketingPageShell";
import GlassCard from "../../components/marketing/GlassCard";
import ContactField from "../../components/marketing/ContactField";
import SectionReveal from "../../components/marketing/SectionReveal";
import { sendContactForm } from "../../api/sendContactForm";

const CONTACT_EMAIL = "amirzhanchikk@gmail.com";

export default function Contact() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const CONTACT_CHANNELS = [
    {
      label: t("common.email"),
      value: CONTACT_EMAIL,
      hint: t("marketing.contact.replyHint"),
      icon: MailOutlined,
      href: `mailto:${CONTACT_EMAIL}`,
    },
    {
      label: t("marketing.contact.discord"),
      value: "discord.gg/soundbloom",
      hint: t("marketing.contact.discordHint"),
      icon: null,
      emoji: "💬",
    },
    {
      label: t("marketing.contact.instagram"),
      value: "@soundbloom",
      hint: t("marketing.contact.instagramHint"),
      icon: null,
      emoji: "📷",
    },
  ];

  const canSubmit =
    !sending &&
    name.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    message.trim().length >= 10;

  const validationHint =
    name.trim().length < 2
      ? t("marketing.contact.hintName")
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ? t("marketing.contact.hintEmail")
        : message.trim().length < 10
          ? t("marketing.contact.hintMessage")
          : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSending(true);
    setError("");

    try {
      await sendContactForm({ name, email, message });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("marketing.contact.error"),
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <MarketingPageShell>
      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 max-w-2xl"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#EE10B0]/80">
            {t("marketing.contact.title")}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("marketing.contact.subtitle")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/45">
            {t("marketing.contact.intro")}
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <SectionReveal>
            <GlassCard glow className="!p-6 sm:!p-8">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-12 text-center"
                >
                  <p className="text-xl font-semibold text-white">
                    {t("marketing.contact.received")}
                  </p>
                  <p className="mt-3 text-sm text-white/45">
                    {t("marketing.contact.thanksShort")}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <ContactField
                    id="contact-name"
                    label={t("marketing.contact.name")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <ContactField
                    id="contact-email"
                    label={t("common.email")}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <ContactField
                    id="contact-message"
                    label={t("marketing.contact.message")}
                    multiline
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />

                  {error && (
                    <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {error}
                    </p>
                  )}

                  {!canSubmit && validationHint && (
                    <p className="text-sm text-white/40">{validationHint}</p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={!canSubmit}
                    whileHover={canSubmit ? { scale: 1.01 } : undefined}
                    whileTap={canSubmit ? { scale: 0.99 } : undefined}
                    className={`mt-2 w-full rounded-full py-3.5 text-[15px] font-semibold transition-all duration-200 sm:py-4 ${
                      canSubmit
                        ? "bg-[#cb0094] text-white shadow-[0_10px_28px_rgba(203,0,148,0.35)] hover:bg-[#EE10B0]"
                        : "cursor-not-allowed bg-white/10 text-white/30"
                    }`}
                  >
                    {sending ? t("marketing.contact.sending") : t("marketing.contact.send")}
                  </motion.button>
                </form>
              )}
            </GlassCard>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="space-y-4">
              {CONTACT_CHANNELS.map((channel) => {
                const inner = (
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#cb0094]/10 text-lg text-[#EE10B0]">
                      {channel.icon ? (
                        <channel.icon />
                      ) : (
                        <span>{channel.emoji}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/35">
                        {channel.label}
                      </p>
                      <p className="mt-1 text-base font-medium text-white">
                        {channel.value}
                      </p>
                      <p className="mt-1 text-sm text-white/40">
                        {channel.hint}
                      </p>
                    </div>
                  </div>
                );

                return (
                  <GlassCard key={channel.label} hover>
                    {channel.href ? (
                      <a
                        href={channel.href}
                        className="block transition hover:opacity-90"
                      >
                        {inner}
                      </a>
                    ) : (
                      inner
                    )}
                  </GlassCard>
                );
              })}

              <motion.div
                animate={{ opacity: [0.15, 0.35, 0.15] }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mt-6 h-32 rounded-2xl border border-[#cb0094]/20 bg-[radial-gradient(ellipse_at_center,rgba(203,0,148,0.12),transparent_70%)]"
                aria-hidden
              />
            </div>
          </SectionReveal>
        </div>
      </section>
    </MarketingPageShell>
  );
}
